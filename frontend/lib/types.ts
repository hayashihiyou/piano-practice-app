export type ScoreSourceType = "musicxml" | "pdf" | "image";
export type SessionSource = "timer" | "analysis" | "manual";
export type IngestionStatus = "ready" | "processing" | "needs_review";
export type AnalysisStatus = "completed" | "processing" | "failed";

export type NoteLabelStyle = "doremi" | "note-name";

export type TempoChange = {
  beatTime: number;
  tempo: number;
};

export type CanonicalNote = {
  id: string;
  midi: number;
  noteName: string;
  solfege: string;
  beatTime: number;
  beatLength: number;
  voice: string;
  dynamic: string;
};

export type CanonicalMeasure = {
  number: number;
  notes: CanonicalNote[];
  lowConfidence?: boolean;
};

export type CanonicalScore = {
  id: string;
  title: string;
  sourceType: ScoreSourceType;
  baseTempo: number;
  tempoMap: TempoChange[];
  measures: CanonicalMeasure[];
};

export type ScoreIngestionJob = {
  id: string;
  pieceId: string;
  sourceType: ScoreSourceType;
  status: IngestionStatus;
  overallConfidence: number;
  lowConfidenceMeasures: number[];
  previewUrl?: string;
};

export type PieceStats = {
  todayMinutes: number;
  weekMinutes: number;
  totalMinutes: number;
  lastPracticedAt: string;
};

export type Piece = {
  id: string;
  title: string;
  composer: string;
  color: string;
  memo?: string;
  canonicalScoreId?: string;
  scoreSourceType: ScoreSourceType;
  analysisReady: boolean;
  createdAt: string;
  stats: PieceStats;
};

export type PracticeSession = {
  id: string;
  pieceId: string;
  pieceTitle: string;
  startedAt: string;
  endedAt?: string;
  durationSec: number;
  memo?: string;
  source: SessionSource;
  analysisResultId?: string;
};

export type MeasureFinding = {
  measure: number;
  title: string;
  detail: string;
  severity: "good" | "warn" | "bad";
};

export type NoteFinding = {
  noteId: string;
  measure: number;
  expected: string;
  actual: string;
  issue: string;
};

export type AnalysisResult = {
  id: string;
  pieceId: string;
  sessionId: string;
  audioFileId: string;
  status: AnalysisStatus;
  overallScore: number;
  pitchAccuracy: number;
  tempoConsistency: number;
  alignmentConfidence: number;
  summary: string;
  measureFindings: MeasureFinding[];
  noteFindings: NoteFinding[];
};

export type DashboardChartBucket = {
  label: string;
  items: Array<{
    pieceId: string;
    pieceTitle: string;
    color: string;
    minutes: number;
  }>;
};

export type DashboardData = {
  todayMinutes: number;
  weekMinutes: number;
  monthMinutes: number;
  pieces: Piece[];
  recentSessions: PracticeSession[];
  chart: DashboardChartBucket[];
};

export type PieceDetail = {
  piece: Piece;
  score: CanonicalScore;
  ingestionJob: ScoreIngestionJob;
  recentSessions: PracticeSession[];
  latestAnalysis?: AnalysisResult;
};

export type PracticeScreenData = {
  session: PracticeSession;
  piece: Piece;
  score: CanonicalScore;
};
