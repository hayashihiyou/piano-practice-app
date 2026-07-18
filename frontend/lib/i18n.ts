export type Locale = "en" | "ja";

type Dictionary = {
  localeName: string;
  switchLanguage: string;
  nav: {
    dashboard: string;
    pieceDetail: string;
    practice: string;
    analysis: string;
    newPiece: string;
  };
  layout: {
    eyebrow: string;
    title: string;
    heroCopy: string;
  };
  home: {
    todayKicker: string;
    overview: string;
    addPiece: string;
    today: string;
    week: string;
    month: string;
    total: string;
    chartKicker: string;
    chartTitle: string;
    weekChartTitle: string;
    monthChartTitle: string;
    chartPill: string;
    weeklyTotal: string;
    monthlyTotal: string;
    rangeSelector: string;
    selectedPracticeTime: string;
    piecesKicker: string;
    library: string;
    strictReady: string;
    needsScoreReview: string;
    openPiece: string;
    sessionsKicker: string;
    recentLogs: string;
    piece: string;
    duration: string;
    source: string;
    result: string;
    status: string;
    viewAnalysis: string;
    continueSession: string;
  };
  piece: {
    kicker: string;
    today: string;
    week: string;
    month: string;
    total: string;
    strictAnalysis: string;
    ready: string;
    blocked: string;
    startPractice: string;
    latestAnalysis: string;
    ingestionKicker: string;
    pipeline: string;
    sourceType: string;
    confidence: string;
    lowConfidenceMeasures: string;
    none: string;
    canonicalFormat: string;
    recentSessionsKicker: string;
    timeline: string;
  };
  score: {
    kicker: string;
    baseTempo: string;
    needsReview: string;
    labelGuide: string;
    reviewGuide: string;
  };
  practice: {
    sessionKicker: string;
    timerLinked: string;
    keepSession: string;
    startTimer: string;
    pauseTimer: string;
    guidanceKicker: string;
    guidanceTitle: string;
    stepCapture: string;
    stepCheckScore: string;
    stepSubmit: string;
    captureKicker: string;
    recordOrUpload: string;
    postTake: string;
    micUnavailable: string;
    micDenied: string;
    stopRecording: string;
    recordWithMic: string;
    uploadFile: string;
    recordingState: string;
    nextKicker: string;
    sendForAnalysis: string;
    scoreTitle: string;
    baseTempo: string;
    measuresReady: string;
    lowConfidenceMeasures: string;
    queueAnalysis: string;
    submitting: string;
    openSample: string;
    resolveLowConfidence: string;
    setApiBaseUrl: string;
    createdJob: string;
    openResult: string;
    failedSubmit: string;
    chooseAudioFirst: string;
    readyToSubmit: string;
    disabledReason: string;
    recordingIdle: string;
    recordingRecording: string;
    recordingStopped: string;
    scoreSupportKicker: string;
    scoreSupportTitle: string;
    currentScoreState: string;
    openLabeledScore: string;
    allMeasuresReady: string;
    reviewMeasures: string;
  };
  analysis: {
    overall: string;
    pitch: string;
    tempo: string;
    alignment: string;
    summaryKicker: string;
    performanceResult: string;
    measuresKicker: string;
    measureFindings: string;
    notesKicker: string;
    detailedMismatches: string;
    measure: string;
    expected: string;
    actual: string;
    issue: string;
  };
  newPiece: {
    kicker: string;
    title: string;
    pill: string;
    pieceTitle: string;
    composer: string;
    color: string;
    colorHelp: string;
    scoreFile: string;
    scoreHelp: string;
    memo: string;
    placeholderTitle: string;
    placeholderComposer: string;
    placeholderMemo: string;
    save: string;
    draft: string;
    draftHelp: string;
    fileRequired: string;
    apiRequired: string;
    saving: string;
    uploadStarting: string;
    saveFailed: string;
    savedReady: string;
  };
};

const en: Dictionary = {
  localeName: "English",
  switchLanguage: "Language",
  nav: {
    dashboard: "Dashboard",
    pieceDetail: "Piece detail",
    practice: "Practice",
    analysis: "Analysis",
    newPiece: "New piece",
  },
  layout: {
    eyebrow: "Practice coach",
    title: "Mobile Piano Practice Coach",
    heroCopy:
      "Track daily piano time, keep each piece organized, and open uploaded scores with doremi labels directly under the notes.",
  },
  home: {
    todayKicker: "Today",
    overview: "Daily practice overview",
    addPiece: "Add piece",
    today: "Today",
    week: "This week",
    month: "This month",
    total: "Total",
    chartKicker: "Breakdown",
    chartTitle: "Practice breakdown",
    weekChartTitle: "This week by piece",
    monthChartTitle: "This month by piece",
    chartPill: "Pie chart",
    weeklyTotal: "Weekly total",
    monthlyTotal: "Monthly total",
    rangeSelector: "Show",
    selectedPracticeTime: "Selected practice time",
    piecesKicker: "Piece detail",
    library: "Added pieces and practice time",
    strictReady: "Doremi labels ready",
    needsScoreReview: "Needs score review",
    openPiece: "Open piece",
    sessionsKicker: "Sessions",
    recentLogs: "Recent practice logs",
    piece: "Piece",
    duration: "Duration",
    source: "Source",
    result: "Open",
    status: "Status",
    viewAnalysis: "Open labeled score",
    continueSession: "Open practice",
  },
  piece: {
    kicker: "Piece",
    today: "Today",
    week: "This week",
    month: "This month",
    total: "Total",
    strictAnalysis: "Label status",
    ready: "Ready to show",
    blocked: "Needs review",
    startPractice: "Start practice",
    latestAnalysis: "Jump to labeled score",
    ingestionKicker: "Ingestion",
    pipeline: "Score pipeline",
    sourceType: "Source type",
    confidence: "Confidence",
    lowConfidenceMeasures: "Low-confidence measures",
    none: "None",
    canonicalFormat: "Canonical format",
    recentSessionsKicker: "Recent sessions",
    timeline: "Piece timeline",
  },
  score: {
    kicker: "Score viewer",
    baseTempo: "Base tempo",
    needsReview: "Needs review",
    labelGuide: "Green text under each note shows the doremi label from the imported score.",
    reviewGuide: "If a measure shows an orange badge, check that part of the import before relying on it.",
  },
  practice: {
    sessionKicker: "Session",
    timerLinked: "Timer linked to this piece",
    keepSession:
      "Keep the timer attached to the selected piece so your totals stay organized automatically.",
    startTimer: "Start timer",
    pauseTimer: "Pause timer",
    guidanceKicker: "Guide",
    guidanceTitle: "Recommended flow",
    stepCapture: "Step 1: open the labeled score and read the green doremi under each note.",
    stepCheckScore: "Step 2: if a measure is marked for review, compare it with the original score once.",
    stepSubmit: "Step 3: start the timer and practice while following the labeled score.",
    captureKicker: "Score support",
    recordOrUpload: "Use the labeled score",
    postTake: "Beginner-friendly reading",
    micUnavailable: "This browser does not expose microphone capture.",
    micDenied: "Microphone permission was denied or is unavailable.",
    stopRecording: "Stop recording",
    recordWithMic: "Record with mic",
    uploadFile: "Upload file",
    recordingState: "Recording state",
    nextKicker: "Next step",
    sendForAnalysis: "Send for analysis",
    scoreTitle: "Score title",
    baseTempo: "Base tempo",
    measuresReady: "Measures ready",
    lowConfidenceMeasures: "Low-confidence measures",
    queueAnalysis: "Queue analysis job",
    submitting: "Submitting...",
    openSample: "Open sample result",
    resolveLowConfidence: "Resolve low-confidence score measures before running strict analysis.",
    setApiBaseUrl: "Set NEXT_PUBLIC_API_BASE_URL before sending analysis jobs to the backend.",
    createdJob: "Created analysis job",
    openResult: "Result ID",
    failedSubmit: "Failed to submit analysis.",
    chooseAudioFirst: "Choose or record audio first so the app has a take to compare.",
    readyToSubmit: "Everything is ready. You can send this take for backend analysis.",
    disabledReason: "Why the button may be disabled",
    recordingIdle: "Waiting for audio",
    recordingRecording: "Recording now",
    recordingStopped: "Audio captured",
    scoreSupportKicker: "Reading help",
    scoreSupportTitle: "How to use the labels",
    currentScoreState: "Current score status",
    openLabeledScore: "Open labeled score",
    allMeasuresReady: "All measures are ready to read with doremi labels.",
    reviewMeasures: "These measures still need a quick visual check in the original score.",
  },
  analysis: {
    overall: "Overall",
    pitch: "Pitch",
    tempo: "Tempo",
    alignment: "Alignment",
    summaryKicker: "Summary",
    performanceResult: "Performance result",
    measuresKicker: "Measures",
    measureFindings: "Measure findings",
    notesKicker: "Notes",
    detailedMismatches: "Detailed note mismatches",
    measure: "Measure",
    expected: "Expected",
    actual: "Actual",
    issue: "Issue",
  },
  newPiece: {
    kicker: "Create piece",
    title: "Add a new score to the library",
    pill: "Mobile-first form",
    pieceTitle: "Piece title",
    composer: "Composer",
    color: "Color",
    colorHelp: "Pick a color you can recognize quickly on the dashboard.",
    scoreFile: "Score file",
    scoreHelp: "MusicXML, PDF, and image files are accepted. The app converts them to MusicXML internally.",
    memo: "Memo",
    placeholderTitle: "Moonlight phrase lab",
    placeholderComposer: "Beethoven",
    placeholderMemo: "Practice focus, fingering notes, or reminders.",
    save: "Save piece",
    draft: "Reset form",
    draftHelp: "Upload a score file now so you can open the labeled score right after saving.",
    fileRequired: "Choose a score file before saving.",
    apiRequired: "Set NEXT_PUBLIC_API_BASE_URL before creating pieces from the browser.",
    saving: "Saving piece...",
    uploadStarting: "Uploading score...",
    saveFailed: "Failed to create the piece or upload the score.",
    savedReady: "Piece created. Opening the labeled score...",
  },
};

const ja: Dictionary = {
  localeName: "\u65e5\u672c\u8a9e",
  switchLanguage: "\u8a00\u8a9e",
  nav: {
    dashboard: "\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9",
    pieceDetail: "\u66f2\u306e\u8a73\u7d30",
    practice: "\u7df4\u7fd2",
    analysis: "\u89e3\u6790",
    newPiece: "\u66f2\u3092\u8ffd\u52a0",
  },
  layout: {
    eyebrow: "\u30d4\u30a2\u30ce\u7df4\u7fd2\u30b3\u30fc\u30c1",
    title: "Mobile Piano Practice Coach",
    heroCopy:
      "\u6bce\u65e5\u306e\u7df4\u7fd2\u6642\u9593\u3092\u7ba1\u7406\u3057\u306a\u304c\u3089\u3001\u8aad\u307f\u8fbc\u3093\u3060\u697d\u8b5c\u306e\u97f3\u7b26\u306e\u4e0b\u306b\u30c9\u30ec\u30df\u3092\u8868\u793a\u3057\u3066\u8b5c\u8aad\u307f\u3092\u52a9\u3051\u307e\u3059\u3002",
  },
  home: {
    todayKicker: "\u4eca\u65e5",
    overview: "\u4eca\u65e5\u306e\u7df4\u7fd2\u6982\u8981",
    addPiece: "\u66f2\u3092\u8ffd\u52a0",
    today: "\u4eca\u65e5",
    week: "\u4eca\u9031",
    month: "\u4eca\u6708",
    total: "\u5408\u8a08",
    chartKicker: "\u5185\u8a33",
    chartTitle: "\u7df4\u7fd2\u6642\u9593\u306e\u5186\u30b0\u30e9\u30d5",
    weekChartTitle: "\u4eca\u9031\u306e\u66f2\u5225\u7df4\u7fd2\u6642\u9593",
    monthChartTitle: "\u4eca\u6708\u306e\u66f2\u5225\u7df4\u7fd2\u6642\u9593",
    chartPill: "\u5186\u30b0\u30e9\u30d5",
    weeklyTotal: "\u4eca\u9031\u306e\u5408\u8a08",
    monthlyTotal: "\u4eca\u6708\u306e\u5408\u8a08",
    rangeSelector: "\u8868\u793a\u671f\u9593",
    selectedPracticeTime: "\u9078\u629e\u4e2d\u306e\u7df4\u7fd2\u6642\u9593",
    piecesKicker: "\u66f2\u306e\u8a73\u7d30",
    library: "\u8ffd\u52a0\u3057\u305f\u66f2\u3068\u7df4\u7fd2\u6642\u9593",
    strictReady: "\u30c9\u30ec\u30df\u8868\u793a\u306e\u6e96\u5099\u5b8c\u4e86",
    needsScoreReview: "\u697d\u8b5c\u306e\u78ba\u8a8d\u304c\u5fc5\u8981",
    openPiece: "\u66f2\u3092\u958b\u304f",
    sessionsKicker: "\u30bb\u30c3\u30b7\u30e7\u30f3",
    recentLogs: "\u6700\u8fd1\u306e\u7df4\u7fd2\u8a18\u9332",
    piece: "\u66f2",
    duration: "\u6642\u9593",
    source: "\u7a2e\u985e",
    result: "\u958b\u304f",
    status: "\u72b6\u614b",
    viewAnalysis: "\u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u3092\u958b\u304f",
    continueSession: "\u7df4\u7fd2\u753b\u9762\u3092\u958b\u304f",
  },
  piece: {
    kicker: "\u66f2",
    today: "\u4eca\u65e5",
    week: "\u4eca\u9031",
    month: "\u4eca\u6708",
    total: "\u5408\u8a08",
    strictAnalysis: "\u30c9\u30ec\u30df\u8868\u793a\u72b6\u614b",
    ready: "\u3059\u3050\u8868\u793a\u3067\u304d\u307e\u3059",
    blocked: "\u307e\u305a\u697d\u8b5c\u306e\u78ba\u8a8d\u304c\u5fc5\u8981\u3067\u3059",
    startPractice: "\u7df4\u7fd2\u3092\u59cb\u3081\u308b",
    latestAnalysis: "\u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u3078\u79fb\u52d5",
    ingestionKicker: "\u8aad\u307f\u8fbc\u307f",
    pipeline: "\u697d\u8b5c\u51e6\u7406\u306e\u72b6\u614b",
    sourceType: "\u8aad\u307f\u8fbc\u307f\u7a2e\u5225",
    confidence: "\u4fe1\u983c\u5ea6",
    lowConfidenceMeasures: "\u4fe1\u983c\u5ea6\u304c\u4f4e\u3044\u5c0f\u7bc0",
    none: "\u306a\u3057",
    canonicalFormat: "\u6b63\u898f\u5316\u5f62\u5f0f",
    recentSessionsKicker: "\u6700\u8fd1\u306e\u30bb\u30c3\u30b7\u30e7\u30f3",
    timeline: "\u7df4\u7fd2\u306e\u30bf\u30a4\u30e0\u30e9\u30a4\u30f3",
  },
  score: {
    kicker: "\u697d\u8b5c\u30d3\u30e5\u30fc\u30a2",
    baseTempo: "\u57fa\u6e96\u30c6\u30f3\u30dd",
    needsReview: "\u898b\u76f4\u3057\u304c\u5fc5\u8981",
    labelGuide: "\u5404\u97f3\u7b26\u306e\u4e0b\u306e\u7dd1\u6587\u5b57\u304c\u3001\u8aad\u307f\u8fbc\u3093\u3060\u697d\u8b5c\u304b\u3089\u4f5c\u3063\u305f\u30c9\u30ec\u30df\u8868\u793a\u3067\u3059\u3002",
    reviewGuide: "\u30aa\u30ec\u30f3\u30b8\u306e\u30de\u30fc\u30af\u304c\u51fa\u3066\u3044\u308b\u5c0f\u7bc0\u306f\u3001\u5143\u306e\u697d\u8b5c\u3068\u898b\u6bd4\u3079\u3066\u4e00\u5ea6\u78ba\u8a8d\u3059\u308b\u3068\u5b89\u5fc3\u3067\u3059\u3002",
  },
  practice: {
    sessionKicker: "\u30bb\u30c3\u30b7\u30e7\u30f3",
    timerLinked: "\u3053\u306e\u66f2\u3068\u9023\u52d5\u4e2d",
    keepSession:
      "\u30bf\u30a4\u30de\u30fc\u3092\u66f2\u306b\u7d10\u3065\u3051\u3066\u304a\u304f\u3068\u3001\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9\u306e\u96c6\u8a08\u304c\u81ea\u52d5\u3067\u6574\u7406\u3055\u308c\u307e\u3059\u3002",
    startTimer: "\u30bf\u30a4\u30de\u30fc\u958b\u59cb",
    pauseTimer: "\u4e00\u6642\u505c\u6b62",
    guidanceKicker: "\u30ac\u30a4\u30c9",
    guidanceTitle: "\u304a\u3059\u3059\u3081\u306e\u9806\u756a",
    stepCapture: "\u624b\u98061: \u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u3092\u958b\u304d\u3001\u5404\u97f3\u7b26\u306e\u4e0b\u306e\u7dd1\u6587\u5b57\u3092\u898b\u307e\u3059\u3002",
    stepCheckScore: "\u624b\u98062: \u898b\u76f4\u3057\u30de\u30fc\u30af\u304c\u3042\u308b\u5c0f\u7bc0\u306f\u3001\u5143\u306e\u697d\u8b5c\u3068\u898b\u6bd4\u3079\u307e\u3059\u3002",
    stepSubmit: "\u624b\u98063: \u30bf\u30a4\u30de\u30fc\u3092\u56de\u3057\u306a\u304c\u3089\u3001\u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u3067\u7df4\u7fd2\u3057\u307e\u3059\u3002",
    captureKicker: "\u8b5c\u8aad\u307f\u30b5\u30dd\u30fc\u30c8",
    recordOrUpload: "\u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u306e\u4f7f\u3044\u65b9",
    postTake: "\u521d\u5fc3\u8005\u5411\u3051",
    micUnavailable: "\u3053\u306e\u30d6\u30e9\u30a6\u30b6\u3067\u306f\u30de\u30a4\u30af\u9332\u97f3\u3092\u5229\u7528\u3067\u304d\u307e\u305b\u3093\u3002",
    micDenied: "\u30de\u30a4\u30af\u306e\u8a31\u53ef\u304c\u62d2\u5426\u3055\u308c\u305f\u304b\u3001\u5229\u7528\u3067\u304d\u306a\u3044\u72b6\u614b\u3067\u3059\u3002",
    stopRecording: "\u9332\u97f3\u505c\u6b62",
    recordWithMic: "\u30de\u30a4\u30af\u3067\u9332\u97f3",
    uploadFile: "\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u3076",
    recordingState: "\u9332\u97f3\u72b6\u614b",
    nextKicker: "\u6b21\u306e\u64cd\u4f5c",
    sendForAnalysis: "\u89e3\u6790\u3078\u9001\u4fe1",
    scoreTitle: "\u697d\u8b5c\u30bf\u30a4\u30c8\u30eb",
    baseTempo: "\u57fa\u6e96\u30c6\u30f3\u30dd",
    measuresReady: "\u8aad\u307f\u53d6\u308a\u6e08\u307f\u5c0f\u7bc0\u6570",
    lowConfidenceMeasures: "\u4fe1\u983c\u5ea6\u304c\u4f4e\u3044\u5c0f\u7bc0\u6570",
    queueAnalysis: "\u89e3\u6790\u30b8\u30e7\u30d6\u3092\u4f5c\u6210",
    submitting: "\u9001\u4fe1\u4e2d...",
    openSample: "\u30b5\u30f3\u30d7\u30eb\u7d50\u679c\u3092\u958b\u304f",
    resolveLowConfidence: "\u4fe1\u983c\u5ea6\u304c\u4f4e\u3044\u5c0f\u7bc0\u3092\u898b\u76f4\u3059\u307e\u3067\u306f\u3001\u53b3\u5bc6\u89e3\u6790\u3092\u5b9f\u884c\u3067\u304d\u307e\u305b\u3093\u3002",
    setApiBaseUrl: "\u30d0\u30c3\u30af\u30a8\u30f3\u30c9\u306b\u9001\u4fe1\u3059\u308b\u306b\u306f NEXT_PUBLIC_API_BASE_URL \u3092\u8a2d\u5b9a\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    createdJob: "\u89e3\u6790\u30b8\u30e7\u30d6\u3092\u4f5c\u6210\u3057\u307e\u3057\u305f",
    openResult: "\u7d50\u679cID",
    failedSubmit: "\u89e3\u6790\u306e\u9001\u4fe1\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002",
    chooseAudioFirst: "\u307e\u305a\u306f\u97f3\u58f0\u3092\u9332\u97f3\u3059\u308b\u304b\u3001\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002",
    readyToSubmit: "\u6e96\u5099\u5b8c\u4e86\u3067\u3059\u3002\u3053\u306e\u6f14\u594f\u3092\u30d0\u30c3\u30af\u30a8\u30f3\u30c9\u89e3\u6790\u306b\u9001\u308c\u307e\u3059\u3002",
    disabledReason: "\u30dc\u30bf\u30f3\u304c\u62bc\u305b\u306a\u3044\u7406\u7531",
    recordingIdle: "\u307e\u3060\u97f3\u58f0\u306f\u3042\u308a\u307e\u305b\u3093",
    recordingRecording: "\u9332\u97f3\u4e2d",
    recordingStopped: "\u97f3\u58f0\u306e\u6e96\u5099\u304c\u3067\u304d\u307e\u3057\u305f",
    scoreSupportKicker: "\u8b5c\u8aad\u307f\u30d8\u30eb\u30d7",
    scoreSupportTitle: "\u30c9\u30ec\u30df\u8868\u793a\u306e\u898b\u65b9",
    currentScoreState: "\u73fe\u5728\u306e\u697d\u8b5c\u72b6\u614b",
    openLabeledScore: "\u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u3092\u958b\u304f",
    allMeasuresReady: "\u3059\u3079\u3066\u306e\u5c0f\u7bc0\u3067\u30c9\u30ec\u30df\u8868\u793a\u3092\u4f7f\u3063\u3066\u8b5c\u8aad\u307f\u3067\u304d\u307e\u3059\u3002",
    reviewMeasures: "\u3053\u306e\u5c0f\u7bc0\u306f\u5143\u306e\u697d\u8b5c\u3068\u898b\u6bd4\u3079\u3066\u78ba\u8a8d\u3059\u308b\u3068\u5b89\u5fc3\u3067\u3059\u3002",
  },
  analysis: {
    overall: "\u7dcf\u5408",
    pitch: "\u97f3\u9ad8",
    tempo: "\u30c6\u30f3\u30dd",
    alignment: "\u6574\u5408\u6027",
    summaryKicker: "\u8981\u7d04",
    performanceResult: "\u6f14\u594f\u7d50\u679c",
    measuresKicker: "\u5c0f\u7bc0",
    measureFindings: "\u5c0f\u7bc0\u3054\u3068\u306e\u6307\u6458",
    notesKicker: "\u97f3\u7b26",
    detailedMismatches: "\u97f3\u7b26\u306e\u8a73\u7d30\u306a\u5dee\u5206",
    measure: "\u5c0f\u7bc0",
    expected: "\u671f\u5f85\u5024",
    actual: "\u5b9f\u969b",
    issue: "\u554f\u984c",
  },
  newPiece: {
    kicker: "\u66f2\u306e\u8ffd\u52a0",
    title: "\u30e9\u30a4\u30d6\u30e9\u30ea\u306b\u65b0\u3057\u3044\u697d\u8b5c\u3092\u767b\u9332",
    pill: "\u30e2\u30d0\u30a4\u30eb\u5411\u3051\u30d5\u30a9\u30fc\u30e0",
    pieceTitle: "\u66f2\u540d",
    composer: "\u4f5c\u66f2\u8005",
    color: "\u8272",
    colorHelp: "\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9\u3067\u3072\u3068\u76ee\u3067\u5206\u304b\u308b\u8272\u3092\u9078\u3076\u3068\u4fbf\u5229\u3067\u3059\u3002",
    scoreFile: "\u697d\u8b5c\u30d5\u30a1\u30a4\u30eb",
    scoreHelp: "MusicXML\u3001PDF\u3001\u753b\u50cf\u304c\u4f7f\u3048\u307e\u3059\u3002\u30a2\u30d7\u30ea\u5185\u90e8\u3067 MusicXML \u306b\u6574\u7406\u3057\u307e\u3059\u3002",
    memo: "\u30e1\u30e2",
    placeholderTitle: "\u6708\u5149\u306e\u30d5\u30ec\u30fc\u30ba\u7df4\u7fd2",
    placeholderComposer: "\u30d9\u30fc\u30c8\u30fc\u30fc\u30f4\u30a7\u30f3",
    placeholderMemo: "\u7df4\u7fd2\u306e\u76ee\u6a19\u3084\u6307\u4f7f\u3044\u3001\u6c17\u3092\u3064\u3051\u305f\u3044\u70b9\u3092\u66f8\u3044\u3066\u304a\u3051\u307e\u3059\u3002",
    save: "\u4fdd\u5b58",
    draft: "\u5165\u529b\u3092\u30ea\u30bb\u30c3\u30c8",
    draftHelp: "\u4fdd\u5b58\u3059\u308b\u3068\u3059\u3050\u306b\u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u3092\u958b\u3051\u308b\u3088\u3046\u3001\u5148\u306b\u697d\u8b5c\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002",
    fileRequired: "\u4fdd\u5b58\u524d\u306b\u697d\u8b5c\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u3093\u3067\u304f\u3060\u3055\u3044\u3002",
    apiRequired: "\u30d6\u30e9\u30a6\u30b6\u304b\u3089\u66f2\u3092\u4f5c\u308b\u306b\u306f NEXT_PUBLIC_API_BASE_URL \u306e\u8a2d\u5b9a\u304c\u5fc5\u8981\u3067\u3059\u3002",
    saving: "\u66f2\u3092\u4fdd\u5b58\u4e2d...",
    uploadStarting: "\u697d\u8b5c\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u4e2d...",
    saveFailed: "\u66f2\u306e\u4fdd\u5b58\u307e\u305f\u306f\u697d\u8b5c\u306e\u8aad\u307f\u8fbc\u307f\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002",
    savedReady: "\u4fdd\u5b58\u3067\u304d\u307e\u3057\u305f\u3002\u30c9\u30ec\u30df\u4ed8\u304d\u8b5c\u9762\u3092\u958b\u304d\u307e\u3059...",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return locale === "ja" ? ja : en;
}

export function formatMinutes(value: number, locale: Locale) {
  return locale === "ja" ? `${value}\u5206` : `${value} min`;
}

export function formatMeasureLabel(value: number, locale: Locale) {
  return locale === "ja" ? `${value}\u5c0f\u7bc0` : `Measure ${value}`;
}

export function formatStatus(status: string, locale: Locale) {
  const labels: Record<string, { en: string; ja: string }> = {
    ready: { en: "Ready", ja: "\u6e96\u5099\u5b8c\u4e86" },
    processing: { en: "Processing", ja: "\u51e6\u7406\u4e2d" },
    needs_review: { en: "Needs review", ja: "\u898b\u76f4\u3057\u304c\u5fc5\u8981" },
    completed: { en: "Completed", ja: "\u5b8c\u4e86" },
    failed: { en: "Failed", ja: "\u5931\u6557" },
    timer: { en: "Timer", ja: "\u30bf\u30a4\u30de\u30fc" },
    analysis: { en: "Analysis", ja: "\u89e3\u6790" },
    manual: { en: "Manual", ja: "\u624b\u5165\u529b" },
    musicxml: { en: "MusicXML", ja: "MusicXML" },
    pdf: { en: "PDF", ja: "PDF" },
    image: { en: "Image", ja: "\u753b\u50cf" },
    idle: { en: "Waiting for audio", ja: "\u307e\u3060\u97f3\u58f0\u306f\u3042\u308a\u307e\u305b\u3093" },
    recording: { en: "Recording now", ja: "\u9332\u97f3\u4e2d" },
    stopped: { en: "Audio captured", ja: "\u97f3\u58f0\u306e\u6e96\u5099\u304c\u3067\u304d\u307e\u3057\u305f" },
    uploading: { en: "Submitting...", ja: "\u9001\u4fe1\u4e2d..." },
    done: { en: "Submitted", ja: "\u9001\u4fe1\u6e08\u307f" },
    error: { en: "Error", ja: "\u30a8\u30e9\u30fc" },
  };

  return labels[status]?.[locale] ?? status;
}
