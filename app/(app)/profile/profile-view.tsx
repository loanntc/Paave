"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { BookOpen, Check, Pencil, Trophy, X, Zap } from "lucide-react";
import { TierBadge, type TierLevel } from "@/components/paave/tier-badge";
import { XPBar } from "@/components/paave/xp-bar";
import { useLearningProgress } from "@/lib/learning/use-learning-progress";
import { MODULES } from "@/lib/learning/content";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Tier progression config
// Based on total lifetime trades — thresholds keep Gen Z coming back daily.
// ---------------------------------------------------------------------------
const TIER_THRESHOLDS: Record<TierLevel, { min: number; max: number }> = {
  1: { min: 0,   max: 10  },
  2: { min: 10,  max: 25  },
  3: { min: 25,  max: 50  },
  4: { min: 50,  max: 100 },
  5: { min: 100, max: 200 },
  6: { min: 200, max: 200 }, // maxed out
};

function getTierLevel(totalTrades: number): TierLevel {
  if (totalTrades >= 200) return 6;
  if (totalTrades >= 100) return 5;
  if (totalTrades >= 50)  return 4;
  if (totalTrades >= 25)  return 3;
  if (totalTrades >= 10)  return 2;
  return 1;
}

function getXP(totalTrades: number, tier: TierLevel): { value: number; max: number } {
  const { min, max } = TIER_THRESHOLDS[tier];
  if (tier === 6) return { value: 200, max: 200 };
  return { value: totalTrades - min, max: max - min };
}

// ---------------------------------------------------------------------------
// ProfileView
// ---------------------------------------------------------------------------
interface ProfileData {
  displayName: string;
  email: string;
  totalTrades: number;
  totalEquity: number;
  totalPL: number;
  totalPLPct: number;
  positionCount: number;
  /** Win rate by stock: % of exited/partially-exited holdings with realized_pl > 0 */
  winRatePct: number | null;
  /** Number of closed or partially-closed stock positions used for the win-rate calc */
  tradedStockCount: number;
  /** Ticker of the best current holding by unrealized P&L % (null if no holdings) */
  bestTicker: string | null;
  /** Unrealized P&L % for the best holding */
  bestPct: number | null;
}

export function ProfileView() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  // Inline name edit state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Learning progress from F0 learning path (stored in localStorage)
  const { hydrated: learningHydrated, progress: learningProgress } =
    useLearningProgress();

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchProfile() {
      const {
        data: { session },
      } = await db.auth.getSession();

      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      const uid = session.user.id;
      const meta = session.user.user_metadata ?? {};
      const displayName: string =
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        session.user.email?.split("@")[0] ??
        "Nhà đầu tư";

      // Fetch sub-account
      const { data: acct } = await db
        .from("virtual_sub_accounts")
        .select("id, cash_balance, starting_balance")
        .eq("user_id", uid)
        .eq("status", "ACTIVE")
        .limit(1)
        .single();

      if (!acct) {
        setIsLoading(false);
        return;
      }

      // Parallel: ALL holdings (incl. exited ones for win-rate) + trade count
      const [holdingsRes, tradesCountRes] = await Promise.all([
        db
          .from("virtual_holdings")
          .select("symbol_code, quantity, avg_cost, realized_pl")
          .eq("sub_account_id", acct.id),

        db
          .from("virtual_trades")
          .select("id", { count: "exact", head: true })
          .eq("sub_account_id", acct.id),
      ]);

      const allHoldings = (holdingsRes.data ?? []).map((h) => ({
        symbol_code: h.symbol_code as string,
        quantity: Number(h.quantity),
        avg_cost: Number(h.avg_cost),
        realized_pl: Number(h.realized_pl),
      }));

      // Active holdings only (quantity > 0) are used for equity calculation
      const activeHoldings = allHoldings.filter((h) => h.quantity > 0);

      // Batch-fetch live prices so the profile shows mark-to-market equity
      const codes = activeHoldings.map((h) => h.symbol_code).filter(Boolean);
      let priceMap = new Map<string, number>();
      if (codes.length > 0) {
        const { data: quotes } = await db
          .from("symbol_quotes_latest")
          .select("symbol_code, last_price")
          .in("symbol_code", codes);
        for (const q of quotes ?? []) {
          if (q.last_price != null) priceMap.set(q.symbol_code, Number(q.last_price));
        }
      }

      const holdingsValue = activeHoldings.reduce(
        (s, h) =>
          s + (priceMap.get(h.symbol_code) ?? h.avg_cost) * h.quantity,
        0,
      );
      const cashBalance = Number(acct.cash_balance);
      const startingBalance = Number(acct.starting_balance);
      const totalEquity = cashBalance + holdingsValue;
      const totalPL = totalEquity - startingBalance;
      const totalPLPct = (totalPL / startingBalance) * 100;
      const totalTrades = tradesCountRes.count ?? 0;

      // Win rate — computed from all holdings that have any realized activity
      // (realized_pl ≠ 0 means we've at least partially exited the position)
      const tradedHoldings = allHoldings.filter((h) => h.realized_pl !== 0);
      const winCount = tradedHoldings.filter((h) => h.realized_pl > 0).length;
      const winRatePct =
        tradedHoldings.length > 0
          ? (winCount / tradedHoldings.length) * 100
          : null;

      // Best performer — highest unrealized P&L % among active holdings
      let bestTicker: string | null = null;
      let bestPct: number | null = null;
      for (const h of activeHoldings) {
        const price = priceMap.get(h.symbol_code);
        if (price != null && h.avg_cost > 0) {
          const pct = ((price - h.avg_cost) / h.avg_cost) * 100;
          if (bestPct === null || pct > bestPct) {
            bestPct = pct;
            bestTicker = h.symbol_code;
          }
        }
      }

      setData({
        displayName,
        email: session.user.email ?? "",
        totalTrades,
        totalEquity,
        totalPL,
        totalPLPct,
        positionCount: activeHoldings.length,
        winRatePct,
        tradedStockCount: tradedHoldings.length,
        bestTicker,
        bestPct,
      });
      setIsLoading(false);
    }

    fetchProfile();
  }, []);

  function startEditingName() {
    setNameInput(data?.displayName ?? "");
    setEditingName(true);
    // Focus is handled by a useEffect below
  }

  function cancelEditingName() {
    setEditingName(false);
    setNameInput("");
  }

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === data?.displayName) {
      cancelEditingName();
      return;
    }
    setNameSaving(true);
    try {
      const db = getBrowserClient();
      await db.auth.updateUser({ data: { full_name: trimmed } });
      setData((prev) => prev ? { ...prev, displayName: trimmed } : prev);
    } catch {
      // Silent failure — keep the old name shown
    } finally {
      setNameSaving(false);
      setEditingName(false);
    }
  }

  // Focus the input when edit mode opens
  useEffect(() => {
    if (editingName) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [editingName]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/sign-in");
    } catch {
      setIsSigningOut(false);
    }
  };

  const tier = data ? getTierLevel(data.totalTrades) : 1;
  const xp = data ? getXP(data.totalTrades, tier) : { value: 0, max: 10 };
  const initial = data?.displayName?.charAt(0).toUpperCase() ?? "?";

  return (
    <main className="min-h-screen bg-ink-violet-base text-text-neo-primary pb-24">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-violet-base/90 backdrop-blur border-b border-border-neo-subtle">
        <span className="font-display text-[18px] font-bold tracking-[-0.3px]">
          Hồ sơ
        </span>
      </header>

      <div className="px-4 pt-6 space-y-4 max-w-[640px] mx-auto">

        {isLoading ? (
          <ProfileSkeleton />
        ) : !data ? (
          <p className="text-[13px] text-text-neo-tertiary">
            Đăng nhập để xem hồ sơ.
          </p>
        ) : (
          <>
            {/* ── Identity card ──────────────────────────────────────── */}
            <section className="rounded-2xl bg-ink-violet-surface border border-border-neo px-5 py-5">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="shrink-0 grid size-16 place-items-center rounded-full text-[22px] font-bold text-ink-violet-base"
                  style={{
                    background: "linear-gradient(135deg, #B5E82F, #7F77DD)",
                  }}
                >
                  {initial}
                </div>

                {/* Name + email + tier */}
                <div className="min-w-0 flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName();
                          if (e.key === "Escape") cancelEditingName();
                        }}
                        maxLength={50}
                        className="flex-1 min-w-0 bg-ink-violet-raised border border-lime-signal-400/60 rounded-lg px-2 py-1 font-display text-[15px] font-bold text-text-neo-primary outline-none"
                        disabled={nameSaving}
                      />
                      <button
                        onClick={saveName}
                        disabled={nameSaving}
                        aria-label="Lưu tên"
                        className="grid size-7 place-items-center rounded-lg bg-lime-signal-400 text-ink-violet-base shrink-0"
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </button>
                      <button
                        onClick={cancelEditingName}
                        aria-label="Huỷ"
                        className="grid size-7 place-items-center rounded-lg bg-ink-violet-raised text-text-neo-tertiary hover:text-text-neo-primary shrink-0"
                      >
                        <X className="size-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={startEditingName}
                      className="group flex items-center gap-1.5 text-left max-w-full"
                      aria-label="Chỉnh sửa tên"
                    >
                      <p className="font-display text-[17px] font-bold text-text-neo-primary truncate">
                        {data.displayName}
                      </p>
                      <Pencil className="size-3.5 text-text-neo-tertiary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                    </button>
                  )}
                  <p className="text-[12px] text-text-neo-tertiary truncate mt-0.5">
                    {data.email}
                  </p>
                  <div className="mt-2">
                    <TierBadge level={tier} showLocale="vi" />
                  </div>
                </div>
              </div>

              {/* XP progress */}
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-[11px] text-text-neo-tertiary">
                  <span>Tiến độ lên Cấp {tier === 6 ? "MAX" : tier + 1}</span>
                  <span>
                    {tier === 6
                      ? "Huyền thoại 👑"
                      : `${xp.value} / ${xp.max} lệnh`}
                  </span>
                </div>
                <XPBar value={xp.value} max={xp.max} />
              </div>
            </section>

            {/* ── Account stats ───────────────────────────────────────── */}
            <section
              aria-label="Thống kê tài khoản"
              className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
            >
              <h2 className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
                Giả lập
              </h2>
              <div className="divide-y divide-border-neo-subtle">
                <StatRow
                  label="Tổng tài sản"
                  value={formatVND(data.totalEquity)}
                />
                <StatRow
                  label="Lãi / lỗ ròng"
                  value={`${data.totalPL >= 0 ? "+" : ""}${formatVND(data.totalPL)}`}
                  sub={pctLabel(data.totalPLPct)}
                  tone={data.totalPL >= 0 ? "positive" : "negative"}
                />
                <StatRow
                  label="Tổng lệnh"
                  value={`${data.totalTrades.toLocaleString()} lệnh`}
                />
                <StatRow
                  label="Vị thế đang mở"
                  value={`${data.positionCount} cổ phiếu`}
                />
              </div>
            </section>

            {/* ── Performance stats ───────────────────────────────────── */}
            {(data.winRatePct !== null || (data.bestTicker !== null && data.positionCount >= 2)) && (
              <PerformanceStatsCard
                winRatePct={data.winRatePct}
                tradedStockCount={data.tradedStockCount}
                bestTicker={data.bestTicker}
                bestPct={data.bestPct}
                positionCount={data.positionCount}
              />
            )}

            {/* ── Learning stats ──────────────────────────────────────── */}
            {learningHydrated && (
              <LearningStatsCard
                totalXP={learningProgress.totalLearningXP}
                completedLessons={
                  Object.values(learningProgress.lessons).filter((l) => l.completed).length
                }
                totalLessons={MODULES.reduce((s, m) => s + m.lessons.length, 0)}
              />
            )}

            {/* ── Actions ─────────────────────────────────────────────── */}
            <section className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden">
              <h2 className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
                Tài khoản
              </h2>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4",
                  "text-[14px] font-medium text-negative",
                  "hover:bg-ink-violet-raised transition-colors",
                  "disabled:opacity-50",
                )}
              >
                <span>{isSigningOut ? "Đang đăng xuất…" : "Đăng xuất"}</span>
                <span className="text-[18px]">→</span>
              </button>
            </section>

            {/* ── Version info ────────────────────────────────────────── */}
            <p className="text-center text-[11px] text-text-neo-tertiary pb-2">
              PAAVE v2.0 · Beta · Chỉ dành cho giao dịch giả lập
            </p>
          </>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// PerformanceStatsCard — trading performance metrics
// Win rate is computed at stock level: % of holdings with realized_pl > 0
// among holdings that have any realized activity (partial or full exits).
// ---------------------------------------------------------------------------
function PerformanceStatsCard({
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
function LearningStatsCard({
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
// StatRow
// ---------------------------------------------------------------------------
function StatRow({
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
          <p className={cn("text-[11px] tabular-nums",
            tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-text-neo-tertiary"
          )}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function ProfileSkeleton() {
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
