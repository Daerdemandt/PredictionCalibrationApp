from common.utils import QUESTIONS_PAGE_LIMIT


def construct_remaining_questions_query(db, YNQuestion, YNAnswer):
    def query_remaining_questions(user_id):
        answered_questions_for_user_q = YNAnswer.query \
            .filter_by(user_id=user_id) \
            .subquery()
        remaining_questions_for_user_q = db.session.query(YNQuestion) \
            .outerjoin(answered_questions_for_user_q) \
            .filter_by(answer=None)
        questions = remaining_questions_for_user_q.limit(QUESTIONS_PAGE_LIMIT).all()
        return questions
    return query_remaining_questions


def construct_answers_statistics_query(db, YNQuestion, YNAnswer):
    def query_answers_statistics(user_id):
        answered_questions_for_user_q = db.session.query(YNAnswer) \
            .filter_by(user_id=user_id) \
            .subquery()
        comparisons_for_user_q = db.session.query(
            YNQuestion.answer,
            answered_questions_for_user_q.c.answer,
            answered_questions_for_user_q.c.probability) \
            .join(answered_questions_for_user_q)
        return comparisons_for_user_q.all()
    return query_answers_statistics


def construct_answers_query(db, YNQuestion, YNAnswer):
    result_labeling = [
        "question",
        "user_answer",
        "real_answer",
        "comment",
    ]

    def result_to_dict(tup):
        return {k: v for (k, v) in zip(result_labeling, tup, strict=True)}

    def query_answers(user_id):
        answered_questions_for_user_q = db.session.query(YNAnswer) \
            .filter_by(user_id=user_id) \
            .subquery()
        comparisons_for_user_q = db.session.query(
            YNQuestion.question,
            answered_questions_for_user_q.c.answer,
            YNQuestion.answer,
            YNQuestion.comment) \
            .join(answered_questions_for_user_q)
        return [result_to_dict(result) for result in comparisons_for_user_q.all()]
    return query_answers
