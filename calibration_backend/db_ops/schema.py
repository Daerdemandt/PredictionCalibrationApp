from db_ops.queries import construct_remaining_questions_query, construct_answers_statistics_query, \
    construct_answers_history_query, construct_predictions_statistics_query
from db_ops.tables.prediction import construct_prediction_table
from db_ops.tables.user import construct_user_table
from db_ops.tables.ynanswer import construct_ynanswer_table
from db_ops.tables.ynquestion import construct_ynquestion_table


def initialize_schema(db):
    if hasattr(initialize_schema, "schema"):
        return initialize_schema.schema
    else:
        class Schema:
            User = construct_user_table(db)
            YNQuestion = construct_ynquestion_table(db)
            YNAnswer = construct_ynanswer_table(db, User, YNQuestion)
            Prediction = construct_prediction_table(db, User)
            query_remaining_questions = staticmethod(
                construct_remaining_questions_query(
                    db, YNQuestion, YNAnswer))
            query_answers_statistics = staticmethod(
                construct_answers_statistics_query(db, YNQuestion, YNAnswer))
            query_predictions_statistics = staticmethod(
                construct_predictions_statistics_query(db, Prediction))
            query_answers = staticmethod(
                construct_answers_history_query(db, YNQuestion, YNAnswer))

        Schema.db = db  # since they are used in tandem anyway
        initialize_schema.schema = Schema
        return initialize_schema.schema
