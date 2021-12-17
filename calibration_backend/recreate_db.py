import pathlib

from common.base_app import init_app
from db_ops.entities import initialize_schema
from common.utils import load_questions


def recreate_db(is_testing=False, with_clean=False):
    with_clean |= is_testing

    app, db = init_app(is_testing)
    Schema = initialize_schema(db)

    if with_clean:
        pathlib.Path(app.config["DATABASE_FILEPATH"]).unlink(missing_ok=True)
    db.create_all()

    for record in load_questions():
        try:
            db.session.add(Schema.YNQuestion(**record))
            db.session.commit()
        except AssertionError as ae:
            print(f"Question {record['question']} could not be added: {str(ae)}")


if __name__ == "__main__":
    recreate_db()
