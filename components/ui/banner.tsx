import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BannerVariant = "warning" | "info";

const variantStyles: Record<BannerVariant, string> = {
  warning: "bg-[rgba(255,138,91,0.16)] text-peach-streak-400 border border-[rgba(245,158,11,0.25)]",
  info:    "bg-[rgba(110,107,143,0.08)] text-text-neo-secondary border border-border-neo",
};

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BannerVariant;
  icon?: React.ReactNode;
}

export function Banner({ className, variant = "info", icon, children, ...props }: BannerProps) {
  return (
    <div
      {...props}
      className={cn(
        "flex gap-3 px-4 py-3 rounded-md-neo text-[12px] leading-relaxed",
        variantStyles[variant],
        className,
      )}
    >
      {icon && <span className="shrink-0 w-4 h-4 mt-0.5">{icon}</span>}
      <div>{children}</div>
    </div>
  );
}
