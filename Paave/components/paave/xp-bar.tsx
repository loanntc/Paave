import { cn } from "@/lib/utils";

export interface XPBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function XPBar({ value, max = 100, className }: XPBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn(
        "relative h-[10px] rounded-full bg-ink-violet-surface overflow-hidden",
        className,
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, #B5E82F, #FF8A5B)",
        }}
      />
    </div>
  );
}
