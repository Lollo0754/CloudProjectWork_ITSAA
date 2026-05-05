from database import SessionLocal
from models import User, RuoloEnum
from security import hash_password


def init_db():
    db = SessionLocal()
    default_users = [
        {"username": "admin", "password": "admin123", "ruolo": RuoloEnum.centrale},
        {"username": "operatore1", "password": "password123", "ruolo": RuoloEnum.operatore},
    ]
    for u in default_users:
        if not db.query(User).filter(User.username == u["username"]).first():
            db.add(User(
                username=u["username"],
                password_hash=hash_password(u["password"]),
                ruolo=u["ruolo"]
            ))
    db.commit()
    db.close()
