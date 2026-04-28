"use client";

import { useEffect, useState, Fragment } from "react";
import { DS_NAV } from "../_data/nav";
import { cn } from "@/lib/utils";

export function DSSidebar() {
  const [active, setActive] = useState<string>(DS_NAV[0]?.items[0]?.id ?? "");

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".ds-section[id]"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 1] },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.pageYOffset - 24,
      behavior: "smooth",
    });
  };

  return (
    <aside className="ds-sidebar">
      <div className="ds-brandmark">
        <div className="mark">P</div>
        <div>
          <div className="wordmark">Paave</div>
          <div className="tag">Design System · v2</div>
        </div>
      </div>
      <nav className="ds-nav" aria-label="Design system">
        {DS_NAV.map((group) => (
          <Fragment key={group.group}>
            <div className="ds-nav-section">{group.group}</div>
            {group.items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.id);
                }}
                className={cn(active === item.id && "active")}
              >
                <span className="num">{item.num}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </Fragment>
        ))}
      </nav>
      <div className="ds-sidebar-foot">Updated April 2026 · Paave guild</div>
    </aside>
  );
}
