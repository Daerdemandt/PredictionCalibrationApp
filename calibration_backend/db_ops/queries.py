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


def construct_answers_statistics_query(db, YNQuestion, YNAnswer, /, with_text_data):
    def query_answers_statistics(user_id):
        answered_questions_for_user_q = db.session.query(YNAnswer) \
            .filter_by(user_id=user_id) \
            .subquery()
        result_select = [
            YNQuestion.answer.label("real_answer"),
            answered_questions_for_user_q.c.answer.label("user_answer"),
            answered_questions_for_user_q.c.probability.label("probability")
        ]
        if with_text_data:
            result_select.extend([
                YNQuestion.question.label("question"),
                YNQuestion.comment.label("comment")
            ])
        comparisons_for_user_q = db.session.query(*result_select) \
            .join(answered_questions_for_user_q)
        human_readable_names = [c["name"] for c in comparisons_for_user_q.column_descriptions]

        def to_dict(tup):
            return {k: v for (k, v) in zip(human_readable_names, tup, strict=True)}

        return [to_dict(tup) for tup in comparisons_for_user_q.all()]

    return query_answers_statistics
