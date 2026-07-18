from __future__ import annotations

from datetime import datetime
from pathlib import Path

from .config import ROOT_DIR
from .schemas import (
  AnalysisJob,
  AnalysisResult,
  CanonicalMeasure,
  CanonicalScore,
  DashboardChartBucket,
  DashboardChartItem,
  MeasureFinding,
  NoteFinding,
  Piece,
  PieceStats,
  PracticeSession,
  ScoreIngestionJob,
)
from .services.musicxml import parse_musicxml


def sample_score(score_id: str, title: str, low_confidence_measures: list[int] | None = None) -> CanonicalScore:
  sample_path = ROOT_DIR / "samples" / "twinkle.musicxml"
  if sample_path.exists():
    xml_text = sample_path.read_text(encoding="utf-8")
    score = parse_musicxml(xml_text, score_id=score_id, source_type="musicxml", fallback_title=title)
    measures: list[CanonicalMeasure] = []
    for measure in score.measures:
      copied = measure.model_copy(deep=True)
      copied.lowConfidence = copied.number in (low_confidence_measures or [])
      measures.append(copied)
    return score.model_copy(update={"measures": measures})

  return CanonicalScore(
    id=score_id,
    title=title,
    sourceType="musicxml",
    baseTempo=88,
    tempoMap=[],
    measures=[],
  )


def build_seed_data() -> dict[str, object]:
  twinkle_score = sample_score("score-twinkle", "Twinkle Warmup", [2])
  nocturne_score = sample_score("score-nocturne", "Nocturne Phrase Lab", [])
  bach_score = sample_score("score-bach", "Bach Two-Part Sketch", [2])
  created_twinkle = datetime.fromisoformat("2026-03-20T09:00:00")
  created_nocturne = datetime.fromisoformat("2026-03-12T17:00:00")
  created_bach = datetime.fromisoformat("2026-03-18T10:30:00")

  pieces = [
    Piece(
      id="piece-twinkle",
      title="Twinkle Warmup",
      composer="Traditional",
      color="#157f6f",
      memo="Morning articulation drill with a soft landing on the last measure.",
      canonicalScoreId=twinkle_score.id,
      scoreSourceType="pdf",
      analysisReady=False,
      createdAt=created_twinkle,
      stats=PieceStats(
        todayMinutes=24,
        weekMinutes=92,
        monthMinutes=146,
        totalMinutes=146,
        lastPracticedAt="2026-03-22T08:20:00.000Z",
      ),
    ),
    Piece(
      id="piece-nocturne",
      title="Nocturne Phrase Lab",
      composer="Chopin",
      color="#d96c06",
      memo="Focus on left-hand timing steadiness.",
      canonicalScoreId=nocturne_score.id,
      scoreSourceType="musicxml",
      analysisReady=True,
      createdAt=created_nocturne,
      stats=PieceStats(
        todayMinutes=18,
        weekMinutes=76,
        monthMinutes=210,
        totalMinutes=210,
        lastPracticedAt="2026-03-22T06:40:00.000Z",
      ),
    ),
    Piece(
      id="piece-bach",
      title="Bach Two-Part Sketch",
      composer="J. S. Bach",
      color="#7c6cff",
      memo="Short score-reading focus with note labels visible.",
      canonicalScoreId=bach_score.id,
      scoreSourceType="image",
      analysisReady=False,
      createdAt=created_bach,
      stats=PieceStats(
        todayMinutes=0,
        weekMinutes=40,
        monthMinutes=58,
        totalMinutes=58,
        lastPracticedAt="2026-03-21T22:10:00.000Z",
      ),
    ),
  ]

  ingestion_jobs = [
    ScoreIngestionJob(
      id="job-twinkle",
      pieceId="piece-twinkle",
      sourceType="pdf",
      status="needs_review",
      overallConfidence=0.61,
      lowConfidenceMeasures=[2],
      previewUrl=str(Path("samples") / "twinkle.musicxml"),
    ),
    ScoreIngestionJob(
      id="job-nocturne",
      pieceId="piece-nocturne",
      sourceType="musicxml",
      status="ready",
      overallConfidence=1.0,
      lowConfidenceMeasures=[],
      previewUrl=str(Path("samples") / "twinkle.musicxml"),
    ),
    ScoreIngestionJob(
      id="job-bach",
      pieceId="piece-bach",
      sourceType="image",
      status="needs_review",
      overallConfidence=0.58,
      lowConfidenceMeasures=[2],
      previewUrl=str(Path("samples") / "twinkle.musicxml"),
    ),
  ]

  practice_sessions = [
    PracticeSession(
      id="session-today",
      pieceId="piece-twinkle",
      pieceTitle="Twinkle Warmup",
      startedAt=datetime.fromisoformat("2026-03-22T07:50:00"),
      endedAt=datetime.fromisoformat("2026-03-22T08:14:00"),
      durationSec=24 * 60,
      memo="Repeated hands-separate warmup.",
      source="timer",
      analysisResultId="analysis-1",
    ),
    PracticeSession(
      id="session-nocturne",
      pieceId="piece-nocturne",
      pieceTitle="Nocturne Phrase Lab",
      startedAt=datetime.fromisoformat("2026-03-22T06:22:00"),
      endedAt=datetime.fromisoformat("2026-03-22T06:40:00"),
      durationSec=18 * 60,
      memo="Slow tempo correction session.",
      source="timer",
    ),
    PracticeSession(
      id="session-bach",
      pieceId="piece-bach",
      pieceTitle="Bach Two-Part Sketch",
      startedAt=datetime.fromisoformat("2026-03-21T21:58:00"),
      endedAt=datetime.fromisoformat("2026-03-21T22:10:00"),
      durationSec=12 * 60,
      memo="Sight-reading check.",
      source="manual",
    ),
  ]

  analysis_results = [
    AnalysisResult(
      id="analysis-1",
      pieceId="piece-twinkle",
      sessionId="session-today",
      audioFileId="audio-1",
      status="completed",
      overallScore=84,
      pitchAccuracy=88,
      tempoConsistency=79,
      alignmentConfidence=0.73,
      summary="Pitch stayed stable overall. Measure 2 rushed slightly and the last note released early.",
      measureFindings=[
        MeasureFinding(measure=1, title="Solid opening", detail="Both C and G entries matched the onset window.", severity="good"),
        MeasureFinding(measure=2, title="Rushed phrase", detail="The A notes landed early compared with the tempo map.", severity="warn"),
        MeasureFinding(measure=4, title="Short final hold", detail="The last C released before the target duration finished.", severity="bad"),
      ],
      noteFindings=[
        NoteFinding(noteId="2-1-4", measure=2, expected="A4", actual="A4", issue="Played early"),
        NoteFinding(noteId="4-1-13", measure=4, expected="C4", actual="C4", issue="Released too soon"),
      ],
    ),
  ]

  analysis_jobs = [
    AnalysisJob(
      id="analysis-job-1",
      pieceId="piece-twinkle",
      sessionId="session-today",
      audioFileId="audio-1",
      status="completed",
      resultId="analysis-1",
    ),
  ]

  chart = [
    DashboardChartBucket(
      label="Mon",
      items=[
        DashboardChartItem(pieceId="piece-nocturne", pieceTitle="Nocturne Phrase Lab", color="#d96c06", minutes=20),
        DashboardChartItem(pieceId="piece-twinkle", pieceTitle="Twinkle Warmup", color="#157f6f", minutes=14),
      ],
    ),
    DashboardChartBucket(
      label="Tue",
      items=[
        DashboardChartItem(pieceId="piece-nocturne", pieceTitle="Nocturne Phrase Lab", color="#d96c06", minutes=16),
        DashboardChartItem(pieceId="piece-bach", pieceTitle="Bach Two-Part Sketch", color="#7c6cff", minutes=12),
      ],
    ),
    DashboardChartBucket(
      label="Wed",
      items=[DashboardChartItem(pieceId="piece-twinkle", pieceTitle="Twinkle Warmup", color="#157f6f", minutes=26)],
    ),
    DashboardChartBucket(
      label="Thu",
      items=[
        DashboardChartItem(pieceId="piece-bach", pieceTitle="Bach Two-Part Sketch", color="#7c6cff", minutes=10),
        DashboardChartItem(pieceId="piece-nocturne", pieceTitle="Nocturne Phrase Lab", color="#d96c06", minutes=14),
      ],
    ),
    DashboardChartBucket(
      label="Fri",
      items=[
        DashboardChartItem(pieceId="piece-twinkle", pieceTitle="Twinkle Warmup", color="#157f6f", minutes=18),
        DashboardChartItem(pieceId="piece-nocturne", pieceTitle="Nocturne Phrase Lab", color="#d96c06", minutes=12),
      ],
    ),
    DashboardChartBucket(
      label="Sat",
      items=[DashboardChartItem(pieceId="piece-bach", pieceTitle="Bach Two-Part Sketch", color="#7c6cff", minutes=18)],
    ),
    DashboardChartBucket(
      label="Sun",
      items=[
        DashboardChartItem(pieceId="piece-twinkle", pieceTitle="Twinkle Warmup", color="#157f6f", minutes=24),
        DashboardChartItem(pieceId="piece-nocturne", pieceTitle="Nocturne Phrase Lab", color="#d96c06", minutes=18),
        DashboardChartItem(pieceId="piece-bach", pieceTitle="Bach Two-Part Sketch", color="#7c6cff", minutes=12),
      ],
    ),
  ]

  return {
    "pieces": pieces,
    "scores": [twinkle_score, nocturne_score, bach_score],
    "ingestionJobs": ingestion_jobs,
    "practiceSessions": practice_sessions,
    "analysisResults": analysis_results,
    "analysisJobs": analysis_jobs,
    "chart": chart,
  }
