// Age-verification sub-components.
// All pure display; no hooks or routing. State is owned by AgeView.

import type React from "react";
import { MINIMUM_AGE } from "@/lib/age-gate";

// ---------------------------------------------------------------------------
// Bolt — lightning icon reused in the logo badge and the submit button
// ---------------------------------------------------------------------------
export function Bolt({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AgeCheckboxes — age confirmation + terms acceptance toggles
// ---------------------------------------------------------------------------
const CHECK_ICON = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

function CheckRow({
  checked,
  onToggle,
  title,
  description,
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  description: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-start gap-3 rounded-[10px] px-3 py-3 text-left"
      style={{
        background: checked ? "rgba(181,232,47,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${checked ? "rgba(181,232,47,0.3)" : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div
        className="mt-0.5 grid flex-shrink-0 place-items-center rounded-[5px]"
        style={{
          width: 18, height: 18,
          background: checked ? "#B5E82F" : "rgba(255,255,255,0.06)",
          border: checked ? "none" : "1px solid rgba(255,255,255,0.15)",
          color: "#0B0A1A",
        }}
      >
        {checked && CHECK_ICON}
      </div>
      <div>
        <div className="text-[12px] font-bold mb-0.5" style={{ color: "#E8E6F5", fontFamily: "var(--font-be-vietnam-pro)" }}>
          {title}
        </div>
        <div className="text-[11px] leading-relaxed" style={{ color: "#A6A2C7" }}>
          {description}
        </div>
      </div>
    </button>
  );
}

export function AgeCheckboxes({
  ageConfirmed,
  onAgeConfirmedToggle,
  termsAccepted,
  onTermsAcceptedToggle,
}: {
  ageConfirmed: boolean;
  onAgeConfirmedToggle: () => void;
  termsAccepted: boolean;
  onTermsAcceptedToggle: () => void;
}) {
  return (
    <>
      <div className="mx-5 mb-2">
        <CheckRow
          checked={ageConfirmed}
          onToggle={onAgeConfirmedToggle}
          title="Xác nhận độ tuổi"
          description="Tôi xác nhận ngày sinh ở trên là chính xác."
        />
      </div>
      <div className="mx-5 mb-3">
        <CheckRow
          checked={termsAccepted}
          onToggle={onTermsAcceptedToggle}
          title="Điều khoản sử dụng"
          description={
            <>
              Đồng ý với{" "}
              <span style={{ color: "#B5E82F" }}>điều khoản</span> và{" "}
              <span style={{ color: "#B5E82F" }}>chính sách bảo mật</span>.
            </>
          }
        />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// AgeBanners — blocked (under 16) and learn-mode (16–17) informational banners
// ---------------------------------------------------------------------------
export function AgeBanners({ isBlocked, isLearnMode }: { isBlocked: boolean; isLearnMode: boolean }) {
  return (
    <>
      {isBlocked && (
        <div
          className="mx-5 mb-3 rounded-[10px] px-3 py-2.5"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <div className="text-[11px] font-bold mb-1" style={{ color: "#EF4444", fontFamily: "var(--font-be-vietnam-pro)" }}>
            Chưa đủ tuổi sử dụng Paave
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "#FCA5A5" }}>
            Paave chỉ dành cho người từ {MINIMUM_AGE} tuổi trở lên theo quy định
            của Uỷ ban Chứng khoán Nhà nước. Bạn có thể đăng ký khi đủ tuổi.
          </p>
        </div>
      )}
      {isLearnMode && (
        <div
          className="mx-5 mb-3 rounded-[10px] px-3 py-2.5"
          style={{ background: "rgba(255,138,91,0.06)", border: "1px solid rgba(255,138,91,0.25)" }}
        >
          <div className="text-[11px] font-bold mb-1" style={{ color: "#FF8A5B", fontFamily: "var(--font-be-vietnam-pro)" }}>
            Chế độ Học tập
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "#FFBFA0" }}>
            Bạn sẽ vào chế độ học với giao dịch mô phỏng đầy đủ. Xếp hạng và cộng đồng mở khi đủ 18 tuổi.
          </p>
        </div>
      )}
    </>
  );
}
