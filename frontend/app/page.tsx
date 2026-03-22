import Link from "next/link";

import { getDashboardData } from "../lib/api";

function formatMinutes(value: number) {
  return `${value} min`;
}

export default async function HomePage() {
  const dashboard = await getDashboardData();

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Today</p>
            <h2>Daily practice overview</h2>
          </div>
          <Link href="/pieces/new" className="primary-link">
            Add piece
          </Link>
        </div>
        <div className="stat-grid">
          <article className="stat-card emphasis">
            <span>Today</span>
            <strong>{formatMinutes(dashboard.todayMinutes)}</strong>
          </article>
          <article className="stat-card">
            <span>This week</span>
            <strong>{formatMinutes(dashboard.weekMinutes)}</strong>
          </article>
          <article className="stat-card">
            <span>This month</span>
            <strong>{formatMinutes(dashboard.monthMinutes)}</strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Chart</p>
            <h2>Piece-colored weekly time</h2>
          </div>
          <span className="pill">Session-based totals</span>
        </div>
        <div className="chart-grid">
          {dashboard.chart.map((bucket) => {
            const total = bucket.items.reduce((sum, item) => sum + item.minutes, 0);

            return (
              <div key={bucket.label} className="chart-column">
                <div className="chart-stack" aria-label={`${bucket.label} ${total} minutes`}>
                  {bucket.items.map((item) => (
                    <span
                      key={`${bucket.label}-${item.pieceId}`}
                      style={{
                        height: `${Math.max(18, (item.minutes / Math.max(total, 1)) * 180)}px`,
                        backgroundColor: item.color,
                      }}
                      title={`${item.pieceTitle}: ${item.minutes} min`}
                    />
                  ))}
                </div>
                <strong>{bucket.label}</strong>
                <small>{total} min</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Pieces</p>
            <h2>Library</h2>
          </div>
        </div>
        <div className="card-grid">
          {dashboard.pieces.map((piece) => (
            <article key={piece.id} className="piece-card">
              <div className="piece-swatch" style={{ backgroundColor: piece.color }} aria-hidden="true" />
              <div>
                <h3>{piece.title}</h3>
                <p className="support-copy">{piece.composer}</p>
              </div>
              <div className="meta-list">
                <span>Today {piece.stats.todayMinutes} min</span>
                <span>Week {piece.stats.weekMinutes} min</span>
                <span>{piece.analysisReady ? "Strict analysis ready" : "Needs score review"}</span>
              </div>
              <Link href={`/pieces/${piece.id}`} className="inline-link">
                Open piece
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Sessions</p>
            <h2>Recent practice logs</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Piece</th>
                <th>Duration</th>
                <th>Source</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentSessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.pieceTitle}</td>
                  <td>{Math.round(session.durationSec / 60)} min</td>
                  <td>{session.source}</td>
                  <td>
                    {session.analysisResultId ? (
                      <Link href={`/analysis/${session.analysisResultId}`}>View analysis</Link>
                    ) : (
                      <Link href={`/practice/${session.id}`}>Continue session</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

