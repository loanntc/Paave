import { cn } from "@/lib/utils";

export interface SentimentMeterProps {
  bull: number;
  neutral: number;
  bear: number;
  label?: string;
  subtitle?: string;
  className?: string;
}

export function SentimentMeter({ bull, neutral, bear, label, subtitle, className }: SentimentMeterProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {(label || subtitle) && (
        <div className="flex justify-between items-center">
          {label   && <span className="type-title-sm">{label}</span>}
          {subtitle && <span className="type-caption text-text-neo-tertiary">{subtitle}</span>}
        </div>
      )}

      <div className="flex rounded-full overflow-hidden h-3 bg-ink-violet-surface">
        <div style={{ width: `${bull}%`, background: "#B5E82F" }} />
        <div style={{ width: `${neutral}%`, background: "#7F77DD" }} />
        <div style={{ width: `${bear}%`, background: "#FF5B7A" }} />
      </div>

      <div className="flex gap-4 text-[12px]">
        <span className="text-lime-signal-400">● Bull {bull}%</span>
        <span className="text-ink-violet-muted">● Neutral {neutral}%</span>
        <span className="text-negative">● Bear {bear}%</span>
      </div>
    </div>
  );
}
