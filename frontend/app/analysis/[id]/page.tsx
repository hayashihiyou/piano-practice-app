import { notFound } from "next/navigation";

import { AnalysisSummary } from "../../../components/analysis-summary";
import { getAnalysisResult } from "../../../lib/api";

type AnalysisPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = await params;
  const analysis = await getAnalysisResult(id);

  if (!analysis) {
    notFound();
  }

  return <AnalysisSummary analysis={analysis} />;
}

