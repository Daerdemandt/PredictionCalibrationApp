from sqlalchemy import ForeignKey
from sqlalchemy.orm import validates


def construct_prediction_table(db):
    class Prediction(db.Model):
        __tablename__ = "predictions"

        prediction_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
        user_id = db.Column(db.Integer, ForeignKey('users.user_id'), nullable=False)
        prediction = db.Column(db.Text, nullable=False)
        terminal_date = db.Column(db.DateTime, nullable=False)
        result = db.Column(db.Integer)

        @validates('prediction')
        def validate_prediction(self, key, prediction):
            if not prediction:
                raise AssertionError('No prediction provided')
            return prediction

        @validates('result')
        def validate_answer(self, key, result):
            if result not in {0, 1, 2}:
                raise AssertionError('Invalid prediction result')
            return result

        def __repr__(self):
            return f"<Answer {self.user_id}, {self.question_id}, {self.answer}>"

    return Prediction
