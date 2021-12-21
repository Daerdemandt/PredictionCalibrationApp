def assert_valid_statistics_response(response):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "statistics" in jresp
    for chunk in jresp["statistics"]:
        assert all(
            (field in chunk.keys() for field in {"correct_percent", "probability_quotient", "total", "total_correct"}))


def test_statistics_empty_stats(client_uq):
    response = client_uq.get("/statistics?user_id=1")
    assert_valid_statistics_response(response)
    for chunk in response.get_json()["statistics"]:
        assert chunk["correct_percent"] is None
        assert chunk["total"] == 0
        assert chunk["total_correct"] == 0


def test_statistics_happy_day(client_uq):
    _ = client_uq.post('/answer_question', json={
        "user_id": 1, "ynq_id": 1, "answer": 0, "probability": 55})
    _ = client_uq.post('/answer_question', json={
        "user_id": 1, "ynq_id": 2, "answer": 0, "probability": 55})
    _ = client_uq.post('/answer_question', json={
        "user_id": 1, "ynq_id": 3, "answer": 1, "probability": 99})
    response = client_uq.get("/statistics?user_id=1")
    assert_valid_statistics_response(response)
    for chunk in response.get_json()["statistics"]:
        if chunk["probability_quotient"] == 55:
            assert chunk["correct_percent"] == 50
            assert chunk["total"] == 2
            assert chunk["total_correct"] == 1
        elif chunk["probability_quotient"] == 99:
            assert chunk["correct_percent"] == 100
            assert chunk["total"] == 1
            assert chunk["total_correct"] == 1
        else:
            assert chunk["correct_percent"] is None
            assert chunk["total"] == 0
            assert chunk["total_correct"] == 0


def test_statistics_no_user_id_provided_error(client_uq):
    response = client_uq.get("/statistics")
    assert response.status_code == 400


def test_statistics_unknown_user_returns_empty_result(client_uq):
    # Does not check if user actually exists because
    # that answer shouldn't have been added in the first place
    response = client_uq.get("/statistics?user_id=42")
    assert_valid_statistics_response(response)
    for chunk in response.get_json()["statistics"]:
        assert chunk["correct_percent"] is None
        assert chunk["total"] == 0
        assert chunk["total_correct"] == 0


def test_statistics_unknown_parameter_ignored(client_uq):
    # Does not check if user actually exists because
    # that answer shouldn't have been added in the first place
    response = client_uq.get("/statistics?user_id=1&unknown_parameter=42")
    assert_valid_statistics_response(response)
    for chunk in response.get_json()["statistics"]:
        assert chunk["correct_percent"] is None
        assert chunk["total"] == 0
        assert chunk["total_correct"] == 0
