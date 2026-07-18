import { NewPieceFormClient } from "../../../components/new-piece-form-client";
import { getDictionary } from "../../../lib/i18n";
import { getCurrentLocale } from "../../../lib/i18n-server";

export default async function NewPiecePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">{dict.newPiece.kicker}</p>
          <h2>{dict.newPiece.title}</h2>
        </div>
        <span className="pill">{dict.newPiece.pill}</span>
      </div>
      <NewPieceFormClient locale={locale} />
    </section>
  );
}
