import { notFound } from "next/navigation";

import { AnalysisSummary } from "../../../components/analysis-summary";
import { getAnalysisResult } from "../../../lib/api";
import { getCurrentLocale } from "../../../lib/i18n-server";

type AnalysisPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const locale = await getCurrentLocale();
  const { id } = await params;
  const analysis = await getAnalysisResult(id, locale);

  if (!analysis) {
    notFound();
  }

  return <AnalysisSummary analysis={analysis} locale={locale} />;
}
