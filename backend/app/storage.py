from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from .config import settings


class LocalStorageGateway:
  def __init__(self, root: Path | None = None) -> None:
    self.root = root or settings.storage_dir
    self.root.mkdir(parents=True, exist_ok=True)

  def save_bytes(self, category: str, filename: str, payload: bytes) -> str:
    target_dir = self.root / category
    target_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"{uuid4().hex}-{filename}"
    target_path = target_dir / safe_name
    target_path.write_bytes(payload)
    return str(target_path)

