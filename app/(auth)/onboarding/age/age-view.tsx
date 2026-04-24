"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

export function AgeView() {
  const router = useRouter();
  const [dd, setDd] = useState("12");
  const [mm, setMm] = useState("06");
  const [yyyy, setYyyy] = useState("2009");
  const [ageConfirmed, setAgeConfirmed] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const year = parseInt(yyyy, 10);
  const isMinor = !isNaN(year) && year > 2007;
  const canSubmit = ageConfirmed && termsAccepted && dd && mm && yyyy.length === 4 && !submitting;

  async function onSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    router.push("/onboarding/interests");
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
        <Link href="/verify-otp" className="grid place-items-center rounded-lg" style={{ width: 28, height: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="inline-grid place-items-center rounded-[5px]" style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}><Bolt size={10} /></span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>PAAVE</span>
        </div>
        <div className="text-[11px] font-semibold" style={{ color: "#6E6B8F" }}>3 / 5</div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 pt-2">
        <div className="mb-1.5 flex justify-between text-[11px] font-semibold" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
          <span>Bước 3 / 5</span>
          <span style={{ color: "#B5E82F" }}>Xác minh độ tuổi · 60%</span>
        </div>
        <div className="flex gap-1.5 h-[3px]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ background: i <= 3 ? "#B5E82F" : "rgba(255,255,255,0.08)", boxShadow: i === 3 ? "0 0 6px #B5E82F" : "none" }} />
          ))}
        </div>
      </div>

      {/* Headline */}
      <h1 className="px-5 pb-2" style={{ fontFamily: "var(--font-be-vietnam-pro)", fontWeight: 900, fontSize: 30, lineHeight: 1.0, letterSpacing: "-0.02em" }}>
        Bước cuối:<br />
        <span style={{ color: "#B5E82F", textShadow: "0 0 12px rgba(181,232,47,0.25)" }}>xác minh độ tuổi.</span>
      </h1>
      <p className="mb-4 px-5 text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
        Paave cần thông tin này để tuân thủ quy định của Uỷ ban Chứng khoán Nhà nước.
      </p>

      {/* DOB label */}
      <div className="px-5 mb-2 text-[11px] font-semibold" style={{ color: "#A6A2C7", fontFamily: "var(--font-be-vietnam-pro)" }}>
        <div className="flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full flex-shrink-0" style={{ background: "#B5E82F", boxShadow: "0 0 4px #B5E82F" }} />
          Ngày sinh
        </div>
      </div>

      {/* DOB boxes */}
      <div className="mx-5 mb-4 grid grid-cols-3 gap-2.5">
        {[
          { label: "DD", value: dd, set: setDd, maxLen: 2, placeholder: "DD" },
          { label: "MM", value: mm, set: setMm, maxLen: 2, placeholder: "MM" },
          { label: "YYYY", value: yyyy, set: setYyyy, maxLen: 4, placeholder: "YYYY" },
        ].map((f) => (
          <div key={f.label} className="relative">
            <div
              className="rounded-xl px-3 pt-1 pb-2 text-center"
              style={{
                background: f.value ? "rgba(181,232,47,0.05)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${f.value ? "#B5E82F" : "rgba(255,255,255,0.08)"}`,
                boxShadow: f.value ? "inset 0 0 20px rgba(181,232,47,0.1)" : "none",
              }}
            >
              <div className="text-[9px] font-bold mb-0.5" style={{ color: "#6E6B8F", fontFamily: "var(--font-jetbrains-mono)" }}>{f.label}</div>
              <input
                type="text"
                inputMode="numeric"
                value={f.value}
                onChange={(e) => f.set(e.target.value.replace(/\D/g, "").slice(0, f.maxLen))}
                className="w-full text-center bg-transparent outline-none text-xl font-black"
                style={{ color: "#E8E6F5", fontFamily: "var(--font-be-vietnam-pro)" }}
                placeholder={f.placeholder}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Check rows */}
      <div className="mx-5 mb-2">
        <button
          onClick={() => setAgeConfirmed((v) => !v)}
          className="w-full flex items-start gap-3 rounded-[10px] px-3 py-3 text-left"
          style={{
            background: ageConfirmed ? "rgba(181,232,47,0.05)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${ageConfirmed ? "rgba(181,232,47,0.3)" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          <div
            className="mt-0.5 grid flex-shrink-0 place-items-center rounded-[5px]"
            style={{
              width: 18, height: 18,
              background: ageConfirmed ? "#B5E82F" : "rgba(255,255,255,0.06)",
              border: ageConfirmed ? "none" : "1px solid rgba(255,255,255,0.15)",
              color: "#0B0A1A",
            }}
          >
            {ageConfirmed && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            )}
          </div>
          <div>
            <div className="text-[12px] font-bold mb-0.5" style={{ color: "#E8E6F5", fontFamily: "var(--font-be-vietnam-pro)" }}>Xác nhận độ tuổi</div>
            <div className="text-[11px] leading-relaxed" style={{ color: "#A6A2C7" }}>Tôi xác nhận ngày sinh ở trên là chính xác.</div>
          </div>
        </button>
      </div>

      <div className="mx-5 mb-3">
        <button
          onClick={() => setTermsAccepted((v) => !v)}
          className="w-full flex items-start gap-3 rounded-[10px] px-3 py-3 text-left"
          style={{
            background: termsAccepted ? "rgba(181,232,47,0.05)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${termsAccepted ? "rgba(181,232,47,0.3)" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          <div
            className="mt-0.5 grid flex-shrink-0 place-items-center rounded-[5px]"
            style={{
              width: 18, height: 18,
              background: termsAccepted ? "#B5E82F" : "rgba(255,255,255,0.06)",
              border: termsAccepted ? "none" : "1px solid rgba(255,255,255,0.15)",
              color: "#0B0A1A",
            }}
          >
            {termsAccepted && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            )}
          </div>
          <div>
            <div className="text-[12px] font-bold mb-0.5" style={{ color: "#E8E6F5", fontFamily: "var(--font-be-vietnam-pro)" }}>Điều khoản sử dụng</div>
            <div className="text-[11px] leading-relaxed" style={{ color: "#A6A2C7" }}>
              Đồng ý với <span style={{ color: "#B5E82F" }}>điều khoản</span> và <span style={{ color: "#B5E82F" }}>chính sách bảo mật</span>.
            </div>
          </div>
        </button>
      </div>

      {/* Learn mode banner */}
      {isMinor && (
        <div
          className="mx-5 mb-3 rounded-[10px] px-3 py-2.5"
          style={{
            background: "rgba(255,138,91,0.06)",
            border: "1px solid rgba(255,138,91,0.25)",
          }}
        >
          <div className="text-[11px] font-bold mb-1" style={{ color: "#FF8A5B", fontFamily: "var(--font-be-vietnam-pro)" }}>Chế độ Học tập</div>
          <p className="text-[11px] leading-relaxed" style={{ color: "#FFBFA0" }}>
            Bạn sẽ vào chế độ học với giao dịch mô phỏng đầy đủ. Xếp hạng và cộng đồng mở khi đủ 18 tuổi.
          </p>
        </div>
      )}

      <div className="flex-1" />

      {/* CTA */}
      <div className="px-5 pb-4">
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
          {submitting ? "Đang xử lý…" : "Hoàn tất"}
        </button>
      </div>

      {/* Meta foot */}
      <div className="flex items-center justify-between px-5 pb-8 text-[11px]" style={{ color: "#6E6B8F", fontFamily: "var(--font-be-vietnam-pro)" }}>
        <Link href="/verify-otp" style={{ color: "#6E6B8F" }}>← Quay lại</Link>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#B5E82F", boxShadow: "0 0 6px #B5E82F" }} />
          Mã hoá AES-256
        </span>
      </div>
    </main>
  );
}
