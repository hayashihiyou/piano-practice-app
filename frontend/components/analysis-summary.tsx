import { AnalysisResult } from "../lib/types";

type AnalysisSummaryProps = {
  analysis: AnalysisResult;
};

export function AnalysisSummary({ analysis }: AnalysisSummaryProps) {
  return (
    <section className="analysis-layout">
      <div className="stat-grid">
        <article className="stat-card emphasis">
          <span>Overall</span>
          <strong>{analysis.overallScore}</strong>
        </article>
        <article className="stat-card">
          <span>Pitch</span>
          <strong>{analysis.pitchAccuracy}%</strong>
        </article>
        <article className="stat-card">
          <span>Tempo</span>
          <strong>{analysis.tempoConsistency}%</strong>
        </article>
        <article className="stat-card">
          <span>Alignment</span>
          <strong>{Math.round(analysis.alignmentConfidence * 100)}%</strong>
        </article>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Summary</p>
            <h2>Performance result</h2>
          </div>
          <span className="pill">{analysis.status}</span>
        </div>
        <p className="support-copy">{analysis.summary}</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Measures</p>
            <h2>Measure findings</h2>
          </div>
        </div>
        <div className="finding-list">
          {analysis.measureFindings.map((finding) => (
            <article key={`${finding.measure}-${finding.title}`} className={`finding-card ${finding.severity}`}>
              <span className="finding-meta">Measure {finding.measure}</span>
              <strong>{finding.title}</strong>
              <p>{finding.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">Notes</p>
            <h2>Detailed note mismatches</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Measure</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Issue</th>
              </tr>
            </thead>
            <tbody>
              {analysis.noteFindings.map((finding) => (
                <tr key={finding.noteId}>
                  <td>{finding.measure}</td>
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

