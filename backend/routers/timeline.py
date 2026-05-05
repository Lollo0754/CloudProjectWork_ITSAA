import json
import os
from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from config import settings

router = APIRouter()


@router.get("/")
def get_timeline(_=Depends(get_current_user)):
    path = os.path.join(settings.data_dir, "timeline.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="timeline.json non trovato")
