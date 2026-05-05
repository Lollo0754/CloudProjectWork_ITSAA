from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import get_db
from routers.auth import get_current_user
import models, schemas

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)

    async def broadcast(self, data: dict):
        for ws in list(self.connections):
            try:
                await ws.send_json(data)
            except Exception:
                self.disconnect(ws)


manager = ConnectionManager()


@router.get("/stats", response_model=schemas.Stats)
def get_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    aperte = db.query(models.Segnalazione).filter(models.Segnalazione.stato == "aperta").count()
    in_carico = db.query(models.Segnalazione).filter(models.Segnalazione.stato == "in_carico").count()
    chiuse = db.query(models.Segnalazione).filter(models.Segnalazione.stato == "chiusa").count()

    closed = db.query(models.Segnalazione).filter(
        models.Segnalazione.stato == "chiusa",
        models.Segnalazione.closed_at.isnot(None),
    ).all()

    avg = None
    if closed:
        durations = [(s.closed_at - s.created_at).total_seconds() / 60 for s in closed]
        avg = round(sum(durations) / len(durations), 1)

    return {"aperte": aperte, "in_carico": in_carico, "chiuse": chiuse, "durata_media_minuti": avg}


@router.get("/", response_model=List[schemas.SegnalazioneOut])
def get_all(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Segnalazione).order_by(models.Segnalazione.created_at.desc()).all()


@router.post("/", response_model=schemas.SegnalazioneOut, status_code=201)
async def create(
    data: schemas.SegnalazioneCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    seg = models.Segnalazione(
        tipo=data.tipo,
        descrizione=data.descrizione,
        latitudine=data.latitudine,
        longitudine=data.longitudine,
        stato="aperta",
        operatore_id=current_user.id,
    )
    db.add(seg)
    db.commit()
    db.refresh(seg)
    await manager.broadcast({"event": "new", "id": seg.id})
    return seg


@router.patch("/{seg_id}", response_model=schemas.SegnalazioneOut)
async def update_stato(
    seg_id: int,
    data: schemas.SegnalazioneUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    seg = db.query(models.Segnalazione).filter(models.Segnalazione.id == seg_id).first()
    if not seg:
        raise HTTPException(status_code=404, detail="Segnalazione non trovata")
    seg.stato = data.stato
    seg.updated_at = datetime.utcnow()
    if data.stato == "chiusa":
        seg.closed_at = datetime.utcnow()
    db.commit()
    db.refresh(seg)
    await manager.broadcast({"event": "update", "id": seg.id, "stato": seg.stato})
    return seg


@router.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
