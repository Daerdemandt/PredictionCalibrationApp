import pathlib

from common.base_app import db
from db_ops.entities import YNQuestion
from common.utils import load_questions

pathlib.Path("data.db").unlink(missing_ok=True)
db.create_all()

for record in load_questions():
    try:
        db.session.add(YNQuestion(**record))
        db.session.commit()
    except AssertionError as ae:
        print(f"Question {record['question']} could not be added: {str(ae)}")
