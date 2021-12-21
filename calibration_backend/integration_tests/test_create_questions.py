from copy import deepcopy
from integration_tests.conftest import assert_get_questions_correct_response, assert_question_in_response


def test_create_questions_happy_day(client):
    # no actual existing user needed
    response = client.get('/get_questions?page=1&user_id=1')
    assert_get_questions_correct_response(response)
    assert_question_in_response(response.get_json()["questions"], None, 0)
    qdata = {"question": "TestQ1", "answer": 1, "topic": "integration_testing"}
    response = client.post('/create_question', json=qdata)
    assert response.status_code == 200
    response = client.get('/get_questions?page=1&user_id=1')
    assert_get_questions_correct_response(response)
    assert_question_in_response(response.get_json()["questions"], qdata, 1)
    qdata = {"question": "TestQ2", "answer": 0, "topic": "integration_testing"}
    response = client.post('/create_question', json=qdata)
    assert response.status_code == 200
    response = client.get('/get_questions?page=1&user_id=1')
    assert_get_questions_correct_response(response)
    assert_question_in_response(response.get_json()["questions"], qdata, 2)


def test_create_questions_unknown_parameters_ignored(client):
    qdata = {"question": "TestQ1", "answer": 1, "topic": "integration_testing", "unknown_parameter": 42}
    response = client.post('/create_question?also_unknown_parameter=test', json=qdata)
    assert response.status_code == 200
    response = client.get('/get_questions?page=1&user_id=1')
    assert_get_questions_correct_response(response)
    del qdata["unknown_parameter"]
    assert_question_in_response(response.get_json()["questions"], qdata, 1)


def test_create_questions_error_when_duplicate(client):
    qdata = {"question": "TestQ1", "answer": 1, "topic": "integration_testing"}
    _ = client.post('/create_question', json=qdata)
    response = client.post('/create_question', json=qdata)
    assert response.status_code == 503
    response = client.get('/get_questions?page=1&user_id=1')
    assert_get_questions_correct_response(response)
    assert_question_in_response(response.get_json()["questions"], qdata, 1)


def test_create_questions_invalid_answer_error(client):
    qdata = {"question": "TestQ1", "answer": 2, "topic": "integration_testing"}
    response = client.post('/create_question', json=qdata)
    assert response.status_code == 503
    response = client.get('/get_questions?page=1&user_id=1')
    assert_get_questions_correct_response(response)
    assert len(response.get_json()["questions"]) == 0


def test_create_questions_not_enough_parameters_error(client):
    qdata = {"question": "TestQ1", "answer": 1, "topic": "integration_testing"}
    for key in qdata.keys():
        qdata_tmp = deepcopy(qdata)
        del qdata_tmp[key]
        response = client.post('/create_question', json=qdata_tmp)
        assert response.status_code == 400
        response = client.get('/get_questions?page=1&user_id=1')
        assert len(response.get_json()["questions"]) == 0
