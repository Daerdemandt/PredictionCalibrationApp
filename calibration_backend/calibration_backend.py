from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    name = db.Column(db.String(64), nullable=False)

    def __repr__(self):
        return f"<User {self.id}>"


class YNQuestion(db.Model):
    __tablename__ = "yn_questions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question = db.Column(db.String(256), nullable=False)
    topic = db.Column(db.String(32), nullable=False)
    answer_question = db.Column(db.Boolean(), nullable=False)
    comment = db.Column(db.String(256), default="")

    def __repr__(self):
        return f"<Question {self.id}>"


class YNAnswer(db.Model):
    __tablename__ = "yn_answers"

    user_id = db.Column(db.Integer, ForeignKey('users.id'),
                        primary_key=True, nullable=False)
    ynq_id = db.Column(db.Integer, ForeignKey('yn_questions.id'),
                       primary_key=True, nullable=False)
    answer = db.Column(db.Integer, nullable=False)
    probability = db.Column(db.Integer, nullable=False)

    user = relationship("User")
    yn_question = relationship("YNQuestion")

    def __repr__(self):
        return f"<Answer {self.user_id}, {self.question_id}, {self.answer}>"


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = db.Column(db.Integer, ForeignKey('users.id'), nullable=False)
    prediction = db.Column(db.Text, nullable=False)
    terminal_date = db.Column(db.DateTime, nullable=False)
    result = db.Column(db.Integer)

    def __repr__(self):
        return f"<Answer {self.user_id}, {self.question_id}, {self.answer}>"


stub_questions = [
    {
        "id": 1,
        "question": "У Марса один спутник, как и у Земли",
        "topic": "science",
        "answer": False,
        "comment": "У Марса два спутника - Фобос и Деймос",
    },
    {
        "id": 2,
        "question": "Цинга вызывается дефицитом витамина C",
        "topic": "science",
        "answer": True,
        "comment": "",
    },
    {
        "id": 3,
        "question": "Латунь - сплав меди и железа",
        "topic": "science",
        "answer": False,
        "comment": "Латунь делается из меди и цинка",
    },
    {
        "id": 4,
        "question": "В 100 граммах чистого подсолнечного масла больше калорий, чем в 100 граммах стейка",
        "topic": "science",
        "answer": True,
        "comment": "Калорийность чистого жира примерно 880 ккал, а чистого белка - 440 ккал на 100 грамм",
    },
    {
        "id": 5,
        "question": "Гелий - самый лёгкий по атомной массе химический элемент",
        "topic": "science",
        "answer": False,
        "comment": "Водород - самый лёгкий по атомной массе элемент",
    },
    {
        "id": 6,
        "question": "Простуда вызывается бактериями",
        "topic": "science",
        "answer": False,
        "comment": "Простуда вызывается вирусами",
    },
    {
        "id": 7,
        "question": "Самое глубокое место на Земле находится в Тихом океане",
        "topic": "science",
        "answer": True,
        "comment": "Марианская впадина находится на западе Тихого океана",
    },
    {
        "id": 8,
        "question": "Времена года вызываются тем, что Земля путешествует вокруг Солнца по эллиптической траектории",
        "topic": "science",
        "answer": False,
        "comment": "Времена года вызываются наклоном оси вращения Земли. "
                   "Если бы дело было в эллиптической траектории, везде было бы одно и то же время года одновременно.",
    },
    {
        "id": 9,
        "question": "Юпитер - самая большая планета Солнечной системы",
        "topic": "science",
        "answer": True,
        "comment": "",
    },
    {
        "id": 10,
        "question": "Атомы в твёрдом веществе расположены более плотно чем в газе",
        "topic": "science",
        "answer": True,
        "comment": "",
    },
    {
        "id": 11,
        "question": "Во время солнечного затмения Луна находится между Солнцем и Землёй примерно на одной прямой",
        "topic": "science",
        "answer": True,
        "comment": "",
    },
    {
        "id": 12,
        "question": "Закон Мура гласит, что количество резисторов в вычислительных схемах каждые два года уменьшается в два раза",
        "topic": "science",
        "answer": False,
        "comment": "Закон Мура гласит, что количество транзисторов в интегральных схемах удваивается каждые два года",
    },
    {
        "id": 13,
        "question": "У типичного человека 23 пары хромосом",
        "topic": "science",
        "answer": True,
        "comment": "Всё верно, 22 пары аутосом и пара половых хромосом X и Y",
    },
]


PAGE_SIZE = 5


@app.route("/get_questions", methods=['GET'])
def get_questions():
    page = int(request.args.get("page"))
    questions = stub_questions[page * PAGE_SIZE: (page + 1) * PAGE_SIZE]
    return {
        "questions": questions,
        "page": page,
        "has_more": (page + 1) * PAGE_SIZE < len(stub_questions)
    }


@app.route("/answer_question", methods=['POST'])
def answer_question():
    data = request.get_json()
    print(data)
    answer = YNAnswer(
        user_id=data["user_id"], ynq_id=data["ynq_id"],
        answer=data["answer"], probability=data["probability"])
    try:
        db.session.add(answer)
        db.session.commit()
    except Exception as e:
        return f"Error: {str(e)}"
    return "OK"


if __name__ == "__main__":
    app.run(debug=True)
