from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError
from database import get_db
import models, schemas, security

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenziali non valide")
    token = security.create_token({"sub": user.username, "ruolo": user.ruolo.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "ruolo": user.ruolo.value,
        "username": user.username,
    }


@router.post("/register", status_code=201)
def register(data: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username già in uso")
    user = models.User(
        username=data.username,
        password_hash=security.hash_password(data.password),
        ruolo=data.ruolo,
    )
    db.add(user)
    db.commit()
    return {"message": "Utente creato"}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = security.decode_token(token)
        username: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token non valido")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utente non trovato")
    return user
