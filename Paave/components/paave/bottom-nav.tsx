"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex justify-around items-stretch",
        "bg-ink-violet-raised border-t border-border-neo",
        "h-16 safe-area-pb",
        className,
      )}
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-1",
              "text-[10px] tracking-[0.4px] font-medium",
              "transition-colors duration-[var(--duration-fast)]",
              active ? "text-lime-signal-400" : "text-text-neo-tertiary",
            )}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-sm bg-lime-signal-400" />
            )}
            <span className="w-[22px] h-[22px] grid place-items-center">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
