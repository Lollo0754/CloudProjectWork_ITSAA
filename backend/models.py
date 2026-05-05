import enum
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class RuoloEnum(str, enum.Enum):
    operatore = "operatore"
    centrale = "centrale"


class StatoEnum(str, enum.Enum):
    aperta = "aperta"
    in_carico = "in_carico"
    annullata = "annullata"
    chiusa = "chiusa"


class TipoEnum(str, enum.Enum):
    incidente = "incidente"
    terremoto = "terremoto"
    incendio = "incendio"
    alluvione = "alluvione"
    altro = "altro"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    ruolo = Column(SAEnum(RuoloEnum), default=RuoloEnum.operatore, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    segnalazioni = relationship("Segnalazione", back_populates="operatore")


class Segnalazione(Base):
    __tablename__ = "segnalazioni"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(SAEnum(TipoEnum), nullable=False)
    descrizione = Column(String, nullable=False)
    latitudine = Column(Float, nullable=False)
    longitudine = Column(Float, nullable=False)
    stato = Column(SAEnum(StatoEnum), default=StatoEnum.aperta, nullable=False)
    operatore_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True), nullable=True)

    operatore = relationship("User", back_populates="segnalazioni")
