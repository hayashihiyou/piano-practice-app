from __future__ import annotations

import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]


class Settings:
  app_name = "Mobile Piano Practice Coach API"
  api_prefix = "/api"
  storage_dir = Path(os.getenv("PRACTICE_STORAGE_DIR", ROOT_DIR / "backend" / "local_storage"))
  omr_mode = os.getenv("OMR_MODE", "mock")
  transcription_mode = os.getenv("TRANSCRIPTION_MODE", "mock")


settings = Settings()

