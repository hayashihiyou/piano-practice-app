from backend.app.repository import InMemoryRepository
from backend.app.services.analysis import AnalysisService
from backend.app.services.score_ingestion import ScoreIngestionService
from backend.app.storage import LocalStorageGateway


def test_pdf_ingestion_requires_review(tmp_path) -> None:
  repository = InMemoryRepository()
  storage = LocalStorageGateway(tmp_path)
  service = ScoreIngestionService(repository, storage)
  piece = repository.get_piece("piece-bach")
  assert piece is not None

  score, job = service.ingest(piece, "bach-score.pdf", b"%PDF mock score bytes")

  assert job.status == "needs_review"
  assert job.lowConfidenceMeasures
  assert any(measure.lowConfidence for measure in score.measures)


def test_analysis_job_is_blocked_until_score_is_ready(tmp_path) -> None:
  repository = InMemoryRepository()
  storage = LocalStorageGateway(tmp_path)
  service = AnalysisService(repository, storage)

  try:
    service.create_job("piece-twinkle", "session-today", "take.webm", b"1234")
  except ValueError as error:
    assert "blocked" in str(error)
  else:
    raise AssertionError("analysis should be blocked for unreviewed scores")


def test_analysis_job_returns_result_for_ready_piece(tmp_path) -> None:
  repository = InMemoryRepository()
  storage = LocalStorageGateway(tmp_path)
  service = AnalysisService(repository, storage)

  job, result = service.create_job("piece-nocturne", "session-nocturne", "take.webm", b"stable audio bytes" * 256)

  assert job.status == "completed"
  assert result.status == "completed"
  assert result.measureFindings
  assert result.noteFindings
  assert result.alignmentConfidence > 0.6
