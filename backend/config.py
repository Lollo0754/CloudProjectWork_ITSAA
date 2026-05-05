from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@db:5432/cloudproject"
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    data_dir: str = "/app/data"

    class Config:
        env_file = ".env"


settings = Settings()
