from typing import Dict

from flask import request
from common.base_app import init_app
from common.utils import gather_and_validate_fields
from db_ops.entities import initialize_schema
from statistics import to_statistics


def initialize_request_handlers(app, db, Schema):
    @app.route("/get_questions", methods=['GET'])
    def get_questions():
        try:
            data = gather_and_validate_fields({
                "page": int,
                "user_id": int,
            }, request.args)
        except ValueError as e:
            return {"error": str(e) + f"in data for /{create_question}"}, 400
        questions = Schema.query_remaining_questions(data["user_id"])
        questions_payload = [q.to_dict() for q in questions]
        return {
            "questions": questions_payload,
            "page": data["page"],
            "has_more": False
        }

    @app.route("/get_users", methods=['GET'])
    def get_users():
        try:
            users = Schema.User.query.all()
        except Exception as e:
            return {"error": f"Could not get users: {str(e)}"}, 503
        return {"users": [{"user_id": u.user_id, "name": u.name} for u in users]}

    @app.route("/create_user", methods=['POST'])
    def create_user():
        if (name := request.json.get("name")) is None:
            return {"error": "No user_id provided in post data"}, 400
        new_user = Schema.User(name=name)
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not add user: {str(e)}"}, 503
        return get_users()

    @app.route("/delete_user", methods=['DELETE'])
    def delete_user():
        if (user_id := request.args.get("user_id", type=int)) is None:
            return {"error": f"user_id is not provided for delete user request or could not cast to int"}, 400
        try:
            user = Schema.User.query.filter_by(user_id=user_id).one()
            db.session.delete(user)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not delete user: {str(e)}"}, 503
        return get_users()

    @app.route("/answer_question", methods=['POST'])
    def answer_question():
        try:
            data = gather_and_validate_fields({
                "user_id": int,
                "ynq_id": int,
                "answer": int,
                "probability": int,
            }, request.json)
        except ValueError as e:
            return {"error": str(e) + " in data for /answer_question"}, 400
        try:
            answer = Schema.YNAnswer(**data)
            db.session.add(answer)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not add answer: {str(e)}"}, 503
        return "OK", 200

    @app.route("/statistics", methods=['GET'])
    def get_statistics():
        if (user_id := request.args.get("user_id", type=int)) is None:
            return {"error": f"user_id is not provided for statistics request or could not cast to int"}, 400
        try:
            datapoints = Schema.query_answers_statistics(user_id)
        except Exception as e:
            return {"error": f"Could not query statistics data: {str(e)}"}, 503
        return {"statistics": to_statistics(datapoints)}

    @app.route("/get_answers", methods=['GET'])
    def get_answers():
        if (user_id := request.args.get("user_id", type=int)) is None:
            return {"error": f"user_id is not provided for get_answers request or could not cast to int"}, 400
        try:
            result = Schema.query_answers(user_id)
        except Exception as e:
            return {"error": f"Could not query answers data: {str(e)}"}, 503
        return {"answers": result}

    @app.route("/create_question", methods=['POST'])
    def create_question():
        try:
            data = gather_and_validate_fields({
                "question": str,
                "answer": int,
                "topic": str,
            }, request.json)
        except ValueError as e:
            return {"error": str(e) + " in data for /create_question"}, 400
        data |= gather_and_validate_fields({"comment": str}, request.json, required=False)
        try:
            new_ynquestion = Schema.YNQuestion(**data)
            db.session.add(new_ynquestion)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not add question: {str(e)}"}, 503
        return "OK", 200


if __name__ == "__main__":
    global_app, global_db = init_app()
    Schema = initialize_schema(global_db)
    initialize_request_handlers(global_app, global_db, Schema)
    global_app.run(debug=True)
