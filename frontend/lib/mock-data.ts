import {
  AnalysisResult,
  CanonicalScore,
  DashboardData,
  Piece,
  PieceDetail,
  PracticeScreenData,
  PracticeSession,
  ScoreIngestionJob,
} from "./types";

const score: CanonicalScore = {
  id: "score-twinkle",
  title: "Twinkle Warmup",
  sourceType: "musicxml",
  baseTempo: 88,
  tempoMap: [
    { beatTime: 0, tempo: 88 },
    { beatTime: 8, tempo: 84 },
  ],
  measures: [
    {
      number: 1,
      notes: [
        { id: "m1-1", midi: 60, noteName: "C4", solfege: "\u30c9", beatTime: 0, beatLength: 1, voice: "1", dynamic: "mf" },
        { id: "m1-2", midi: 60, noteName: "C4", solfege: "\u30c9", beatTime: 1, beatLength: 1, voice: "1", dynamic: "mf" },
        { id: "m1-3", midi: 67, noteName: "G4", solfege: "\u30bd", beatTime: 2, beatLength: 1, voice: "1", dynamic: "mf" },
        { id: "m1-4", midi: 67, noteName: "G4", solfege: "\u30bd", beatTime: 3, beatLength: 1, voice: "1", dynamic: "mf" },
      ],
    },
    {
      number: 2,
      lowConfidence: true,
      notes: [
        { id: "m2-1", midi: 69, noteName: "A4", solfege: "\u30e9", beatTime: 4, beatLength: 1, voice: "1", dynamic: "f" },
        { id: "m2-2", midi: 69, noteName: "A4", solfege: "\u30e9", beatTime: 5, beatLength: 1, voice: "1", dynamic: "f" },
        { id: "m2-3", midi: 67, noteName: "G4", solfege: "\u30bd", beatTime: 6, beatLength: 2, voice: "1", dynamic: "f" },
      ],
    },
    {
      number: 3,
      notes: [
        { id: "m3-1", midi: 65, noteName: "F4", solfege: "\u30d5\u30a1", beatTime: 8, beatLength: 1, voice: "1", dynamic: "mp" },
        { id: "m3-2", midi: 65, noteName: "F4", solfege: "\u30d5\u30a1", beatTime: 9, beatLength: 1, voice: "1", dynamic: "mp" },
        { id: "m3-3", midi: 64, noteName: "E4", solfege: "\u30df", beatTime: 10, beatLength: 1, voice: "1", dynamic: "mp" },
        { id: "m3-4", midi: 64, noteName: "E4", solfege: "\u30df", beatTime: 11, beatLength: 1, voice: "1", dynamic: "mp" },
      ],
    },
    {
      number: 4,
      notes: [
        { id: "m4-1", midi: 62, noteName: "D4", solfege: "\u30ec", beatTime: 12, beatLength: 1, voice: "1", dynamic: "p" },
        { id: "m4-2", midi: 62, noteName: "D4", solfege: "\u30ec", beatTime: 13, beatLength: 1, voice: "1", dynamic: "p" },
        { id: "m4-3", midi: 60, noteName: "C4", solfege: "\u30c9", beatTime: 14, beatLength: 2, voice: "1", dynamic: "p" },
      ],
    },
  ],
};

const pieces: Piece[] = [
  {
    id: "piece-twinkle",
    title: "Twinkle Warmup",
    composer: "Traditional",
    color: "#157f6f",
    memo: "Morning articulation drill with soft landing on the last measure.",
    canonicalScoreId: score.id,
    scoreSourceType: "pdf",
    analysisReady: false,
    createdAt: "2026-03-20T09:00:00.000Z",
    stats: {
      todayMinutes: 24,
      weekMinutes: 92,
      totalMinutes: 146,
      lastPracticedAt: "2026-03-22T08:20:00.000Z",
    },
  },
  {
    id: "piece-nocturne",
    title: "Nocturne Phrase Lab",
    composer: "Chopin",
    color: "#d96c06",
    memo: "Focus on left-hand timing steadiness.",
    canonicalScoreId: "score-nocturne",
    scoreSourceType: "musicxml",
    analysisReady: true,
    createdAt: "2026-03-12T17:00:00.000Z",
    stats: {
      todayMinutes: 18,
      weekMinutes: 76,
      totalMinutes: 210,
      lastPracticedAt: "2026-03-22T06:40:00.000Z",
    },
  },
  {
    id: "piece-bach",
    title: "Bach Two-Part Sketch",
    composer: "J. S. Bach",
    color: "#7c6cff",
    memo: "Short score-reading focus with labels visible.",
    canonicalScoreId: "score-bach",
    scoreSourceType: "image",
    analysisReady: false,
    createdAt: "2026-03-18T10:30:00.000Z",
    stats: {
      todayMinutes: 12,
      weekMinutes: 40,
      totalMinutes: 58,
      lastPracticedAt: "2026-03-21T22:10:00.000Z",
    },
  },
];

const recentSessions: PracticeSession[] = [
  {
    id: "session-today",
    pieceId: "piece-twinkle",
    pieceTitle: "Twinkle Warmup",
    startedAt: "2026-03-22T07:50:00.000Z",
    endedAt: "2026-03-22T08:14:00.000Z",
    durationSec: 24 * 60,
    memo: "Repeated hands-separate warmup.",
    source: "analysis",
    analysisResultId: "analysis-1",
  },
  {
    id: "session-nocturne",
    pieceId: "piece-nocturne",
    pieceTitle: "Nocturne Phrase Lab",
    startedAt: "2026-03-22T06:22:00.000Z",
    endedAt: "2026-03-22T06:40:00.000Z",
    durationSec: 18 * 60,
    memo: "Slow tempo correction session.",
    source: "timer",
  },
  {
    id: "session-bach",
    pieceId: "piece-bach",
    pieceTitle: "Bach Two-Part Sketch",
    startedAt: "2026-03-21T21:58:00.000Z",
    endedAt: "2026-03-21T22:10:00.000Z",
    durationSec: 12 * 60,
    memo: "Sight-reading check.",
    source: "manual",
  },
];

const latestAnalysis: AnalysisResult = {
  id: "analysis-1",
  pieceId: "piece-twinkle",
  sessionId: "session-today",
  audioFileId: "audio-1",
  status: "completed",
  overallScore: 84,
  pitchAccuracy: 88,
  tempoConsistency: 79,
  alignmentConfidence: 0.73,
  summary: "Pitch stayed stable overall. Measure 2 rushed slightly and the last note released early.",
  measureFindings: [
    { measure: 1, title: "Solid opening", detail: "Both C and G entries matched the expected onset window.", severity: "good" },
    { measure: 2, title: "Rushed phrase", detail: "The two A notes landed early by about 90 ms compared with the tempo map.", severity: "warn" },
    { measure: 4, title: "Short final hold", detail: "The last C released before the target duration finished.", severity: "bad" },
  ],
  noteFindings: [
    { noteId: "m2-1", measure: 2, expected: "A4", actual: "A4", issue: "Played early" },
    { noteId: "m4-3", measure: 4, expected: "C4", actual: "C4", issue: "Released too soon" },
  ],
};

const ingestionJob: ScoreIngestionJob = {
  id: "job-twinkle",
  pieceId: "piece-twinkle",
  sourceType: "pdf",
  status: "needs_review",
  overallConfidence: 0.61,
  lowConfidenceMeasures: [2],
  previewUrl: "/samples/twinkle.musicxml",
};

export async function getMockDashboardData(): Promise<DashboardData> {
  return {
    todayMinutes: 54,
    weekMinutes: 208,
    monthMinutes: 414,
    pieces,
    recentSessions,
    chart: [
      {
        label: "Mon",
        items: [
          { pieceId: "piece-nocturne", pieceTitle: "Nocturne Phrase Lab", color: "#d96c06", minutes: 20 },
          { pieceId: "piece-twinkle", pieceTitle: "Twinkle Warmup", color: "#157f6f", minutes: 14 },
        ],
      },
      {
        label: "Tue",
        items: [
          { pieceId: "piece-nocturne", pieceTitle: "Nocturne Phrase Lab", color: "#d96c06", minutes: 16 },
          { pieceId: "piece-bach", pieceTitle: "Bach Two-Part Sketch", color: "#7c6cff", minutes: 12 },
        ],
      },
      {
        label: "Wed",
        items: [
          { pieceId: "piece-twinkle", pieceTitle: "Twinkle Warmup", color: "#157f6f", minutes: 26 },
        ],
      },
      {
        label: "Thu",
        items: [
          { pieceId: "piece-bach", pieceTitle: "Bach Two-Part Sketch", color: "#7c6cff", minutes: 10 },
          { pieceId: "piece-nocturne", pieceTitle: "Nocturne Phrase Lab", color: "#d96c06", minutes: 14 },
        ],
      },
      {
        label: "Fri",
        items: [
          { pieceId: "piece-twinkle", pieceTitle: "Twinkle Warmup", color: "#157f6f", minutes: 18 },
          { pieceId: "piece-nocturne", pieceTitle: "Nocturne Phrase Lab", color: "#d96c06", minutes: 12 },
        ],
      },
      {
        label: "Sat",
        items: [
          { pieceId: "piece-bach", pieceTitle: "Bach Two-Part Sketch", color: "#7c6cff", minutes: 18 },
        ],
      },
      {
        label: "Sun",
        items: [
          { pieceId: "piece-twinkle", pieceTitle: "Twinkle Warmup", color: "#157f6f", minutes: 24 },
          { pieceId: "piece-nocturne", pieceTitle: "Nocturne Phrase Lab", color: "#d96c06", minutes: 18 },
          { pieceId: "piece-bach", pieceTitle: "Bach Two-Part Sketch", color: "#7c6cff", minutes: 12 },
        ],
      },
    ],
  };
}

export async function getMockPieceDetail(id: string): Promise<PieceDetail | null> {
  const piece = pieces.find((entry) => entry.id === id);
  if (!piece) {
    return null;
  }

  return {
    piece,
    score,
    ingestionJob,
    recentSessions: recentSessions.filter((session) => session.pieceId === id),
    latestAnalysis: id === "piece-twinkle" ? latestAnalysis : undefined,
  };
}

export async function getMockPracticeScreenData(id: string): Promise<PracticeScreenData | null> {
  const session = recentSessions.find((entry) => entry.id === id) ?? recentSessions[0];
  const piece = pieces.find((entry) => entry.id === session.pieceId);
  if (!piece) {
    return null;
  }

  return {
    session,
    piece,
    score,
  };
}

export async function getMockAnalysisResult(id: string): Promise<AnalysisResult | null> {
  return id === latestAnalysis.id ? latestAnalysis : null;
}
