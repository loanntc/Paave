"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveNav } from "@/components/paave/paave-nav";
import { cn } from "@/lib/utils";

type Period = "Hôm nay" | "1T" | "3T" | "6T" | "1N";
const PERIODS: Period[] = ["Hôm nay", "1T", "3T", "6T", "1N"];

type Holding = {
  symbol: string;
  name: string;
  qty: number;
  avgCost: number;
  currentPrice: number;
  color: string;
};

const HOLDINGS: Holding[] = [
  { symbol: "VCB", name: "Vietcombank", qty: 10, avgCost: 82000, currentPrice: 88000, color: "#CAFD00" },
  { symbol: "FPT", name: "FPT Corp", qty: 5, avgCost: 108000, currentPrice: 121500, color: "#D277FF" },
  { symbol: "VIC", name: "Vingroup", qty: 20, avgCost: 40000, currentPrice: 45200, color: "#10B981" },
  { symbol: "HPG", name: "Hòa Phát Group", qty: 30, avgCost: 28000, currentPrice: 26100, color: "#EF4444" },
  { symbol: "REE", name: "REE Corporation", qty: 8, avgCost: 60000, currentPrice: 68700, color: "#F59E0B" },
];

type Tx = {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  qty: number;
  price: number;
  date: string;
};

const TRANSACTIONS: Tx[] = [
  { id: "1", type: "buy", symbol: "FPT", qty: 5, price: 108000, date: "15/04/2026 · 09:15" },
  { id: "2", type: "buy", symbol: "REE", qty: 8, price: 60000, date: "12/04/2026 · 10:42" },
  { id: "3", type: "sell", symbol: "VCB", qty: 5, price: 90000, date: "10/04/2026 · 14:20" },
  { id: "4", type: "buy", symbol: "VIC", qty: 20, price: 40000, date: "08/04/2026 · 11:05" },
  { id: "5", type: "buy", symbol: "VCB", qty: 15, price: 82000, date: "01/04/2026 · 09:30" },
  { id: "6", type: "buy", symbol: "HPG", qty: 30, price: 28000, date: "28/03/2026 · 13:15" },
];

function formatVND(n: number): string {
  return "₫" + n.toLocaleString("vi-VN");
}

function AllocationBar({ holdings }: { holdings: Holding[] }) {
  const totalValue = holdings.reduce((s, h) => s + h.currentPrice * h.qty, 0);
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full">
        {holdings.map((h) => {
          const pct = ((h.currentPrice * h.qty) / totalValue) * 100;
          return (
            <div
              key={h.symbol}
              style={{ width: `${pct}%`, background: h.color }}
              className="transition-all duration-500"
            />
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {holdings.map((h) => {
          const pct = (((h.currentPrice * h.qty) / totalValue) * 100).toFixed(1);
          return (
            <div key={h.symbol} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: h.color }}
              />
              <span className="font-display text-[11px] text-fog truncate">
                {h.symbol}
              </span>
              <span className="ml-auto font-display text-[11px] text-fog-muted">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PNL_BY_PERIOD: Record<Period, { abs: string; pct: string; up: boolean }> = {
  "Hôm nay": { abs: "+₫125.000", pct: "+3,02%", up: true },
  "1T": { abs: "+₫480.000", pct: "+11,57%", up: true },
  "3T": { abs: "+₫920.000", pct: "+22,17%", up: true },
  "6T": { abs: "+₫1.350.000", pct: "+32,53%", up: true },
  "1N": { abs: "+₫2.050.000", pct: "+49,40%", up: true },
};

export function PortfolioView() {
  const [period, setPeriod] = useState<Period>("Hôm nay");

  const totalValue = HOLDINGS.reduce((s, h) => s + h.currentPrice * h.qty, 0);
  const totalCost = HOLDINGS.reduce((s, h) => s + h.avgCost * h.qty, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = ((totalPnL / totalCost) * 100).toFixed(2);
  const pnlUp = totalPnL >= 0;
  const pnl = PNL_BY_PERIOD[period];

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <header className="relative z-20 flex items-center justify-between px-6 pt-14 pb-4">
        <h1 className="font-display text-[20px] font-bold text-lime-soft">
          Danh mục
        </h1>
        <button
          aria-label="Thêm khoản đầu tư"
          className="grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-fog backdrop-blur transition-colors hover:text-lime-soft"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </header>

      <div className="relative z-10 mx-4 space-y-5">
        <section
          aria-label="Portfolio summary"
          className="relative overflow-hidden rounded-[32px] bg-ink-800 px-6 py-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-lime/10 blur-3xl"
          />
          <p className="font-display text-[11px] uppercase tracking-pulse text-fog">
            Tổng giá trị danh mục
          </p>
          <p className="mt-2 font-display text-[40px] font-bold leading-tight tabular-nums text-lime-soft">
            {formatVND(totalValue)}
          </p>

          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1",
              pnlUp ? "bg-positive/15" : "bg-negative/15",
            )}
          >
            {pnlUp ? (
              <ArrowUpRight className="size-3.5 text-positive" strokeWidth={2.5} />
            ) : (
              <ArrowDownRight className="size-3.5 text-negative" strokeWidth={2.5} />
            )}
            <span
              className={cn(
                "font-display text-[13px] tabular-nums",
                pnlUp ? "text-positive" : "text-negative",
              )}
            >
              {pnlUp ? "+" : ""}
              {formatVND(Math.abs(totalPnL))} ({pnlUp ? "+" : ""}{totalPnLPct}%) tổng
            </span>
          </div>

          <div className="mt-4 flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-full px-3 py-1 font-display text-[11px] uppercase tracking-pulse transition-all",
                  period === p
                    ? "bg-lime/20 text-lime border border-lime/40"
                    : "bg-ink-600/60 text-fog",
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-ink-600/60 px-4 py-3">
            <p className="font-display text-[11px] uppercase tracking-pulse text-fog">
              Lãi/lỗ {period.toLowerCase()}
            </p>
            <p
              className={cn(
                "mt-1 font-display text-[18px] font-semibold tabular-nums",
                pnl.up ? "text-positive" : "text-negative",
              )}
            >
              {pnl.abs}{" "}
              <span className="text-[14px]">({pnl.pct})</span>
            </p>
          </div>
        </section>

        <section aria-label="Holdings">
          <h2 className="mb-3 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Danh mục nắm giữ ({HOLDINGS.length})
          </h2>
          <div className="space-y-2">
            {HOLDINGS.map((h) => {
              const value = h.currentPrice * h.qty;
              const pnl = (h.currentPrice - h.avgCost) * h.qty;
              const pnlPct = (((h.currentPrice - h.avgCost) / h.avgCost) * 100).toFixed(2);
              const up = pnl >= 0;

              return (
                <Link
                  key={h.symbol}
                  href={`/stock/${h.symbol}`}
                  className="flex items-center gap-3 rounded-2xl border border-edge bg-ink-800/60 px-4 py-4 backdrop-blur transition-colors hover:bg-ink-700"
                >
                  <div
                    className="w-1 self-stretch rounded-full"
                    style={{ background: h.color }}
                    aria-hidden
                  />
                  <div
                    className="grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-ink-600 font-display text-[11px] font-bold text-lime-soft"
                    aria-hidden
                  >
                    {h.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[15px] font-semibold text-lime-soft">
                      {h.symbol}
                    </p>
                    <p className="font-body text-[12px] text-fog">
                      {h.qty} CP · {formatVND(h.avgCost)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[15px] font-semibold tabular-nums text-lime-soft">
                      {formatVND(value)}
                    </p>
                    <p
                      className={cn(
                        "font-display text-[12px] tabular-nums",
                        up ? "text-positive" : "text-negative",
                      )}
                    >
                      {up ? "+" : ""}
                      {formatVND(Math.abs(pnl))} ({up ? "+" : ""}{pnlPct}%)
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section
          aria-label="Allocation"
          className="rounded-3xl border border-edge bg-ink-800/60 p-5 backdrop-blur"
        >
          <h2 className="mb-4 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Phân bổ danh mục
          </h2>
          <AllocationBar holdings={HOLDINGS} />
        </section>

        <section aria-label="Transaction history">
          <h2 className="mb-3 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Lịch sử giao dịch
          </h2>
          <div className="divide-y divide-edge/40 rounded-3xl border border-edge bg-ink-800/60 overflow-hidden">
            {TRANSACTIONS.map((tx) => {
              const buy = tx.type === "buy";
              return (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      buy ? "bg-positive/15" : "bg-negative/15",
                    )}
                  >
                    {buy ? (
                      <ArrowUpRight className="size-4 text-positive" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight className="size-4 text-negative" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[14px] font-semibold text-lime-soft">
                      {buy ? "Mua" : "Bán"} {tx.symbol}
                    </p>
                    <p className="font-body text-[11px] text-fog">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[13px] font-semibold text-lime-soft">
                      {buy ? "+" : "-"}{tx.qty} CP
                    </p>
                    <p className="font-body text-[11px] text-fog">
                      {formatVND(tx.qty * tx.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <PaaveNav />
    </main>
  );
}
