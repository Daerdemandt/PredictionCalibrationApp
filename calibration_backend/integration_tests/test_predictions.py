import pytest

from integration_tests.conftest import assert_user_deleted


def assert_valid_get_predictions_response(response):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "predictions" in jresp
    expected_keys = {
        "prediction_id", "user_id", "prediction",
        "resolve_ts", "created_ts", "result"
    }
    for chunk in jresp["predictions"]:
        assert set(chunk.keys()) == expected_keys


def assert_uqp_predictions_statuses_unchanged(response):
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2
    assert all((p["result"] == -1) for p in predictions)


def test_create_predictions_simple(client_uq):
    data = {"user_id": 1, "prediction": "p1", "created_ts": 1000000, "resolve_ts": 2000000}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 200
    data = {"user_id": 1, "prediction": "p2", "created_ts": 1000000, "resolve_ts": 2000000}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 200
    response = client_uq.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2


def test_create_same_predictions_not_validated(client_uq):
    data = {"user_id": 1, "prediction": "p1", "created_ts": 1000000, "resolve_ts": 2000000}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 200
    data = {"user_id": 1, "prediction": "p1", "created_ts": 1000000, "resolve_ts": 2000000}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 200
    response = client_uq.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2


def test_resolved_before_created_not_validated(client_uq):
    # in case user wants to record prediction made elsewhere
    data = {"user_id": 1, "prediction": "p1", "created_ts": 1000000, "resolve_ts": 2000000}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 200
    data = {"user_id": 1, "prediction": "p2", "created_ts": 1000000, "resolve_ts": 1}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 200
    response = client_uq.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2


def test_prediction_unknown_user_id_error(client_uq):
    # in case user wants to record prediction made elsewhere
    data = {"user_id": 42, "prediction": "p1", "created_ts": 1000000, "resolve_ts": 2000000}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 503
    response = client_uq.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 0


def test_prediction_empty_text_error(client_uq):
    # in case user wants to record prediction made elsewhere
    data = {"user_id": 1, "prediction": "", "created_ts": 1000000, "resolve_ts": 2000000}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 503
    response = client_uq.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 0


def test_create_prediction_unknown_parameters_ignored(client_uq):
    data = {"user_id": 1, "prediction": "p1",
            "created_ts": 1000000, "resolve_ts": 2000000,
            "unknown_parameter": 42}
    response = client_uq.post('/create_prediction', json=data)
    assert response.status_code == 200
    response = client_uq.get('/get_predictions?user_id=1&unknown_parameter=111')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 1


@pytest.mark.parametrize("result", [-1, 0, 1, 2])
def test_resolve_prediction_simple(client_uqp, result):
    response = client_uqp.put(
        f'/resolve_prediction?prediction_id=1&result={result}')
    assert response.status_code == 200
    response = client_uqp.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2
    for p in predictions:
        assert p["result"] == (result if p["prediction_id"] == 1 else -1)


def test_resolve_prediction_unknown_parameters_ignored(client_uqp):
    response = client_uqp.put(
        f'/resolve_prediction?prediction_id=1&result=0&unknown_parameter=42')
    assert response.status_code == 200
    response = client_uqp.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2
    for p in predictions:
        assert p["result"] == (0 if p["prediction_id"] == 1 else -1)


@pytest.mark.parametrize("result, err_code", [(42, 503), ("abc", 400)])
def test_resolve_prediction_unknown_status_error(client_uqp, result, err_code):
    response = client_uqp.put(
        f'/resolve_prediction?prediction_id=1&result={result}')
    assert response.status_code == err_code
    response = client_uqp.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    assert_uqp_predictions_statuses_unchanged(response)


@pytest.mark.parametrize("prediction_id, err_code", [(42, 503), ("abc", 400)])
def test_resolve_prediction_unknown_prediction_id_error(client_uqp, prediction_id, err_code):
    response = client_uqp.put(
        f'/resolve_prediction?prediction_id={prediction_id}&result=0')
    assert response.status_code == err_code
    response = client_uqp.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    assert_uqp_predictions_statuses_unchanged(response)


def test_get_predictions_for_unknown_user_empty_response(client_uq):
    response = client_uq.get('/get_predictions?user_id=42')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 0


def test_delete_user_deletes_predictions(client_uqp):
    response = client_uqp.delete(f'/delete_user?user_id=1')
    assert_user_deleted(response, 1, "TestUser1", 1)
    response = client_uqp.get('/get_predictions?user_id=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 0


@pytest.mark.parametrize("resolve_ts, expected_len", [(2000001, 2), (2000000, 1), (1000000, 0)])
def test_get_predictions_with_resolve_ts(client_uqp, resolve_ts, expected_len):
    response = client_uqp.get(f'/get_predictions?user_id=1&resolved_before_ts={resolve_ts}')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == expected_len
    assert all((p["resolve_ts"] < resolve_ts for p in predictions))


@pytest.mark.parametrize("result", [0, 1, 2])
def test_get_predictions_with_only_unresolved(client_uqp, result):
    _ = client_uqp.put(f'/resolve_prediction?prediction_id=1&result={result}')
    response = client_uqp.get(f'/get_predictions?user_id=1&only_unresolved=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 1


def test_multiple_users_dont_interact(client_uqp):
    response = client_uqp.get(f'/get_predictions?user_id=1&only_unresolved=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2
    response = client_uqp.get(f'/get_predictions?user_id=2&only_unresolved=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 1

    _ = client_uqp.put(f'/resolve_prediction?prediction_id=3&result=1')
    response = client_uqp.get(f'/get_predictions?user_id=1&only_unresolved=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2
    response = client_uqp.get(f'/get_predictions?user_id=2&only_unresolved=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 0

    _ = client_uqp.delete(f'/delete_user?user_id=2')
    response = client_uqp.get(f'/get_predictions?user_id=1&only_unresolved=1')
    assert_valid_get_predictions_response(response)
    predictions = response.get_json()["predictions"]
    assert len(predictions) == 2
