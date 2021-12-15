from base_app import db
from db_schema import YNQuestion, YNAnswer

print(db.session.query(YNQuestion, YNAnswer).outerjoin(YNAnswer))
tmp = YNQuestion.query.outerjoin(YNAnswer, YNAnswer.ynq_id == YNQuestion.ynq_id)
print(tmp)
wtf = tmp.all()
pass