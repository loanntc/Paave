"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Flame, SlidersHorizontal, Zap } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveNav } from "@/components/paave/paave-nav";
import { Sparkline } from "@/components/paave/sparkline";
import { cn } from "@/lib/utils";

const THEMES = [
  "Tất cả",
  "Công nghệ",
  "Ngân hàng",
  "Bất động sản",
  "Năng lượng xanh",
  "Tiêu dùng",
  "Dược phẩm",
  "Sản xuất",
];

type Stock = {
  symbol: string;
  name: string;
  exchange: string;
  price: string;
  changeAbs: string;
  changePct: string;
  up: boolean;
  hook: string;
  watchers: number;
  caps: string;
  pe: string;
  volume: string;
  theme: string;
  tag: string;
};

const STOCKS: Stock[] = [
  {
    symbol: "VCB",
    name: "Vietcombank",
    exchange: "HOSE",
    price: "₫88.000",
    changeAbs: "+₫1.800",
    changePct: "+2,15%",
    up: true,
    hook: "Vietcombank ghi nhận lợi nhuận quý cao nhất từ trước đến nay, với ROE vượt 18%. Tín dụng tư nhân tăng mạnh trong bối cảnh lãi suất hạ nhiệt.",
    watchers: 47,
    caps: "123,4T₫",
    pe: "12,5x",
    volume: "1,24M",
    theme: "Ngân hàng",
    tag: "Quarterly Beat",
  },
  {
    symbol: "VIC",
    name: "Vingroup",
    exchange: "HOSE",
    price: "₫45.200",
    changeAbs: "+₫1.400",
    changePct: "+3,19%",
    up: true,
    hook: "Vingroup tăng tốc mảng bất động sản nghỉ dưỡng — 3 dự án mới vừa được phê duyệt tại Phú Quốc và Đà Nẵng, hút dòng tiền khối ngoại mạnh.",
    watchers: 63,
    caps: "156,8T₫",
    pe: "18,2x",
    volume: "3,10M",
    theme: "Bất động sản",
    tag: "Land Rush",
  },
  {
    symbol: "FPT",
    name: "FPT Corporation",
    exchange: "HOSE",
    price: "₫121.500",
    changeAbs: "+₫2.500",
    changePct: "+2,10%",
    up: true,
    hook: "FPT ký hợp đồng AI với 5 tập đoàn Nhật Bản — doanh thu phần mềm nước ngoài tăng 28% YoY. Đây là mức tăng trưởng mạnh nhất từ 2020.",
    watchers: 89,
    caps: "72,3T₫",
    pe: "22,1x",
    volume: "0,87M",
    theme: "Công nghệ",
    tag: "AI Wave",
  },
  {
    symbol: "HPG",
    name: "Hòa Phát Group",
    exchange: "HOSE",
    price: "₫26.100",
    changeAbs: "-₫400",
    changePct: "-1,51%",
    up: false,
    hook: "Giá thép HRC toàn cầu đi xuống do nhu cầu Trung Quốc yếu, ảnh hưởng biên lợi nhuận quý tới của Hòa Phát. Nhưng mảng thép cuộn nội địa vẫn tăng trưởng.",
    watchers: 31,
    caps: "59,4T₫",
    pe: "8,7x",
    volume: "5,22M",
    theme: "Sản xuất",
    tag: "Global Headwind",
  },
  {
    symbol: "MWG",
    name: "Mobile World",
    exchange: "HOSE",
    price: "₫52.400",
    changeAbs: "+₫1.100",
    changePct: "+2,14%",
    up: true,
    hook: "Chuỗi điện máy Thế Giới Di Động hồi phục mạnh nhờ tăng trưởng tiêu dùng và chiến lược đẩy mạnh sản phẩm mid-range. Kết quả Q1 vượt ước tính 15%.",
    watchers: 22,
    caps: "36,9T₫",
    pe: "14,3x",
    volume: "1,05M",
    theme: "Tiêu dùng",
    tag: "Consumer Rebound",
  },
  {
    symbol: "REE",
    name: "REE Corporation",
    exchange: "HOSE",
    price: "₫68.700",
    changeAbs: "+₫1.900",
    changePct: "+2,84%",
    up: true,
    hook: "REE dẫn đầu làn sóng năng lượng tái tạo Việt Nam — dự án điện gió 300MW tại Ninh Thuận sẽ đi vào hoạt động quý III. Điện mặt trời đóng góp 35% doanh thu.",
    watchers: 54,
    caps: "24,1T₫",
    pe: "11,6x",
    volume: "0,68M",
    theme: "Năng lượng xanh",
    tag: "Green Pulse",
  },
];

function ChangePill({ up, pct }: { up: boolean; pct: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-display text-[12px] font-semibold tabular-nums",
        up ? "bg-positive/15 text-positive" : "bg-negative/15 text-negative",
      )}
    >
      {pct}
    </span>
  );
}

function StockFeedCard({
  stock,
  watched,
  onWatch,
  onClick,
}: {
  stock: Stock;
  watched: boolean;
  onWatch: () => void;
  onClick: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="mx-4 mb-3 cursor-pointer overflow-hidden rounded-3xl border border-edge bg-ink-800/60 backdrop-blur transition-colors hover:bg-ink-700"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="grid size-11 shrink-0 place-items-center rounded-full border border-edge bg-ink-600 font-display text-[13px] font-bold text-lime-soft"
              aria-hidden
            >
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <p className="font-display text-[16px] font-semibold text-lime-soft">
                {stock.symbol}
              </p>
              <p className="font-body text-[12px] text-fog">
                {stock.name} · {stock.exchange}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onWatch(); }}
            aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
            className="grid size-10 shrink-0 place-items-center rounded-full transition-colors"
          >
            <Bookmark
              className={cn(
                "size-5",
                watched ? "fill-plasma text-plasma" : "text-fog",
              )}
              strokeWidth={2}
            />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <p className="font-display text-[24px] font-bold tabular-nums text-lime-soft">
            {stock.price}
          </p>
          <ChangePill up={stock.up} pct={stock.changePct} />
        </div>

        <div className="mt-3">
          <Sparkline up={stock.up} width={320} height={40} />
        </div>

        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Zap className="size-3 text-plasma" strokeWidth={2.5} />
            <span className="font-display text-[11px] uppercase tracking-pulse text-fog">
              Vì sao đang hot?
            </span>
          </div>
          <p
            className={cn(
              "font-body text-[13px] leading-[1.55] text-lime-soft/80",
              !expanded && "line-clamp-3",
            )}
          >
            {stock.hook}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className="mt-1 font-display text-[11px] uppercase tracking-pulse text-plasma"
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Vốn hóa", value: stock.caps },
            { label: "P/E", value: stock.pe },
            { label: "KL GD", value: stock.volume },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-ink-600/60 px-3 py-2"
            >
              <p className="font-display text-[10px] uppercase tracking-pulse text-fog">
                {label}
              </p>
              <p className="mt-1 font-display text-[14px] font-semibold tabular-nums text-lime-soft">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          {stock.watchers >= 5 && (
            <span className="font-body text-[11px] text-fog">
              🔥 {stock.watchers} người đang xem
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-plasma/15 px-3 py-1 font-display text-[11px] uppercase tracking-pulse text-plasma">
            <Flame className="size-3" strokeWidth={2.5} />
            {stock.tag}
          </span>
        </div>
      </div>
    </article>
  );
}

export function DiscoverView() {
  const router = useRouter();
  const [activeTheme, setActiveTheme] = useState("Tất cả");
  const [watched, setWatched] = useState<Set<string>>(new Set());

  const filtered =
    activeTheme === "Tất cả"
      ? STOCKS
      : STOCKS.filter((s) => s.theme === activeTheme);

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <header className="relative z-20 px-6 pt-14 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[20px] font-bold text-lime-soft">
            Khám phá
          </h1>
          <button
            aria-label="Open filter"
            className="grid size-10 place-items-center rounded-full border border-edge bg-ink-800/60 text-fog backdrop-blur transition-colors hover:text-lime-soft"
          >
            <SlidersHorizontal className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 font-display text-[12px] uppercase tracking-pulse transition-all duration-150",
                activeTheme === theme
                  ? "bg-lime/20 text-lime border border-lime/40"
                  : "border border-edge bg-ink-800/60 text-fog hover:text-lime-soft",
              )}
            >
              {theme}
            </button>
          ))}
        </div>
      </header>

      <section className="relative z-10 mt-2">
        {filtered.length === 0 ? (
          <div className="mx-4 mt-16 flex flex-col items-center gap-3 rounded-3xl border border-edge bg-ink-800/60 p-10">
            <p className="font-display text-[16px] font-semibold text-lime-soft">
              Không có cổ phiếu nào
            </p>
            <p className="font-body text-[13px] text-fog">
              Thử chọn chủ đề khác
            </p>
            <button
              onClick={() => setActiveTheme("Tất cả")}
              className="mt-2 rounded-full bg-lime/20 px-4 py-1.5 font-display text-[12px] uppercase tracking-pulse text-lime"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          filtered.map((stock) => (
            <StockFeedCard
              key={stock.symbol}
              stock={stock}
              watched={watched.has(stock.symbol)}
              onClick={() => router.push(`/stock/${stock.symbol}`)}
              onWatch={() => {
                setWatched((prev) => {
                  const next = new Set(prev);
                  next.has(stock.symbol)
                    ? next.delete(stock.symbol)
                    : next.add(stock.symbol);
                  return next;
                });
              }}
            />
          ))
        )}
      </section>

      <PaaveNav />
    </main>
  );
}
