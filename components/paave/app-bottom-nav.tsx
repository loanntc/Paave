"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Compass,
  Home as HomeIcon,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Coming-soon tabs render as a non-interactive button */
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/home", icon: HomeIcon },
  { label: "Danh mục", href: "/portfolio", icon: BarChart2 },
  { label: "Khám phá", href: "/discover", icon: Compass },
  { label: "Hồ sơ",   href: "/profile",  icon: User },
];

// ---------------------------------------------------------------------------
// AppBottomNav
// ---------------------------------------------------------------------------
/**
 * Persistent bottom navigation bar mounted in (app)/layout.tsx.
 * Uses `usePathname` for active-state detection so it works on every route.
 * Disabled items are rendered as non-interactive buttons with reduced opacity.
 */
export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30",
        "flex items-stretch justify-around",
        "h-16 safe-area-pb",
        "bg-ink-violet-raised/95 backdrop-blur-xl border-t border-border-neo",
        // centre-cap on wide screens — matches the max-w used on home & portfolio
        "mx-auto max-w-[896px]",
      )}
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon, disabled }) => {
        const active =
          !disabled &&
          (pathname === href || pathname.startsWith(href + "/"));

        if (disabled) {
          return (
            <span
              key={label}
              aria-disabled="true"
              className="relative flex flex-1 flex-col items-center justify-center gap-[3px] opacity-30 select-none"
            >
              <Icon className="size-[22px]" strokeWidth={2} />
              <span className="text-[10px] font-medium tracking-[0.4px] text-text-neo-tertiary">
                {label}
              </span>
            </span>
          );
        }

        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-[3px]",
              "transition-colors duration-[var(--duration-fast)]",
              active
                ? "text-lime-signal-400"
                : "text-text-neo-tertiary hover:text-text-neo-secondary",
            )}
          >
            {/* Active indicator — thin bar at the top of the tab */}
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-6 rounded-b bg-lime-signal-400" />
            )}
            <Icon
              className="size-[22px]"
              strokeWidth={active ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium tracking-[0.4px]">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
