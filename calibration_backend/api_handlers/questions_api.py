from flask import request

from common.utils import gather_and_validate_fields


def initialize_question_interaction_api(app, Schema):
    @app.route("/get_questions", methods=['GET'])
    def get_questions():
        try:
            data = gather_and_validate_fields({"user_id": int}, request.args)
        except ValueError as e:
            return {"error": str(e) + f"in data for /get_questions"}, 400
        questions = Schema.query_remaining_questions(data["user_id"])
        questions_payload = [q.to_dict() for q in questions]
        return {"questions": questions_payload}

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
            Schema.db.session.add(answer)
            Schema.db.session.commit()
        except Exception as e:
            return {"error": f"Could not add answer: {str(e)}"}, 503
        return "OK", 200

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
            Schema.db.session.add(new_ynquestion)
            Schema.db.session.commit()
        except Exception as e:
            return {"error": f"Could not add question: {str(e)}"}, 503
        return "OK", 200
