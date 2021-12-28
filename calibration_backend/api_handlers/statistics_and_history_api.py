from flask import request


def initialize_statistics_and_history_interaction_api(app, Schema):
    @app.route("/statistics", methods=['GET'])
    def get_statistics():
        if (user_id := request.args.get("user_id", type=int)) is None:
            return {"error": f"user_id is not provided for statistics request or could not cast to int"}, 400
        try:
            datapoints = Schema.query_answers_statistics(user_id)
        except Exception as e:
            return {"error": f"Could not query statistics data: {str(e)}"}, 503
        return {"statistics": datapoints}

    @app.route("/get_answers", methods=['GET'])
    def get_answers():
        if (user_id := request.args.get("user_id", type=int)) is None:
            return {"error": f"user_id is not provided for get_answers request or could not cast to int"}, 400
        try:
            result = Schema.query_answers(user_id)
        except Exception as e:
            return {"error": f"Could not query answers data: {str(e)}"}, 503
        return {"answers": result}
