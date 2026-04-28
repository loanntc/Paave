import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbProps {
  items: readonly BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("inline-flex items-center gap-2 text-[13px]", className)}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={`${item.label}-${idx}`} className="inline-flex items-center gap-2">
            {isLast ? (
              <span className="text-lime-signal-400 font-semibold inline-flex items-center gap-1">
                {item.icon}
                {item.label}
              </span>
            ) : (
              <a
                href={item.href ?? "#"}
                className="text-text-neo-tertiary hover:text-text-neo-primary inline-flex items-center gap-1"
              >
                {item.icon}
                {item.label}
              </a>
            )}
            {!isLast && <span className="text-text-neo-tertiary opacity-60">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
