from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship, validates

from base_app import db
from utils import make_to_dict_clsfn, VALID_PROBABILITY_QUANTS


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    name = db.Column(db.String(64), nullable=False)

    ynanswer = relationship("YNAnswer", cascade="all,delete", backref="users")

    @validates('name')
    def validate_username(self, key, name):
        if not name:
            raise AssertionError('No username provided')
        if User.query.filter(User.name == name).first():
            raise AssertionError('Username is already in use')
        return name

    def __repr__(self):
        return f"<User {self.user_id}>"


class YNQuestion(db.Model):
    __tablename__ = "yn_questions"

    ynq_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question = db.Column(db.String(256), nullable=False)
    topic = db.Column(db.String(32), nullable=False)
    answer = db.Column(db.Boolean(), nullable=False)
    comment = db.Column(db.String(256), default="")

    to_dict = make_to_dict_clsfn(["ynq_id", "question", "topic", "answer", "comment"])
    ynanswer = relationship("YNAnswer", cascade="all,delete", backref="yn_questions")

    @validates('question')
    def validate_question(self, key, question):
        if not question:
            raise AssertionError('No question provided')
        if len(question) >= 256:
            raise AssertionError('Question is too long')
        if YNQuestion.query.filter(YNQuestion.question == question).first():
            raise AssertionError('Duplicate question')
        return question

    @validates('topic')
    def validate_topic(self, key, topic):
        if not topic:
            raise AssertionError('No topic provided')
        if len(topic) >= 32:
            raise AssertionError('Topic is too long')
        return topic

    @validates('answer')
    def validate_answer(self, key, answer):
        if answer not in {0, 1}:
            raise AssertionError('Invalid answer')
        return answer

    @validates('comment')
    def validate_comment(self, key, comment):
        if comment and len(comment) >= 256:
            raise AssertionError('Question is too long')
        return comment

    def __repr__(self):
        return f"<Question {self.ynq_id}>"


class YNAnswer(db.Model):
    __tablename__ = "yn_answers"

    user_id = db.Column(db.Integer, ForeignKey('users.user_id'),
                        primary_key=True, nullable=False)
    ynq_id = db.Column(db.Integer, ForeignKey('yn_questions.ynq_id'),
                       primary_key=True, nullable=False)
    answer = db.Column(db.Integer, nullable=False)
    probability = db.Column(db.Integer, nullable=False)

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
