"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

const SECTORS = [
  { e: "💻", l: "Công nghệ" },
  { e: "🏦", l: "Ngân hàng" },
  { e: "🏘️", l: "Bất động sản" },
  { e: "🎵", l: "K-Pop · Giải trí" },
  { e: "🔋", l: "Năng lượng" },
  { e: "🛒", l: "Bán lẻ" },
  { e: "🏭", l: "Công nghiệp" },
  { e: "💊", l: "Dược phẩm" },
  { e: "🎮", l: "Trò chơi" },
];

export function InterestsView() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 3, 8]));
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = selected.size >= 3 && !submitting;

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });
  }

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    // Persist selected sector labels to user_metadata for future personalisation
    const selectedLabels = SECTORS.filter((_, i) => selected.has(i)).map((s) => s.l);
    try {
      const db = getBrowserClient();
      await db.auth.updateUser({ data: { interests: selectedLabels } });
    } catch {
      // Non-fatal — personalization degrades silently
    }
    router.push("/onboarding/goals");
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
        <Link href="/onboarding/age" className="grid place-items-center rounded-lg" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="inline-grid place-items-center rounded-[5px]" style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}><Bolt size={10} /></span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>PAAVE</span>
        </div>
        <div className="text-[11px] font-semibold" style={{ color: "#6E6B8F" }}>4 / 5</div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 pt-2">
        <div className="mb-1.5 flex justify-between text-[11px] font-semibold" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
          <span>Bước 4 / 5</span>
          <span style={{ color: "#B5E82F" }}>Chọn lĩnh vực · 80%</span>
        </div>
        <div className="flex gap-1.5 h-[3px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ background: i <= 4 ? "#B5E82F" : "rgba(255,255,255,0.08)", boxShadow: i === 4 ? "0 0 6px #B5E82F" : "none" }} />
          ))}
        </div>
      </div>

      {/* Headline */}
      <h1 className="px-5 pb-2" style={{ fontFamily: "var(--font-be-vietnam-pro)", fontWeight: 900, fontSize: 30, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
        Bạn quan tâm<br />
        <span style={{ color: "#B5E82F", textShadow: "0 0 12px rgba(181,232,47,0.25)" }}>ngành nào?</span>
      </h1>
      <p className="mb-4 px-5 text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
        Chọn ít nhất 3 — Paave sẽ ưu tiên cổ phiếu và phân tích theo sở thích.
      </p>

      {/* Sector grid */}
      <div className="mx-5 mb-3 grid grid-cols-3 gap-2">
        {SECTORS.map((s, i) => {
          const on = selected.has(i);
          return (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="relative rounded-xl py-3 text-center"
              style={{
                background: on ? "rgba(181,232,47,0.10)" : "rgba(255,255,255,0.03)",
                border: on ? "1.5px solid #B5E82F" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: on ? "0 0 10px rgba(181,232,47,0.08)" : "none",
                padding: "12px 4px",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 2 }}>{s.e}</div>
              <div className="text-[10.5px] font-bold leading-tight" style={{ color: on ? "#B5E82F" : "#A6A2C7", fontFamily: "var(--font-be-vietnam-pro)" }}>{s.l}</div>
              {on && (
                <div
                  className="absolute grid place-items-center rounded-[4px]"
                  style={{ top: 4, right: 4, width: 14, height: 14, background: "#B5E82F", color: "#0B0A1A" }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <p className="mb-2 text-center text-[11px]" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
        Đã chọn {selected.size} / tối thiểu 3
      </p>

      <div className="flex-1" />

      {/* CTA */}
      <div className="px-5 pb-8">
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] font-bold"
          style={{
            height: 54,
            background: canSubmit ? "#B5E82F" : "rgba(255,255,255,0.06)",
            color: canSubmit ? "#0B0A1A" : "#6E6B8F",
            fontFamily: "var(--font-be-vietnam-pro)",
            fontWeight: 700,
            fontSize: 15,
            boxShadow: canSubmit ? "0 0 0 1px rgba(181,232,47,0.2), 0 8px 24px rgba(181,232,47,0.18)" : "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {canSubmit && <Bolt size={12} />}
          {submitting ? "Đang xử lý…" : "Tiếp tục"}
        </button>
      </div>
    </main>
  );
}
