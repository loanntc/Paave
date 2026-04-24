"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

export function SplashView() {
  const [pct, setPct] = useState(12);

  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => (p >= 73 ? 73 : p + 2));
    }, 80);
    return () => clearInterval(t);
  }, []);

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 50% 0%, rgba(127,119,221,0.10) 0%, transparent 60%),
          radial-gradient(ellipse 50% 35% at 50% 100%, rgba(181,232,47,0.04) 0%, transparent 60%),
          #07070C
        `,
      }}
    >
      {/* Status bar */}
      <div className="flex justify-between px-6 pt-14 text-xs font-bold text-white" style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="10" viewBox="0 0 16 10"><rect x="0" y="6" width="2.5" height="4" rx="0.5" fill="currentColor" /><rect x="3.5" y="4" width="2.5" height="6" rx="0.5" fill="currentColor" /><rect x="7" y="2" width="2.5" height="8" rx="0.5" fill="currentColor" /><rect x="10.5" y="0" width="2.5" height="10" rx="0.5" fill="currentColor" /></svg>
          <svg width="14" height="10" viewBox="0 0 16 10"><path d="M8 3c2 0 3.5 0.8 4.8 2L14 3.8C12.3 2.2 10.3 1 8 1S3.7 2.2 2 3.8L3.2 5C4.5 3.8 6 3 8 3z" fill="currentColor" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></svg>
          <svg width="22" height="10" viewBox="0 0 24 10"><rect x="0.5" y="0.5" width="20" height="9" rx="2" stroke="currentColor" fill="none" opacity="0.4" /><rect x="2" y="2" width="16" height="6" rx="1" fill="currentColor" /><rect x="21" y="3" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.4" /></svg>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        {/* Logo card */}
        <div
          className="relative mb-6 inline-flex items-center justify-center rounded-[20px] px-8 py-6"
          style={{
            background: `
              radial-gradient(ellipse at 50% 50%, rgba(181,232,47,0.15) 0%, transparent 60%),
              linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))
            `,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Grid bg */}
          <div
            className="absolute inset-0 rounded-[20px]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
              opacity: 0.5,
            }}
          />
          <span
            className="relative text-5xl font-black italic"
            style={{
              fontFamily: "var(--font-be-vietnam-pro), sans-serif",
              color: "#E8E6F5",
              textShadow: "0 0 24px rgba(181,232,47,0.3), 2px 2px 0 rgba(127,119,221,0.4)",
              letterSpacing: "-0.02em",
            }}
          >
            PAAVE
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mb-3"
          style={{
            fontFamily: "var(--font-be-vietnam-pro), sans-serif",
            fontWeight: 900,
            fontSize: 26,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Luyện tập. Giao dịch.{" "}
          <span
            style={{
              textDecoration: "underline",
              textDecorationColor: "#B5E82F",
              textDecorationThickness: 3,
              textUnderlineOffset: 4,
            }}
          >
            Thăng hạng.
          </span>
        </h1>

        <p className="mb-2 text-sm leading-relaxed" style={{ color: "#A6A2C7", padding: "0 20px" }}>
          Sàn giao dịch ảo cho thế hệ đầu tư mới.<br />
          ₫500 triệu vốn ảo · không rủi ro tiền thật.
        </p>
      </div>

      {/* Sync bar */}
      <div className="px-5 pb-2">
        <div
          className="mb-2 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span className="text-[#B5E82F]" style={{ filter: "drop-shadow(0 0 4px #B5E82F)" }}>
            <Bolt size={12} />
          </span>
          <span className="flex-1 text-xs font-semibold" style={{ color: "#A6A2C7", fontFamily: "var(--font-be-vietnam-pro)" }}>
            Đang đồng bộ dữ liệu thị trường
          </span>
          <span className="text-xs font-bold" style={{ color: "#B5E82F", fontFamily: "var(--font-jetbrains-mono)" }}>
            {pct}%
          </span>
        </div>
        <div className="mx-0 mb-4 h-0.5 overflow-hidden rounded" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded transition-[width] duration-200"
            style={{ width: `${pct}%`, background: "#B5E82F", boxShadow: "0 0 8px #B5E82F" }}
          />
        </div>

        {/* CTA */}
        <Link href="/welcome" className="block">
          <button
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-[14px] text-sm font-bold"
            style={{
              height: 54,
              background: "#B5E82F",
              color: "#0B0A1A",
              fontFamily: "var(--font-be-vietnam-pro)",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 0 0 1px rgba(181,232,47,0.2), 0 8px 24px rgba(181,232,47,0.18)",
            }}
          >
            <Bolt size={12} />
            Bắt đầu
          </button>
        </Link>

        {/* Meta foot */}
        <div
          className="flex items-center justify-between border-t px-0 pb-8 pt-3 text-[11px]"
          style={{
            borderColor: "rgba(255,255,255,0.04)",
            color: "#6E6B8F",
            fontFamily: "var(--font-be-vietnam-pro)",
          }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "#B5E82F", boxShadow: "0 0 6px #B5E82F" }}
            />
            Mã hoá AES-256
          </span>
          <span>v1.0 · Tiếng Việt · 한국어</span>
        </div>
      </div>
    </main>
  );
}
