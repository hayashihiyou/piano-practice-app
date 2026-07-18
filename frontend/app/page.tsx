import Link from "next/link";

import { DashboardRangePanel } from "../components/dashboard-range-panel";
import { getDashboardData } from "../lib/api";
import { formatMinutes, formatStatus, getDictionary } from "../lib/i18n";
import { getCurrentLocale } from "../lib/i18n-server";

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const dashboard = await getDashboardData();

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.home.todayKicker}</p>
            <h2>{dict.home.overview}</h2>
          </div>
          <Link href="/pieces/new" className="primary-link">
            {dict.home.addPiece}
          </Link>
        </div>
        <div className="stat-grid">
          <article className="stat-card emphasis">
            <span>{dict.home.today}</span>
            <strong>{formatMinutes(dashboard.todayMinutes, locale)}</strong>
          </article>
          <article className="stat-card">
            <span>{dict.home.week}</span>
            <strong>{formatMinutes(dashboard.weekMinutes, locale)}</strong>
          </article>
          <article className="stat-card">
            <span>{dict.home.month}</span>
            <strong>{formatMinutes(dashboard.monthMinutes, locale)}</strong>
          </article>
        </div>
      </section>

      <DashboardRangePanel dashboard={dashboard} locale={locale} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.home.sessionsKicker}</p>
            <h2>{dict.home.recentLogs}</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{dict.home.piece}</th>
                <th>{dict.home.duration}</th>
                <th>{dict.home.source}</th>
                <th>{dict.home.result}</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recentSessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.pieceTitle}</td>
                  <td>{formatMinutes(Math.round(session.durationSec / 60), locale)}</td>
                  <td>{formatStatus(session.source, locale)}</td>
                  <td>
                    <Link href={`/practice/${session.id}`}>{dict.home.continueSession}</Link>
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
