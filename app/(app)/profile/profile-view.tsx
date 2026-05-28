"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import type { TierLevel } from "@/components/paave/tier-badge";
import { useLearningProgress } from "@/lib/learning/use-learning-progress";
import { MODULES } from "@/lib/learning/content";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProfileIdentityCard } from "./profile-identity-card";
import {
  LearningStatsCard,
  PerformanceStatsCard,
  ProfileSkeleton,
  StatRow,
} from "./profile-stat-cards";

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

  const { hydrated: learningHydrated, progress: learningProgress } = useLearningProgress();

  useEffect(() => {
    const db = getBrowserClient();

    async function fetchProfile() {
      const { data: { session } } = await db.auth.getSession();
      if (!session?.user) { setIsLoading(false); return; }

      const uid = session.user.id;
      const meta = session.user.user_metadata ?? {};
      const displayName: string =
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        session.user.email?.split("@")[0] ??
        "Nhà đầu tư";

      const { data: acct } = await db
        .from("virtual_sub_accounts")
        .select("id, cash_balance, starting_balance")
        .eq("user_id", uid)
        .eq("status", "ACTIVE")
        .limit(1)
        .single();

      if (!acct) { setIsLoading(false); return; }

      const [holdingsRes, tradesCountRes] = await Promise.all([
        db.from("virtual_holdings")
          .select("symbol_code, quantity, avg_cost, realized_pl")
          .eq("sub_account_id", acct.id),
        db.from("virtual_trades")
          .select("id", { count: "exact", head: true })
          .eq("sub_account_id", acct.id),
      ]);

      const allHoldings = (holdingsRes.data ?? []).map((h) => ({
        symbol_code: h.symbol_code as string,
        quantity: Number(h.quantity),
        avg_cost: Number(h.avg_cost),
        realized_pl: Number(h.realized_pl),
      }));
      const activeHoldings = allHoldings.filter((h) => h.quantity > 0);

      // Batch-fetch live prices for mark-to-market equity calculation
      const codes = activeHoldings.map((h) => h.symbol_code).filter(Boolean);
      const priceMap = new Map<string, number>();
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
        (s, h) => s + (priceMap.get(h.symbol_code) ?? h.avg_cost) * h.quantity,
        0,
      );
      const cashBalance = Number(acct.cash_balance);
      const startingBalance = Number(acct.starting_balance);
      const totalEquity = cashBalance + holdingsValue;
      const totalPL = totalEquity - startingBalance;
      const totalPLPct = (totalPL / startingBalance) * 100;
      const totalTrades = tradesCountRes.count ?? 0;

      // Win rate — holdings with any realized activity (realized_pl ≠ 0)
      const tradedHoldings = allHoldings.filter((h) => h.realized_pl !== 0);
      const winCount = tradedHoldings.filter((h) => h.realized_pl > 0).length;
      const winRatePct = tradedHoldings.length > 0
        ? (winCount / tradedHoldings.length) * 100
        : null;

      // Best performer — highest unrealized P&L % among active holdings
      let bestTicker: string | null = null;
      let bestPct: number | null = null;
      for (const h of activeHoldings) {
        const price = priceMap.get(h.symbol_code);
        if (price != null && h.avg_cost > 0) {
          const pct = ((price - h.avg_cost) / h.avg_cost) * 100;
          if (bestPct === null || pct > bestPct) { bestPct = pct; bestTicker = h.symbol_code; }
        }
      }

      setData({
        displayName, email: session.user.email ?? "", totalTrades,
        totalEquity, totalPL, totalPLPct, positionCount: activeHoldings.length,
        winRatePct, tradedStockCount: tradedHoldings.length, bestTicker, bestPct,
      });
      setIsLoading(false);
    }

    fetchProfile();
  }, []);

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

  return (
    <main className="min-h-screen bg-ink-violet-base text-text-neo-primary pb-24">
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-violet-base/90 backdrop-blur border-b border-border-neo-subtle">
        <span className="font-display text-[18px] font-bold tracking-[-0.3px]">Hồ sơ</span>
      </header>

      <div className="px-4 pt-6 space-y-4 max-w-[640px] mx-auto">
        {isLoading ? (
          <ProfileSkeleton />
        ) : !data ? (
          <p className="text-[13px] text-text-neo-tertiary">Đăng nhập để xem hồ sơ.</p>
        ) : (
          <>
            {/* Identity card — owns its own name-edit state */}
            <ProfileIdentityCard
              displayName={data.displayName}
              email={data.email}
              tier={tier}
              xp={xp}
              onNameSave={(newName) =>
                setData((prev) => prev ? { ...prev, displayName: newName } : prev)
              }
            />

            {/* Account stats */}
            <section
              aria-label="Thống kê tài khoản"
              className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
            >
              <h2 className="px-5 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
                Giả lập
              </h2>
              <div className="divide-y divide-border-neo-subtle">
                <StatRow label="Tổng tài sản" value={formatVND(data.totalEquity)} />
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

            {/* Performance stats */}
            {(data.winRatePct !== null ||
              (data.bestTicker !== null && data.positionCount >= 2)) && (
              <PerformanceStatsCard
                winRatePct={data.winRatePct}
                tradedStockCount={data.tradedStockCount}
                bestTicker={data.bestTicker}
                bestPct={data.bestPct}
                positionCount={data.positionCount}
              />
            )}

            {/* Learning stats */}
            {learningHydrated && (
              <LearningStatsCard
                totalXP={learningProgress.totalLearningXP}
                completedLessons={
                  Object.values(learningProgress.lessons).filter((l) => l.completed).length
                }
                totalLessons={MODULES.reduce((s, m) => s + m.lessons.length, 0)}
              />
            )}

            {/* Actions */}
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

            <p className="text-center text-[11px] text-text-neo-tertiary pb-2">
              PAAVE v2.0 · Beta · Chỉ dành cho giao dịch giả lập
            </p>
          </>
        )}
      </div>
    </main>
  );
}
