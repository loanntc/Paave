"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

const DEMO_VALS = ["4", "2", "7", "", "", ""];
const RESEND_SECS = 42;

export function VerifyOtpView({ email }: { email: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECS);
  const [submitting, setSubmitting] = useState(false);

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");
  const filled = digits.filter((d) => d).length;
  const canSubmit = filled === 6 && !submitting;

  // Pre-fill first 3 for demo
  useEffect(() => {
    setDigits(DEMO_VALS.map((v) => v));
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  async function onVerify() {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push("/onboarding/age");
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
        <Link href="/sign-up" className="grid place-items-center rounded-lg" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="inline-grid place-items-center rounded-[5px]" style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}><Bolt size={10} /></span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>PAAVE</span>
        </div>
        <div className="text-[11px] font-semibold" style={{ color: "#6E6B8F" }}>2 / 5</div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 pt-2">
        <div className="mb-1.5 flex justify-between text-[11px] font-semibold" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
          <span>Bước 2 / 5</span>
          <span style={{ color: "#B5E82F" }}>Xác minh email · 40%</span>
        </div>
        <div className="flex gap-1.5 h-[3px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ background: i <= 2 ? "#B5E82F" : "rgba(255,255,255,0.08)", boxShadow: i === 2 ? "0 0 6px #B5E82F" : "none" }} />
          ))}
        </div>
      </div>

      {/* Email icon */}
      <div className="mx-5 mb-4 flex justify-center">
        <div
          className="grid place-items-center rounded-[20px]"
          style={{
            width: 64, height: 64,
            background: "rgba(127,119,221,0.15)",
            border: "1px solid rgba(127,119,221,0.4)",
            boxShadow: "0 0 16px rgba(127,119,221,0.18)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7F77DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7 10-7" />
          </svg>
        </div>
      </div>

      {/* Headline */}
      <h1 className="px-5 pb-2 text-center" style={{ fontFamily: "var(--font-be-vietnam-pro)", fontWeight: 900, fontSize: 26, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
        Kiểm tra hộp thư<br />của bạn
      </h1>
      <p className="mb-5 px-5 text-center text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
        Đã gửi mã 6 chữ số tới{" "}
        <span className="font-bold" style={{ color: "#E8E6F5" }}>{maskedEmail}</span>.
        {" "}Nhập mã để tiếp tục.
      </p>

      {/* OTP boxes */}
      <div className="mx-5 mb-4 grid grid-cols-6 gap-2">
        {digits.map((v, i) => (
          <div
            key={i}
            className="grid aspect-square place-items-center rounded-xl text-2xl font-black relative"
            style={{
              background: v ? "rgba(181,232,47,0.05)" : "rgba(255,255,255,0.03)",
              border: v ? "1px solid #B5E82F" : (i === filled ? "1px solid #B5E82F" : "1px solid rgba(255,255,255,0.08)"),
              boxShadow: v ? "inset 0 0 20px rgba(181,232,47,0.15)" : "none",
              fontFamily: "var(--font-be-vietnam-pro)",
              color: "#E8E6F5",
            }}
          >
            {v || (i === filled ? (
              <span style={{ width: 2, height: 24, background: "#B5E82F", boxShadow: "0 0 8px #B5E82F", display: "inline-block", animation: "blink 1s infinite" }} />
            ) : "")}
          </div>
        ))}
      </div>

      <p className="mb-5 px-5 text-center text-xs" style={{ color: "#6E6B8F" }}>
        Không nhận được mã?{" "}
        <button
          onClick={() => { if (secondsLeft <= 0) { setSecondsLeft(RESEND_SECS); setDigits(["", "", "", "", "", ""]); } }}
          className="font-bold"
          style={{ color: "#B5E82F", background: "none", border: "none", cursor: secondsLeft <= 0 ? "pointer" : "default", opacity: secondsLeft <= 0 ? 1 : 0.6 }}
        >
          Gửi lại {secondsLeft > 0 ? `(0:${String(secondsLeft).padStart(2, "0")})` : ""}
        </button>
      </p>

      <div className="flex-1" />

      {/* Security card */}
      <div
        className="relative mx-5 mb-4 overflow-hidden rounded-[16px] px-4 py-4"
        style={{
          background: "rgba(127,119,221,0.06)",
          border: "1px solid rgba(127,119,221,0.25)",
        }}
      >
        <div className="absolute left-0 right-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #7F77DD, transparent)" }} />
        <div className="mb-2 flex items-center gap-2.5">
          <div className="grid place-items-center rounded-lg" style={{ width: 28, height: 28, background: "#534AB7", boxShadow: "0 0 12px rgba(127,119,221,0.5)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.4px]" style={{ color: "#CECBF6", fontFamily: "var(--font-be-vietnam-pro)" }}>Bảo mật tài khoản</span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: "#A6A2C7" }}>
          Mã hết hạn sau 10 phút. Paave không bao giờ yêu cầu mật khẩu qua email hay tin nhắn.
        </p>
      </div>

      {/* Verify button */}
      <div className="px-5 pb-8">
        <button
          onClick={onVerify}
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
          {submitting ? "Đang xác minh…" : "Xác minh"}
        </button>
      </div>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </main>
  );
}
