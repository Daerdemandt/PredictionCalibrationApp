from sqlalchemy import and_, or_

from common.utils import QUESTIONS_PAGE_LIMIT


def all_query_results_as_list_of_dicts(query):
    def to_dict(tup):
        human_readable_names = [c["name"] for c in query.column_descriptions]
        return {k: v for (k, v) in zip(human_readable_names, tup, strict=True)}

    return [to_dict(tup) for tup in query.all()]


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
            .filter(and_(YNAnswer.user_id == user_id, or_(YNAnswer.answer == 0, YNAnswer.answer == 1))) \
            .subquery()
        comparisons_for_user_q = db.session.query(
                (YNQuestion.answer == answered_questions_for_user_q.c.answer).label("is_correct"),
                answered_questions_for_user_q.c.probability.label("probability")
            ).join(answered_questions_for_user_q)
        return all_query_results_as_list_of_dicts(comparisons_for_user_q)
    return query_answers_statistics


def construct_predictions_statistics_query(db, Prediction):
    def query_answers_statistics(user_id):
        resolved_predictions_for_user_q = db.session.query(
                Prediction.result.label("is_correct"),
                Prediction.probability.label("probability"))\
            .filter(and_(Prediction.user_id == user_id,
                     or_(Prediction.result == Prediction.PredictionResult.RESOLVED_FALSE.value,
                         Prediction.result == Prediction.PredictionResult.RESOLVED_TRUE.value)))
        return all_query_results_as_list_of_dicts(resolved_predictions_for_user_q)
    return query_answers_statistics


def construct_answers_history_query(db, YNQuestion, YNAnswer):
    def query_answers_statistics(user_id):
        answered_questions_for_user_q = db.session.query(YNAnswer) \
            .filter_by(user_id=user_id) \
            .subquery()
        answers_for_user_q = db.session.query(
                YNQuestion.answer.label("real_answer"),
                answered_questions_for_user_q.c.answer.label("user_answer"),
                answered_questions_for_user_q.c.probability.label("probability"),
                YNQuestion.question.label("question"),
                YNQuestion.comment.label("comment")) \
            .join(answered_questions_for_user_q)
        return all_query_results_as_list_of_dicts(answers_for_user_q)
    return query_answers_statistics
