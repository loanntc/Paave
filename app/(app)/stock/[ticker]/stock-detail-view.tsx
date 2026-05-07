"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Bookmark,
  BookmarkCheck,
  Share2,
  Zap,
} from "lucide-react";
import { PaaveNav } from "@/components/paave/paave-nav";
import { cn } from "@/lib/utils";

type TimeRange = "1N" | "1W" | "1T" | "3T" | "6T" | "1Y";
const TIME_RANGES: TimeRange[] = ["1N", "1W", "1T", "3T", "6T", "1Y"];

type StockData = {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  price: string;
  priceNum: number;
  changeAbs: string;
  changePct: string;
  up: boolean;
  updatedAt: string;
  caps: string;
  pe: string;
  eps: string;
  volume: string;
  high52w: string;
  low52w: string;
  hook: string;
  relatedSymbols: { symbol: string; name: string; price: string; changePct: string; up: boolean }[];
};

const STOCKS_DB: Record<string, StockData> = {
  VCB: {
    symbol: "VCB", name: "Vietcombank", sector: "Ngân hàng", exchange: "HOSE",
    price: "₫88.000", priceNum: 88000,
    changeAbs: "+₫1.800", changePct: "+2,15%", up: true, updatedAt: "14:32 ICT",
    caps: "123,4T₫", pe: "12,5x", eps: "₫7.040", volume: "1,24M", high52w: "₫95.000", low52w: "₫72.000",
    hook: "Vietcombank ghi nhận lợi nhuận quý cao nhất từ trước đến nay, với ROE vượt 18%. Tín dụng tư nhân tăng mạnh trong bối cảnh lãi suất hạ nhiệt. Khối ngoại mua ròng 5 phiên liên tiếp.",
    relatedSymbols: [
      { symbol: "BID", name: "BIDV", price: "₫52.100", changePct: "+1,17%", up: true },
      { symbol: "CTG", name: "VietinBank", price: "₫37.800", changePct: "+0,80%", up: true },
      { symbol: "TCB", name: "Techcombank", price: "₫48.200", changePct: "-0,82%", up: false },
      { symbol: "ACB", name: "ACB Bank", price: "₫24.500", changePct: "+1,45%", up: true },
    ],
  },
  FPT: {
    symbol: "FPT", name: "FPT Corporation", sector: "Công nghệ", exchange: "HOSE",
    price: "₫121.500", priceNum: 121500,
    changeAbs: "+₫2.500", changePct: "+2,10%", up: true, updatedAt: "14:33 ICT",
    caps: "72,3T₫", pe: "22,1x", eps: "₫5.498", volume: "0,87M", high52w: "₫130.000", low52w: "₫88.000",
    hook: "FPT ký hợp đồng AI với 5 tập đoàn Nhật Bản — doanh thu phần mềm nước ngoài tăng 28% YoY. Đây là mức tăng trưởng mạnh nhất từ 2020. Mảng giáo dục tiếp tục là động lực lợi nhuận ổn định.",
    relatedSymbols: [
      { symbol: "CMG", name: "CMC Corp", price: "₫35.600", changePct: "+1,42%", up: true },
      { symbol: "ELC", name: "ELC Corp", price: "₫28.200", changePct: "+0,72%", up: true },
      { symbol: "VNG", name: "VNG Corp", price: "₫94.800", changePct: "-0,63%", up: false },
    ],
  },
  VIC: {
    symbol: "VIC", name: "Vingroup", sector: "Bất động sản", exchange: "HOSE",
    price: "₫45.200", priceNum: 45200,
    changeAbs: "+₫1.400", changePct: "+3,19%", up: true, updatedAt: "14:30 ICT",
    caps: "156,8T₫", pe: "18,2x", eps: "₫2.484", volume: "3,10M", high52w: "₫56.000", low52w: "₫34.000",
    hook: "Vingroup tăng tốc mảng bất động sản nghỉ dưỡng — 3 dự án mới vừa được phê duyệt tại Phú Quốc và Đà Nẵng, hút dòng tiền khối ngoại mạnh.",
    relatedSymbols: [
      { symbol: "NVL", name: "Novaland", price: "₫12.400", changePct: "+1,23%", up: true },
      { symbol: "DXG", name: "Đất Xanh", price: "₫16.800", changePct: "+2,43%", up: true },
      { symbol: "KDH", name: "Khang Điền", price: "₫32.500", changePct: "-0,46%", up: false },
    ],
  },
};

const DEFAULT_STOCK: StockData = {
  symbol: "N/A", name: "Unknown Stock", sector: "—", exchange: "—",
  price: "—", priceNum: 0,
  changeAbs: "—", changePct: "—", up: true, updatedAt: "—",
  caps: "—", pe: "—", eps: "—", volume: "—", high52w: "—", low52w: "—",
  hook: "Không có thông tin về cổ phiếu này.",
  relatedSymbols: [],
};

const CHART_DATA: Record<TimeRange, number[]> = {
  "1N": [86200, 86500, 86800, 87200, 87800, 87400, 87900, 88200, 88000, 87700, 88000],
  "1W": [85000, 85800, 86400, 86200, 87000, 87500, 88000],
  "1T": [80000, 81200, 82500, 83800, 84200, 85000, 86000, 87200, 88000],
  "3T": [75000, 77500, 79000, 80500, 82000, 83500, 85000, 86200, 88000],
  "6T": [70000, 72000, 74500, 76000, 78000, 80000, 82000, 84500, 86000, 88000],
  "1Y": [65000, 67000, 69000, 72000, 75000, 78000, 80000, 83000, 85000, 87000, 88000],
};

function LineChart({
  data,
  up,
}: {
  data: number[];
  up: boolean;
}) {
  const W = 375;
  const H = 200;
  const PAD_T = 16;
  const PAD_B = 24;
  const PAD_L = 4;
  const PAD_R = 48;

  const chartH = H - PAD_T - PAD_B;
  const chartW = W - PAD_L - PAD_R;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD_T + chartH - ((v - min) / range) * chartH;

  const pts = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(" ");
  const fill = `${pts} ${toX(data.length - 1).toFixed(1)},${H - PAD_B} ${PAD_L},${H - PAD_B}`;

  const color = up ? "#10B981" : "#EF4444";
  const fillColor = up ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)";

  const labelY = [min, (min + max) / 2, max];
  const formatK = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n.toString();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      aria-hidden
      className="overflow-visible"
    >
      <polyline points={fill} fill={fillColor} stroke="none" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {labelY.map((v, i) => (
        <text
          key={i}
          x={W - PAD_R + 6}
          y={toY(v) + 4}
          fill="#7A7777"
          fontSize="10"
          fontFamily="var(--font-space-grotesk)"
        >
          {formatK(v)}
        </text>
      ))}
    </svg>
  );
}

export function StockDetailView({ ticker }: { ticker: string }) {
  const stock = STOCKS_DB[ticker.toUpperCase()] ?? { ...DEFAULT_STOCK, symbol: ticker.toUpperCase() };
  const [timeRange, setTimeRange] = useState<TimeRange>("1N");
  const [watched, setWatched] = useState(false);
  const [alerted, setAlerted] = useState(false);
  const [hookExpanded, setHookExpanded] = useState(false);

  const chartData = CHART_DATA[timeRange];
  const chartUp = chartData[chartData.length - 1] >= chartData[0];

  const STATS = [
    { label: "Vốn hóa", value: stock.caps },
    { label: "P/E", value: stock.pe },
    { label: "EPS", value: stock.eps },
    { label: "KL giao dịch", value: stock.volume },
    { label: "52T cao nhất", value: stock.high52w },
    { label: "52T thấp nhất", value: stock.low52w },
  ];

  return (
    <main className="relative min-h-screen bg-ink-900 pb-44">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-edge bg-ink-900/90 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/discover"
          aria-label="Go back"
          className="grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-fog transition-colors hover:text-lime-soft"
        >
          <ArrowLeft className="size-4" strokeWidth={2} />
        </Link>
        <span className="font-display text-[17px] font-semibold text-lime-soft">
          {stock.symbol}
        </span>
        <div className="flex gap-2">
          <button
            aria-label="Share"
            className="grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-fog transition-colors hover:text-lime-soft"
          >
            <Share2 className="size-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => setAlerted((v) => !v)}
            aria-label={alerted ? "Remove alert" : "Set price alert"}
            className={cn(
              "grid size-10 place-items-center rounded-full border transition-colors",
              alerted
                ? "border-plasma/40 bg-plasma/15 text-plasma"
                : "border-edge bg-ink-800/60 text-fog hover:text-lime-soft",
            )}
          >
            {alerted ? (
              <Bell className="size-4 fill-plasma" strokeWidth={2} />
            ) : (
              <BellOff className="size-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </header>

      <section className="mx-4 mt-5">
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-full border border-edge bg-ink-600 font-display text-[14px] font-bold text-lime-soft">
            {stock.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-display text-[18px] font-bold text-lime-soft">
              {stock.name}
            </p>
            <p className="font-body text-[13px] text-fog">
              {stock.sector} · {stock.exchange}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <p className="font-display text-[32px] font-bold tabular-nums text-lime-soft leading-tight">
            {stock.price}
          </p>
          <div className="mb-0.5">
            <span
              className={cn(
                "font-display text-[14px] font-semibold tabular-nums",
                stock.up ? "text-positive" : "text-negative",
              )}
            >
              {stock.changeAbs} ({stock.changePct})
            </span>
          </div>
        </div>
        <p className="mt-1 font-body text-[12px] text-fog-muted">
          Cập nhật {stock.updatedAt}
        </p>
      </section>

      <section className="mt-5">
        <div className="flex items-center gap-1 border-b border-edge px-4">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={cn(
                "flex-1 pb-2.5 font-display text-[12px] font-semibold uppercase tracking-pulse transition-all duration-150",
                timeRange === r
                  ? "border-b-2 border-lime text-lime-soft"
                  : "text-fog",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="mt-2 w-full overflow-hidden">
          <LineChart data={chartData} up={chartUp} />
        </div>
      </section>

      <section className="mx-4 mt-6">
        <h2 className="mb-3 font-display text-[13px] uppercase tracking-drop text-lime-soft">
          Thông tin cổ phiếu
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {STATS.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-edge bg-ink-800/60 px-4 py-3"
            >
              <p className="font-display text-[11px] uppercase tracking-pulse text-fog">
                {label}
              </p>
              <p className="mt-1.5 font-display text-[16px] font-semibold tabular-nums text-lime-soft">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-6 rounded-3xl border border-edge bg-ink-800/60 p-5 backdrop-blur">
        <div className="mb-2 flex items-center gap-1.5">
          <Zap className="size-4 text-plasma" strokeWidth={2.5} />
          <h2 className="font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Tại sao đang hot?
          </h2>
        </div>
        <p
          className={cn(
            "font-body text-[14px] leading-[1.6] text-lime-soft/80",
            !hookExpanded && "line-clamp-4",
          )}
        >
          {stock.hook}
        </p>
        <button
          onClick={() => setHookExpanded((v) => !v)}
          className="mt-2 font-display text-[11px] uppercase tracking-pulse text-plasma"
        >
          {hookExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
        <p className="mt-3 font-body text-[11px] text-fog-muted">
          Phân tích bởi Paave · 07/05/2026
        </p>
      </section>

      {stock.relatedSymbols.length > 0 && (
        <section className="mt-6">
          <h2 className="mx-4 mb-3 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Cùng ngành
          </h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
            {stock.relatedSymbols.map((r) => (
              <Link
                key={r.symbol}
                href={`/stock/${r.symbol}`}
                className="shrink-0 rounded-2xl border border-edge bg-ink-800/60 px-4 py-3 backdrop-blur transition-colors hover:bg-ink-700"
              >
                <div className="mb-2 grid size-8 place-items-center rounded-full border border-edge bg-ink-600 font-display text-[11px] font-bold text-lime-soft">
                  {r.symbol.slice(0, 2)}
                </div>
                <p className="font-display text-[13px] font-semibold text-lime-soft">
                  {r.symbol}
                </p>
                <p className="mt-0.5 font-body text-[11px] text-fog truncate max-w-[80px]">
                  {r.name}
                </p>
                <p className="mt-1.5 font-display text-[13px] font-semibold tabular-nums text-lime-soft">
                  {r.price}
                </p>
                <p
                  className={cn(
                    "font-display text-[11px] tabular-nums",
                    r.up ? "text-positive" : "text-negative",
                  )}
                >
                  {r.changePct}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-16 z-20 mx-auto max-w-[896px] border-t border-edge bg-ink-900/95 px-4 py-3 backdrop-blur-xl">
        <div className="flex gap-3">
          <button
            onClick={() => setWatched((v) => !v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3.5 font-display text-[13px] uppercase tracking-pulse transition-all duration-150 active:scale-[0.98]",
              watched
                ? "border-plasma/40 bg-plasma/15 text-plasma"
                : "border-edge bg-ink-800/60 text-fog hover:text-lime-soft",
            )}
          >
            {watched ? (
              <BookmarkCheck className="size-4" strokeWidth={2.5} />
            ) : (
              <Bookmark className="size-4" strokeWidth={2} />
            )}
            {watched ? "Đang theo dõi" : "Theo dõi"}
          </button>
          <button
            onClick={() => setAlerted((v) => !v)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3.5 font-display text-[13px] uppercase tracking-pulse transition-all duration-150 active:scale-[0.98]",
              alerted
                ? "border-plasma/40 bg-plasma/15 text-plasma"
                : "border-edge bg-ink-800/60 text-fog hover:text-lime-soft",
            )}
          >
            <Bell className={cn("size-4", alerted && "fill-plasma")} strokeWidth={2} />
            {alerted ? "Đang theo dõi giá" : "Cài đặt cảnh báo"}
          </button>
        </div>
      </div>

      <PaaveNav />
    </main>
  );
}
