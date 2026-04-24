"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

const FEATURES = [
  "Đăng nhập dưới 1 giây",
  "Tự động khoá khi rời máy",
  "Vẫn có thể dùng mật khẩu",
];

export function BiometricView() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function onEnable() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/home");
  }

  function onSkip() {
    router.push("/home");
  }

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

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pb-2 pt-2">
        <div className="w-7" />
        <div className="flex items-center gap-1.5">
          <span className="inline-grid place-items-center rounded-[5px]" style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}><Bolt size={10} /></span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>PAAVE</span>
        </div>
        <div className="text-[11px] font-semibold" style={{ color: "#6E6B8F" }}>Tuỳ chọn</div>
      </div>

      {/* Center content */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        {/* Face ID rings */}
        <div
          className="relative mb-6 grid place-items-center"
          style={{ width: 100, height: 100 }}
        >
          {/* Outer glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(181,232,47,0.16) 0%, transparent 70%)" }}
          />
          {/* Ring 1 */}
          <div
            className="absolute rounded-full"
            style={{ inset: 10, border: "1px solid rgba(181,232,47,0.3)" }}
          />
          {/* Ring 2 dashed */}
          <div
            className="absolute rounded-full"
            style={{ inset: 20, border: "1px dashed rgba(181,232,47,0.2)" }}
          />
          {/* Face ID icon */}
          <div
            className="relative z-10 grid place-items-center rounded-[18px]"
            style={{
              width: 60, height: 60,
              background: "#B5E82F",
              color: "#0B0A1A",
              boxShadow: "0 0 16px rgba(181,232,47,0.25)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7V5a2 2 0 0 1 2-2h2" /><path d="M16 3h2a2 2 0 0 1 2 2v2" />
              <path d="M20 17v2a2 2 0 0 1-2 2h-2" /><path d="M8 21H6a2 2 0 0 1-2-2v-2" />
              <path d="M9 10v1" /><path d="M15 10v1" /><path d="M9 15c1.5 1 4.5 1 6 0" />
            </svg>
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--font-be-vietnam-pro)", fontWeight: 900, fontSize: 26, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Đăng nhập bằng<br />
          <span style={{ color: "#B5E82F", textShadow: "0 0 12px rgba(181,232,47,0.25)" }}>Face ID</span>
        </h1>
        <p className="text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
          Mở ứng dụng chỉ trong 1 giây.<br />
          Dữ liệu sinh trắc học được lưu ngay trên máy của bạn.
        </p>
      </div>

      {/* Feature list */}
      <div className="mx-5 mb-4 flex flex-col gap-1.5">
        {FEATURES.map((f) => (
          <div key={f} className="flex items-center gap-2.5 text-[12px]" style={{ color: "#A6A2C7" }}>
            <span
              className="grid flex-shrink-0 place-items-center rounded-[5px] text-[10px]"
              style={{ width: 16, height: 16, background: "rgba(181,232,47,0.15)", color: "#B5E82F" }}
            >
              ✓
            </span>
            {f}
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="px-5 pb-4">
        <button
          onClick={onEnable}
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
          {submitting ? "Đang bật…" : "Bật Face ID"}
        </button>
      </div>
      <div className="mb-8 text-center">
        <button
          onClick={onSkip}
          className="text-[12px]"
          style={{ background: "none", border: "none", color: "#6E6B8F", cursor: "pointer", fontFamily: "var(--font-be-vietnam-pro)" }}
        >
          Để sau
        </button>
      </div>
    </main>
  );
}
