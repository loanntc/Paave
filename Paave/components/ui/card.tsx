import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardState = "default" | "pressed" | "selected";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  state?: CardState;
}

const stateStyles: Record<CardState, string> = {
  default:  "bg-ink-violet-raised border-border-neo",
  pressed:  "bg-ink-violet-hover border-border-neo",
  selected: "bg-ink-violet-raised border-lime-signal-400 border-2 shadow-card-raised",
};

export function Card({ className, state = "default", children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "border rounded-md-neo p-4",
        "transition-[transform,background] duration-[var(--duration-instant)] ease-[var(--ease-sharp)]",
        "active:scale-[0.97]",
        stateStyles[state],
        className,
      )}
    >
      {children}
    </div>
  );
}
