"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Compass, Home, LineChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/markets", label: "Markets", icon: LineChart },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function PaaveNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[896px] items-center justify-around border-t border-edge bg-ink-900/90 px-4 pt-2 pb-6 backdrop-blur-xl"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-colors duration-150",
              active ? "text-lime-soft" : "text-fog hover:text-lime-soft",
            )}
          >
            <Icon
              className={cn("size-5", active ? "text-lime" : "text-fog")}
              strokeWidth={active ? 2.5 : 2}
            />
            <span className="font-display text-[10px] uppercase tracking-pulse">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
