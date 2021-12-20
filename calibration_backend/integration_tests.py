from typing import List, Iterable

from calibration_backend import initialize_request_handlers
from common.base_app import init_app
from db_ops.entities import initialize_schema
from pathlib import Path
import pytest


@pytest.fixture(scope="session")
def app_db():
    app, db = init_app(is_testing=True)
    Schema = initialize_schema(db)
    initialize_request_handlers(app, db, Schema)
    yield app, db
    Path(app.config["DATABASE_FILEPATH"]).unlink(missing_ok=True)


@pytest.fixture(scope="function")
def client(app_db):
    app, db = app_db
    db.drop_all()  # in case db already exists after erroneous exit
    db.create_all()

    with app.test_client() as client:
        yield client

    db.drop_all()


def exactly_one(iterable: Iterable):
    result = False
    for value in iterable:
        if not result:
            result |= bool(value)
        else:
            return False
    return result


def assert_get_users_valid_response(response):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "users" in jresp


def assert_user_added(response, userid, username, usernum):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "users" in jresp
    assert len(jresp["users"]) == usernum
    assert jresp["users"][-1].keys() == {"user_id", "name"}
    assert exactly_one((u["user_id"] == userid and u["name"] == username for u in jresp["users"]))


def assert_user_deleted(response, userid, username, usernum):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "users" in jresp
    assert len(jresp["users"]) == usernum
    if usernum > 0:
        assert not any((u["user_id"] == userid or u["name"] == username for u in jresp["users"]))


def test_user_interaction_happy_day(client):
    response = client.get('/get_users')
    assert_get_users_valid_response(response)
    assert len(response.get_json()["users"]) == 0
    response = client.post('/create_user', data={"name": "TestUser1"})
    assert_user_added(response, 1, "TestUser1", 1)
    response = client.post('/create_user', data={"name": "TestUser2"})
    assert_user_added(response, 2, "TestUser2", 2)
    response = client.delete(f'/delete_user?user_id=1')
    assert_user_deleted(response, 1, "TestUser1", 1)


def test_user_interaction_unknown_parameters_ignored(client):
    response = client.get('/get_users?unknown_parameter=451')
    assert_get_users_valid_response(response)
    response = client.post('/create_user', data={"name": "TestUser1", "unknown_parameter": True})
    assert_user_added(response, 1, "TestUser1", 1)
    response = client.delete(f'/delete_user?user_id=1&unknown_parameter=test')
    assert_user_deleted(response, None, None, 0)


def test_user_interaction_name_required_when_creating_user(client):
    response = client.post('/create_user', data={"unknown_parameter": "TestUser1"})
    assert response.status_code == 400
    response = client.get('/get_users')
    assert_user_deleted(response, None, None, 0)


def test_user_interaction_user_id_required_when_deleting_user(client):
    response = client.post('/create_user', data={"name": "TestUser1"})
    assert_user_added(response, 1, "TestUser1", 1)
    response = client.delete(f'/delete_user?unknown_parameter=413')
    assert response.status_code == 400
    response = client.get('/get_users')
    assert_user_added(response, 1, "TestUser1", 1)
    

if __name__ == "__main__":
    pytest.main()
