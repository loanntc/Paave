import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarTone = "lime" | "peach" | "violet" | "blush";
export type AvatarStatus = "online" | "away" | "off";

const sizeMap: Record<AvatarSize, string> = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-[28px]",
};

const toneMap: Record<AvatarTone, string> = {
  lime:   "bg-gradient-to-br from-lime-signal-400 to-lime-signal-600 text-ink-violet-base",
  peach:  "bg-gradient-to-br from-peach-streak-400 to-peach-streak-600 text-white",
  violet: "bg-gradient-to-br from-violet-deep-400 to-violet-deep-800 text-white",
  blush:  "bg-gradient-to-br from-peach-streak-200 to-peach-streak-400 text-ink-violet-base",
};

const statusMap: Record<AvatarStatus, string> = {
  online: "bg-lime-signal-400",
  away:   "bg-peach-streak-400",
  off:    "bg-text-neo-tertiary",
};

export interface AvatarProps {
  size?: AvatarSize;
  tone?: AvatarTone;
  initials?: string;
  status?: AvatarStatus;
  className?: string;
}

export function Avatar({ size = "md", tone = "lime", initials, status, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-grid place-items-center rounded-full font-bold shrink-0 overflow-visible",
        sizeMap[size],
        toneMap[tone],
        className,
      )}
    >
      {initials}
      {status && (
        <span
          aria-hidden
          className={cn(
            "absolute right-0 bottom-0 w-3 h-3 rounded-full border-2 border-ink-violet-raised",
            statusMap[status],
          )}
        />
      )}
    </span>
  );
}

export interface AvatarStackProps {
  children: ReactNode;
  more?: number;
  className?: string;
}

export function AvatarStack({ children, more, className }: AvatarStackProps) {
  return (
    <div className={cn("inline-flex [&>*+*]:-ml-2.5 [&>*]:ring-2 [&>*]:ring-ink-violet-base", className)}>
      {children}
      {more != null && more > 0 && (
        <span
          className={cn(
            "inline-grid place-items-center w-10 h-10 rounded-full",
            "bg-ink-violet-surface text-text-neo-secondary text-[11px] font-bold",
            "ring-2 ring-ink-violet-base",
          )}
        >
          +{more}
        </span>
      )}
    </div>
  );
}
