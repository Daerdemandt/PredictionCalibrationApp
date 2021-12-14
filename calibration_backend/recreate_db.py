import pathlib
from calibration_backend import db, User

pathlib.Path("data.db").unlink(missing_ok=True)
db.create_all()
