from flask import request
from sqlalchemy import and_

from common.utils import gather_and_validate_fields


def initialize_prediction_interaction_api(app, Schema):
    @app.route("/create_prediction", methods=['POST'])
    def create_prediction():
        try:
            data = gather_and_validate_fields({
                "user_id": int,
                "prediction": str,
                "probability": int,
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
            data |= gather_and_validate_fields(
                {"resolved_before_ts": int, "only_unresolved": int},
                request.args, required=False)
        except ValueError as e:
            return {"error": str(e) + " in data for /get_predictions"}, 400
        try:
            P = Schema.Prediction
            filter_conditions = [P.user_id == data["user_id"]]
            if "resolved_before_ts" in data:
                filter_conditions.append(P.resolve_ts < data["resolved_before_ts"])
            if "only_unresolved" in data and data["only_unresolved"] != 0:
                filter_conditions.append(P.result == P.PredictionResult.UNRESOLVED.value)
            query = P.query.filter(*filter_conditions)
            predictions = query.all()
            return {"predictions": [p.to_dict() for p in predictions]}
        except Exception as e:
            return {"error": f"Could not get predictions: {str(e)}"}, 503
