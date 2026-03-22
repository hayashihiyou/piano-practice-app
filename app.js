const STORAGE_KEY = "piano-practice-studio";
const SAMPLE_SCORE_PATH = "./samples/twinkle.musicxml";
const NOTE_WINDOW_MS = 350;
const AUDIO_RMS_THRESHOLD = 0.012;
const AUDIO_MIN_FREQUENCY = 80;
const AUDIO_MAX_FREQUENCY = 1200;
const STABLE_NOTE_FRAMES = 4;
const SAME_NOTE_COOLDOWN_MS = 180;
const SILENCE_RESET_MS = 180;

const CHART_MODES = {
  day: { label: "日ごとの練習", periods: 14 },
  week: { label: "週ごとの練習", periods: 12 },
  month: { label: "月ごとの練習", periods: 12 },
};

const state = {
  practiceEntries: [],
  practiceTimer: createEmptyPracticeTimer(),
  practiceChartMode: "day",
  score: null,
  audio: createEmptyAudioState(),
  session: createEmptySession(),
  ui: {
    busyCount: 0,
  },
};

const dom = {
  todayTotal: document.querySelector("#today-total"),
  todayDate: document.querySelector("#today-date"),
  weekTotal: document.querySelector("#week-total"),
  averageTotal: document.querySelector("#average-total"),
  streakTotal: document.querySelector("#streak-total"),
  practiceStatus: document.querySelector("#practice-status"),
  practiceLiveTimer: document.querySelector("#practice-live-timer"),
  practiceSessionMessage: document.querySelector("#practice-session-message"),
  chartTitle: document.querySelector("#chart-title"),
  practiceChart: document.querySelector("#practice-chart"),
  chartCaption: document.querySelector("#chart-caption"),
  chartModeDay: document.querySelector("#chart-mode-day"),
  chartModeWeek: document.querySelector("#chart-mode-week"),
  chartModeMonth: document.querySelector("#chart-mode-month"),
  practiceTableBody: document.querySelector("#practice-table-body"),
  emptyRowTemplate: document.querySelector("#empty-row-template"),
  startPractice: document.querySelector("#start-practice"),
  stopPractice: document.querySelector("#stop-practice"),
  resetData: document.querySelector("#reset-data"),
  runIndicator: document.querySelector("#run-indicator"),
  scoreFile: document.querySelector("#score-file"),
  loadSampleScore: document.querySelector("#load-sample-score"),
  scoreName: document.querySelector("#score-name"),
  scoreTempo: document.querySelector("#score-tempo"),
  scoreEvents: document.querySelector("#score-events"),
  audioStatus: document.querySelector("#audio-status"),
  scoreExpectations: document.querySelector("#score-expectations"),
  startSession: document.querySelector("#start-session"),
  stopSession: document.querySelector("#stop-session"),
  sessionState: document.querySelector("#session-state"),
  tempoState: document.querySelector("#tempo-state"),
  symbolState: document.querySelector("#symbol-state"),
  accuracyRate: document.querySelector("#accuracy-rate"),
  tempoConsistency: document.querySelector("#tempo-consistency"),
  symbolAccuracy: document.querySelector("#symbol-accuracy"),
  currentMeasure: document.querySelector("#current-measure"),
  coachMessage: document.querySelector("#coach-message"),
  performanceLog: document.querySelector("#performance-log"),
  feedbackList: document.querySelector("#feedback-list"),
};

initialize();

function initialize() {
  loadState();
  reconcilePersistedPracticeTimer();
  bindPracticeEvents();
  bindScoreEvents();
  dom.todayDate.textContent = formatLongDate(new Date());
  renderPracticeDashboard();
  renderScoreState();
  renderSessionState();
  renderRunIndicator();
}

function bindPracticeEvents() {
  dom.startPractice.addEventListener("click", startPracticeTimer);
  dom.stopPractice.addEventListener("click", () => stopPracticeTimer("manual"));
  dom.chartModeDay.addEventListener("click", () => setPracticeChartMode("day"));
  dom.chartModeWeek.addEventListener("click", () => setPracticeChartMode("week"));
  dom.chartModeMonth.addEventListener("click", () => setPracticeChartMode("month"));

  dom.resetData.addEventListener("click", async () => {
    const confirmed = window.confirm("保存済みの練習記録と録音チェック情報を削除しますか？");
    if (!confirmed) {
      return;
    }

    stopPracticeTicker();
    await stopAudioSession({ silent: true });
    localStorage.removeItem(STORAGE_KEY);
    state.practiceEntries = [];
    state.practiceTimer = createEmptyPracticeTimer();
    state.score = null;
    state.session = createEmptySession();
    state.audio = createEmptyAudioState();
    clearLiveLists();
    renderPracticeDashboard();
    renderScoreState();
    renderSessionState();
    renderRunIndicator();
  });
}

function bindScoreEvents() {
  dom.scoreFile.addEventListener("change", async (event) => {
    const [file] = event.target.files ?? [];
    if (!file) {
      return;
    }

    if (file.name.toLowerCase().endsWith(".mxl")) {
      pushFeedback("このアプリでは、圧縮された楽譜ではなく .musicxml / .xml の楽譜ファイルを読み込んでください。", "warn");
      return;
    }

    try {
      await runWithBusy(async () => {
        const text = await file.text();
        await parseAndStoreScore(text, file.name);
        pushFeedback(`楽譜を読み込みました: ${file.name}`, "good");
      });
    } catch (error) {
      console.error(error);
      pushFeedback("楽譜ファイルの読み込みに失敗しました。.musicxml または .xml を確認してください。", "bad");
    }
  });

  dom.loadSampleScore.addEventListener("click", async () => {
    await runWithBusy(async () => {
      const response = await fetch(SAMPLE_SCORE_PATH);
      if (!response.ok) {
        throw new Error(`Failed to load sample: ${response.status}`);
      }

      const xmlText = await response.text();
      await parseAndStoreScore(xmlText, "見本の楽譜");
      pushFeedback("見本の楽譜を読み込みました。録音開始ですぐ試せます。", "good");
    }).catch((error) => {
      console.error(error);
      pushFeedback("見本の楽譜を開けませんでした。ローカルサーバー経由で開いているか確認してください。", "bad");
    });
  });

  dom.startSession.addEventListener("click", () => {
    void startAudioSession();
  });
  dom.stopSession.addEventListener("click", () => {
    void stopAudioSession();
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    state.practiceEntries = Array.isArray(parsed.practiceEntries) ? parsed.practiceEntries : [];

    if (parsed.practiceTimer) {
      state.practiceTimer = {
        ...createEmptyPracticeTimer(),
        ...parsed.practiceTimer,
      };
    }
  } catch (error) {
    console.warn("Failed to load state", error);
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      practiceEntries: state.practiceEntries,
      practiceTimer: {
        active: state.practiceTimer.active,
        startedAt: state.practiceTimer.startedAt,
        elapsedBeforeStartMs: state.practiceTimer.elapsedBeforeStartMs,
        sessionDate: state.practiceTimer.sessionDate,
      },
    }),
  );
}

function reconcilePersistedPracticeTimer() {
  if (!state.practiceTimer.active) {
    state.practiceTimer = {
      ...createEmptyPracticeTimer(),
      elapsedBeforeStartMs: getStoredDurationMs(getTodayKey()),
    };
    persistState();
    return;
  }

  const todayKey = getTodayKey();
  if (state.practiceTimer.sessionDate === todayKey) {
    state.practiceTimer.message = "記録中です。練習が終わったら停止を押してください。";
    startPracticeTicker();
    return;
  }

  finalizeHistoricalPracticeTimer();
}

function finalizeHistoricalPracticeTimer() {
  if (!state.practiceTimer.active || !state.practiceTimer.sessionDate) {
    return;
  }

  const cutoff = getStartOfNextDay(state.practiceTimer.sessionDate).getTime();
  const elapsedMs =
    state.practiceTimer.elapsedBeforeStartMs + Math.max(0, cutoff - state.practiceTimer.startedAt);

  upsertPracticeEntry({
    date: state.practiceTimer.sessionDate,
    durationMs: elapsedMs,
  });

  state.practiceTimer = {
    ...createEmptyPracticeTimer(),
    message: "日付をまたいだため、前日の練習を自動で停止しました。",
  };
  persistState();
}

function startPracticeTimer() {
  if (state.practiceTimer.active) {
    return;
  }

  const todayKey = getTodayKey();
  state.practiceTimer.active = true;
  state.practiceTimer.sessionDate = todayKey;
  state.practiceTimer.startedAt = Date.now();
  state.practiceTimer.elapsedBeforeStartMs = getStoredDurationMs(todayKey);
  state.practiceTimer.message = "記録中です。練習が終わったら停止を押してください。";
  startPracticeTicker();
  persistState();
  renderPracticeDashboard();
}

function stopPracticeTimer(reason = "manual") {
  if (!state.practiceTimer.active) {
    return;
  }

  const todayKey = getTodayKey();
  let effectiveElapsedMs;

  if (state.practiceTimer.sessionDate === todayKey) {
    effectiveElapsedMs = getActivePracticeDurationMs(Date.now());
  } else {
    const cutoff = getStartOfNextDay(state.practiceTimer.sessionDate).getTime();
    effectiveElapsedMs =
      state.practiceTimer.elapsedBeforeStartMs + Math.max(0, cutoff - state.practiceTimer.startedAt);
  }

  upsertPracticeEntry({
    date: state.practiceTimer.sessionDate,
    durationMs: effectiveElapsedMs,
  });

  stopPracticeTicker();
  state.practiceTimer = {
    ...createEmptyPracticeTimer(),
    elapsedBeforeStartMs: getStoredDurationMs(todayKey),
    message:
      reason === "day-change"
        ? "日付が変わったため、自動で停止しました。"
        : "今日の練習を保存しました。次も開始ボタンから続けられます。",
  };
  persistState();
  renderPracticeDashboard();
}

function startPracticeTicker() {
  stopPracticeTicker();
  state.practiceTimer.tickId = window.setInterval(() => {
    if (state.practiceTimer.active && state.practiceTimer.sessionDate !== getTodayKey()) {
      stopPracticeTimer("day-change");
      return;
    }

    renderPracticeDashboard();
  }, 1000);
}

function stopPracticeTicker() {
  if (state.practiceTimer.tickId !== null) {
    window.clearInterval(state.practiceTimer.tickId);
    state.practiceTimer.tickId = null;
  }
}

function upsertPracticeEntry(entry) {
  const existingIndex = state.practiceEntries.findIndex((item) => item.date === entry.date);
  if (existingIndex >= 0) {
    state.practiceEntries[existingIndex] = entry;
  } else {
    state.practiceEntries.push(entry);
  }

  state.practiceEntries.sort((a, b) => b.date.localeCompare(a.date));
  persistState();
}

function renderPracticeDashboard() {
  const todayKey = getTodayKey();
  const todayDurationMs = getDisplayedDurationMs(todayKey);
  const lastSevenDays = buildDateRange(7);
  const weekTotalMs = lastSevenDays.reduce((sum, date) => sum + getDisplayedDurationMs(date), 0);
  const averageMs = weekTotalMs / lastSevenDays.length;

  dom.todayTotal.textContent = formatHours(todayDurationMs);
  dom.weekTotal.textContent = formatHours(weekTotalMs);
  dom.averageTotal.textContent = formatHours(averageMs);
  dom.streakTotal.textContent = `${calculateStreak()}日`;
  dom.practiceLiveTimer.textContent = formatHms(
    state.practiceTimer.active ? getActivePracticeDurationMs(Date.now()) : todayDurationMs,
  );

  setPill(
    dom.practiceStatus,
    state.practiceTimer.active ? "計測中" : "待機中",
    state.practiceTimer.active ? "good" : "idle",
  );
  dom.practiceSessionMessage.textContent = state.practiceTimer.message;
  dom.startPractice.disabled = state.practiceTimer.active;
  dom.stopPractice.disabled = !state.practiceTimer.active;
  updateChartModeButtons();

  renderPracticeChart();
  renderPracticeTable();
}

function renderPracticeChart() {
  const chartData = buildChartData(state.practiceChartMode);
  const maxDurationMs = Math.max(...chartData.map((item) => item.durationMs), 1);

  dom.practiceChart.innerHTML = "";
  dom.practiceChart.style.gridTemplateColumns = `repeat(${chartData.length}, minmax(0, 1fr))`;
  chartData.forEach((item) => {
    const barGroup = document.createElement("div");
    barGroup.className = "chart-bar-group";

    const barWrap = document.createElement("div");
    barWrap.className = "chart-bar-wrap";

    const bar = document.createElement("div");
    bar.className = `chart-bar ${item.isCurrent ? "active" : ""}`.trim();
    bar.style.height = `${Math.max(6, (item.durationMs / maxDurationMs) * 160)}px`;
    bar.title = `${item.tooltipLabel}: ${formatDurationForTooltip(item.durationMs)}`;

    const hours = document.createElement("span");
    hours.className = "chart-hours";
    hours.textContent = formatShortHours(item.durationMs);

    const label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = item.shortLabel;

    barWrap.append(bar);
    barGroup.append(hours, barWrap, label);
    dom.practiceChart.append(barGroup);
  });

  dom.chartTitle.textContent = CHART_MODES[state.practiceChartMode].label;
  dom.chartCaption.textContent = getChartCaption(chartData.length, state.practiceChartMode);
}

function setPracticeChartMode(mode) {
  if (!CHART_MODES[mode]) {
    return;
  }

  state.practiceChartMode = mode;
  renderPracticeDashboard();
}

function updateChartModeButtons() {
  const buttons = {
    day: dom.chartModeDay,
    week: dom.chartModeWeek,
    month: dom.chartModeMonth,
  };

  Object.entries(buttons).forEach(([mode, button]) => {
    button.classList.toggle("active", state.practiceChartMode === mode);
  });
}

function buildChartData(mode) {
  if (mode === "week") {
    return buildWeeklyChartData(CHART_MODES.week.periods);
  }

  if (mode === "month") {
    return buildMonthlyChartData(CHART_MODES.month.periods);
  }

  return buildDailyChartData(CHART_MODES.day.periods);
}

function buildDailyChartData(periods) {
  return buildDateRange(periods)
    .reverse()
    .map((date) => ({
      key: date,
      shortLabel: formatChartLabel(date),
      tooltipLabel: date,
      durationMs: getDisplayedDurationMs(date),
      isCurrent: date === getTodayKey(),
    }));
}

function buildWeeklyChartData(periods) {
  const results = [];
  const currentStart = getStartOfWeek(new Date());

  for (let index = periods - 1; index >= 0; index -= 1) {
    const start = new Date(currentStart);
    start.setDate(currentStart.getDate() - index * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    results.push({
      key: formatDateInput(start),
      shortLabel: `${start.getMonth() + 1}/${start.getDate()}`,
      tooltipLabel: `${formatDateInput(start)} 〜 ${formatDateInput(end)}`,
      durationMs: sumDailyDurations(start, end),
      isCurrent: isDateWithinRange(new Date(), start, end),
    });
  }

  return results;
}

function buildMonthlyChartData(periods) {
  const today = new Date();
  const results = [];

  for (let index = periods - 1; index >= 0; index -= 1) {
    const start = new Date(today.getFullYear(), today.getMonth() - index, 1);
    const end = new Date(today.getFullYear(), today.getMonth() - index + 1, 0);

    results.push({
      key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
      shortLabel: `${start.getMonth() + 1}月`,
      tooltipLabel: `${start.getFullYear()}年${start.getMonth() + 1}月`,
      durationMs: sumDailyDurations(start, end),
      isCurrent: today.getFullYear() === start.getFullYear() && today.getMonth() === start.getMonth(),
    });
  }

  return results;
}

function sumDailyDurations(startDate, endDate) {
  const cursor = new Date(startDate);
  let total = 0;

  while (cursor <= endDate) {
    total += getDisplayedDurationMs(formatDateInput(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

function getStartOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + diff);
  return result;
}

function isDateWithinRange(target, start, end) {
  const normalizedTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return normalizedTarget >= start && normalizedTarget <= end;
}

function getChartCaption(length, mode) {
  if (mode === "week") {
    return `直近${length}週間の練習時間を表示しています`;
  }

  if (mode === "month") {
    return `直近${length}か月の練習時間を表示しています`;
  }

  return `直近${length}日間の練習時間を表示しています`;
}

function renderPracticeTable() {
  dom.practiceTableBody.innerHTML = "";
  if (state.practiceEntries.length === 0 && !state.practiceTimer.active) {
    dom.practiceTableBody.append(dom.emptyRowTemplate.content.cloneNode(true));
    return;
  }

  const rows = [...state.practiceEntries];
  if (state.practiceTimer.active && !rows.some((entry) => entry.date === state.practiceTimer.sessionDate)) {
    rows.unshift({
      date: state.practiceTimer.sessionDate,
      durationMs: getDisplayedDurationMs(state.practiceTimer.sessionDate),
    });
  }

  rows.forEach((entry) => {
    const row = document.createElement("tr");
    const isToday = entry.date === getTodayKey();
    const isActiveToday = isToday && state.practiceTimer.active;
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${formatHours(getDisplayedDurationMs(entry.date))}</td>
      <td>${isActiveToday ? "計測中" : isToday ? "今日" : "保存済み"}</td>
    `;
    dom.practiceTableBody.append(row);
  });
}

function calculateStreak() {
  const practicedDates = new Set(
    buildDateRange(365).filter((date) => getDisplayedDurationMs(date) > 0),
  );

  let streak = 0;
  const cursor = new Date();
  while (practicedDates.has(formatDateInput(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getDisplayedDurationMs(date) {
  if (state.practiceTimer.active && state.practiceTimer.sessionDate === date) {
    return getActivePracticeDurationMs(Date.now());
  }

  return getStoredDurationMs(date);
}

function getStoredDurationMs(date) {
  return state.practiceEntries.find((entry) => entry.date === date)?.durationMs || 0;
}

function getActivePracticeDurationMs(now) {
  if (!state.practiceTimer.active || state.practiceTimer.startedAt === null) {
    return state.practiceTimer.elapsedBeforeStartMs;
  }

  return state.practiceTimer.elapsedBeforeStartMs + Math.max(0, now - state.practiceTimer.startedAt);
}

async function parseAndStoreScore(xmlText, name) {
  await stopAudioSession({ silent: true });
  const score = parseMusicXml(xmlText, name);
  state.score = score;
  state.session = createEmptySession();
  clearLiveLists();
  renderScoreState();
  renderSessionState();
}

function parseMusicXml(xmlText, name) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");
  const parserError = xml.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid XML");
  }

  const title =
    xml.querySelector("work > work-title")?.textContent?.trim() ||
    xml.querySelector("movement-title")?.textContent?.trim() ||
    name;
  const part = xml.querySelector("part");
  if (!part) {
    throw new Error("MusicXML part not found");
  }

  let divisions = 1;
  let currentDynamic = "mf";
  let cursorBeat = 0;
  const notes = [];
  const tempoChanges = [{ beatTime: 0, tempo: 80 }];

  Array.from(part.children)
    .filter((node) => node.tagName === "measure")
    .forEach((measureNode, measureIndex) => {
      const measureNumber = Number.parseInt(measureNode.getAttribute("number") || `${measureIndex + 1}`, 10);
      let measureCursor = cursorBeat;
      let lastNoteStartBeat = measureCursor;
      let measureMaxBeat = measureCursor;

      Array.from(measureNode.children).forEach((childNode) => {
        if (childNode.tagName === "attributes") {
          const nextDivisions = childNode.querySelector("divisions")?.textContent;
          if (nextDivisions) {
            divisions = Number.parseInt(nextDivisions, 10) || divisions;
          }
          return;
        }

        if (childNode.tagName === "direction") {
          const tempoNode = childNode.querySelector("sound[tempo]");
          if (tempoNode) {
            const nextTempo = Number.parseFloat(tempoNode.getAttribute("tempo"));
            if (!Number.isNaN(nextTempo)) {
              const lastTempoChange = tempoChanges[tempoChanges.length - 1];
              if (!lastTempoChange || lastTempoChange.beatTime !== measureCursor || lastTempoChange.tempo !== nextTempo) {
                tempoChanges.push({ beatTime: measureCursor, tempo: nextTempo });
              }
            }
          }

          const dynamicNode = childNode.querySelector("direction-type > dynamics > *");
          if (dynamicNode?.tagName) {
            currentDynamic = dynamicNode.tagName.toLowerCase();
          }
          return;
        }

        if (childNode.tagName === "backup" || childNode.tagName === "forward") {
          const duration = Number.parseInt(childNode.querySelector("duration")?.textContent || "0", 10);
          const beatLength = divisions > 0 ? duration / divisions : 0;
          measureCursor += childNode.tagName === "backup" ? -beatLength : beatLength;
          return;
        }

        if (childNode.tagName !== "note") {
          return;
        }

        const isRest = Boolean(childNode.querySelector("rest"));
        const chord = Boolean(childNode.querySelector("chord"));
        const duration = Number.parseInt(childNode.querySelector("duration")?.textContent || "0", 10);
        const beatLength = divisions > 0 ? duration / divisions : 0;
        const voice = childNode.querySelector("voice")?.textContent?.trim() || "1";
        const noteStartBeat = chord ? lastNoteStartBeat : measureCursor;

        if (isRest) {
          measureCursor += beatLength;
          measureMaxBeat = Math.max(measureMaxBeat, measureCursor);
          return;
        }

        const pitchNode = childNode.querySelector("pitch");
        if (!pitchNode) {
          return;
        }

        const midi = pitchToMidi(
          pitchNode.querySelector("step")?.textContent?.trim(),
          Number.parseInt(pitchNode.querySelector("alter")?.textContent || "0", 10),
          Number.parseInt(pitchNode.querySelector("octave")?.textContent || "4", 10),
        );

        const articulationsNode = childNode.querySelector("notations > articulations");
        const articulations = articulationsNode
          ? Array.from(articulationsNode.children).map((node) => node.tagName.toLowerCase())
          : [];

        notes.push({
          id: `${measureNumber}-${voice}-${notes.length}`,
          measure: measureNumber,
          beatTime: noteStartBeat,
          beatLength,
          midi,
          dynamic: currentDynamic,
          articulations,
          hasSlur: Boolean(childNode.querySelector("notations > slur")),
        });

        if (!chord) {
          lastNoteStartBeat = noteStartBeat;
          measureCursor += beatLength;
          measureMaxBeat = Math.max(measureMaxBeat, measureCursor);
        }
      });

      cursorBeat = measureMaxBeat;
    });

  const normalizedTempoChanges = normalizeTempoChanges(tempoChanges);
  notes.forEach((note) => {
    note.expectedMsFromStart = beatPositionToMs(note.beatTime, normalizedTempoChanges);
    note.expectedDurationMs = beatSpanToMs(note.beatTime, note.beatLength, normalizedTempoChanges);
  });

  const events = groupNotesIntoEvents(notes);
  const baseTempo = normalizedTempoChanges[0]?.tempo || 80;

  return {
    title,
    tempo: baseTempo,
    tempoChanges: normalizedTempoChanges,
    notes,
    events,
    expectations: summarizeExpectations(events, normalizedTempoChanges),
  };
}

function normalizeTempoChanges(changes) {
  const sorted = [...changes].sort((left, right) => left.beatTime - right.beatTime);
  const normalized = [];

  sorted.forEach((change) => {
    const last = normalized[normalized.length - 1];
    if (last && last.beatTime === change.beatTime) {
      last.tempo = change.tempo;
      return;
    }

    normalized.push({ beatTime: change.beatTime, tempo: change.tempo });
  });

  return normalized;
}

function beatPositionToMs(beatTime, tempoChanges) {
  let elapsedMs = 0;

  for (let index = 0; index < tempoChanges.length; index += 1) {
    const current = tempoChanges[index];
    const next = tempoChanges[index + 1];
    const segmentEndBeat = next ? Math.min(next.beatTime, beatTime) : beatTime;

    if (segmentEndBeat <= current.beatTime) {
      continue;
    }

    elapsedMs += beatsToMs(segmentEndBeat - current.beatTime, current.tempo);
    if (!next || beatTime <= next.beatTime) {
      break;
    }
  }

  return elapsedMs;
}

function beatSpanToMs(startBeat, beatLength, tempoChanges) {
  return beatPositionToMs(startBeat + beatLength, tempoChanges) - beatPositionToMs(startBeat, tempoChanges);
}

function groupNotesIntoEvents(notes) {
  const grouped = [];

  notes
    .slice()
    .sort((left, right) => {
      if (left.beatTime !== right.beatTime) {
        return left.beatTime - right.beatTime;
      }
      return left.midi - right.midi;
    })
    .forEach((note) => {
      const lastGroup = grouped[grouped.length - 1];
      const sameOnset =
        lastGroup &&
        Math.abs(lastGroup.beatTime - note.beatTime) < 0.0001 &&
        lastGroup.measure === note.measure;

      if (sameOnset) {
        lastGroup.notes.push(note);
        return;
      }

      grouped.push({
        index: grouped.length,
        measure: note.measure,
        beatTime: note.beatTime,
        expectedMsFromStart: note.expectedMsFromStart,
        notes: [note],
      });
    });

  return grouped;
}

function summarizeExpectations(events, tempoChanges) {
  const notes = events.flatMap((event) => event.notes);
  const baseTempo = tempoChanges[0]?.tempo || 80;
  const uniqueDynamics = [...new Set(notes.map((note) => note.dynamic))].filter(Boolean);
  const articulationCounts = notes.reduce((accumulator, note) => {
    note.articulations.forEach((articulation) => {
      accumulator[articulation] = (accumulator[articulation] || 0) + 1;
    });
    if (note.hasSlur) {
      accumulator.slur = (accumulator.slur || 0) + 1;
    }
    return accumulator;
  }, {});

  const expectations = [
    tempoChanges.length > 1
      ? `楽譜の速さ指定は ${tempoChanges.length} 箇所あります。最初は ${baseTempo} 拍/分 で、途中の変化も見ています。`
      : `お手本の速さは約 ${baseTempo} 拍/分 です。最初の音からの時間差で、走りすぎや遅れすぎを見ます。`,
    uniqueDynamics.length > 0
      ? `強弱の指定は ${uniqueDynamics.join(", ")} を含みます。録音の音量は目安として使います。`
      : "強弱の指定は少なめなので、主に音の高さと速さを見ます。",
  ];

  const articulationSummary = Object.entries(articulationCounts)
    .map(([name, count]) => `${name} x ${count}`)
    .join(" / ");

  expectations.push(
    articulationSummary
      ? `弾き方のチェック対象: ${articulationSummary}`
      : "スタッカートやスラーなどの指定が少ないため、主に音の高さと速さを見ます。",
  );

  if (events.some((event) => event.notes.length > 1)) {
    expectations.push("録音でのリアルタイム判定は単音メロディー向けです。和音は目安として扱います。");
  }

  return expectations;
}

async function startAudioSession() {
  if (!state.score) {
    pushFeedback("先に楽譜ファイルを読み込んでください。", "warn");
    return;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    pushFeedback("このブラウザでは録音機能が使えません。", "bad");
    renderSessionState();
    return;
  }

  if (state.audio.active) {
    return;
  }

  await runWithBusy(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.12;
    source.connect(analyser);

    state.audio = {
      ...createEmptyAudioState(),
      active: true,
      stream,
      context: audioContext,
      source,
      analyser,
      dataArray: new Float32Array(analyser.fftSize),
    };

    state.session = createEmptySession();
    state.session.active = true;
    clearLiveLists();
    pushFeedback("録音を開始しました。演奏すると、楽譜との比較がリアルタイムで進みます。", "good");
    renderSessionState();
    startAudioAnalysisLoop();
  }).catch((error) => {
    console.error(error);
    pushFeedback("録音を開始できませんでした。マイクの許可設定を確認してください。", "bad");
    renderSessionState();
  });
}

async function stopAudioSession(options = {}) {
  const { silent = false } = options;
  if (!state.audio.active && !state.audio.stream && !state.audio.context) {
    state.session.active = false;
    renderSessionState();
    return;
  }

  stopAudioAnalysisLoop();

  if (state.audio.stream) {
    state.audio.stream.getTracks().forEach((track) => track.stop());
  }

  if (state.audio.context && state.audio.context.state !== "closed") {
    try {
      await state.audio.context.close();
    } catch (error) {
      console.warn("Failed to close audio context", error);
    }
  }

  state.audio = createEmptyAudioState();
  state.session.active = false;
  renderSessionState();

  if (!silent) {
    pushFeedback("録音を停止しました。必要ならもう一度録音開始を押してください。", "warn");
  }
}

function startAudioAnalysisLoop() {
  stopAudioAnalysisLoop();
  analyseAudioFrame();
}

function stopAudioAnalysisLoop() {
  if (state.audio.rafId !== null) {
    window.cancelAnimationFrame(state.audio.rafId);
    state.audio.rafId = null;
  }
}

function analyseAudioFrame() {
  if (!state.audio.active || !state.audio.analyser || !state.audio.dataArray || !state.audio.context) {
    return;
  }

  state.audio.analyser.getFloatTimeDomainData(state.audio.dataArray);
  const rms = calculateRms(state.audio.dataArray);
  const now = performance.now();

  if (rms > AUDIO_RMS_THRESHOLD) {
    const frequency = detectPitch(state.audio.dataArray, state.audio.context.sampleRate);
    if (frequency > 0) {
      const midi = Math.round(frequencyToMidi(frequency));
      registerDetectedNote(midi, rms, now);
    } else {
      handleAudioSilence(now);
    }
  } else {
    handleAudioSilence(now);
  }

  state.audio.rafId = window.requestAnimationFrame(analyseAudioFrame);
}

function registerDetectedNote(midi, rms, now) {
  state.audio.lastSignalAt = now;

  if (state.audio.candidateMidi === midi) {
    state.audio.candidateFrames += 1;
  } else {
    state.audio.candidateMidi = midi;
    state.audio.candidateFrames = 1;
  }

  if (state.audio.candidateFrames < STABLE_NOTE_FRAMES) {
    return;
  }

  const isNewNote =
    state.audio.lastCommittedMidi !== midi ||
    now - state.audio.lastCommittedAt > SAME_NOTE_COOLDOWN_MS;

  if (!isNewNote) {
    return;
  }

  state.audio.lastCommittedMidi = midi;
  state.audio.lastCommittedAt = now;
  handleDetectedNote(midi, rms, now);
}

function handleAudioSilence(now) {
  if (now - state.audio.lastSignalAt > SILENCE_RESET_MS) {
    state.audio.candidateMidi = null;
    state.audio.candidateFrames = 0;
    state.audio.lastCommittedMidi = null;
  }
}

function handleDetectedNote(midi, rms, timestamp) {
  if (!state.score || !state.session.active) {
    return;
  }

  if (state.session.startedAt === null) {
    state.session.startedAt = timestamp;
  }

  const playedMsFromStart = timestamp - state.session.startedAt;
  const nextEvent = state.score.events[state.session.currentEventIndex];
  if (!nextEvent) {
    appendPerformanceLog("すべてのチェック対象を評価済みです。", "good");
    void stopAudioSession({ silent: true });
    return;
  }

  const expectedNotes = nextEvent.notes.map((note) => note.midi);
  const pitchMatch = expectedNotes.includes(midi);
  const timeDelta = playedMsFromStart - nextEvent.expectedMsFromStart;
  const timingSeverity = classifyTiming(timeDelta);

  state.session.playedNotes += 1;
  if (pitchMatch) {
    state.session.correctNotes += 1;
  }

  const loudnessScore = evaluateLoudness(nextEvent.notes[0].dynamic, rms);
  state.session.symbolChecks += 1;
  state.session.symbolSuccess += loudnessScore.ok ? 1 : 0;

  if (pitchMatch && state.session.lastMatchedAtMs !== null) {
    const actualGap = playedMsFromStart - state.session.lastMatchedAtMs;
    const expectedGap = nextEvent.expectedMsFromStart - state.session.lastExpectedMs;
    if (expectedGap > 0) {
      state.session.tempoRatios.push(Math.abs(actualGap - expectedGap) / expectedGap);
    }
  }

  appendPerformanceLog(
    [
      pitchMatch ? `音が合っています: ${midiToNoteName(midi)}` : `違う音です: ${midiToNoteName(midi)}`,
      `ずれ ${Math.round(timeDelta)}ms`,
      loudnessScore.message,
    ].join(" / "),
    pitchMatch && timingSeverity !== "bad" ? "good" : timingSeverity === "warn" ? "warn" : "bad",
  );

  if (!loudnessScore.ok) {
    pushFeedback(`${nextEvent.measure}小節: ${loudnessScore.message}`, "warn");
  }

  state.session.currentMeasure = nextEvent.measure;

  const shouldAdvance =
    pitchMatch ||
    Math.abs(timeDelta) > NOTE_WINDOW_MS ||
    state.session.playedNotes - state.session.correctNotes > 2;

  if (shouldAdvance) {
    if (pitchMatch) {
      state.session.lastMatchedAtMs = playedMsFromStart;
      state.session.lastExpectedMs = nextEvent.expectedMsFromStart;
    }

    state.session.currentEventIndex += 1;
  }

  renderSessionState();
}

function evaluateLoudness(dynamic, rms) {
  const ranges = {
    pp: [0.005, 0.015],
    p: [0.01, 0.028],
    mp: [0.016, 0.04],
    mf: [0.025, 0.065],
    f: [0.04, 0.1],
    ff: [0.06, 0.16],
  };

  const range = ranges[dynamic] || ranges.mf;
  const ok = rms >= range[0] && rms <= range[1];
  return {
    ok,
    message: ok
      ? `音量は ${dynamic} の目安に近いです`
      : `音量は ${dynamic} の目安から少し外れています`,
  };
}

function calculateRms(buffer) {
  let sum = 0;
  for (let index = 0; index < buffer.length; index += 1) {
    sum += buffer[index] * buffer[index];
  }
  return Math.sqrt(sum / buffer.length);
}

function detectPitch(buffer, sampleRate) {
  const minOffset = Math.floor(sampleRate / AUDIO_MAX_FREQUENCY);
  const maxOffset = Math.floor(sampleRate / AUDIO_MIN_FREQUENCY);
  let bestOffset = -1;
  let bestCorrelation = 0;

  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;
    for (let index = 0; index < buffer.length - offset; index += 1) {
      correlation += buffer[index] * buffer[index + offset];
    }

    correlation /= buffer.length - offset;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestOffset === -1 || bestCorrelation < 0.82) {
    return -1;
  }

  return sampleRate / bestOffset;
}

function renderScoreState() {
  dom.scoreName.textContent = state.score?.title || "未読込";
  dom.scoreTempo.textContent = state.score ? `${state.score.tempo}拍/分` : "-";
  dom.scoreEvents.textContent = `${state.score?.events.length || 0}`;

  dom.scoreExpectations.innerHTML = "";
  const expectations = state.score?.expectations || [
    "楽譜ファイルを読み込むと、速さや強弱、弾き方のポイントをここに表示します。",
  ];

  expectations.forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    dom.scoreExpectations.append(item);
  });
}

function renderSessionState() {
  const accuracy = percentage(state.session.correctNotes, state.session.playedNotes);
  const tempoConsistency = calculateTempoConsistency();
  const loudnessAccuracy = percentage(state.session.symbolSuccess, state.session.symbolChecks);

  dom.accuracyRate.textContent = `${accuracy}%`;
  dom.tempoConsistency.textContent = `${tempoConsistency}%`;
  dom.symbolAccuracy.textContent = `${loudnessAccuracy}%`;
  dom.currentMeasure.textContent = state.session.currentMeasure ? `${state.session.currentMeasure}小節` : "-";

  setPill(dom.sessionState, state.session.active ? "録音中" : "待機中", state.session.active ? "good" : "idle");

  if (state.session.tempoRatios.length === 0) {
    setPill(dom.tempoState, "速さ未判定", "neutral");
  } else {
    const tempoLabel = describeTempoState(tempoConsistency);
    setPill(dom.tempoState, tempoLabel.label, tempoLabel.kind);
  }

  if (state.session.symbolChecks === 0) {
    setPill(dom.symbolState, "音量未判定", "neutral");
  } else {
    const loudnessLabel = describeLoudnessState(loudnessAccuracy);
    setPill(dom.symbolState, loudnessLabel.label, loudnessLabel.kind);
  }

  dom.startSession.disabled = state.audio.active || !state.score;
  dom.stopSession.disabled = !state.audio.active;
  dom.audioStatus.textContent = getAudioStatusLabel();
  dom.coachMessage.textContent = buildCoachMessage(accuracy, tempoConsistency, loudnessAccuracy);
  renderRunIndicator();
}

function getAudioStatusLabel() {
  if (!navigator.mediaDevices?.getUserMedia) {
    return "未対応";
  }

  if (state.audio.active) {
    return "録音中";
  }

  if (state.ui.busyCount > 0) {
    return "準備中";
  }

  return "待機中";
}

function buildCoachMessage(accuracy, tempoConsistency, loudnessAccuracy) {
  if (!state.score) {
    return "楽譜を読み込むと、比べるポイントを自動で取り出します。";
  }

  if (state.session.playedNotes === 0) {
    return "録音開始後、最初の音を基準にして楽譜との比較を進めます。";
  }

  const messages = [];
  if (accuracy < 70) {
    messages.push("まずは音の高さを合わせることを優先すると安定します。");
  } else {
    messages.push("音の高さはかなり揃っています。");
  }

  if (state.session.tempoRatios.length > 0) {
    if (tempoConsistency < 65) {
      messages.push("速さのばらつきが大きいので、メトロノームに合わせる意識を持つと改善しやすいです。");
    } else {
      messages.push("速さは概ね安定しています。");
    }
  }

  if (state.session.symbolChecks > 0) {
    if (loudnessAccuracy < 70) {
      messages.push("音量は録音環境の影響も受けるので、強弱は目安として見てください。");
    } else {
      messages.push("音量も大きくは外れていません。");
    }
  }

  return messages.join(" ");
}

function calculateTempoConsistency() {
  if (state.session.tempoRatios.length === 0) {
    return 0;
  }

  const averageRatio =
    state.session.tempoRatios.reduce((sum, value) => sum + value, 0) / state.session.tempoRatios.length;
  return Math.max(0, Math.min(100, Math.round((1 - averageRatio) * 100)));
}

function describeTempoState(consistency) {
  if (consistency >= 80) {
    return { label: "速さ安定", kind: "good" };
  }
  if (consistency >= 55) {
    return { label: "速さに揺れあり", kind: "warn" };
  }
  return { label: "速さが乱れ気味", kind: "bad" };
}

function describeLoudnessState(accuracy) {
  if (accuracy >= 80) {
    return { label: "音量良好", kind: "good" };
  }
  if (accuracy >= 55) {
    return { label: "音量に揺れあり", kind: "warn" };
  }
  return { label: "音量を見直し", kind: "bad" };
}

function setPill(element, label, kind) {
  element.textContent = label;
  element.className = `status-pill ${kind}`;
}

function appendPerformanceLog(message, kind = "good") {
  const item = document.createElement("li");
  item.className = kind;
  item.textContent = message;
  dom.performanceLog.prepend(item);
  trimList(dom.performanceLog, 8);
}

function pushFeedback(message, kind = "good") {
  const item = document.createElement("li");
  item.className = kind;
  item.textContent = message;
  dom.feedbackList.prepend(item);
  trimList(dom.feedbackList, 8);
}

function trimList(list, limit) {
  while (list.children.length > limit) {
    list.removeChild(list.lastChild);
  }
}

function clearLiveLists() {
  dom.performanceLog.innerHTML = "";
  dom.feedbackList.innerHTML = "";
}

function createEmptyPracticeTimer() {
  return {
    active: false,
    startedAt: null,
    elapsedBeforeStartMs: 0,
    sessionDate: null,
    tickId: null,
    message: "練習を始めるときに開始、終わったら停止を押してください。日付が変わると自動で停止します。",
  };
}

function createEmptyAudioState() {
  return {
    active: false,
    stream: null,
    context: null,
    source: null,
    analyser: null,
    dataArray: null,
    rafId: null,
    candidateMidi: null,
    candidateFrames: 0,
    lastCommittedMidi: null,
    lastCommittedAt: 0,
    lastSignalAt: 0,
  };
}

function createEmptySession() {
  return {
    active: false,
    startedAt: null,
    currentEventIndex: 0,
    playedNotes: 0,
    correctNotes: 0,
    symbolChecks: 0,
    symbolSuccess: 0,
    lastMatchedAtMs: null,
    lastExpectedMs: 0,
    tempoRatios: [],
    currentMeasure: null,
  };
}

function buildDateRange(length) {
  const dates = [];
  const cursor = new Date();
  for (let index = 0; index < length; index += 1) {
    dates.push(formatDateInput(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return dates;
}

function getTodayKey() {
  return formatDateInput(new Date());
}

function getStartOfNextDay(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day + 1, 0, 0, 0, 0);
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function formatChartLabel(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatHours(durationMs) {
  return `${(durationMs / 3600000).toFixed(1)}時間`;
}

function formatShortHours(durationMs) {
  if (durationMs <= 0) {
    return "0h";
  }

  if (durationMs < 3600000) {
    return `${Math.round(durationMs / 60000)}分`;
  }

  return `${(durationMs / 3600000).toFixed(1)}h`;
}

function formatDurationForTooltip(durationMs) {
  const totalMinutes = Math.round(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}分`;
  }

  return `${hours}時間${minutes}分`;
}

function formatHms(durationMs) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function percentage(value, total) {
  if (!total) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

function pitchToMidi(step, alter, octave) {
  const base = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  return (octave + 1) * 12 + (base[step] || 0) + alter;
}

function frequencyToMidi(frequency) {
  return 69 + 12 * Math.log2(frequency / 440);
}

function midiToNoteName(midi) {
  const names = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const octave = Math.floor(midi / 12) - 1;
  return `${names[midi % 12]}${octave}`;
}

function beatsToMs(beats, tempo) {
  return (beats * 60000) / tempo;
}

function classifyTiming(timeDeltaMs) {
  const deviation = Math.abs(timeDeltaMs);
  if (deviation <= NOTE_WINDOW_MS * 0.45) {
    return "good";
  }
  if (deviation <= NOTE_WINDOW_MS) {
    return "warn";
  }
  return "bad";
}

async function runWithBusy(callback) {
  state.ui.busyCount += 1;
  renderRunIndicator();
  renderSessionState();

  try {
    return await callback();
  } finally {
    state.ui.busyCount = Math.max(0, state.ui.busyCount - 1);
    renderRunIndicator();
    renderSessionState();
  }
}

function renderRunIndicator() {
  const isVisible = state.ui.busyCount > 0 || state.audio.active;
  dom.runIndicator.classList.toggle("hidden", !isVisible);
}
