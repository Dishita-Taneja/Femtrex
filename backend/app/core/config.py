import os
import json
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

# Dynamically locate the root directory (containing package.json)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = current_dir
while project_root != os.path.dirname(project_root):
    if os.path.exists(os.path.join(project_root, "package.json")):
        break
    project_root = os.path.dirname(project_root)

# Load root .env first, then backend/.env (backend/.env takes precedence)
root_env = os.path.join(project_root, ".env")
backend_env = os.path.join(project_root, "backend", ".env")
env_files = [f for f in [root_env, backend_env] if os.path.exists(f)]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=env_files if env_files else root_env,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    GEMINI_API_KEY: Optional[str] = None
    GROK_API_KEY: Optional[str] = None
    FIREBASE_SERVICE_ACCOUNT_PATH: Optional[str] = None
    CHROMA_PERSIST_DIR: Optional[str] = None
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
                return [x.strip() for x in v.split(",") if x.strip()]
            except Exception:
                return [x.strip() for x in v.split(",") if x.strip()]
        return v

    @property
    def chroma_dir(self) -> str:
        if self.CHROMA_PERSIST_DIR:
            # If absolute path, use it. If relative, make it relative to project root.
            if os.path.isabs(self.CHROMA_PERSIST_DIR):
                return self.CHROMA_PERSIST_DIR
            return os.path.abspath(os.path.join(project_root, self.CHROMA_PERSIST_DIR))
        return os.path.abspath(os.path.join(project_root, "backend", "chroma_db"))

settings = Settings()
