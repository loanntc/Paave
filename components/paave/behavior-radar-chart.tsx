// RadarChart and MetricPill — pure display components for the behavior analysis panel.
// Extracted from behavior-analysis-card.tsx to keep each file under 300 lines.

// ---------------------------------------------------------------------------
// RadarChart — inline SVG pentagon radar, no external chart library
// ---------------------------------------------------------------------------
export function RadarChart({
  scores,
}: {
  scores: {
    overtrading: number;
    diversification: number;
    discipline: number;
    fee_awareness: number;
    patience: number;
  };
}) {
  const SIZE = 120;
  const CENTER = SIZE / 2;
  const MAX_R = 44;

  // 5 axes, evenly spaced around a circle (starting top, clockwise)
  const axes = [
    { label: "Kỷ luật",   key: "discipline" as const,      invert: false },
    { label: "Đa dạng",   key: "diversification" as const,  invert: false },
    { label: "Kiên nhẫn", key: "patience" as const,         invert: false },
    { label: "Phí thấp",  key: "fee_awareness" as const,    invert: false },
    { label: "Ổn định",   key: "overtrading" as const,      invert: true  }, // lower overtrading = better
  ] as const;

  const toPoint = (angle: number, r: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: CENTER + r * Math.cos(rad),
      y: CENTER + r * Math.sin(rad),
    };
  };

  const points = axes.map((axis, i) => {
    const angle = (360 / axes.length) * i;
    const raw = axis.invert ? 100 - scores[axis.key] : scores[axis.key];
    const r = (raw / 100) * MAX_R;
    return toPoint(angle, r);
  });

  const gridPoints = [0.25, 0.5, 0.75, 1].map((pct) =>
    axes.map((_, i) => toPoint((360 / axes.length) * i, MAX_R * pct)),
  );

  const polyStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      aria-label="Behaviour radar chart"
      className="shrink-0"
    >
      {/* Grid rings */}
      {gridPoints.map((ring, ri) => (
        <polygon
          key={ri}
          points={ring.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="rgba(127,119,221,0.15)"
          strokeWidth="0.5"
        />
      ))}

      {/* Axis spokes */}
      {axes.map((_, i) => {
        const outer = toPoint((360 / axes.length) * i, MAX_R);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(127,119,221,0.2)"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Score polygon */}
      <polygon
        points={polyStr}
        fill="rgba(181,232,47,0.15)"
        stroke="#B5E82F"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Score dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#B5E82F" />
      ))}

      {/* Labels */}
      {axes.map((axis, i) => {
        const outer = toPoint((360 / axes.length) * i, MAX_R + 10);
        return (
          <text
            key={i}
            x={outer.x}
            y={outer.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill="rgba(210,208,235,0.5)"
          >
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MetricPill — single key metric chip used in BehaviorMetricPanel
// ---------------------------------------------------------------------------
export function MetricPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-ink-violet-surface border border-border-neo px-3 py-2.5 min-w-0">
      <span className="text-[10px] uppercase tracking-[0.4px] text-text-neo-tertiary truncate">
        {label}
      </span>
      <span className="font-display text-[15px] font-bold tabular-nums text-text-neo-primary">
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-text-neo-tertiary">{sub}</span>
      )}
    </div>
  );
}
