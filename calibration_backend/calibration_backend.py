from flask import request

from base_app import app, db
from db_schema import User, YNAnswer, YNQuestion
from statistics import to_statistics


@app.route("/get_questions", methods=['GET'])
def get_questions():
    page = int(request.args.get("page"))
    try:
        user_id = int(request.args.get("user_id"))
    except Exception as e:
        print("Tried to get questions without user_id or could not parse user_id")
        return "Error"
    answered_questions_for_user_q = YNAnswer.query\
        .filter_by(user_id=user_id)\
        .subquery()
    remaining_questions_for_user_q = db.session.query(YNQuestion)\
        .outerjoin(answered_questions_for_user_q)\
        .filter_by(answer=None)
    questions = remaining_questions_for_user_q.all()
    questions_payload = [q.to_dict() for q in questions]
    return {
        "questions": questions_payload,
        "page": page,
        "has_more": False
    }


@app.route("/get_users", methods=['GET'])
def get_users():
    users = User.query.all()
    return {"users": [{"user_id": u.user_id, "name": u.name} for u in users]}


@app.route("/create_user", methods=['POST'])
def create_user():
    data = request.get_json()
    new_user = User(name=data["name"])
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        return f"Error: {str(e)}"
    return get_users()


@app.route("/delete_user", methods=['DELETE'])
def delete_user():
    user_id = int(request.args.get("user_id"))
    user = User.query.filter_by(user_id=user_id).one()
    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        return f"Error: {str(e)}"
    return get_users()


@app.route("/answer_question", methods=['POST'])
def answer_question():
    data = request.get_json()
    answer = YNAnswer(**{field: data[field] for field in
                         ["user_id", "ynq_id", "answer", "probability"]})
    try:
        db.session.add(answer)
        db.session.commit()
    except Exception as e:
        return f"Error: {str(e)}"
    return "OK"


@app.route("/statistics", methods=['GET'])
def get_statistics():
    try:
        user_id = int(request.args.get("user_id"))
    except Exception:
        print("Tried to get questions without user_id or could not parse user_id")
        return "Error"

    answered_questions_for_user_q = db.session.query(YNAnswer) \
        .filter_by(user_id=user_id) \
        .subquery()
    comparisons_for_user_q = db.session.query(
        YNQuestion.answer,
        answered_questions_for_user_q.c.answer,
        answered_questions_for_user_q.c.probability) \
        .join(answered_questions_for_user_q)
    datapoints = comparisons_for_user_q.all()
    return {"statistics": to_statistics(datapoints)}


if __name__ == "__main__":
    app.run(debug=True)
