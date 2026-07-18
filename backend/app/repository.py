from __future__ import annotations

from datetime import timedelta
from typing import Iterable

from .sample_data import build_seed_data
from .schemas import (
  AnalysisJob,
  AnalysisResult,
  CanonicalScore,
  DashboardChartBucket,
  DashboardData,
  Piece,
  PieceDetail,
  PieceStats,
  PracticeScreenData,
  PracticeSession,
  ScoreIngestionJob,
)


class InMemoryRepository:
  def __init__(self) -> None:
    seed = build_seed_data()
    self.pieces: dict[str, Piece] = {piece.id: piece for piece in seed["pieces"]}
    self.scores: dict[str, CanonicalScore] = {score.id: score for score in seed["scores"]}
    self.ingestionJobs: dict[str, ScoreIngestionJob] = {job.id: job for job in seed["ingestionJobs"]}
    self.practiceSessions: dict[str, PracticeSession] = {session.id: session for session in seed["practiceSessions"]}
    self.analysisResults: dict[str, AnalysisResult] = {result.id: result for result in seed["analysisResults"]}
    self.analysisJobs: dict[str, AnalysisJob] = {job.id: job for job in seed["analysisJobs"]}
    self.chart: list[DashboardChartBucket] = seed["chart"]

  def list_pieces(self) -> list[Piece]:
    return sorted(
      [self._with_fresh_stats(piece) for piece in self.pieces.values()],
      key=lambda piece: piece.createdAt,
      reverse=True,
    )

  def get_piece(self, piece_id: str) -> Piece | None:
    piece = self.pieces.get(piece_id)
    if piece is None:
      return None
    return self._with_fresh_stats(piece)

  def save_piece(self, piece: Piece) -> Piece:
    self.pieces[piece.id] = piece
    return piece

  def get_score(self, score_id: str | None) -> CanonicalScore | None:
    if score_id is None:
      return None
    return self.scores.get(score_id)

  def save_score(self, score: CanonicalScore) -> CanonicalScore:
    self.scores[score.id] = score
    return score

  def list_jobs_for_piece(self, piece_id: str) -> list[ScoreIngestionJob]:
    return sorted(
      [job for job in self.ingestionJobs.values() if job.pieceId == piece_id],
      key=lambda job: job.createdAt,
      reverse=True,
    )

  def get_job_by_score(self, score_id: str) -> ScoreIngestionJob | None:
    piece = next((entry for entry in self.pieces.values() if entry.canonicalScoreId == score_id), None)
    if piece is None:
      return None
    jobs = self.list_jobs_for_piece(piece.id)
    return jobs[0] if jobs else None

  def save_ingestion_job(self, job: ScoreIngestionJob) -> ScoreIngestionJob:
    self.ingestionJobs[job.id] = job
    return job

  def list_sessions(self, piece_id: str | None = None) -> list[PracticeSession]:
    sessions: Iterable[PracticeSession] = self.practiceSessions.values()
    if piece_id:
      sessions = [session for session in sessions if session.pieceId == piece_id]
    return sorted(sessions, key=lambda session: session.startedAt, reverse=True)

  def get_session(self, session_id: str) -> PracticeSession | None:
    return self.practiceSessions.get(session_id)

  def save_session(self, session: PracticeSession) -> PracticeSession:
    self.practiceSessions[session.id] = session
    return session

  def get_analysis_result(self, result_id: str) -> AnalysisResult | None:
    return self.analysisResults.get(result_id)

  def latest_analysis_for_piece(self, piece_id: str) -> AnalysisResult | None:
    piece_sessions = self.list_sessions(piece_id)
    for session in piece_sessions:
      if session.analysisResultId and session.analysisResultId in self.analysisResults:
        return self.analysisResults[session.analysisResultId]
    return None

  def save_analysis_result(self, result: AnalysisResult) -> AnalysisResult:
    self.analysisResults[result.id] = result
    return result

  def save_analysis_job(self, job: AnalysisJob) -> AnalysisJob:
    self.analysisJobs[job.id] = job
    return job

  def get_analysis_job(self, job_id: str) -> AnalysisJob | None:
    return self.analysisJobs.get(job_id)

  def build_dashboard(self) -> DashboardData:
    pieces = self.list_pieces()
    sessions = self.list_sessions()
    if sessions:
      reference_day = self._reference_day()
      week_start = reference_day - timedelta(days=6)
      month_start = reference_day - timedelta(days=29)
      today_minutes = 0
      week_minutes = 0
      month_minutes = 0

      for session in sessions:
        minutes = round(session.durationSec / 60)
        session_day = session.startedAt.date()
        if session_day == reference_day:
          today_minutes += minutes
        if week_start <= session_day <= reference_day:
          week_minutes += minutes
        if month_start <= session_day <= reference_day:
          month_minutes += minutes
    else:
      today_minutes = 0
      week_minutes = 0
      month_minutes = 0

    return DashboardData(
      todayMinutes=today_minutes,
      weekMinutes=week_minutes,
      monthMinutes=month_minutes,
      pieces=pieces,
      recentSessions=sessions[:6],
      chart=self.chart,
    )

  def build_piece_detail(self, piece_id: str) -> PieceDetail | None:
    piece = self.get_piece(piece_id)
    if piece is None:
      return None
    score = self.get_score(piece.canonicalScoreId)
    job = self.list_jobs_for_piece(piece.id)[0] if self.list_jobs_for_piece(piece.id) else None
    if score is None or job is None:
      return None
    return PieceDetail(
      piece=piece,
      score=score,
      ingestionJob=job,
      recentSessions=self.list_sessions(piece.id)[:6],
      latestAnalysis=self.latest_analysis_for_piece(piece.id),
    )

  def build_practice_screen_data(self, session_id: str) -> PracticeScreenData | None:
    session = self.get_session(session_id)
    if session is None:
      return None
    piece = self.get_piece(session.pieceId)
    if piece is None:
      return None
    score = self.get_score(piece.canonicalScoreId)
    if score is None:
      return None
    return PracticeScreenData(session=session, piece=piece, score=score)

  def _with_fresh_stats(self, piece: Piece) -> Piece:
    stats = self._compute_piece_stats(piece.id)
    return piece.model_copy(update={"stats": stats})

  def _compute_piece_stats(self, piece_id: str) -> PieceStats:
    sessions = self.list_sessions(piece_id)
    if not sessions:
      return PieceStats()

    reference_day = self._reference_day()
    week_start = reference_day - timedelta(days=6)
    month_start = reference_day - timedelta(days=29)
    today_minutes = 0
    week_minutes = 0
    month_minutes = 0
    total_minutes = 0

    for session in sessions:
      minutes = round(session.durationSec / 60)
      total_minutes += minutes
      session_day = session.startedAt.date()
      if session_day == reference_day:
        today_minutes += minutes
      if week_start <= session_day <= reference_day:
        week_minutes += minutes
      if month_start <= session_day <= reference_day:
        month_minutes += minutes

    return PieceStats(
      todayMinutes=today_minutes,
      weekMinutes=week_minutes,
      monthMinutes=month_minutes,
      totalMinutes=total_minutes,
      lastPracticedAt=max(session.startedAt for session in sessions).isoformat(),
    )

  def _reference_day(self):
    sessions = self.list_sessions()
    if not sessions:
      raise ValueError("No practice sessions available")
    return max(session.startedAt.date() for session in sessions)
