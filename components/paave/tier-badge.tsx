import { cn } from "@/lib/utils";

export type TierLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface TierInfo {
  en: string;
  vi: string;
  ko: string;
  icon: string;
}

export const TIERS: Record<TierLevel, TierInfo> = {
  1: { en: "Seedling",  vi: "Mầm non",     ko: "새싹",    icon: "🌱" },
  2: { en: "Learner",   vi: "Người học",    ko: "입문자",  icon: "📘" },
  3: { en: "Investor",  vi: "Nhà đầu tư",   ko: "투자자",  icon: "💼" },
  4: { en: "Trader",    vi: "Trader",        ko: "트레이더", icon: "📈" },
  5: { en: "Expert",    vi: "Chuyên gia",    ko: "전문가",  icon: "🎯" },
  6: { en: "Legend",    vi: "Huyền thoại",  ko: "레전드",  icon: "👑" },
};

const tierStyles: Record<TierLevel, string> = {
  1: "bg-[rgba(209,242,122,0.18)] text-[#D1F27A]",
  2: "bg-[rgba(181,232,47,0.18)]  text-lime-signal-400",
  3: "bg-[rgba(127,119,221,0.22)] text-[#CECBF6]",
  4: "bg-[rgba(83,74,183,0.28)]   text-violet-deep-400",
  5: "bg-[rgba(255,138,91,0.20)]  text-peach-streak-400",
  6: "bg-gradient-to-r from-[rgba(181,232,47,0.25)] to-[rgba(255,138,91,0.25)] text-peach-streak-400 border border-[rgba(255,138,91,0.4)]",
};

export interface TierBadgeProps {
  level: TierLevel;
  showLocale?: "en" | "vi" | "ko";
  className?: string;
}

export function TierBadge({ level, showLocale = "en", className }: TierBadgeProps) {
  const tier = TIERS[level];
  const label = tier[showLocale];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-[11px] font-bold tracking-[0.3px]",
        tierStyles[level],
        className,
      )}
    >
      <span
        className="w-[18px] h-[18px] rounded-full grid place-items-center text-[10px] font-extrabold bg-white/15"
      >
        {level}
      </span>
      {label}
    </span>
  );
}
