from sqlalchemy.orm import relationship, validates

from common.utils import make_to_dict_clsfn


def construct_ynquestion_table(db):
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

    return YNQuestion
