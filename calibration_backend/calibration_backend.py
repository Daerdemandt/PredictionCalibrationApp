from api_handlers.prediction_api import initialize_prediction_interaction_api
from api_handlers.questions_api import initialize_question_interaction_api
from api_handlers.statistics_and_history_api import initialize_statistics_and_history_interaction_api
from api_handlers.user_api import initialize_user_interaction_api
from common.base_app import init_app
from db_ops.schema import initialize_schema


def initialize_request_handlers(app, Schema):
    initialize_user_interaction_api(app, Schema)
    initialize_question_interaction_api(app, Schema)
    initialize_statistics_and_history_interaction_api(app, Schema)
    initialize_prediction_interaction_api(app, Schema)


if __name__ == "__main__":
    global_app, global_db = init_app()
    Schema = initialize_schema(global_db)
    initialize_request_handlers(global_app, Schema)
    global_app.run(debug=True)
