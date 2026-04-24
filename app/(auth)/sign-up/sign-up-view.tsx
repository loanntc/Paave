"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type Strength = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function scorePassword(pw: string): Strength {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 14) s++;
  return Math.min(s, 6) as Strength;
}

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

const STRENGTH_LABEL = ["", "Yếu", "Yếu", "Trung bình", "Khá", "Mạnh", "Rất mạnh"] as const;
const STRENGTH_COLOR = ["", "#FF5B7A", "#FF5B7A", "#FF8A5B", "#FF8A5B", "#B5E82F", "#B5E82F"] as const;

export function SignUpView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emailOk = EMAIL_RE.test(email);
  const strength = useMemo(() => scorePassword(password), [password]);
  const canSubmit = emailOk && strength >= 3 && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
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
        <Link href="/welcome" className="grid place-items-center rounded-lg" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="inline-grid place-items-center rounded-[5px]" style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}>
            <Bolt size={10} />
          </span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>PAAVE</span>
        </div>
        <div className="text-[11px] font-semibold" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>1 / 5</div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 pt-2">
        <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
          <span>Bước 1 / 5</span>
          <span style={{ color: "#B5E82F" }}>Đăng ký · 20%</span>
        </div>
        <div className="flex gap-1.5 h-[3px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ background: i === 1 ? "#B5E82F" : "rgba(255,255,255,0.08)", boxShadow: i === 1 ? "0 0 6px #B5E82F" : "none" }} />
          ))}
        </div>
      </div>

      {/* Headline */}
      <h1 className="px-5 pb-2" style={{ fontFamily: "var(--font-be-vietnam-pro)", fontWeight: 900, fontSize: 30, lineHeight: 0.97, letterSpacing: "-0.02em" }}>
        Tạo tài khoản<br />
        <span style={{ color: "#B5E82F", textShadow: "0 0 12px rgba(181,232,47,0.25)" }}>Paave của bạn</span>
      </h1>
      <p className="mb-5 px-5 text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
        Nhận ngay ₫500 triệu vốn ảo để bắt đầu giao dịch mô phỏng.
      </p>

      <form onSubmit={onSubmit} className="flex flex-1 flex-col px-5" noValidate>
        {/* Email field */}
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
            placeholder="ten@email.com"
            className="w-full rounded-xl px-4 text-sm outline-none transition-all"
            style={{
              height: 50,
              background: "rgba(255,255,255,0.02)",
              border: `1px solid ${emailOk && email ? "rgba(181,232,47,0.6)" : "rgba(255,255,255,0.08)"}`,
              color: "#E8E6F5",
              fontFamily: "var(--font-be-vietnam-pro)",
            }}
          />
        </div>

        {/* Password field */}
        <div className="relative mb-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#A6A2C7", fontFamily: "var(--font-be-vietnam-pro)" }}>
            <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: "#B5E82F", boxShadow: "0 0 4px #B5E82F" }} />
            Mật khẩu
          </div>
          <input
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
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
            style={{ color: "#6E6B8F", paddingBottom: 2 }}
            aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPw ? "🙈" : "👁"}
          </button>
        </div>

        {/* Password strength */}
        {password.length > 0 && (
          <div className="mb-4 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>
              <span style={{ color: "#6E6B8F" }}>Độ mạnh mật khẩu</span>
              <span style={{ color: STRENGTH_COLOR[strength] || "#6E6B8F" }}>{STRENGTH_LABEL[strength] || "…"}</span>
            </div>
            <div className="flex gap-1 h-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-1 rounded-sm transition-all" style={{
                  background: i <= strength ? (STRENGTH_COLOR[strength] || "#6E6B8F") : "rgba(255,255,255,0.08)",
                  boxShadow: i <= strength ? `0 0 6px ${STRENGTH_COLOR[strength]}` : "none",
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Social divider */}
        <div className="mb-3 mt-2 flex items-center gap-2.5 text-[11px]" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          Hoặc tiếp tục với
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Social buttons */}
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          {[
            { label: "Apple", bg: "#000", color: "#fff" },
            { label: "Google", bg: "#fff", color: "#111" },
            { label: "Zalo", bg: "#0068FF", color: "#fff" },
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

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-[14px] font-bold text-sm"
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

        <p className="pb-8 text-center text-xs" style={{ color: "#6E6B8F" }}>
          Đã có tài khoản?{" "}
          <Link href="/sign-in" className="font-bold" style={{ color: "#B5E82F" }}>Đăng nhập</Link>
        </p>
      </form>
    </main>
  );
}
