from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from common.utils import PROJECT_ROOT


def init_app(is_testing=False):
    dbname = "data_testing.db" if is_testing else "data.db"
    global_app = Flask(__name__)
    global_app.config["DATABASE_FILEPATH"] = f"{PROJECT_ROOT}/{dbname}"
    global_app.config["SQLALCHEMY_DATABASE_URI"] = \
        "sqlite:///" + global_app.config["DATABASE_FILEPATH"]
    global_app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    global_db = SQLAlchemy(global_app)
    return global_app, global_db
