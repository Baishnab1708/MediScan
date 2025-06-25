from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserOut, Token
from app.db.crud import create_user, authenticate_user, get_user_by_username_or_email
from app.services.auth import create_access_token
from app.dependencies import get_db

router = APIRouter(prefix="/auth", tags=["auth"])



# Signup endpoint
@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    if get_user_by_username_or_email(db, user_in.username) or get_user_by_username_or_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="User already exists")
    user = create_user(db, user_in)
    return user

# Helper function for login response
def login_response(user):
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Single login endpoint that supports both username and email
@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # The form_data.username field can contain either username or email
    # Our authenticate_user function will handle both
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return login_response(user)