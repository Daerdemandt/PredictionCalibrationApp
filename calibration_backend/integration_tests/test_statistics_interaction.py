def assert_valid_statistics_response(response):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "statistics" in jresp
    expected_keys = {
        "real_answer",
        "user_answer",
        "probability",
    }
    for chunk in jresp["statistics"]:
        assert set(chunk.keys()) == expected_keys


def assert_uqa_expected_data(statistics):
    expected = [
        {"probability": 55, "real_answer": True, "user_answer": False},
        {"probability": 55, "real_answer": False, "user_answer": False},
        {"probability": 99, "real_answer": True, "user_answer": True},
    ]
    assert len(statistics) == len(expected)
    for chunk in statistics:
        assert chunk in expected, f"{chunk} not found in expected results or got it twice"
        expected.remove(chunk)


def test_statistics_empty_stats(client_uq):
    response = client_uq.get("/statistics?user_id=1")
    assert_valid_statistics_response(response)
    assert len(response.get_json()["statistics"]) == 0


def test_statistics_no_user_id_provided_error(client_uq):
    response = client_uq.get("/statistics")
    assert response.status_code == 400


def test_statistics_unknown_user_returns_empty_result(client_uq):
    # Does not check if user actually exists because
    # that answer shouldn't have been added in the first place
    response = client_uq.get("/statistics?user_id=42")
    assert_valid_statistics_response(response)
    assert len(response.get_json()["statistics"]) == 0


def test_statistics_happy_day(client_uqa):
    response = client_uqa.get("/statistics?user_id=1")
    assert_valid_statistics_response(response)
    statistics = response.get_json()["statistics"]
    assert_uqa_expected_data(statistics)


def test_statistics_unknown_parameter_ignored(client_uqa):
    # Does not check if user actually exists because
    # that answer shouldn't have been added in the first place
    response = client_uqa.get("/statistics?user_id=1&unknown_parameter=42")
    assert_valid_statistics_response(response)
    statistics = response.get_json()["statistics"]
    assert_uqa_expected_data(statistics)
