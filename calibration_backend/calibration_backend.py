from flask import Flask, request

app = Flask(__name__)

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
]


@app.route("/get_questions", methods=['GET'])
def get_questions():
    return {"questions": stub_questions, "page": 1, "has_more": False}


@app.route("/answer_question", methods=['POST'])
def answer_question():
    data = request.get_json()
    print(data)
    return "OK"


if __name__ == "__main__":
    app.run(debug=True)
