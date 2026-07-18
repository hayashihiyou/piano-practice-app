type PieChartSlice = {
  label: string;
  value: number;
  color: string;
};

type PieChartProps = {
  slices: PieChartSlice[];
  totalLabel: string;
  totalValue: string;
  formatValue?: (value: number) => string;
};

function buildConicGradient(slices: PieChartSlice[]) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total === 0) {
    return "conic-gradient(#d9d2c8 0deg 360deg)";
  }

  let current = 0;
  const parts = slices.map((slice) => {
    const start = current;
    current += (slice.value / total) * 360;
    return `${slice.color} ${start}deg ${current}deg`;
  });

  return `conic-gradient(${parts.join(", ")})`;
}

export function PieChart({ slices, totalLabel, totalValue, formatValue }: PieChartProps) {
  const nonZeroSlices = slices.filter((slice) => slice.value > 0);

  return (
    <div className="pie-layout">
      <div className="pie-figure-wrap">
        <div
          className="pie-figure"
          style={{ backgroundImage: buildConicGradient(nonZeroSlices) }}
          aria-label={nonZeroSlices.map((slice) => `${slice.label} ${slice.value}`).join(", ")}
          role="img"
        >
          <div className="pie-hole">
            <span>{totalLabel}</span>
            <strong>{totalValue}</strong>
          </div>
        </div>
      </div>
      <div className="pie-legend">
        {nonZeroSlices.map((slice) => (
          <div key={slice.label} className="legend-item">
            <span className="legend-swatch" style={{ backgroundColor: slice.color }} aria-hidden="true" />
            <span>{slice.label}</span>
            <strong>{formatValue ? formatValue(slice.value) : slice.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
