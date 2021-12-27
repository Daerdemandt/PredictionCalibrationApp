from tqdm import tqdm

from common.base_app import init_app
from db_ops.schema import initialize_schema
from common.utils import load_questions


def recreate_db(db, Schema):
    db.create_all()
    questions = load_questions()
    for record in tqdm(questions, total=len(questions)):
        try:
            db.session.add(Schema.YNQuestion(**record))
        except AssertionError as ae:
            print(f"Question {record['question']} could not be added: {str(ae)}")
    try:
        db.session.commit()
    except Exception as e:
        print(f"Could not commit questions: {str(e)}")


if __name__ == "__main__":
    app, db = init_app()
    Schema = initialize_schema(db)
    recreate_db(db, Schema)
