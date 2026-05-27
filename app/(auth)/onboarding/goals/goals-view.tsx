"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

function getBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

const GOALS = [
  { i: "🎯", t: "Thi đấu & xếp hạng", d: "Giải đấu hàng tuần, leaderboard, thăng hạng trader." },
  { i: "🧠", t: "Hiểu thị trường", d: "Giao dịch ảo với AI giải thích từng quyết định." },
  { i: "📈", t: "Rèn kỷ luật đầu tư", d: "Streak hàng ngày, xây danh mục dài hạn." },
];

export function GoalsView() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    // Persist selected goal title to user_metadata for future personalisation
    const goalTitle = GOALS[selected]?.t ?? "";
    try {
      const db = getBrowserClient();
      await db.auth.updateUser({ data: { goal: goalTitle } });
    } catch {
      // Non-fatal — personalisation degrades silently
    }
    router.push("/onboarding/biometric");
  }

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 70% 50% at 50% 0%, rgba(127,119,221,0.10) 0%, transparent 60%),
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

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pb-2 pt-2">
        <Link href="/onboarding/interests" className="grid place-items-center rounded-lg" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="inline-grid place-items-center rounded-[5px]" style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}><Bolt size={10} /></span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>PAAVE</span>
        </div>
        <div className="text-[11px] font-semibold" style={{ color: "#6E6B8F" }}>5 / 5</div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 pt-2">
        <div className="mb-1.5 flex justify-between text-[11px] font-semibold" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
          <span>Bước 5 / 5</span>
          <span style={{ color: "#B5E82F" }}>Mục tiêu · 100%</span>
        </div>
        <div className="flex gap-1.5 h-[3px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ background: "#B5E82F", boxShadow: i === 5 ? "0 0 6px #B5E82F" : "none" }} />
          ))}
        </div>
      </div>

      {/* Headline */}
      <h1 className="px-5 pb-2" style={{ fontFamily: "var(--font-be-vietnam-pro)", fontWeight: 900, fontSize: 30, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
        Mục tiêu của bạn<br />
        <span style={{ color: "#B5E82F", textShadow: "0 0 12px rgba(181,232,47,0.25)" }}>với Paave là gì?</span>
      </h1>
      <p className="mb-5 px-5 text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
        Giao dịch ảo là trung tâm. Hãy chọn cách bạn muốn luyện tập.
      </p>

      {/* Goal cards */}
      <div className="mx-5 flex flex-col gap-2.5 mb-4">
        {GOALS.map((g, i) => {
          const on = selected === i;
          return (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="flex items-center gap-3 rounded-[14px] px-3 py-3 text-left"
              style={{
                background: on ? "rgba(181,232,47,0.08)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${on ? "#B5E82F" : "rgba(255,255,255,0.08)"}`,
                boxShadow: on ? "0 0 10px rgba(181,232,47,0.08)" : "none",
              }}
            >
              <div
                className="grid flex-shrink-0 place-items-center rounded-[10px] text-xl"
                style={{
                  width: 40, height: 40,
                  background: on ? "#B5E82F" : "rgba(255,255,255,0.06)",
                }}
              >
                {g.i}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold" style={{ color: on ? "#B5E82F" : "#E8E6F5", fontFamily: "var(--font-be-vietnam-pro)" }}>{g.t}</div>
                <div className="mt-0.5 text-[11px] leading-snug" style={{ color: "#A6A2C7" }}>{g.d}</div>
              </div>
              <div
                className="grid flex-shrink-0 place-items-center rounded-full"
                style={{
                  width: 18, height: 18,
                  border: `2px solid ${on ? "#B5E82F" : "rgba(255,255,255,0.2)"}`,
                }}
              >
                {on && <div className="rounded-full" style={{ width: 8, height: 8, background: "#B5E82F" }} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex-1" />

      {/* CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] font-bold"
          style={{
            height: 54,
            background: "#B5E82F",
            color: "#0B0A1A",
            fontFamily: "var(--font-be-vietnam-pro)",
            fontWeight: 700,
            fontSize: 15,
            boxShadow: "0 0 0 1px rgba(181,232,47,0.2), 0 8px 24px rgba(181,232,47,0.18)",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          <Bolt size={12} />
          {submitting ? "Đang xử lý…" : "Hoàn tất thiết lập"}
        </button>
      </div>
    </main>
  );
}
