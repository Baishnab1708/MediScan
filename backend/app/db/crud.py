from sqlalchemy.orm import Session
from app.db.models import User
from app.schemas.user import UserCreate
from app.services.auth import get_password_hash, verify_password


def get_user_by_username_or_email(db: Session, identifier: str):
    return db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()


def create_user(db: Session, user_in: UserCreate):
    user = User(
        name=user_in.name,
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, identifier: str, password: str):
    user = get_user_by_username_or_email(db, identifier)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    # increment visits count
    user.visits += 1
    db.commit()
    return user