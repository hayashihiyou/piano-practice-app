"use client";

import Link from "next/link";
import { useState } from "react";

import { formatMinutes, getDictionary, Locale } from "../lib/i18n";
import { DashboardData } from "../lib/types";
import { PieChart } from "./pie-chart";

type DashboardRangePanelProps = {
  dashboard: DashboardData;
  locale: Locale;
};

type RangeKey = "week" | "month";

export function DashboardRangePanel({ dashboard, locale }: DashboardRangePanelProps) {
  const dict = getDictionary(locale);
  const [range, setRange] = useState<RangeKey>("week");
  const isWeek = range === "week";
  const slices = dashboard.pieces.map((piece) => ({
    label: piece.title,
    value: isWeek ? piece.stats.weekMinutes : piece.stats.monthMinutes,
    color: piece.color,
  }));
  const totalMinutes = isWeek ? dashboard.weekMinutes : dashboard.monthMinutes;
  const chartTitle = isWeek ? dict.home.weekChartTitle : dict.home.monthChartTitle;
  const totalLabel = isWeek ? dict.home.weeklyTotal : dict.home.monthlyTotal;

  return (
    <>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.home.chartKicker}</p>
            <h2>{chartTitle}</h2>
          </div>
          <div className="range-switcher-wrap">
            <span className="range-label">{dict.home.rangeSelector}</span>
            <div className="segmented-control" role="tablist" aria-label={dict.home.rangeSelector}>
              <button
                className={`segmented-button ${isWeek ? "active" : ""}`}
                type="button"
                onClick={() => setRange("week")}
                aria-pressed={isWeek}
              >
                {dict.home.week}
              </button>
              <button
                className={`segmented-button ${!isWeek ? "active" : ""}`}
                type="button"
                onClick={() => setRange("month")}
                aria-pressed={!isWeek}
              >
                {dict.home.month}
              </button>
            </div>
          </div>
        </div>
        <PieChart
          slices={slices}
          totalLabel={totalLabel}
          totalValue={formatMinutes(totalMinutes, locale)}
          formatValue={(value) => formatMinutes(value, locale)}
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-kicker">{dict.home.piecesKicker}</p>
            <h2>{dict.home.library}</h2>
          </div>
          <span className="pill">
            {dict.home.selectedPracticeTime}: {isWeek ? dict.home.week : dict.home.month}
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{dict.home.piece}</th>
                <th>{isWeek ? dict.home.week : dict.home.month}</th>
                <th>{dict.home.total}</th>
                <th>{dict.home.status}</th>
                <th>{dict.home.result}</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.pieces.map((piece) => (
                <tr key={piece.id}>
                  <td>
                    <div className="piece-summary">
                      <span className="legend-swatch" style={{ backgroundColor: piece.color }} aria-hidden="true" />
                      <div>
                        <strong>{piece.title}</strong>
                        <div className="support-copy">{piece.composer}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatMinutes(isWeek ? piece.stats.weekMinutes : piece.stats.monthMinutes, locale)}</td>
                  <td>{formatMinutes(piece.stats.totalMinutes, locale)}</td>
                  <td>{piece.analysisReady ? dict.home.strictReady : dict.home.needsScoreReview}</td>
                  <td>
                    <Link href={`/pieces/${piece.id}`}>{dict.home.openPiece}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
