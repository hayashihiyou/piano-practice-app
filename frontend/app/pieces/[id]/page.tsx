import Link from "next/link";
import { notFound } from "next/navigation";

import { ScoreViewer } from "../../../components/score-viewer";
import { getPieceDetail } from "../../../lib/api";
import { formatMinutes, formatStatus, getDictionary } from "../../../lib/i18n";
import { getCurrentLocale } from "../../../lib/i18n-server";

type PiecePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PiecePage({ params }: PiecePageProps) {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const { id } = await params;
  const detail = await getPieceDetail(id, locale);

  if (!detail) {
    notFound();
  }

  const practiceHref = detail.recentSessions[0] ? `/practice/${detail.recentSessions[0].id}` : "#labeled-score";
  const scoreReady = detail.ingestionJob.status === "ready";

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.piece.kicker}</p>
            <h2>{detail.piece.title}</h2>
          </div>
          <span className="pill" style={{ backgroundColor: detail.piece.color, color: "white" }}>
            {detail.piece.composer}
          </span>
        </div>
        <p className="support-copy">{detail.piece.memo}</p>
        <div className="stat-grid">
          <article className="stat-card">
            <span>{dict.piece.today}</span>
            <strong>{formatMinutes(detail.piece.stats.todayMinutes, locale)}</strong>
          </article>
          <article className="stat-card">
            <span>{dict.piece.week}</span>
            <strong>{formatMinutes(detail.piece.stats.weekMinutes, locale)}</strong>
          </article>
          <article className="stat-card">
            <span>{dict.piece.month}</span>
            <strong>{formatMinutes(detail.piece.stats.monthMinutes, locale)}</strong>
          </article>
          <article className="stat-card">
            <span>{dict.piece.total}</span>
            <strong>{formatMinutes(detail.piece.stats.totalMinutes, locale)}</strong>
          </article>
          <article className="stat-card">
            <span>{dict.piece.strictAnalysis}</span>
            <strong>{scoreReady ? dict.piece.ready : dict.piece.blocked}</strong>
          </article>
        </div>
        <p className="support-copy">
          {locale === "ja"
            ? "下の譜面では、各音符の下にドレミが表示されます。まずはそのまま譜読みし、オレンジ表示の小節だけ元の楽譜と見比べるのがおすすめです。"
            : "The score below shows doremi under each note. A good beginner flow is to read with those labels first, then double-check only the orange review measures."}
        </p>
        <div className="action-row">
          <Link href={practiceHref} className="primary-link">
            {dict.piece.startPractice}
          </Link>
          <Link href="#labeled-score" className="ghost-link">
            {dict.piece.latestAnalysis}
          </Link>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.piece.ingestionKicker}</p>
            <h2>{dict.piece.pipeline}</h2>
          </div>
          <span className="pill secondary">{formatStatus(detail.ingestionJob.status, locale)}</span>
        </div>
        <ul className="plain-list">
          <li>{dict.piece.sourceType}: {formatStatus(detail.ingestionJob.sourceType, locale)}</li>
          <li>{dict.piece.confidence}: {Math.round(detail.ingestionJob.overallConfidence * 100)}%</li>
          <li>{dict.piece.lowConfidenceMeasures}: {detail.ingestionJob.lowConfidenceMeasures.join(", ") || dict.piece.none}</li>
          <li>{dict.piece.canonicalFormat}: MusicXML</li>
        </ul>
      </section>

      <ScoreViewer score={detail.score} locale={locale} noteLabelStyle="doremi" sectionId="labeled-score" />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.piece.recentSessionsKicker}</p>
            <h2>{dict.piece.timeline}</h2>
          </div>
        </div>
        <div className="timeline">
          {detail.recentSessions.map((session) => (
            <article key={session.id} className="timeline-item">
              <strong>{formatMinutes(Math.round(session.durationSec / 60), locale)}</strong>
              <span>{session.memo}</span>
              <small>{new Date(session.startedAt).toLocaleString(locale === "ja" ? "ja-JP" : "en-US")}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
