"use client";

import Link from "next/link";

function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

const TICKER_CARDS = [
  {
    sym: "FPT", val: "142.500", d: "+2,3%", up: true,
    style: { top: 12, left: 4, transform: "rotate(-4deg)" } as React.CSSProperties,
  },
  {
    sym: "005930.KS", val: "74.200", d: "+1,1%", up: true,
    style: { top: 28, right: 0, transform: "rotate(5deg)" } as React.CSSProperties,
  },
  {
    sym: "VNM", val: "68.200", d: "−0,4%", up: false,
    style: { top: 120, left: 20, transform: "rotate(2deg)" } as React.CSSProperties,
  },
];

export function WelcomeView() {
  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background: `
          linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px) 0 0 / 100% 36px,
          linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px) 0 0 / 36px 100%,
          radial-gradient(ellipse 70% 50% at 50% 20%, rgba(127,119,221,0.13) 0%, transparent 60%),
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
          <span
            className="inline-grid place-items-center rounded-[5px]"
            style={{ width: 18, height: 18, background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 0 10px rgba(181,232,47,0.35)" }}
          >
            <Bolt size={10} />
          </span>
          <span className="text-[13px] font-black tracking-[0.5px]" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>
            PAAVE
          </span>
        </div>
        <div className="w-7" />
      </div>

      {/* Floating ticker art */}
      <div className="relative mx-5 flex-shrink-0" style={{ height: 220 }}>
        {TICKER_CARDS.map((c) => (
          <div
            key={c.sym}
            className="absolute rounded-xl px-3 py-2.5 backdrop-blur-md"
            style={{
              ...c.style,
              background: "rgba(255,255,255,0.04)",
              border: c.up ? "1px solid rgba(181,232,47,0.3)" : "1px solid rgba(255,91,122,0.3)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            <div className="text-sm font-black" style={{ fontFamily: "var(--font-be-vietnam-pro)", letterSpacing: "0.5px" }}>
              {c.sym}
            </div>
            <div className="mt-1 text-lg font-black" style={{ fontFamily: "var(--font-be-vietnam-pro)" }}>
              {c.val}
            </div>
            <div className="text-xs font-bold" style={{ color: c.up ? "#B5E82F" : "#FF5B7A", fontFamily: "var(--font-jetbrains-mono)" }}>
              {c.d}
            </div>
          </div>
        ))}

        {/* Bottom stamp */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <span
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-[5px] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.8px]"
            style={{ background: "#B5E82F", color: "#0B0A1A", boxShadow: "0 2px 8px rgba(181,232,47,0.2)" }}
          >
            ₫500 triệu vốn ảo · Trực tiếp
          </span>
        </div>
      </div>

      {/* Headline */}
      <h1
        className="mb-3 mt-2 px-5"
        style={{
          fontFamily: "var(--font-be-vietnam-pro)",
          fontWeight: 900,
          fontSize: 34,
          lineHeight: 0.97,
          letterSpacing: "-0.025em",
          color: "#E8E6F5",
        }}
      >
        Đầu tư như dân pro —
        <br />
        <span style={{ color: "#B5E82F", textShadow: "0 0 12px rgba(181,232,47,0.25)" }}>
          không mất đồng nào
        </span>
      </h1>

      <p className="mb-3 px-5 text-[13px] leading-relaxed" style={{ color: "#A6A2C7" }}>
        <span className="font-bold" style={{ color: "#E8E6F5" }}>Giao dịch mô phỏng với dữ liệu thật.</span>{" "}
        Cổ phiếu Việt Nam và quốc tế, AI phân tích, Cộng đồng học hỏi.
      </p>

      {/* Trust pills */}
      <div className="mb-4 flex flex-wrap gap-1.5 px-5">
        {[
          { label: "Vốn ảo · không tiền thật", violet: false },
          { label: "Mã hoá AES-256", violet: true },
          { label: "HOSE · KRX trực tiếp", violet: false },
        ].map((t) => (
          <span
            key={t.label}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#A6A2C7",
            }}
          >
            <span
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{
                background: t.violet ? "#7F77DD" : "#B5E82F",
                boxShadow: `0 0 4px ${t.violet ? "#7F77DD" : "#B5E82F"}`,
              }}
            />
            {t.label}
          </span>
        ))}
      </div>

      <div className="flex-1" />

      {/* CTA */}
      <div className="px-5 pb-4">
        <Link href="/sign-up" className="block">
          <button
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-[14px]"
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
            Tạo tài khoản miễn phí
          </button>
        </Link>
        <p className="pb-8 text-center text-xs" style={{ color: "#6E6B8F" }}>
          Đã có tài khoản?{" "}
          <Link href="/sign-in" className="font-bold" style={{ color: "#B5E82F" }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </main>
  );
}
