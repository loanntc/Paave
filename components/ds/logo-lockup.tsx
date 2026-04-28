import { cn } from "@/lib/utils";

export type LogoSize = "sm" | "md" | "lg";
export type LogoSurface = "dark" | "light" | "lime" | "violet";

const markSize: Record<LogoSize, string> = {
  sm: "w-7 h-7 rounded-lg text-[14px]",
  md: "w-11 h-11 rounded-[11px] text-[22px]",
  lg: "w-16 h-16 rounded-2xl text-[32px]",
};

const wordSize: Record<LogoSize, string> = {
  sm: "text-[16px]",
  md: "text-[26px]",
  lg: "text-[40px]",
};

export interface LogoLockupProps {
  size?: LogoSize;
  surface?: LogoSurface;
  className?: string;
}

export function LogoLockup({ size = "md", surface = "dark", className }: LogoLockupProps) {
  const onLight = surface === "light" || surface === "lime";

  const markClass = cn(
    "grid place-items-center font-black tracking-tight",
    markSize[size],
    onLight
      ? "bg-ink-violet-base text-lime-signal-400"
      : surface === "violet"
        ? "bg-lime-signal-400 text-ink-violet-base"
        : "bg-gradient-lime text-ink-violet-base shadow-[0_0_20px_rgba(181,232,47,0.45)]",
  );

  const wordClass = cn(
    "font-extrabold tracking-tight",
    wordSize[size],
    onLight ? "text-ink-violet-base" : "text-text-neo-primary",
  );

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className={markClass}>P</div>
      <div className={wordClass}>paave</div>
    </div>
  );
}
