from common.base_app import db
from db_ops.entities import YNAnswer, YNQuestion


def query_remaining_questions(user_id):
    answered_questions_for_user_q = YNAnswer.query \
        .filter_by(user_id=user_id) \
        .subquery()
    remaining_questions_for_user_q = db.session.query(YNQuestion) \
        .outerjoin(answered_questions_for_user_q) \
        .filter_by(answer=None)
    questions = remaining_questions_for_user_q.all()
    return questions


def query_answers_statistics_datapoints(user_id):
    answered_questions_for_user_q = db.session.query(YNAnswer) \
        .filter_by(user_id=user_id) \
        .subquery()
    comparisons_for_user_q = db.session.query(
        YNQuestion.answer,
        answered_questions_for_user_q.c.answer,
        answered_questions_for_user_q.c.probability) \
        .join(answered_questions_for_user_q)
    datapoints = comparisons_for_user_q.all()
    return datapoints