from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, Field


ScoreSourceType = Literal["musicxml", "pdf", "image"]
SessionSource = Literal["timer", "analysis", "manual"]
IngestionStatus = Literal["ready", "processing", "needs_review"]
AnalysisStatus = Literal["completed", "processing", "failed"]


def utc_now() -> datetime:
  return datetime.now(UTC)


class TempoChange(BaseModel):
  beatTime: float
  tempo: float


class CanonicalNote(BaseModel):
  id: str
  midi: int
  noteName: str
  solfege: str
  beatTime: float
  beatLength: float
  voice: str
  dynamic: str
  expectedMsFromStart: float = 0
  expectedDurationMs: float = 0


class CanonicalMeasure(BaseModel):
  number: int
  notes: list[CanonicalNote] = Field(default_factory=list)
  lowConfidence: bool = False


class CanonicalScore(BaseModel):
  id: str
  title: str
  sourceType: ScoreSourceType
  baseTempo: float
  tempoMap: list[TempoChange] = Field(default_factory=list)
  measures: list[CanonicalMeasure] = Field(default_factory=list)


class ScoreIngestionJob(BaseModel):
  id: str
  pieceId: str
  sourceType: ScoreSourceType
  status: IngestionStatus
  overallConfidence: float
  lowConfidenceMeasures: list[int] = Field(default_factory=list)
  previewUrl: str | None = None
  createdAt: datetime = Field(default_factory=utc_now)


class PieceStats(BaseModel):
  todayMinutes: int = 0
  weekMinutes: int = 0
  monthMinutes: int = 0
  totalMinutes: int = 0
  lastPracticedAt: str = ""


class Piece(BaseModel):
  id: str
  title: str
  composer: str
  color: str
  memo: str | None = None
  canonicalScoreId: str | None = None
  scoreSourceType: ScoreSourceType
  analysisReady: bool = False
  createdAt: datetime = Field(default_factory=utc_now)
  stats: PieceStats = Field(default_factory=PieceStats)


class PracticeSession(BaseModel):
  id: str
  pieceId: str
  pieceTitle: str
  startedAt: datetime
  endedAt: datetime | None = None
  durationSec: int = 0
  memo: str | None = None
  source: SessionSource = "timer"
  analysisResultId: str | None = None


class MeasureFinding(BaseModel):
  measure: int
  title: str
  detail: str
  severity: Literal["good", "warn", "bad"]


class NoteFinding(BaseModel):
  noteId: str
  measure: int
  expected: str
  actual: str
  issue: str


class AnalysisResult(BaseModel):
  id: str
  pieceId: str
  sessionId: str
  audioFileId: str
  status: AnalysisStatus
  overallScore: int
  pitchAccuracy: int
  tempoConsistency: int
  alignmentConfidence: float
  summary: str
  measureFindings: list[MeasureFinding] = Field(default_factory=list)
  noteFindings: list[NoteFinding] = Field(default_factory=list)
  createdAt: datetime = Field(default_factory=utc_now)


class AnalysisJob(BaseModel):
  id: str
  pieceId: str
  sessionId: str
  audioFileId: str
  status: AnalysisStatus
  resultId: str | None = None
  createdAt: datetime = Field(default_factory=utc_now)


class DashboardChartItem(BaseModel):
  pieceId: str
  pieceTitle: str
  color: str
  minutes: int


class DashboardChartBucket(BaseModel):
  label: str
  items: list[DashboardChartItem] = Field(default_factory=list)


class DashboardData(BaseModel):
  todayMinutes: int
  weekMinutes: int
  monthMinutes: int
  pieces: list[Piece]
  recentSessions: list[PracticeSession]
  chart: list[DashboardChartBucket]


class PieceDetail(BaseModel):
  piece: Piece
  score: CanonicalScore
  ingestionJob: ScoreIngestionJob
  recentSessions: list[PracticeSession] = Field(default_factory=list)
  latestAnalysis: AnalysisResult | None = None


class PracticeScreenData(BaseModel):
  session: PracticeSession
  piece: Piece
  score: CanonicalScore


class PieceCreateRequest(BaseModel):
  title: str
  composer: str
  color: str = "#157f6f"
  memo: str | None = None


class PracticeSessionStartRequest(BaseModel):
  pieceId: str
  startedAt: datetime | None = None
  memo: str | None = None
  source: SessionSource = "timer"


class PracticeSessionStopRequest(BaseModel):
  endedAt: datetime | None = None
  memo: str | None = None
  analysisResultId: str | None = None


class ScoreCorrectionRequest(BaseModel):
  confirmedMeasures: list[int] = Field(default_factory=list)


class AnalysisJobCreateResponse(BaseModel):
  job: AnalysisJob
  result: AnalysisResult
