"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import {
  BehaviorAnalysisCard,
  BehaviorMetricPanel,
} from "@/components/paave/behavior-analysis-card";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePortfolioData } from "./use-portfolio-data";
import {
  EquitySkeleton,
  HoldingRow,
  HoldingsSkeleton,
  HistorySkeleton,
  TradeHistoryRow,
} from "./portfolio-components";

// ---------------------------------------------------------------------------
// PortfolioView — Danh mục tab
// Data fetching and derived metrics live in usePortfolioData.
// ---------------------------------------------------------------------------
export function PortfolioView() {
  const [activeTab, setActiveTab] = useState<"holdings" | "behavior" | "history">("holdings");

  const {
    userId,
    account,
    holdings,
    trades,
    quotes,
    isLoading,
    holdingsValue,
    totalEquity,
    totalPL,
    totalPLPct,
    isUp,
    tradesPerWeek,
    winRatePct,
    feeBurnPct,
    behaviorScores,
  } = usePortfolioData();

  return (
    <main className="min-h-screen bg-ink-violet-base text-text-neo-primary pb-24">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-violet-base/90 backdrop-blur border-b border-border-neo-subtle">
        <Link
          href="/home"
          aria-label="Go back"
          className="grid size-9 place-items-center rounded-full border border-border-neo bg-ink-violet-surface text-text-neo-secondary hover:text-text-neo-primary transition-colors"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
        </Link>
        <span className="font-display text-[18px] font-bold tracking-[-0.3px]">
          Danh mục
        </span>
      </header>

      <div className="px-4 pt-5 space-y-4 max-w-[640px] mx-auto">

        {/* ── Equity hero ──────────────────────────────────────────────── */}
        {isLoading ? (
          <EquitySkeleton />
        ) : account ? (
          <section aria-label="Portfolio value" className="space-y-1">
            <p className="text-[12px] uppercase tracking-[0.5px] text-text-neo-tertiary">
              Tổng tài sản
            </p>
            <p className="font-display text-[38px] font-bold tabular-nums tracking-[-1px] leading-none">
              {formatVND(totalEquity)}
            </p>
            <div
              className={cn(
                "flex items-center gap-2 text-[14px] font-display tabular-nums",
                isUp ? "text-positive" : "text-negative",
              )}
            >
              {isUp ? (
                <TrendingUp className="size-4" strokeWidth={2} />
              ) : (
                <TrendingDown className="size-4" strokeWidth={2} />
              )}
              <span>{formatVND(Math.abs(totalPL))}</span>
              <span className="text-[12px] opacity-80">({pctLabel(totalPLPct)})</span>
            </div>

            {/* Cash vs Invested bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] text-text-neo-tertiary">
                <span>Tiền mặt {formatVND(account.cash_balance)}</span>
                <span>Đầu tư {formatVND(holdingsValue)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-violet-raised overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime-signal-400 transition-all duration-500"
                  style={{
                    width:
                      totalEquity > 0
                        ? `${(account.cash_balance / totalEquity) * 100}%`
                        : "100%",
                  }}
                />
              </div>
            </div>
          </section>
        ) : (
          <p className="text-[13px] text-text-neo-tertiary">
            {userId
              ? "Tài khoản giả lập chưa được khởi tạo. Vui lòng liên hệ hỗ trợ."
              : "Đăng nhập để xem danh mục của bạn."}
          </p>
        )}

        {/* ── Tab switcher ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-ink-violet-surface border border-border-neo p-1">
          {(["holdings", "history", "behavior"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-xl py-2 text-[12px] font-bold uppercase tracking-[0.5px] transition-colors",
                activeTab === tab
                  ? "bg-ink-violet-raised text-text-neo-primary"
                  : "text-text-neo-tertiary hover:text-text-neo-secondary",
              )}
            >
              {tab === "holdings" ? "Vị thế" : tab === "history" ? "Lịch sử" : "Hành vi"}
            </button>
          ))}
        </div>

        {/* ── Holdings tab ──────────────────────────────────────────────── */}
        {activeTab === "holdings" && (
          <>
            {isLoading ? (
              <HoldingsSkeleton />
            ) : holdings.length === 0 ? (
              <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-8 text-center">
                <p className="text-[14px] text-text-neo-secondary mb-1">Chưa có vị thế nào</p>
                <p className="text-[12px] text-text-neo-tertiary mb-4">
                  Tìm cổ phiếu và đặt lệnh giả lập đầu tiên của bạn.
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-lime-signal-400 px-4 py-2 text-[12px] font-bold text-ink-violet-base"
                >
                  Khám phá cổ phiếu →
                </Link>
              </div>
            ) : (
              <section
                aria-label="Holdings"
                className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
              >
                <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
                  Vị thế đang nắm ({holdings.length})
                </h2>
                <div className="divide-y divide-border-neo-subtle">
                  {holdings.map((h) => (
                    <HoldingRow
                      key={h.symbol_code}
                      holding={h}
                      lastPrice={quotes.get(h.symbol_code)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── History tab ──────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <>
            {isLoading ? (
              <HistorySkeleton />
            ) : trades.length === 0 ? (
              <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-8 text-center">
                <p className="text-[14px] text-text-neo-secondary mb-1">Chưa có lệnh nào</p>
                <p className="text-[12px] text-text-neo-tertiary mb-4">
                  Đặt lệnh mua giả lập đầu tiên của bạn.
                </p>
                <Link
                  href="/discover"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-lime-signal-400 px-4 py-2 text-[12px] font-bold text-ink-violet-base"
                >
                  Khám phá cổ phiếu →
                </Link>
              </div>
            ) : (
              <section
                aria-label="Trade history"
                className="rounded-2xl bg-ink-violet-surface border border-border-neo overflow-hidden"
              >
                <h2 className="px-4 pt-4 pb-2 text-[11px] font-bold uppercase tracking-[0.8px] text-text-neo-tertiary">
                  50 lệnh gần nhất
                </h2>
                <div className="divide-y divide-border-neo-subtle">
                  {trades.map((t) => (
                    <TradeHistoryRow key={t.id} trade={t} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Behavior tab ─────────────────────────────────────────────── */}
        {activeTab === "behavior" && userId && (
          <>
            {/* Quantitative overview — radar + metric pills */}
            {!isLoading && (
              <BehaviorMetricPanel
                scores={behaviorScores}
                tradesPerWeek={tradesPerWeek}
                winRatePct={winRatePct}
                avgHoldDays={null}
                feeBurnPct={feeBurnPct}
              />
            )}
            {/* Qualitative AI narrative — fires on mount, streams from Anthropic */}
            <BehaviorAnalysisCard userId={userId} />
          </>
        )}

        {activeTab === "behavior" && !userId && !isLoading && (
          <div className="rounded-2xl bg-ink-violet-surface border border-border-neo px-4 py-8 text-center">
            <p className="text-[13px] text-text-neo-tertiary">
              Đăng nhập để xem phân tích hành vi giao dịch.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
