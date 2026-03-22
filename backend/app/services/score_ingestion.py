from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from ..config import ROOT_DIR
from ..repository import InMemoryRepository
from ..schemas import CanonicalScore, Piece, ScoreIngestionJob, ScoreSourceType
from ..storage import LocalStorageGateway
from .musicxml import parse_musicxml


class ScoreIngestionService:
  def __init__(self, repository: InMemoryRepository, storage: LocalStorageGateway) -> None:
    self.repository = repository
    self.storage = storage

  def ingest(self, piece: Piece, filename: str, payload: bytes) -> tuple[CanonicalScore, ScoreIngestionJob]:
    source_type = detect_source_type(filename)
    preview_url = self.storage.save_bytes("scores", filename, payload)
    score_id = f"score-{uuid4().hex[:8]}"

    if source_type == "musicxml":
      xml_text = payload.decode("utf-8")
      score = parse_musicxml(xml_text, score_id=score_id, source_type="musicxml", fallback_title=piece.title)
      job = ScoreIngestionJob(
        id=f"job-{uuid4().hex[:8]}",
        pieceId=piece.id,
        sourceType=source_type,
        status="ready",
        overallConfidence=1.0,
        lowConfidenceMeasures=[],
        previewUrl=preview_url,
      )
      piece.analysisReady = True
    else:
      score = self._run_mock_omr(piece.title, source_type, score_id)
      low_confidence = [measure.number for measure in score.measures if measure.number % 2 == 0][:2] or [1]
      measures = []
      for measure in score.measures:
        measures.append(measure.model_copy(update={"lowConfidence": measure.number in low_confidence}))
      score = score.model_copy(update={"measures": measures})
      job = ScoreIngestionJob(
        id=f"job-{uuid4().hex[:8]}",
        pieceId=piece.id,
        sourceType=source_type,
        status="needs_review",
        overallConfidence=0.61,
        lowConfidenceMeasures=low_confidence,
        previewUrl=preview_url,
      )
      piece.analysisReady = False

    piece.canonicalScoreId = score.id
    piece.scoreSourceType = source_type
    self.repository.save_piece(piece)
    self.repository.save_score(score)
    self.repository.save_ingestion_job(job)
    return score, job

  def apply_corrections(self, score_id: str, confirmed_measures: list[int]) -> CanonicalScore:
    score = self.repository.get_score(score_id)
    if score is None:
      raise ValueError("Score not found")

    job = self.repository.get_job_by_score(score_id)
    if job is None:
      raise ValueError("Ingestion job not found")

    remaining = [measure for measure in job.lowConfidenceMeasures if measure not in confirmed_measures]
    measures = []
    for measure in score.measures:
      measures.append(measure.model_copy(update={"lowConfidence": measure.number in remaining}))

    updated_score = score.model_copy(update={"measures": measures})
    updated_job = job.model_copy(
      update={
        "lowConfidenceMeasures": remaining,
        "status": "ready" if not remaining else "needs_review",
        "overallConfidence": 1.0 if not remaining else job.overallConfidence,
      },
    )

    self.repository.save_score(updated_score)
    self.repository.save_ingestion_job(updated_job)

    piece = self.repository.get_piece(job.pieceId)
    if piece is not None:
      piece.analysisReady = not remaining
      self.repository.save_piece(piece)

    return updated_score

  def _run_mock_omr(self, title: str, source_type: ScoreSourceType, score_id: str) -> CanonicalScore:
    sample_path = ROOT_DIR / "samples" / "twinkle.musicxml"
    if not sample_path.exists():
      return CanonicalScore(id=score_id, title=title, sourceType=source_type, baseTempo=80, tempoMap=[], measures=[])

    xml_text = sample_path.read_text(encoding="utf-8")
    return parse_musicxml(xml_text, score_id=score_id, source_type="musicxml", fallback_title=title)


def detect_source_type(filename: str) -> ScoreSourceType:
  extension = Path(filename).suffix.lower()
  if extension in {".musicxml", ".xml"}:
    return "musicxml"
  if extension == ".pdf":
    return "pdf"
  if extension in {".png", ".jpg", ".jpeg", ".heic", ".webp"}:
    return "image"
  raise ValueError("Unsupported score file type")
