"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

export function SignInView() {
  const router = useRouter();
  const [email, setEmail] = useState("minhanh@paave.vn");
  const [password, setPassword] = useState("••••••••");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailOk = EMAIL_RE.test(email);
  const canSubmit = emailOk && password.length >= 3 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
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
          <span className="inline-grid place-items-center rounded-[5px]" style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}>
            <Bolt size={10} />
          </span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>PAAVE</span>
        </div>
        <div className="w-7" />
      </div>

      {/* Headline */}
      <h1 className="px-5 pb-2 pt-2" style={{ fontFamily: "var(--font-be-vietnam-pro)", fontWeight: 900, fontSize: 34, lineHeight: 0.97, letterSpacing: "-0.025em" }}>
        Chào mừng trở lại<br />
        <span style={{ color: "#B5E82F", textShadow: "0 0 12px rgba(181,232,47,0.25)" }}>với Paave!</span>
      </h1>
      <p className="mb-5 px-5 text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
        Đăng nhập để tiếp tục giao dịch mô phỏng và theo dõi danh mục của bạn.
      </p>

      <form onSubmit={onSubmit} className="flex flex-1 flex-col px-5" noValidate>
        {/* Email */}
        <div className="relative mb-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#A6A2C7", fontFamily: "var(--font-be-vietnam-pro)" }}>
            <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: "#B5E82F", boxShadow: "0 0 4px #B5E82F" }} />
            Email
          </div>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-4 text-sm outline-none transition-all"
            style={{
              height: 50,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E8E6F5",
              fontFamily: "var(--font-be-vietnam-pro)",
            }}
          />
        </div>

        {/* Password */}
        <div className="relative mb-4">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#A6A2C7", fontFamily: "var(--font-be-vietnam-pro)" }}>
            <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: "#B5E82F", boxShadow: "0 0 4px #B5E82F" }} />
            Mật khẩu
          </div>
          <input
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-4 pr-12 text-sm outline-none transition-all"
            style={{
              height: 50,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#E8E6F5",
              fontFamily: "var(--font-be-vietnam-pro)",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 translate-y-1 text-lg"
            style={{ color: "#6E6B8F" }}
            aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        </div>

        {/* Bio pill + submit row */}
        <div className="mb-3 flex gap-2.5">
          {/* Face ID button */}
          <button
            type="button"
            className="grid flex-shrink-0 place-items-center rounded-[16px]"
            style={{
              width: 56,
              height: 56,
              background: "rgba(127,119,221,0.12)",
              border: "1px solid rgba(127,119,221,0.4)",
              color: "#7F77DD",
            }}
            aria-label="Đăng nhập bằng Face ID"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7V5a2 2 0 0 1 2-2h2" /><path d="M16 3h2a2 2 0 0 1 2 2v2" />
              <path d="M20 17v2a2 2 0 0 1-2 2h-2" /><path d="M8 21H6a2 2 0 0 1-2-2v-2" />
              <path d="M9 10v1" /><path d="M15 10v1" /><path d="M9 15c1.5 1 4.5 1 6 0" />
            </svg>
          </button>

          {/* Main login button */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-[14px] font-bold"
            style={{
              height: 56,
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
            {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </div>

        {/* Social divider */}
        <div className="mb-3 flex items-center gap-2.5 text-[11px]" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          Hoặc tiếp tục với
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Social buttons */}
        <div className="mb-4 grid grid-cols-2 gap-2.5">
          {[
            { label: "Apple", bg: "#000", color: "#fff" },
            { label: "Google", bg: "#fff", color: "#111" },
          ].map((s) => (
            <button
              key={s.label}
              type="button"
              className="flex items-center justify-center gap-1.5 rounded-xl text-sm font-bold"
              style={{
                height: 48,
                background: s.bg,
                color: s.color,
                border: s.bg === "#fff" ? "1px solid #ddd" : "none",
                fontFamily: "var(--font-be-vietnam-pro)",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Tournament drop card */}
        <div
          className="relative mb-4 overflow-hidden rounded-[16px] p-4"
          style={{
            background: "linear-gradient(135deg, rgba(127,119,221,0.20) 0%, rgba(255,138,91,0.10) 100%)",
            border: "1px solid rgba(127,119,221,0.3)",
          }}
        >
          <div className="absolute right-2.5 top-2.5">
            <span className="inline-flex items-center rounded-[5px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.8px]" style={{ background: "#534AB7", color: "white" }}>
              Mới
            </span>
          </div>
          <div className="mb-2 grid place-items-center rounded-[10px]" style={{ width: 32, height: 32, background: "#534AB7", color: "#B5E82F" }}>
            <Bolt size={16} />
          </div>
          <div className="mb-1 text-sm font-bold" style={{ color: "#E8E6F5", fontFamily: "var(--font-be-vietnam-pro)" }}>
            Giải đấu Virtual Trading · Mùa 2
          </div>
          <div className="text-xs leading-relaxed" style={{ color: "#A6A2C7" }}>
            Đã mở đăng ký. Top 100 trader nhận phần thưởng học tập.
          </div>
        </div>

        {/* Bottom nav */}
        <div
          className="mx-[-20px] flex justify-around rounded-b-none pb-8 pt-2.5"
          style={{
            background: "rgba(5,5,9,0.9)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {["home", "chart", "trade", "people", "me"].map((k) => (
            <div
              key={k}
              className="grid h-11 w-11 place-items-center rounded-xl"
              style={{
                background: k === "me" ? "#B5E82F" : "none",
                color: k === "me" ? "#0B0A1A" : "#6E6B8F",
                boxShadow: k === "me" ? "0 4px 12px rgba(181,232,47,0.25)" : "none",
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {k === "home" && <path d="M3 10l9-8 9 8v11a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10z" />}
                {k === "chart" && <><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-5" /></>}
                {k === "trade" && <><path d="M8 3v4m0 0 3-3m-3 3L5 4" /><path d="M16 21v-4m0 0 3 3m-3-3-3 3" /></>}
                {k === "people" && <><circle cx="9" cy="8" r="4" /><path d="M17 11a3 3 0 1 0 0-6" /><path d="M3 21v-1a6 6 0 0 1 12 0v1" /><path d="M16 15h2a3 3 0 0 1 3 3v3" /></>}
                {k === "me" && <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 16 0v1" /></>}
              </svg>
            </div>
          ))}
        </div>
      </form>
    </main>
  );
}
