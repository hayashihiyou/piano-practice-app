from __future__ import annotations

import hashlib
from uuid import uuid4

from ..repository import InMemoryRepository
from ..schemas import AnalysisJob, AnalysisResult, CanonicalNote, MeasureFinding, NoteFinding
from ..storage import LocalStorageGateway


class AnalysisService:
  def __init__(self, repository: InMemoryRepository, storage: LocalStorageGateway) -> None:
    self.repository = repository
    self.storage = storage

  def create_job(self, piece_id: str, session_id: str, filename: str, payload: bytes) -> tuple[AnalysisJob, AnalysisResult]:
    piece = self.repository.get_piece(piece_id)
    if piece is None:
      raise ValueError("Piece not found")
    if not piece.analysisReady:
      raise ValueError("Strict analysis is blocked until low-confidence measures are corrected")

    score = self.repository.get_score(piece.canonicalScoreId)
    if score is None:
      raise ValueError("Canonical score not found")

    session = self.repository.get_session(session_id)
    if session is None:
      raise ValueError("Practice session not found")
    if session.pieceId != piece_id:
      raise ValueError("Practice session does not belong to the requested piece")

    audio_file_id = self.storage.save_bytes("audio", filename, payload)
    seed = int.from_bytes(hashlib.sha256(payload or filename.encode("utf-8")).digest()[:4], "big")
    result = build_mock_result(score.measures, piece_id, session_id, audio_file_id, seed, poor_quality=len(payload) < 2048)
    job = AnalysisJob(
      id=f"analysis-job-{uuid4().hex[:8]}",
      pieceId=piece_id,
      sessionId=session_id,
      audioFileId=audio_file_id,
      status="completed",
      resultId=result.id,
    )

    session.analysisResultId = result.id
    self.repository.save_session(session)
    self.repository.save_analysis_result(result)
    self.repository.save_analysis_job(job)
    return job, result


def build_mock_result(measures: list, piece_id: str, session_id: str, audio_file_id: str, seed: int, poor_quality: bool) -> AnalysisResult:
  overall_score = clamp(76 + (seed % 17), 58, 96)
  pitch_accuracy = clamp(80 + ((seed >> 1) % 15), 52, 98)
  tempo_consistency = clamp(72 + ((seed >> 2) % 18), 48, 96)
  alignment_confidence = 0.42 if poor_quality else round(0.68 + ((seed % 13) / 100), 2)

  note_pool: list[CanonicalNote] = [note for measure in measures for note in measure.notes]
  highlighted_measures = [measure.number for measure in measures[:3]] or [1]

  measure_findings = [
    MeasureFinding(
      measure=highlighted_measures[0],
      title="Stable opening",
      detail="First entries aligned closely with the canonical tempo map.",
      severity="good",
    ),
  ]

  if len(highlighted_measures) > 1:
    measure_findings.append(
      MeasureFinding(
        measure=highlighted_measures[1],
        title="Tempo drift",
        detail="The phrase accelerated compared with the score timing window.",
        severity="warn",
      ),
    )

  if len(highlighted_measures) > 2:
    measure_findings.append(
      MeasureFinding(
        measure=highlighted_measures[2],
        title="Chord release mismatch",
        detail="At least one note in the held sonority released too early.",
        severity="bad",
      ),
    )

  note_findings: list[NoteFinding] = []
  if note_pool:
    primary_note = note_pool[seed % len(note_pool)]
    note_findings.append(
      NoteFinding(
        noteId=primary_note.id,
        measure=int(primary_note.id.split("-", 1)[0]),
        expected=primary_note.noteName,
        actual=primary_note.noteName,
        issue="Played early",
      ),
    )

  if len(note_pool) > 1:
    secondary_note = note_pool[(seed // 3) % len(note_pool)]
    note_findings.append(
      NoteFinding(
        noteId=secondary_note.id,
        measure=int(secondary_note.id.split("-", 1)[0]),
        expected=secondary_note.noteName,
        actual=f"{secondary_note.noteName} (partial chord)",
        issue="Released too soon",
      ),
    )

  summary = (
    "Audio quality was low, so the result confidence was reduced. Timing drift is likely real, but note-level calls may need a cleaner take."
    if poor_quality
    else "Pitch stayed mostly stable. The main issue was tempo drift in the middle phrase and an early release in the closing measure."
  )

  return AnalysisResult(
    id=f"analysis-{uuid4().hex[:8]}",
    pieceId=piece_id,
    sessionId=session_id,
    audioFileId=audio_file_id,
    status="completed",
    overallScore=overall_score,
    pitchAccuracy=pitch_accuracy,
    tempoConsistency=tempo_consistency,
    alignmentConfidence=alignment_confidence,
    summary=summary,
    measureFindings=measure_findings,
    noteFindings=note_findings,
  )


def clamp(value: int, lower: int, upper: int) -> int:
  return max(lower, min(upper, value))
