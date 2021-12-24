from typing import Dict


def assert_valid_get_answers_response(response):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "answers" in jresp
    for chunk in jresp["answers"]:
        assert all((field in chunk.keys() for field in {
            "question", "user_answer", "probability", "real_answer", "comment", }))


def find_result_by_name(answers, name):
    for item in answers:
        if item["question"] == name:
            return item
    raise AssertionError(f"Answer record for question {name} not found")


def assert_values_equal(tested: Dict, exemplar: Dict):
    for ke in exemplar.keys():
        assert tested[ke] == exemplar[ke]


def test_get_answers_happy_day(client_uqa):
    response = client_uqa.get("/get_answers?user_id=1")
    assert_valid_get_answers_response(response)
    answers = response.get_json()["answers"]
    assert len(answers) == 4
    answer_record = find_result_by_name(answers, "TestQ1")
    assert_values_equal(answer_record, {
        "real_answer": True,
        "user_answer": 0,
        "probability": 55,
        "comment": "",
    })
    answer_record = find_result_by_name(answers, "TestQ2")
    assert_values_equal(answer_record, {
        "real_answer": False,
        "user_answer": 0,
        "probability": 55,
        "comment": "",
    })
    answer_record = find_result_by_name(answers, "TestQ3")
    assert_values_equal(answer_record, {
        "real_answer": True,
        "user_answer": 1,
        "probability": 99,
        "comment": "test_comment",
    })
    answer_record = find_result_by_name(answers, "TestQ5")
    assert_values_equal(answer_record, {
        "real_answer": False,
        "user_answer": 2,
        "probability": -1,
        "comment": "",
    })


def test_get_answers_no_user_id_provided_error(client_uqa):
    response = client_uqa.get("/get_answers")
    assert response.status_code == 400


def test_get_answers_no_such_user_empty_result(client_uqa):
    response = client_uqa.get("/get_answers?user_id=42")
    assert_valid_get_answers_response(response)
    answers = response.get_json()["answers"]
    assert len(answers) == 0


def test_get_answers_knonw_user_no_answers_empty_result(client_uq):
    response = client_uq.get("/get_answers?user_id=1")
    assert_valid_get_answers_response(response)
    answers = response.get_json()["answers"]
    assert len(answers) == 0
