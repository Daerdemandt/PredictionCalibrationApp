from flask import request


def initialize_user_interaction_api(app, db, Schema):
    @app.route("/get_users", methods=['GET'])
    def get_users():
        try:
            users = Schema.User.query.all()
        except Exception as e:
            return {"error": f"Could not get users: {str(e)}"}, 503
        return {"users": [{"user_id": u.user_id, "name": u.name} for u in users]}

    @app.route("/create_user", methods=['POST'])
    def create_user():
        if (name := request.json.get("name")) is None:
            return {"error": "No user_id provided in post data"}, 400
        new_user = Schema.User(name=name)
        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not add user: {str(e)}"}, 503
        return get_users()

    @app.route("/delete_user", methods=['DELETE'])
    def delete_user():
        if (user_id := request.args.get("user_id", type=int)) is None:
            return {"error": f"user_id is not provided for delete user request or could not cast to int"}, 400
        try:
            user = Schema.User.query.filter_by(user_id=user_id).one()
            db.session.delete(user)
            db.session.commit()
        except Exception as e:
            return {"error": f"Could not delete user: {str(e)}"}, 503
        return get_users()
