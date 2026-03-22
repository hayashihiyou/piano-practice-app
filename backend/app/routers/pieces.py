from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..dependencies import repository, score_ingestion_service
from ..schemas import Piece, PieceCreateRequest, PieceDetail, PieceStats, ScoreCorrectionRequest


router = APIRouter(tags=["pieces"])


@router.post("/pieces", response_model=Piece)
def create_piece(payload: PieceCreateRequest) -> Piece:
  piece = Piece(
    id=f"piece-{uuid4().hex[:8]}",
    title=payload.title,
    composer=payload.composer,
    color=payload.color,
    memo=payload.memo,
    scoreSourceType="musicxml",
    analysisReady=False,
    createdAt=datetime.utcnow(),
    stats=PieceStats(),
  )
  repository.save_piece(piece)
  return piece


@router.get("/pieces/{piece_id}", response_model=PieceDetail)
def get_piece(piece_id: str) -> PieceDetail:
  detail = repository.build_piece_detail(piece_id)
  if detail is None:
    raise HTTPException(status_code=404, detail="Piece not found")
  return detail


@router.post("/pieces/{piece_id}/score", response_model=PieceDetail)
async def upload_score(piece_id: str, file: UploadFile = File(...)) -> PieceDetail:
  piece = repository.get_piece(piece_id)
  if piece is None:
    raise HTTPException(status_code=404, detail="Piece not found")

  try:
    payload = await file.read()
    score_ingestion_service.ingest(piece, file.filename or "uploaded.musicxml", payload)
  except ValueError as error:
    raise HTTPException(status_code=400, detail=str(error)) from error

  detail = repository.build_piece_detail(piece_id)
  if detail is None:
    raise HTTPException(status_code=500, detail="Failed to rebuild piece detail")
  return detail


@router.patch("/scores/{score_id}/corrections", response_model=PieceDetail)
def apply_score_corrections(score_id: str, payload: ScoreCorrectionRequest) -> PieceDetail:
  try:
    score_ingestion_service.apply_corrections(score_id, payload.confirmedMeasures)
  except ValueError as error:
    raise HTTPException(status_code=404, detail=str(error)) from error

  piece = next((entry for entry in repository.pieces.values() if entry.canonicalScoreId == score_id), None)
  if piece is None:
    raise HTTPException(status_code=404, detail="Piece not found for score")

  detail = repository.build_piece_detail(piece.id)
  if detail is None:
    raise HTTPException(status_code=500, detail="Failed to rebuild piece detail")
  return detail

