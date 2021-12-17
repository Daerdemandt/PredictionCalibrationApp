from flask import request
from common.base_app import init_app
from db_ops.entities import initialize_schema
from statistics import to_statistics


def initialize_request_handlers(app, db):
    Schema = initialize_schema(db)

    @app.route("/get_questions", methods=['GET'])
    def get_questions():
        page = int(request.args.get("page"))
        try:
            user_id = int(request.args.get("user_id"))
        except Exception as e:
            print("Tried to get questions without user_id or could not parse user_id")
            return "Error"
        questions = Schema.query_remaining_questions(user_id)
        questions_payload = [q.to_dict() for q in questions]
        return {
            "questions": questions_payload,
            "page": page,
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
        data = request.get_json()
        new_user = Schema.User(name=data["name"])
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not add user: {str(e)}"}, 503
        return get_users()

    @app.route("/delete_user", methods=['DELETE'])
    def delete_user():
        user_id = int(request.args.get("user_id"))
        user = Schema.User.query.filter_by(user_id=user_id).one()
        try:
            db.session.delete(user)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not delete user: {str(e)}"}, 503
        return get_users()

    @app.route("/answer_question", methods=['POST'])
    def answer_question():
        data = request.get_json()
        answer = Schema.YNAnswer(**{field: data[field] for field in
                             ["user_id", "ynq_id", "answer", "probability"]})
        try:
            db.session.add(answer)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not add answer: {str(e)}"}, 503
        return "OK"

    @app.route("/statistics", methods=['GET'])
    def get_statistics():
        try:
            user_id = int(request.args.get("user_id"))
        except:
            print(f"Bad request for /statistics: {request.url}, no user_id")
            return {"error": "No user provided"}, 400
        try:
            datapoints = Schema.query_answers_statistics(user_id)
        except Exception as e:
            return {"error": f"Could not query statistics data: {str(e)}"}, 503
        return {"statistics": to_statistics(datapoints)}


if __name__ == "__main__":
    global_app, global_db = init_app()
    initialize_request_handlers(global_app, global_db)
    global_app.run(debug=True)
