import pathlib

from common.base_app import init_app
from db_ops.schema import initialize_schema
from common.utils import load_questions


def recreate_db(db, Schema):
    db.create_all()
    for record in load_questions():
        try:
            db.session.add(Schema.YNQuestion(**record))
            db.session.commit()
        except AssertionError as ae:
            print(f"Question {record['question']} could not be added: {str(ae)}")


if __name__ == "__main__":
    app, db = init_app()
    Schema = initialize_schema(db)
    recreate_db(db, Schema)
