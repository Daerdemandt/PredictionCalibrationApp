from sqlalchemy.orm import relationship, validates


def construct_user_table(db):
    class User(db.Model):
        __tablename__ = "users"

        user_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
        name = db.Column(db.String(64), nullable=False)

        ynanswer = relationship("YNAnswer", cascade="all,delete", backref="users")
        prediction_rel = relationship("Prediction", cascade="all,delete", backref="users")

        @validates('name')
        def validate_username(self, key, name):
            if not name:
                raise AssertionError('No username provided')
            if User.query.filter(User.name == name).first():
                raise AssertionError('Username is already in use')
            return name

        def __repr__(self):
            return f"<User {self.user_id}>"

    return User
