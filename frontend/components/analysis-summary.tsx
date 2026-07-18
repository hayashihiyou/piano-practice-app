import { AnalysisResult } from "../lib/types";
import { formatMeasureLabel, formatStatus, getDictionary, Locale } from "../lib/i18n";

type AnalysisSummaryProps = {
  analysis: AnalysisResult;
  locale: Locale;
};

export function AnalysisSummary({ analysis, locale }: AnalysisSummaryProps) {
  const dict = getDictionary(locale);

  return (
    <section className="analysis-layout">
      <div className="stat-grid">
        <article className="stat-card emphasis">
          <span>{dict.analysis.overall}</span>
          <strong>{analysis.overallScore}</strong>
        </article>
        <article className="stat-card">
          <span>{dict.analysis.pitch}</span>
          <strong>{analysis.pitchAccuracy}%</strong>
        </article>
        <article className="stat-card">
          <span>{dict.analysis.tempo}</span>
          <strong>{analysis.tempoConsistency}%</strong>
        </article>
        <article className="stat-card">
          <span>{dict.analysis.alignment}</span>
          <strong>{Math.round(analysis.alignmentConfidence * 100)}%</strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.analysis.summaryKicker}</p>
            <h2>{dict.analysis.performanceResult}</h2>
          </div>
          <span className="pill">{formatStatus(analysis.status, locale)}</span>
        </div>
        <p className="support-copy">{analysis.summary}</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.analysis.measuresKicker}</p>
            <h2>{dict.analysis.measureFindings}</h2>
          </div>
        </div>
        <div className="finding-list">
          {analysis.measureFindings.map((finding) => (
            <article key={`${finding.measure}-${finding.title}`} className={`finding-card ${finding.severity}`}>
              <span className="finding-meta">{formatMeasureLabel(finding.measure, locale)}</span>
              <strong>{finding.title}</strong>
              <p>{finding.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.analysis.notesKicker}</p>
            <h2>{dict.analysis.detailedMismatches}</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{dict.analysis.measure}</th>
                <th>{dict.analysis.expected}</th>
                <th>{dict.analysis.actual}</th>
                <th>{dict.analysis.issue}</th>
              </tr>
            </thead>
            <tbody>
              {analysis.noteFindings.map((finding) => (
                <tr key={finding.noteId}>
                  <td>{formatMeasureLabel(finding.measure, locale)}</td>
                  <td>{finding.expected}</td>
                  <td>{finding.actual}</td>
                  <td>{finding.issue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
