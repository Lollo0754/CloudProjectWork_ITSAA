import json
import boto3
from botocore.exceptions import ClientError
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Impostazioni base (usate in locale e come fallback)
    database_url: str = "postgresql://postgres:password@db:5432/cloudproject"
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    data_dir: str = "/app/data"

    # Impostazioni AWS (attive solo in produzione)
    use_aws: bool = False
    aws_region: str = "eu-west-1"
    aws_secret_name: str = "cloudproject/prod"
    s3_bucket: str = ""
    s3_timeline_key: str = "timeline.json"

    class Config:
        env_file = ".env"


def _load_settings() -> Settings:
    s = Settings()
    if not s.use_aws:
        return s

    # Recupera DATABASE_URL e SECRET_KEY da Secrets Manager
    try:
        client = boto3.client("secretsmanager", region_name=s.aws_region)
        response = client.get_secret_value(SecretId=s.aws_secret_name)
        secrets = json.loads(response["SecretString"])
        s.database_url = secrets.get("DATABASE_URL", s.database_url)
        s.secret_key = secrets.get("SECRET_KEY", s.secret_key)
        print(f"[config] Secrets caricati da Secrets Manager ({s.aws_secret_name})")
    except ClientError as e:
        print(f"[config] ATTENZIONE: impossibile leggere Secrets Manager: {e}")

    return s


settings = _load_settings()
