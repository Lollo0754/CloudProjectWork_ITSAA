import json
import os
import boto3
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException
from routers.auth import get_current_user
from config import settings

router = APIRouter()


def _load_from_s3() -> list:
    try:
        s3 = boto3.client("s3", region_name=settings.aws_region)
        obj = s3.get_object(Bucket=settings.s3_bucket, Key=settings.s3_timeline_key)
        return json.loads(obj["Body"].read().decode("utf-8"))
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Errore lettura S3: {e}")


def _load_from_local() -> list:
    path = os.path.join(settings.data_dir, "timeline.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="timeline.json non trovato")


@router.get("/")
def get_timeline(_=Depends(get_current_user)):
    if settings.use_aws and settings.s3_bucket:
        return _load_from_s3()
    return _load_from_local()
