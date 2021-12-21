from pathlib import Path

import pytest

from calibration_backend import initialize_request_handlers
from common.base_app import init_app
from common.utils import dict_intersection, exactly_one
from db_ops.entities import initialize_schema


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


@pytest.fixture(scope="function")
def client_uq(client):
    _ = client.post('/create_user', json={"name": "TestUser1"})
    _ = client.post('/create_user', json={"name": "TestUser2"})
    _ = client.post('/create_question', json={
        "question": "TestQ1", "answer": 1, "topic": "integration_testing"})
    _ = client.post('/create_question', json={
        "question": "TestQ2", "answer": 0, "topic": "integration_testing"})
    _ = client.post('/create_question', json={
        "question": "TestQ3", "answer": 1, "topic": "more_testing"})
    yield client


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


def assert_get_questions_correct_response(response):
    assert response.status_code == 200
    jresp = response.get_json()
    assert "questions" in jresp
    assert "page" in jresp
    assert "has_more" in jresp


def assert_question_in_response(questions, qdata, expected_num):
    assert len(questions) == expected_num
    if expected_num > 0:
        assert exactly_one((dict_intersection(qdata, q) == qdata for q in questions))
