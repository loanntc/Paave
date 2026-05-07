"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveNav } from "@/components/paave/paave-nav";
import { Sparkline } from "@/components/paave/sparkline";
import { cn } from "@/lib/utils";

type MarketTab = "vn" | "kr" | "global";

const SECTORS_VN = [
  { name: "Ngân hàng", change: 1.25 },
  { name: "Bất động sản", change: 0.87 },
  { name: "Công nghệ", change: 2.14 },
  { name: "Tiêu dùng", change: 0.42 },
  { name: "Năng lượng xanh", change: 1.92 },
  { name: "Dược phẩm", change: -0.38 },
  { name: "Sản xuất", change: -0.95 },
  { name: "Vật liệu", change: 0.11 },
];

const SECTORS_KR = [
  { name: "반도체/IT", change: 1.82 },
  { name: "금융", change: 0.54 },
  { name: "바이오", change: -1.20 },
  { name: "자동차", change: 0.77 },
  { name: "화학", change: -0.43 },
  { name: "소비재", change: 1.08 },
  { name: "에너지", change: 0.35 },
  { name: "유통", change: -0.22 },
];

const SECTORS_GL = [
  { name: "Technology", change: 1.45 },
  { name: "Financials", change: 0.32 },
  { name: "Healthcare", change: -0.58 },
  { name: "Energy", change: 1.12 },
  { name: "Consumer", change: 0.67 },
  { name: "Industrials", change: 0.23 },
  { name: "Real Estate", change: -1.04 },
  { name: "Materials", change: 0.44 },
];

type Mover = {
  symbol: string;
  name: string;
  price: string;
  changePct: string;
  up: boolean;
};

const GAINERS_VN: Mover[] = [
  { symbol: "FPT", name: "FPT Corp", price: "₫121.500", changePct: "+4,20%", up: true },
  { symbol: "REE", name: "REE Corp", price: "₫68.700", changePct: "+2,84%", up: true },
  { symbol: "VCB", name: "Vietcombank", price: "₫88.000", changePct: "+2,15%", up: true },
  { symbol: "VIC", name: "Vingroup", price: "₫45.200", changePct: "+3,19%", up: true },
  { symbol: "MWG", name: "Mobile World", price: "₫52.400", changePct: "+2,14%", up: true },
];

const LOSERS_VN: Mover[] = [
  { symbol: "HPG", name: "Hòa Phát", price: "₫26.100", changePct: "-1,51%", up: false },
  { symbol: "TCB", name: "Techcombank", price: "₫48.200", changePct: "-0,82%", up: false },
  { symbol: "PVD", name: "PV Drilling", price: "₫19.500", changePct: "-1,28%", up: false },
  { symbol: "SBT", name: "SBT Sugar", price: "₫14.700", changePct: "-2,00%", up: false },
  { symbol: "DGW", name: "Digiworld", price: "₫39.800", changePct: "-0,75%", up: false },
];

const GAINERS_KR: Mover[] = [
  { symbol: "035420", name: "NAVER", price: "₩198,500", changePct: "+3,82%", up: true },
  { symbol: "000270", name: "Kia Corp", price: "₩85,200", changePct: "+2,44%", up: true },
  { symbol: "207940", name: "Samsung Bio", price: "₩702,000", changePct: "+1,98%", up: true },
  { symbol: "051910", name: "LG Chem", price: "₩312,000", changePct: "+1,75%", up: true },
  { symbol: "009150", name: "Samsung Electro", price: "₩142,500", changePct: "+1,23%", up: true },
];

const LOSERS_KR: Mover[] = [
  { symbol: "003670", name: "POSCO", price: "₩294,000", changePct: "-2,15%", up: false },
  { symbol: "017670", name: "SK Telecom", price: "₩48,700", changePct: "-1,42%", up: false },
  { symbol: "028260", name: "Samsung C&T", price: "₩136,500", changePct: "-0,87%", up: false },
  { symbol: "086790", name: "Hana Financial", price: "₩54,300", changePct: "-0,55%", up: false },
  { symbol: "004020", name: "Hyundai Steel", price: "₩28,950", changePct: "-1,10%", up: false },
];

const GAINERS_GL: Mover[] = [
  { symbol: "NVDA", name: "NVIDIA", price: "$962.14", changePct: "+4,12%", up: true },
  { symbol: "TSMC", name: "TSMC ADR", price: "$178.50", changePct: "+2,87%", up: true },
  { symbol: "MSFT", name: "Microsoft", price: "$420.24", changePct: "+1,54%", up: true },
  { symbol: "META", name: "Meta", price: "$524.81", changePct: "+2,10%", up: true },
  { symbol: "AMZN", name: "Amazon", price: "$193.47", changePct: "+1,22%", up: true },
];

const LOSERS_GL: Mover[] = [
  { symbol: "INTC", name: "Intel", price: "$31.42", changePct: "-3,21%", up: false },
  { symbol: "BABA", name: "Alibaba", price: "$76.80", changePct: "-2,45%", up: false },
  { symbol: "PYPL", name: "PayPal", price: "$62.15", changePct: "-1,87%", up: false },
  { symbol: "DIS", name: "Disney", price: "$98.22", changePct: "-1,14%", up: false },
  { symbol: "NFLX", name: "Netflix", price: "$648.90", changePct: "-0,92%", up: false },
];

function ChangePill({ up, pct }: { up: boolean; pct: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 font-display text-[11px] tabular-nums",
        up ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative",
      )}
    >
      {pct}
    </span>
  );
}

function IndexCard({
  name,
  value,
  change,
  changePct,
  up,
  large,
}: {
  name: string;
  value: string;
  change: string;
  changePct: string;
  up: boolean;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-edge bg-ink-800/60 p-4 backdrop-blur",
        large ? "col-span-2" : "col-span-1",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-[11px] uppercase tracking-pulse text-fog">
            {name}
          </p>
          <p className="mt-1.5 font-display text-[24px] font-bold tabular-nums text-lime-soft">
            {value}
          </p>
          <p
            className={cn(
              "mt-1 font-display text-[13px] tabular-nums",
              up ? "text-positive" : "text-negative",
            )}
          >
            {change} ({changePct})
          </p>
        </div>
        {large && (
          <div className="shrink-0">
            <Sparkline up={up} width={80} height={40} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectorRow({ name, change }: { name: string; change: number }) {
  const up = change >= 0;
  const width = Math.min(Math.abs(change) / 5, 1) * 80;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="w-28 shrink-0 font-body text-[13px] text-lime-soft/80">
        {name}
      </span>
      <div className="flex-1 rounded-full bg-ink-600/60 h-1.5 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            up ? "bg-positive" : "bg-negative",
          )}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={cn(
          "w-14 shrink-0 text-right font-display text-[12px] tabular-nums font-semibold",
          up ? "text-positive" : "text-negative",
        )}
      >
        {up ? "+" : ""}
        {change.toFixed(2)}%
      </span>
    </div>
  );
}

function MoverRow({ mover }: { mover: Mover }) {
  return (
    <Link
      href={`/stock/${mover.symbol}`}
      className="flex items-center gap-3 rounded-2xl bg-ink-800/40 px-4 py-3 transition-colors hover:bg-ink-700"
    >
      <div className="grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-ink-600 font-display text-[11px] font-bold text-lime-soft">
        {mover.symbol.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-[14px] font-semibold text-lime-soft">
          {mover.symbol}
        </p>
        <p className="font-body text-[12px] text-fog truncate">{mover.name}</p>
      </div>
      <div className="text-right">
        <p className="font-display text-[14px] font-semibold tabular-nums text-lime-soft">
          {mover.price}
        </p>
        <ChangePill up={mover.up} pct={mover.changePct} />
      </div>
    </Link>
  );
}

type TabConfig = {
  indices: { name: string; value: string; change: string; changePct: string; up: boolean; large?: boolean }[];
  sectors: { name: string; change: number }[];
  gainers: Mover[];
  losers: Mover[];
};

const TAB_DATA: Record<MarketTab, TabConfig> = {
  vn: {
    indices: [
      { name: "VN-Index", value: "1.284,52", change: "+10,84", changePct: "+0,85%", up: true, large: true },
      { name: "HNX-Index", value: "228,46", change: "+1,52", changePct: "+0,67%", up: true },
      { name: "VN30", value: "1.341,20", change: "+9,30", changePct: "+0,70%", up: true },
    ],
    sectors: SECTORS_VN,
    gainers: GAINERS_VN,
    losers: LOSERS_VN,
  },
  kr: {
    indices: [
      { name: "KOSPI", value: "2.712,14", change: "-9,28", changePct: "-0,34%", up: false, large: true },
      { name: "KOSDAQ", value: "872,35", change: "+2,14", changePct: "+0,25%", up: true },
      { name: "KRX 300", value: "1.024,88", change: "-3,12", changePct: "-0,30%", up: false },
    ],
    sectors: SECTORS_KR,
    gainers: GAINERS_KR,
    losers: LOSERS_KR,
  },
  global: {
    indices: [
      { name: "S&P 500", value: "5.248,49", change: "+9,44", changePct: "+0,18%", up: true, large: true },
      { name: "NASDAQ", value: "16.399,27", change: "+64,51", changePct: "+0,39%", up: true },
      { name: "DJIA", value: "39,127.14", change: "+125.48", changePct: "+0,32%", up: true },
    ],
    sectors: SECTORS_GL,
    gainers: GAINERS_GL,
    losers: LOSERS_GL,
  },
};

const TABS: { id: MarketTab; label: string }[] = [
  { id: "vn", label: "🇻🇳 Việt Nam" },
  { id: "kr", label: "🇰🇷 Hàn Quốc" },
  { id: "global", label: "🌏 Toàn cầu" },
];

export function MarketsView() {
  const [tab, setTab] = useState<MarketTab>("vn");
  const [moversType, setMoversType] = useState<"gainers" | "losers">("gainers");

  const data = TAB_DATA[tab];

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <header className="relative z-20 px-6 pt-14 pb-0">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[20px] font-bold text-lime-soft">
            Thị trường
          </h1>
          <button
            aria-label="Refresh markets"
            className="grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-fog backdrop-blur transition-colors hover:text-lime-soft"
          >
            <RefreshCw className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 flex gap-1 border-b border-edge">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 pb-3 font-display text-[12px] uppercase tracking-pulse transition-all duration-150",
                tab === id
                  ? "border-b-2 border-lime text-lime-soft"
                  : "text-fog hover:text-lime-soft",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <section className="relative z-10 mx-4 mt-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {data.indices.map((idx) => (
            <IndexCard key={idx.name} {...idx} />
          ))}
        </div>

        <div className="rounded-3xl border border-edge bg-ink-800/60 p-5 backdrop-blur">
          <h2 className="mb-1 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Hiệu suất ngành
          </h2>
          <div className="divide-y divide-edge/60">
            {data.sectors.map((s) => (
              <SectorRow key={s.name} name={s.name} change={s.change} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-edge bg-ink-800/60 p-5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[13px] uppercase tracking-drop text-lime-soft">
              Top biến động
            </h2>
            <div className="flex overflow-hidden rounded-full border border-edge">
              <button
                onClick={() => setMoversType("gainers")}
                className={cn(
                  "px-4 py-1.5 font-display text-[11px] uppercase tracking-pulse transition-colors",
                  moversType === "gainers"
                    ? "bg-positive/20 text-positive"
                    : "text-fog",
                )}
              >
                Tăng
              </button>
              <button
                onClick={() => setMoversType("losers")}
                className={cn(
                  "px-4 py-1.5 font-display text-[11px] uppercase tracking-pulse transition-colors",
                  moversType === "losers"
                    ? "bg-negative/20 text-negative"
                    : "text-fog",
                )}
              >
                Giảm
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {(moversType === "gainers" ? data.gainers : data.losers).map(
              (m) => (
                <MoverRow key={m.symbol} mover={m} />
              ),
            )}
          </div>
        </div>
      </section>

      <PaaveNav />
    </main>
  );
}
