interface TrendLineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  label?: string;
}

/**
 * A single smooth line with a soft fade beneath it. No gridlines, no axis
 * labels, no points — the numbers belong in the copy, not the chart.
 */
export function TrendLine({
  values,
  color = 'var(--nourish)',
  width = 320,
  height = 72,
  label,
}: TrendLineProps) {
  if (values.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-surface-2 text-[0.75rem] text-ink-3"
        style={{ height }}
      >
        A few more days of logging will draw this line.
      </div>
    );
  }

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const pad = 8;
  const stepX = (width - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));

  // Catmull-Rom style smoothing kept simple: midpoints between neighbours.
  let path = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const cx = (prev.x + curr.x) / 2;
    path += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  const area = `${path} L ${points.at(-1)!.x} ${height} L ${points[0]!.x} ${height} Z`;
  const gradientId = `trend-${label?.replace(/\W/g, '') ?? 'default'}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={label ? `${label} trend` : 'Trend'}
      preserveAspectRatio="none"
      style={{ height }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
