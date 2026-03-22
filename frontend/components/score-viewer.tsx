import { CanonicalScore, NoteLabelStyle } from "../lib/types";

type ScoreViewerProps = {
  score: CanonicalScore;
  noteLabelStyle?: NoteLabelStyle;
};

export function ScoreViewer({ score, noteLabelStyle = "doremi" }: ScoreViewerProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Score Viewer</p>
          <h2>{score.title}</h2>
        </div>
        <div className="pill-row">
          <span className="pill">Base tempo {score.baseTempo}</span>
          <span className="pill secondary">{score.sourceType.toUpperCase()}</span>
        </div>
      </div>

      <div className="score-scroll">
        {score.measures.map((measure) => (
          <article
            key={measure.number}
            className={`measure-card ${measure.lowConfidence ? "measure-card-warning" : ""}`}
          >
            <div className="measure-head">
              <span className="measure-number">M{measure.number}</span>
              {measure.lowConfidence ? <span className="measure-flag">Needs review</span> : null}
            </div>
            <div className="staff-lines" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="note-strip">
              {measure.notes.map((note) => (
                <div key={note.id} className="note-card">
                  <span className="note-head" />
                  <strong>{note.noteName}</strong>
                  <small>{noteLabelStyle === "doremi" ? note.solfege : note.noteName}</small>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

