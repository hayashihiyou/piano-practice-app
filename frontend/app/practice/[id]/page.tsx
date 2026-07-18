import { notFound } from "next/navigation";

import { PracticeSessionClient } from "../../../components/practice-session-client";
import { ScoreViewer } from "../../../components/score-viewer";
import { getPracticeScreenData } from "../../../lib/api";
import { getCurrentLocale } from "../../../lib/i18n-server";

type PracticePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PracticePage({ params }: PracticePageProps) {
  const locale = await getCurrentLocale();
  const { id } = await params;
  const data = await getPracticeScreenData(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="page-grid">
      <PracticeSessionClient data={data} locale={locale} />
      <ScoreViewer score={data.score} locale={locale} noteLabelStyle="doremi" sectionId="labeled-score" />
    </div>
  );
}
