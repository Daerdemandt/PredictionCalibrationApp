from typing import Dict

from integration_tests.conftest import assert_user_deleted


def assert_valid_get_answers_response(response):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "answers" in jresp
    expected_keys = {
        "question",
        "comment",
        "real_answer",
        "user_answer",
        "probability",
    }
    for chunk in jresp["answers"]:
        assert set(chunk.keys()) == expected_keys


def assert_uqa_expected_data(answers):
    expected_data = {
        "TestQ1": {
            "real_answer": True,
            "user_answer": 0,
            "probability": 55,
            "comment": "",
        },
        "TestQ2": {
            "real_answer": False,
            "user_answer": 0,
            "probability": 55,
            "comment": "",
        },
        "TestQ3": {
            "real_answer": True,
            "user_answer": 1,
            "probability": 99,
            "comment": "test_comment",
        },
        "TestQ5": {
            "real_answer": False,
            "user_answer": 2,
            "probability": -1,
            "comment": "",
        }
    }
    assert len(answers) == len(expected_data.keys())
    for name, values in expected_data.items():
        answer_record = find_result_by_name(answers, name)
        assert_values_equal(answer_record, values)


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
    assert_uqa_expected_data(answers)


def test_get_answers_unknown_parameter_ignored(client_uqa):
    response = client_uqa.get("/get_answers?user_id=1&unknown_parameter=42")
    assert_valid_get_answers_response(response)
    answers = response.get_json()["answers"]
    assert_uqa_expected_data(answers)


def test_get_answers_no_user_id_provided_error(client_uqa):
    response = client_uqa.get("/get_answers")
    assert response.status_code == 400


def test_get_answers_no_such_user_empty_result(client_uqa):
    response = client_uqa.get("/get_answers?user_id=42")
    assert_valid_get_answers_response(response)
    answers = response.get_json()["answers"]
    assert len(answers) == 0


def test_get_answers_known_user_no_answers_empty_result(client_uq):
    response = client_uq.get("/get_answers?user_id=1")
    assert_valid_get_answers_response(response)
    answers = response.get_json()["answers"]
    assert len(answers) == 0


def test_delete_user_deletes_answers(client_uqa):
    response = client_uqa.delete(f'/delete_user?user_id=1')
    assert_user_deleted(response, 1, "TestUser1", 1)
    response = client_uqa.get("/get_answers?user_id=1")
    assert_valid_get_answers_response(response)
    answers = response.get_json()["answers"]
    assert len(answers) == 0
