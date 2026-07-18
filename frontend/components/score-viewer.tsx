import { CanonicalScore, NoteLabelStyle } from "../lib/types";
import { formatMeasureLabel, formatStatus, getDictionary, Locale } from "../lib/i18n";

type ScoreViewerProps = {
  score: CanonicalScore;
  locale: Locale;
  noteLabelStyle?: NoteLabelStyle;
  sectionId?: string;
};

export function ScoreViewer({ score, locale, noteLabelStyle = "doremi", sectionId }: ScoreViewerProps) {
  const dict = getDictionary(locale);

  return (
    <section className="panel" id={sectionId}>
      <div className="panel-heading">
        <div>
          <p className="section-kicker">{dict.score.kicker}</p>
          <h2>{score.title}</h2>
        </div>
        <div className="pill-row">
          <span className="pill">{dict.score.baseTempo} {score.baseTempo}</span>
          <span className="pill secondary">{formatStatus(score.sourceType, locale)}</span>
        </div>
      </div>
      <div className="score-guide">
        <p className="support-copy">{dict.score.labelGuide}</p>
        <p className="support-copy">{dict.score.reviewGuide}</p>
      </div>

      <div className="score-scroll">
        {score.measures.map((measure) => (
          <article
            key={measure.number}
            className={`measure-card ${measure.lowConfidence ? "measure-card-warning" : ""}`}
          >
            <div className="measure-head">
              <span className="measure-number">{formatMeasureLabel(measure.number, locale)}</span>
              {measure.lowConfidence ? <span className="measure-flag">{dict.score.needsReview}</span> : null}
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
