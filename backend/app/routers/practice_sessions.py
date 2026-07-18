from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from ..dependencies import repository
from ..schemas import PracticeScreenData, PracticeSession, PracticeSessionStartRequest, PracticeSessionStopRequest


router = APIRouter(tags=["practice-sessions"])


@router.get("/practice-sessions/{session_id}", response_model=PracticeScreenData)
def get_practice_screen_data(session_id: str) -> PracticeScreenData:
  data = repository.build_practice_screen_data(session_id)
  if data is None:
    raise HTTPException(status_code=404, detail="Practice session not found")
  return data


@router.post("/practice-sessions/start", response_model=PracticeSession)
def start_practice_session(payload: PracticeSessionStartRequest) -> PracticeSession:
  piece = repository.get_piece(payload.pieceId)
  if piece is None:
    raise HTTPException(status_code=404, detail="Piece not found")

  session = PracticeSession(
    id=f"session-{uuid4().hex[:8]}",
    pieceId=piece.id,
    pieceTitle=piece.title,
    startedAt=payload.startedAt or datetime.now(UTC),
    memo=payload.memo,
    source=payload.source,
  )
  repository.save_session(session)
  return session


@router.post("/practice-sessions/{session_id}/stop", response_model=PracticeSession)
def stop_practice_session(session_id: str, payload: PracticeSessionStopRequest) -> PracticeSession:
  session = repository.get_session(session_id)
  if session is None:
    raise HTTPException(status_code=404, detail="Practice session not found")

  ended_at = payload.endedAt or datetime.now(UTC)
  duration = max(0, int((ended_at - session.startedAt).total_seconds()))
  updated = session.model_copy(
    update={
      "endedAt": ended_at,
      "durationSec": duration,
      "memo": payload.memo or session.memo,
      "analysisResultId": payload.analysisResultId or session.analysisResultId,
    },
  )
  repository.save_session(updated)
  return updated
