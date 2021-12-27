from flask import request

from common.utils import gather_and_validate_fields


def initialize_prediction_interaction_api(app, Schema):
    @app.route("/create_prediction", methods=['POST'])
    def create_prediction():
        try:
            data = gather_and_validate_fields({
                "user_id": int,
                "prediction": str,
                "resolve_ts": int,
                "created_ts": int
            }, request.json)
        except ValueError as e:
            return {"error": str(e) + " in data for /create_prediction"}, 400
        try:
            new_prediction = Schema.Prediction(**data)
            Schema.db.session.add(new_prediction)
            Schema.db.session.commit()
        except Exception as e:
            return {"error": f"Could not add prediction: {str(e)}"}, 503
        return "OK", 200

    @app.route("/resolve_prediction", methods=['PUT'])
    def resolve_prediction():
        try:
            data = gather_and_validate_fields(
                {"prediction_id": int, "result": int},
                request.args)
        except ValueError as e:
            return {"error": str(e) + " in data for /resolve_prediction"}, 400
        try:
            prediction = Schema.Prediction.query.filter_by(
                prediction_id=data["prediction_id"]).first()
            if not prediction:
                raise ValueError(f"Prediction with id={data['prediction_id']} not found")
            prediction.result = data["result"]
            Schema.db.session.commit()
        except Exception as e:
            return {"error": f"Could not modify prediction: {str(e)}"}, 503
        return "OK", 200

    @app.route("/get_predictions", methods=['GET'])
    def get_predictions():
        try:
            data = gather_and_validate_fields({"user_id": int}, request.args)
        except ValueError as e:
            return {"error": str(e) + " in data for /get_predictions"}, 400
        try:
            predictions = Schema.Prediction.query.filter_by(user_id=data["user_id"]).all()
            return {"predictions": [p.to_dict() for p in predictions]}
        except Exception as e:
            return {"error": f"Could not get predictions: {str(e)}"}, 503
