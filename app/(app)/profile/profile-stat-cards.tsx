// Profile stat cards — PerformanceStatsCard, LearningStatsCard, StatRow,
// ProfileSkeleton. All pure display; no hooks or client state.

import type React from "react";
import { BookOpen, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// StatRow — generic key-value row used by the stat cards
// ---------------------------------------------------------------------------

export function StatRow({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | React.ReactNode;
  sub?: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-[13px] text-text-neo-secondary">{label}</span>
      <div className="text-right">
        <span
          className={cn(
            "font-display text-[14px] tabular-nums font-medium",
            tone === "positive"
              ? "text-positive"
              : tone === "negative"
                ? "text-negative"
                : "text-text-neo-primary",
          )}
        >
          {value}
        </span>
        {sub && (
          <p
            className={cn(
              "text-[11px] tabular-nums",
              tone === "positive"
                ? "text-positive"
                : tone === "negative"
                  ? "text-negative"
                  : "text-text-neo-tertiary",
            )}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PerformanceStatsCard — trading performance: win rate and best position
// Win rate = % of holdings with realized_pl > 0 among exited/partial holdings
// ---------------------------------------------------------------------------

export function PerformanceStatsCard({
  winRatePct,
  tradedStockCount,
  bestTicker,
  bestPct,
  positionCount,
}: {
  winRatePct: number | null;
  tradedStockCount: number;
  bestTicker: string | null;
  bestPct: number | null;
  positionCount: number;
}) {
  return (
    <section className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
      <h2 className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
        Hiệu suất
      </h2>
      <div className="divide-y divide-border-neo-subtle">
        {winRatePct !== null && (
          <StatRow
            label={`Tỷ lệ thắng (${tradedStockCount} CP)`}
            value={`${winRatePct.toFixed(0)}%`}
            tone={winRatePct >= 55 ? "positive" : winRatePct < 40 ? "negative" : undefined}
            sub={
              winRatePct >= 55
                ? "Tốt · trên mức trung bình"
                : winRatePct < 40
                  ? "Cần cải thiện"
                  : "Trung bình"
            }
          />
        )}
        {bestTicker !== null && bestPct !== null && positionCount >= 2 && (
          <StatRow
            label="Cổ phiếu tốt nhất"
            value={`${bestTicker}  ${bestPct >= 0 ? "+" : ""}${bestPct.toFixed(1)}%`}
            tone={bestPct >= 0 ? "positive" : "negative"}
          />
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// LearningStatsCard — F0 Learning Path progress summary
// ---------------------------------------------------------------------------

export function LearningStatsCard({
  totalXP,
  completedLessons,
  totalLessons,
}: {
  totalXP: number;
  completedLessons: number;
  totalLessons: number;
}) {
  const pct = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  return (
    <section className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
      <h2 className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
        Học tập
      </h2>
      <div className="divide-y divide-border-neo-subtle">
        <StatRow
          label="Điểm học tập"
          value={
            <span className="flex items-center gap-1 justify-end">
              <Zap className="size-3 text-lime-signal-400" />
              <span className="text-lime-signal-400">{totalXP} XP</span>
            </span>
          }
        />
        <StatRow
          label="Bài học hoàn thành"
          value={
            <span className="flex items-center gap-1.5 justify-end">
              <BookOpen className="size-3 text-text-neo-tertiary" />
              {completedLessons} / {totalLessons}
            </span>
          }
        />
        <div className="px-5 py-3 space-y-1.5">
          <div className="flex justify-between text-[11px] text-text-neo-tertiary">
            <span>Tiến độ tổng thể</span>
            <span className="text-lime-signal-400 font-bold">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink-violet-raised overflow-hidden">
            <div
              className="h-full rounded-full bg-lime-signal-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        {completedLessons === totalLessons && totalLessons > 0 && (
          <div className="px-5 py-3 flex items-center gap-2">
            <Trophy className="size-4 text-yellow-400 shrink-0" />
            <span className="text-[12px] text-text-neo-secondary font-medium">
              F0 Master — học xong toàn bộ lộ trình!
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ProfileSkeleton — loading state placeholder
// ---------------------------------------------------------------------------

export function ProfileSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Identity card */}
      <div className="rounded-2xl bg-ink-violet-surface border border-border-neo p-5">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-ink-violet-raised shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-ink-violet-raised" />
            <div className="h-3 w-44 rounded bg-ink-violet-raised" />
            <div className="h-5 w-20 rounded-full bg-ink-violet-raised" />
          </div>
        </div>
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between">
            <div className="h-2.5 w-24 rounded bg-ink-violet-raised" />
            <div className="h-2.5 w-16 rounded bg-ink-violet-raised" />
          </div>
          <div className="h-2.5 w-full rounded-full bg-ink-violet-raised" />
        </div>
      </div>
      {/* Stats */}
      <div className="rounded-2xl bg-ink-violet-surface border border-border-neo p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-24 rounded bg-ink-violet-raised" />
            <div className="h-3 w-20 rounded bg-ink-violet-raised" />
          </div>
        ))}
      </div>
    </div>
  );
}
