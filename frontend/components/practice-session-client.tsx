"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getDictionary, Locale } from "../lib/i18n";
import { PracticeScreenData } from "../lib/types";

type PracticeSessionClientProps = {
  data: PracticeScreenData;
  locale: Locale;
};

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function PracticeSessionClient({ data, locale }: PracticeSessionClientProps) {
  const dict = getDictionary(locale);
  const [timerActive, setTimerActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(Math.floor(data.session.durationSec));
  const reviewMeasures = data.score.measures.filter((measure) => measure.lowConfidence).map((measure) => measure.number);
  const labeledScoreHref = `/pieces/${data.piece.id}#labeled-score`;

  useEffect(() => {
    if (!timerActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerActive]);

  return (
    <section className="practice-session-layout">
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.practice.sessionKicker}</p>
            <h2>{data.piece.title}</h2>
          </div>
          <span className="pill">{dict.practice.timerLinked}</span>
        </div>
        <div className="timer-card modern">
          <strong className="timer-display">{formatDuration(elapsedSeconds)}</strong>
          <p className="support-copy">{dict.practice.keepSession}</p>
          <div className="guide-list" aria-label={dict.practice.guidanceTitle}>
            <p className="section-kicker">{dict.practice.guidanceKicker}</p>
            <ol className="instruction-list">
              <li>{dict.practice.stepCapture}</li>
              <li>{dict.practice.stepCheckScore}</li>
              <li>{dict.practice.stepSubmit}</li>
            </ol>
          </div>
          <div className="action-row">
            <button className="primary-button" type="button" onClick={() => setTimerActive(true)} disabled={timerActive}>
              {dict.practice.startTimer}
            </button>
            <button className="ghost-button" type="button" onClick={() => setTimerActive(false)} disabled={!timerActive}>
              {dict.practice.pauseTimer}
            </button>
            <Link className="ghost-link" href={labeledScoreHref}>
              {dict.practice.openLabeledScore}
            </Link>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.practice.scoreSupportKicker}</p>
            <h2>{dict.practice.scoreSupportTitle}</h2>
          </div>
          <span className="pill secondary">{dict.practice.postTake}</span>
        </div>
        <div className="upload-card">
          <ul className="plain-list">
            <li>{dict.score.labelGuide}</li>
            <li>{dict.score.reviewGuide}</li>
            <li>{locale === "ja" ? "練習中に迷ったら、まず緑のドレミだけを追っても大丈夫です。" : "If you get stuck, follow the green doremi labels first."}</li>
          </ul>
        </div>
      </article>

      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.practice.nextKicker}</p>
            <h2>{dict.practice.currentScoreState}</h2>
          </div>
        </div>
        <ul className="plain-list">
          <li>{dict.practice.scoreTitle}: {data.score.title}</li>
          <li>{dict.practice.baseTempo}: {data.score.baseTempo} BPM</li>
          <li>{dict.practice.measuresReady}: {data.score.measures.length}</li>
          <li>
            {dict.practice.lowConfidenceMeasures}: {reviewMeasures.length > 0 ? reviewMeasures.join(", ") : dict.piece.none}
          </li>
        </ul>
        {reviewMeasures.length > 0 ? (
          <p className="inline-error">{dict.practice.reviewMeasures}</p>
        ) : (
          <p className="support-copy">{dict.practice.allMeasuresReady}</p>
        )}
        <Link className="primary-link" href={labeledScoreHref}>
          {dict.practice.openLabeledScore}
        </Link>
      </article>
    </section>
  );
}
