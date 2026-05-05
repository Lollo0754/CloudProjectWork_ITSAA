from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str
    ruolo: str = "operatore"


class Token(BaseModel):
    access_token: str
    token_type: str
    ruolo: str
    username: str


class SegnalazioneCreate(BaseModel):
    tipo: str
    descrizione: str
    latitudine: float
    longitudine: float


class SegnalazioneUpdate(BaseModel):
    stato: str


class SegnalazioneOut(BaseModel):
    id: int
    tipo: str
    descrizione: str
    latitudine: float
    longitudine: float
    stato: str
    operatore_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    closed_at: Optional[datetime]

    class Config:
        from_attributes = True


class Stats(BaseModel):
    aperte: int
    in_carico: int
    chiuse: int
    durata_media_minuti: Optional[float]
