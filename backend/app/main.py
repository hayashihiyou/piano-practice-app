from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers.analysis import router as analysis_router
from .routers.dashboard import router as dashboard_router
from .routers.pieces import router as pieces_router
from .routers.practice_sessions import router as practice_sessions_router


app = FastAPI(title=settings.app_name)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(dashboard_router, prefix=settings.api_prefix)
app.include_router(pieces_router, prefix=settings.api_prefix)
app.include_router(practice_sessions_router, prefix=settings.api_prefix)
app.include_router(analysis_router, prefix=settings.api_prefix)


@app.get("/health")
def healthcheck() -> dict[str, str]:
  return {"status": "ok"}
