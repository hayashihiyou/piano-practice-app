import {
  AnalysisResult,
  DashboardData,
  PieceDetail,
  PracticeScreenData,
} from "./types";
import {
  getMockAnalysisResult,
  getMockDashboardData,
  getMockPieceDetail,
  getMockPracticeScreenData,
} from "./mock-data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchFromApi<T>(path: string): Promise<T | null> {
  if (!apiBaseUrl) {
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  const response = await fetchFromApi<DashboardData>("/dashboard");
  return response ?? getMockDashboardData();
}

export async function getPieceDetail(id: string): Promise<PieceDetail | null> {
  const response = await fetchFromApi<PieceDetail>(`/pieces/${id}`);
  return response ?? getMockPieceDetail(id);
}

export async function getPracticeScreenData(id: string): Promise<PracticeScreenData | null> {
  const response = await fetchFromApi<PracticeScreenData>(`/practice-sessions/${id}`);
  return response ?? getMockPracticeScreenData(id);
}

export async function getAnalysisResult(id: string): Promise<AnalysisResult | null> {
  const response = await fetchFromApi<AnalysisResult>(`/analysis-results/${id}`);
  return response ?? getMockAnalysisResult(id);
}
