from sqlalchemy import ForeignKey
from sqlalchemy.orm import validates

from common.utils import VALID_PROBABILITY_QUANTS


def construct_ynanswer_table(db, User, YNQuestion):
    class YNAnswer(db.Model):
        __tablename__ = "yn_answers"

        user_id = db.Column(db.Integer, ForeignKey('users.user_id'),
                            primary_key=True, nullable=False)
        ynq_id = db.Column(db.Integer, ForeignKey('yn_questions.ynq_id'),
                           primary_key=True, nullable=False)
        answer = db.Column(db.Integer, nullable=False)
        probability = db.Column(db.Integer, nullable=False)

        @validates('user_id')
        def validate_user_id(self, key, user_id):
            if not User.query.filter(User.user_id == user_id).first():
                raise AssertionError('Answer to question for unknown user')
            return user_id

        @validates('ynq_id')
        def validate_ynq_id(self, key, ynq_id):
            if not YNQuestion.query.filter(YNQuestion.ynq_id == ynq_id).first():
                raise AssertionError('Answer to unknown question')
            return ynq_id

        @validates('answer')
        def validate_answer(self, key, answer):
            if answer not in {0, 1, 2}:
                raise AssertionError('Invalid answer')
            return answer

        @validates('probability')
        def validate_probability(self, key, probability):
            if probability not in VALID_PROBABILITY_QUANTS:
                raise AssertionError('Invalid probability')
            return probability

        def __repr__(self):
            return f"<Answer {self.user_id}, {self.ynq_id}, {self.answer}>"

    return YNAnswer
