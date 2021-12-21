from integration_tests.conftest import assert_get_users_valid_response, assert_user_added, assert_user_deleted


def test_user_interaction_happy_day(client):
    response = client.get('/get_users')
    assert_get_users_valid_response(response)
    assert len(response.get_json()["users"]) == 0
    response = client.post('/create_user', json={"name": "TestUser1"})
    assert_user_added(response, 1, "TestUser1", 1)
    response = client.post('/create_user', json={"name": "TestUser2"})
    assert_user_added(response, 2, "TestUser2", 2)
    response = client.delete(f'/delete_user?user_id=1')
    assert_user_deleted(response, 1, "TestUser1", 1)


def test_user_interaction_unknown_parameters_ignored(client):
    response = client.get('/get_users?unknown_parameter=451')
    assert_get_users_valid_response(response)
    response = client.post('/create_user', json={"name": "TestUser1", "unknown_parameter": True})
    assert_user_added(response, 1, "TestUser1", 1)
    response = client.delete(f'/delete_user?user_id=1&unknown_parameter=test')
    assert_user_deleted(response, None, None, 0)


def test_user_interaction_name_required_when_creating_user(client):
    response = client.post('/create_user', json={"unknown_parameter": "TestUser1"})
    assert response.status_code == 400
    response = client.get('/get_users')
    assert_user_deleted(response, None, None, 0)


def test_user_interaction_user_id_required_when_deleting_user(client):
    response = client.post('/create_user', json={"name": "TestUser1"})
    assert_user_added(response, 1, "TestUser1", 1)
    response = client.delete(f'/delete_user?unknown_parameter=413')
    assert response.status_code == 400
    response = client.get('/get_users')
    assert_user_added(response, 1, "TestUser1", 1)


def test_user_interaction_delete_user(client_uq):
    response = client_uq.delete(f'/delete_user?user_id=1')
    assert_user_deleted(response, 1, "TestUser1", 1)


def test_user_interaction_delete_unknown_user(client_uq):
    response = client_uq.delete(f'/delete_user?user_id=42')
    assert response.status_code == 503
    response = client_uq.get('/get_users')
    assert_get_users_valid_response(response)
    assert len(response.get_json()["users"]) == 2
