"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { AICard } from "@/components/paave/ai-card";
import { useAIChat } from "@/lib/ai/use-ai-chat";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface BehaviorAnalysisCardProps {
  userId: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Archetype visual config
// ---------------------------------------------------------------------------
const ARCHETYPE_CONFIG: Record<
  string,
  { emoji: string; color: string; bg: string }
> = {
  overtrader:   { emoji: "⚡", color: "text-peach-streak-400", bg: "bg-peach-streak-400/10 border-peach-streak-400/30" },
  fee_unaware:  { emoji: "💸", color: "text-peach-streak-400", bg: "bg-peach-streak-400/10 border-peach-streak-400/30" },
  fomo:         { emoji: "🚀", color: "text-violet-deep-300",  bg: "bg-violet-deep-300/10  border-violet-deep-300/30" },
  loss_averse:  { emoji: "😰", color: "text-text-neo-secondary", bg: "bg-violet-deep-800/40 border-border-neo" },
  disciplined:  { emoji: "🎯", color: "text-lime-signal-400",  bg: "bg-lime-signal-400/10  border-lime-signal-400/30" },
  concentrated: { emoji: "🔭", color: "text-violet-deep-300",  bg: "bg-violet-deep-300/10  border-violet-deep-300/30" },
  developing:   { emoji: "📈", color: "text-text-neo-secondary", bg: "bg-violet-deep-800/40 border-border-neo" },
};

const DEFAULT_ARCHETYPE = ARCHETYPE_CONFIG.developing;

// ---------------------------------------------------------------------------
// Radar chart (inline SVG, no external deps)
// ---------------------------------------------------------------------------
function RadarChart({
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
    { label: "Kỷ luật",    key: "discipline" as const,     invert: false },
    { label: "Đa dạng",    key: "diversification" as const, invert: false },
    { label: "Kiên nhẫn",  key: "patience" as const,        invert: false },
    { label: "Phí thấp",   key: "fee_awareness" as const,   invert: false },
    { label: "Ổn định",    key: "overtrading" as const,     invert: true  }, // lower overtrading = better
  ] as const;

  // Compute polygon points
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
    axes.map((_, i) =>
      toPoint((360 / axes.length) * i, MAX_R * pct),
    ),
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
// Metric pill
// ---------------------------------------------------------------------------
function MetricPill({
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
/**
 * BehaviorAnalysisCard — auto-fires a full behavioural analysis on mount.
 *
 * The AI agent calls get_user_portfolio + get_trade_analytics, then produces
 * a personalised Vietnamese narrative using the behavioral-finance skill.
 * Implements the Vibe-Trading "shadow account" concept for Paave.
 */
export function BehaviorAnalysisCard({
  userId,
  className,
}: BehaviorAnalysisCardProps) {
  const { messages, isLoading, error, sendMessage } = useAIChat({
    userId,
    language: "vi",
  });
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    sendMessage(
      `Hãy phân tích hành vi giao dịch giả lập của tôi (user_id: ${userId}). ` +
        "Dùng công cụ get_trade_analytics và get_user_portfolio để lấy dữ liệu. " +
        "Sau đó trình bày: " +
        "(1) Loại nhà đầu tư tôi đang là (archetype), " +
        "(2) 2–3 thói quen giao dịch nổi bật (tốt + cần cải thiện), " +
        "(3) 1 thay đổi cụ thể tôi nên áp dụng ngay tuần tới. " +
        "Giữ giọng điệu quan sát, không phán xét. Dùng tiếng Việt thân thiện với Gen Z.",
    );
  }, [userId, sendMessage]);

  const assistantMsg = messages.find((m) => m.role === "assistant");
  const content = assistantMsg?.content ?? "";
  const isStreaming = assistantMsg?.isStreaming ?? false;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoading && !content) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg-neo p-4",
          "bg-ink-violet-raised border border-border-neo",
          className,
        )}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, #B5E82F, #7F77DD, #FF8A5B)",
          }}
        />

        <div className="flex items-center gap-2 mb-4">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-lime-signal-400/40 animate-pulse" />
          <div className="h-3 w-36 rounded bg-violet-deep-800/60 animate-pulse" />
        </div>

        {/* Skeleton metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-ink-violet-surface border border-border-neo p-2.5 space-y-1.5 animate-pulse"
            >
              <div className="h-2 w-12 rounded bg-violet-deep-800/60" />
              <div className="h-4 w-10 rounded bg-violet-deep-800/60" />
            </div>
          ))}
        </div>

        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-full rounded bg-violet-deep-800/60" />
          <div className="h-3 w-5/6 rounded bg-violet-deep-800/60" />
          <div className="h-3 w-4/6 rounded bg-violet-deep-800/60" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && !content) {
    return (
      <AICard title="Phân tích hành vi" className={className}>
        <p className="text-[13px] text-text-neo-tertiary">
          Phân tích tạm thời không khả dụng. Vui lòng thử lại sau.
        </p>
      </AICard>
    );
  }

  if (!content && !isStreaming) return null;

  // ── Parse archetype from the streaming/completed content ────────────────
  // We extract signals from the AI text to pick the visual config.
  // This is best-effort — defaults to "developing" if nothing matches.
  const archetypeKey = (() => {
    const lower = content.toLowerCase();
    if (lower.includes("hyperactive") || lower.includes("giao dịch quá nhiều"))
      return "overtrader";
    if (lower.includes("fomo") || lower.includes("đà tăng"))
      return "fomo";
    if (lower.includes("phí") && lower.includes("cao"))
      return "fee_unaware";
    if (lower.includes("sợ lỗ") || lower.includes("loss-averse"))
      return "loss_averse";
    if (lower.includes("kỷ luật") || lower.includes("disciplined"))
      return "disciplined";
    if (lower.includes("tập trung") || lower.includes("concentrated"))
      return "concentrated";
    return "developing";
  })();

  const { emoji, color, bg } =
    ARCHETYPE_CONFIG[archetypeKey] ?? DEFAULT_ARCHETYPE;

  return (
    <AICard title="Phân tích hành vi giao dịch" className={className}>
      {/* Archetype badge */}
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 mb-4",
          bg,
        )}
      >
        <span className="text-[16px]">{emoji}</span>
        <span className={cn("font-display text-[12px] font-bold uppercase tracking-[0.5px]", color)}>
          {archetypeKey === "overtrader" && "Hyperactive Trader"}
          {archetypeKey === "fomo" && "FOMO Momentum Trader"}
          {archetypeKey === "fee_unaware" && "Fee-Unaware Trader"}
          {archetypeKey === "loss_averse" && "Loss-Averse Holder"}
          {archetypeKey === "disciplined" && "Disciplined Investor"}
          {archetypeKey === "concentrated" && "Concentrated Bettor"}
          {archetypeKey === "developing" && "Developing Investor"}
        </span>
      </div>

      {/* AI narrative */}
      <p className="text-[13px] leading-[1.7] text-text-neo-primary whitespace-pre-wrap">
        {content}
        {isStreaming && (
          <span className="ml-0.5 inline-block h-[14px] w-[2px] animate-pulse align-middle bg-lime-signal-400" />
        )}
      </p>
    </AICard>
  );
}

// ---------------------------------------------------------------------------
// Radar + metric panel — shown on the portfolio page alongside the AI card
// ---------------------------------------------------------------------------
export function BehaviorMetricPanel({
  scores,
  tradesPerWeek,
  winRatePct,
  avgHoldDays,
  feeBurnPct,
}: {
  scores: {
    overtrading: number;
    diversification: number;
    discipline: number;
    fee_awareness: number;
    patience: number;
  };
  tradesPerWeek: number;
  winRatePct: number | null;
  avgHoldDays: number | null;
  feeBurnPct: number;
}) {
  return (
    <div className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
      <h3 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
        Hồ sơ hành vi
      </h3>

      <div className="flex items-start gap-4 px-4 pb-4">
        {/* Radar */}
        <RadarChart scores={scores} />

        {/* Metric pills — 2×2 */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <MetricPill
            label="Giao dịch / tuần"
            value={tradesPerWeek.toFixed(1)}
            sub={tradesPerWeek > 3 ? "⚠️ quá nhiều" : "✓ hợp lý"}
          />
          <MetricPill
            label="Tỷ lệ thắng"
            value={winRatePct !== null ? `${winRatePct.toFixed(0)}%` : "—"}
            sub={
              winRatePct !== null
                ? winRatePct >= 55
                  ? "✓ tốt"
                  : "cần cải thiện"
                : "chưa đủ dữ liệu"
            }
          />
          <MetricPill
            label="Giữ lệnh TB"
            value={avgHoldDays !== null ? `${avgHoldDays.toFixed(1)} ngày` : "—"}
            sub={
              avgHoldDays !== null
                ? avgHoldDays < 1
                  ? "⚠️ quá ngắn"
                  : avgHoldDays >= 5
                  ? "✓ kiên nhẫn"
                  : "trung bình"
                : undefined
            }
          />
          <MetricPill
            label="Phí đã trả"
            value={`${feeBurnPct.toFixed(2)}%`}
            sub={feeBurnPct > 1 ? "⚠️ cao" : "✓ ổn"}
          />
        </div>
      </div>
    </div>
  );
}
