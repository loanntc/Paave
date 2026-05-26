import { cn } from "@/lib/utils";

export interface AIStep {
  label: string;
  body: string;
}

export interface AICardProps {
  title: string;
  steps?: AIStep[];
  children?: React.ReactNode;
  disclaimer?: string;
  className?: string;
}

export function AICard({ title, steps, children, disclaimer, className }: AICardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg-neo p-4",
        "bg-ink-violet-raised border border-border-neo",
        className,
      )}
    >
      {/* tri-colour top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, #B5E82F, #7F77DD, #FF8A5B)" }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 text-[11px] font-bold tracking-[0.8px] uppercase text-violet-deep-400">
        <span
          className="relative w-3.5 h-3.5 rounded-[3px] inline-block"
          style={{ background: "linear-gradient(135deg, #B5E82F, #7F77DD)" }}
          aria-hidden
        >
          <span className="absolute inset-0 grid place-items-center text-[10px] text-white">✦</span>
        </span>
        {title}
      </div>

      {/* Steps */}
      {steps?.map((step, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-3 py-3",
            i < steps.length - 1 && "border-b border-dashed border-border-neo-subtle",
          )}
        >
          <div className="w-5 h-5 shrink-0 mt-0.5 rounded-full grid place-items-center text-[11px] font-bold text-violet-deep-400 bg-[rgba(83,74,183,0.22)]">
            {i + 1}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.5px] text-text-neo-tertiary font-semibold mb-0.5">
              {step.label}
            </div>
            <div className="text-[13px] leading-relaxed text-text-neo-primary">{step.body}</div>
          </div>
        </div>
      ))}

      {/* Freeform content */}
      {children}

      {/* Disclaimer */}
      {disclaimer && (
        <p className="text-[10px] text-text-neo-tertiary leading-snug pt-3 mt-2 border-t border-border-neo-subtle">
          {disclaimer}
        </p>
      )}
    </div>
  );
}
