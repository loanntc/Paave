import { cn } from "@/lib/utils";

export type SpinnerSize = "sm" | "md" | "lg";

const spinnerSize: Record<SpinnerSize, string> = {
  sm: "w-[18px] h-[18px] border-2",
  md: "w-7 h-7 border-[2.5px]",
  lg: "w-11 h-11 border-[3.5px]",
};

export function Spinner({ size = "md", className }: { size?: SpinnerSize; className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "ds-spinner rounded-full",
        "border-[rgba(181,232,47,0.18)] border-t-lime-signal-400",
        spinnerSize[size],
        className,
      )}
    />
  );
}

export function DotsLoading({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Thinking" className={cn("inline-flex gap-1.5", className)}>
      <span className="ds-dot block w-2 h-2 rounded-full bg-lime-signal-400" />
      <span className="ds-dot block w-2 h-2 rounded-full bg-lime-signal-400" />
      <span className="ds-dot block w-2 h-2 rounded-full bg-lime-signal-400" />
    </div>
  );
}

export interface ProgressLinearProps {
  value?: number;
  indeterminate?: boolean;
  className?: string;
}

export function ProgressLinear({ value, indeterminate, className }: ProgressLinearProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      className={cn("relative h-1 rounded-full bg-ink-violet-surface overflow-hidden", className)}
    >
      {indeterminate ? (
        <span
          aria-hidden
          className="ds-progress-fill absolute top-0 bottom-0 w-[30%] bg-lime-signal-400 rounded-full"
          style={{ left: "-30%" }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute top-0 bottom-0 left-0 bg-lime-signal-400 rounded-full transition-[width] duration-[var(--duration-standard)] ease-[var(--ease-decelerate)]"
          style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
        />
      )}
    </div>
  );
}

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "full";
  className?: string;
}

const skeletonRadius: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm:   "rounded-sm",
  md:   "rounded-md-neo",
  full: "rounded-full",
};

export function Skeleton({ width, height = 12, rounded = "sm", className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("skeleton", skeletonRadius[rounded], className)}
      style={{ width, height }}
    />
  );
}
