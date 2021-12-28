from enum import Enum

from sqlalchemy import ForeignKey
from sqlalchemy.orm import validates

from common.utils import make_to_dict_clsfn


def construct_prediction_table(db, User):
    class Prediction(db.Model):
        class PredictionResult(Enum):
            UNRESOLVED = -1
            RESOLVED_FALSE = 0
            RESOLVED_TRUE = 1
            AMBIGUOUS_RESULT = 2

        __tablename__ = "predictions"

        prediction_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
        user_id = db.Column(db.Integer, ForeignKey('users.user_id'), nullable=False)
        prediction = db.Column(db.Text, nullable=False)
        probability = db.Column(db.Integer, nullable=False)
        resolve_ts = db.Column(db.Integer, nullable=False)
        created_ts = db.Column(db.Integer, nullable=False)
        result = db.Column(db.Integer, default=PredictionResult.UNRESOLVED.value)

        to_dict = make_to_dict_clsfn(
            ["prediction_id", "user_id", "prediction", "probability",
             "resolve_ts", "created_ts", "result"])

        @validates('user_id')
        def validate_user_id(self, key, user_id):
            if not User.query.filter(User.user_id == user_id).first():
                raise AssertionError('Prediction of unknown user')
            return user_id

        @validates('prediction')
        def validate_prediction(self, key, prediction):
            if not prediction:
                raise AssertionError('No prediction provided')
            return prediction

        @validates('probability')
        def validate_probability(self, key, probability):
            if probability < 50 or probability > 99:
                raise AssertionError('Invalid probability')
            return probability

        @validates('result')
        def validate_result(self, key, result):
            if result not in {p.value for p in Prediction.PredictionResult}:
                raise AssertionError(f'Invalid prediction result: {str(result)}')
            return result

        def __repr__(self):
            return f"<Prediction {self.user_id}, {self.prediction_id}, {self.prediction}>"

    return Prediction
