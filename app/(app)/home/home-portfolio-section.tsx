// Portfolio hero card and quick-action grid for the Home tab.
// All pure display; data is fed in as props from HomeView via useHomeData.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpen, Compass, MessageSquare, TrendingDown, Wallet } from "lucide-react";
import { useChatSheet } from "@/lib/ai/chat-context";
import { formatVND, pctLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PortfolioSummary {
  totalEquity: number;
  totalPL: number;
  totalPLPct: number;
  cashBalance: number;
  holdingsValue: number;
  positionCount: number;
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const toneCls =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "text-lime-soft";
  return (
    <div className="rounded-2xl bg-ink-600/60 px-4 py-3">
      <dt className="font-display text-[11px] uppercase tracking-pulse text-fog">
        {label}
      </dt>
      <dd className={cn("mt-1 font-display text-[16px] tabular-nums", toneCls)}>
        {value}
      </dd>
    </div>
  );
}

export function PortfolioHero({
  name,
  data,
  isLoading,
  isAuthenticated,
}: {
  name: string;
  data: PortfolioSummary | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}) {
  const isUp = data ? data.totalPL >= 0 : true;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-[32px] bg-ink-800 px-7 pb-7 pt-8 space-y-3 animate-pulse">
        <div className="h-3 w-40 rounded bg-ink-700" />
        <div className="h-12 w-56 rounded-xl bg-ink-700" />
        <div className="h-7 w-44 rounded-full bg-ink-700" />
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-ink-600/60 p-3 space-y-1.5">
              <div className="h-2.5 w-12 rounded bg-ink-700" />
              <div className="h-4 w-16 rounded bg-ink-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/portfolio"
      aria-label="Xem danh mục đầu tư"
      className="group relative block overflow-hidden rounded-[32px] bg-ink-800 px-7 pb-7 pt-8 transition-opacity hover:opacity-90 active:scale-[0.99]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-lime/10 blur-3xl"
      />

      <p className="font-display text-[12px] uppercase tracking-pulse text-fog">
        Danh mục của {name}
      </p>

      {data ? (
        <>
          <p className="mt-2 font-display text-[40px] font-bold leading-[1.05] tracking-display tabular-nums text-lime-soft">
            {formatVND(data.totalEquity)}
          </p>

          <div
            className={cn(
              "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1",
              isUp ? "bg-positive/15" : "bg-negative/15",
            )}
          >
            {isUp ? (
              <ArrowUpRight className="size-3.5 text-positive" strokeWidth={2.5} aria-hidden />
            ) : (
              <TrendingDown className="size-3.5 text-negative" strokeWidth={2.5} aria-hidden />
            )}
            <span
              className={cn(
                "font-display text-[13px] tabular-nums",
                isUp ? "text-positive" : "text-negative",
              )}
            >
              {isUp ? "+" : ""}
              {formatVND(data.totalPL)} · {pctLabel(data.totalPLPct)}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            <MiniStat label="Đầu tư" value={formatVND(data.holdingsValue)} />
            <MiniStat
              label="Lãi/lỗ"
              value={`${isUp ? "+" : ""}${formatVND(data.totalPL)}`}
              tone={isUp ? "positive" : "negative"}
            />
            <MiniStat label="Vị thế" value={String(data.positionCount)} />
          </dl>
        </>
      ) : (
        <p className="mt-4 font-display text-[15px] text-fog">
          {isAuthenticated
            ? "Đặt lệnh đầu tiên để bắt đầu danh mục của bạn."
            : "Đăng nhập để xem danh mục."}
        </p>
      )}
    </Link>
  );
}

export function QuickActions() {
  const { open: openChat } = useChatSheet();
  const router = useRouter();

  const actions = [
    { label: "Khám phá", icon: Compass, tone: "lime" as const, onClick: () => router.push("/discover") },
    { label: "Học tập", icon: BookOpen, tone: "lime" as const, onClick: () => router.push("/grow") },
    { label: "Hỏi AI", icon: MessageSquare, tone: "plasma" as const, onClick: () => openChat({ language: "vi" }) },
    { label: "Danh mục", icon: Wallet, tone: "plasma" as const, onClick: () => router.push("/portfolio") },
  ];

  return (
    <section aria-label="Quick actions" className="grid grid-cols-4 gap-3">
      {actions.map(({ label, icon: Icon, tone, onClick }) => (
        <button
          key={label}
          onClick={onClick}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-edge bg-ink-800/60 px-3 py-4 backdrop-blur transition-all hover:bg-ink-700 active:scale-[0.98]"
        >
          <span
            className={cn(
              "grid size-10 place-items-center rounded-xl",
              tone === "lime"
                ? "bg-lime-drop text-lime-ink"
                : "bg-plasma-drop text-white",
            )}
          >
            <Icon className="size-4" strokeWidth={2.25} />
          </span>
          <span className="font-display text-[11px] uppercase tracking-pulse text-lime-soft">
            {label}
          </span>
        </button>
      ))}
    </section>
  );
}
