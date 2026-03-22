import Link from "next/link";
import { notFound } from "next/navigation";

import { ScoreViewer } from "../../../components/score-viewer";
import { getPieceDetail } from "../../../lib/api";

type PiecePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PiecePage({ params }: PiecePageProps) {
  const { id } = await params;
  const detail = await getPieceDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Piece</p>
            <h2>{detail.piece.title}</h2>
          </div>
          <span className="pill" style={{ backgroundColor: detail.piece.color, color: "white" }}>
            {detail.piece.composer}
          </span>
        </div>
        <p className="support-copy">{detail.piece.memo}</p>
        <div className="stat-grid">
          <article className="stat-card">
            <span>Today</span>
            <strong>{detail.piece.stats.todayMinutes} min</strong>
          </article>
          <article className="stat-card">
            <span>This week</span>
            <strong>{detail.piece.stats.weekMinutes} min</strong>
          </article>
          <article className="stat-card">
            <span>Strict analysis</span>
            <strong>{detail.piece.analysisReady ? "Ready" : "Blocked"}</strong>
          </article>
        </div>
        <div className="action-row">
          <Link href="/practice/session-today" className="primary-link">
            Start practice
          </Link>
          {detail.latestAnalysis ? (
            <Link href={`/analysis/${detail.latestAnalysis.id}`} className="ghost-link">
              Latest analysis
            </Link>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Ingestion</p>
            <h2>Score pipeline</h2>
          </div>
          <span className="pill secondary">{detail.ingestionJob.status}</span>
        </div>
        <ul className="plain-list">
          <li>Source type: {detail.ingestionJob.sourceType}</li>
          <li>Confidence: {Math.round(detail.ingestionJob.overallConfidence * 100)}%</li>
          <li>Low-confidence measures: {detail.ingestionJob.lowConfidenceMeasures.join(", ") || "None"}</li>
          <li>Canonical format: MusicXML</li>
        </ul>
      </section>

      <ScoreViewer score={detail.score} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Recent sessions</p>
            <h2>Piece timeline</h2>
          </div>
        </div>
        <div className="timeline">
          {detail.recentSessions.map((session) => (
            <article key={session.id} className="timeline-item">
              <strong>{Math.round(session.durationSec / 60)} min</strong>
              <span>{session.memo}</span>
              <small>{new Date(session.startedAt).toLocaleString()}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

