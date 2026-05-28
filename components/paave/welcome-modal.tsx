"use client";

// ---------------------------------------------------------------------------
// WelcomeModal — FR-LEARN-01
// Shown once per account on first Grow tab visit.
// Flag is written on mount (before any tap) so app crashes don't re-show it.
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import { BookOpen, GraduationCap, ShieldCheck, Zap } from "lucide-react";

interface WelcomeModalProps {
  /** Called immediately on mount to persist the "shown" flag */
  onMount: () => void;
  /** Navigate directly to L1.1 (primary CTA) */
  onStart: () => void;
  /** Dismiss without starting (secondary CTA) */
  onExplore: () => void;
}

export function WelcomeModal({ onMount, onStart, onExplore }: WelcomeModalProps) {
  // AC-05: write the flag on render — not on tap — so a force-kill does not
  // re-show the modal on next launch.
  useEffect(() => {
    onMount();
    // onMount is stable (useCallback); the lint exception below is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-heading"
    >
      {/* Sheet */}
      <div className="w-full sm:max-w-[440px] rounded-t-3xl sm:rounded-3xl bg-ink-violet-surface border border-border-neo overflow-hidden">

        {/* ── Hero strip ─────────────────────────────────────────────────── */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-violet-deep-800 to-violet-deep-900 text-center">
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 size-48 rounded-full bg-lime-signal-400/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="mx-auto mb-4 size-16 rounded-2xl bg-lime-signal-400/10 border border-lime-signal-400/20 grid place-items-center">
              <GraduationCap className="size-8 text-lime-signal-400" strokeWidth={1.5} />
            </div>

            <h2
              id="welcome-modal-heading"
              className="font-display text-[22px] font-bold text-text-neo-primary leading-tight"
            >
              Học chứng khoán,<br />không cần kinh nghiệm
            </h2>

            <p className="mt-3 text-[13px] text-text-neo-secondary leading-relaxed max-w-[300px] mx-auto">
              Paave dạy bạn từng bước với tài khoản giao dịch thử — không mất
              tiền thật, không rủi ro. Làm chủ cơ bản trong 4 module ngắn.
            </p>
          </div>
        </div>

        {/* ── Value props ────────────────────────────────────────────────── */}
        <div className="px-6 py-4 space-y-3">
          <ValueRow
            icon={<BookOpen className="size-4 text-lime-signal-400" strokeWidth={2} />}
            title="20 bài học · ~3 phút mỗi bài"
            subtitle="Từ cổ phiếu là gì đến lập chiến lược cá nhân"
          />
          <ValueRow
            icon={<ShieldCheck className="size-4 text-lime-signal-400" strokeWidth={2} />}
            title="Giao dịch thử, tiền thật ở đây không có"
            subtitle="Luyện đặt lệnh với 500 triệu VND ảo"
          />
          <ValueRow
            icon={<Zap className="size-4 text-lime-signal-400" strokeWidth={2} />}
            title="Kiếm XP, mở huy hiệu"
            subtitle="Hoàn thành module để mở khoá nội dung tiếp theo"
          />
        </div>

        {/* ── First lesson preview ───────────────────────────────────────── */}
        <div className="mx-6 mb-5 rounded-xl border border-border-neo bg-ink-violet-raised px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-lime-signal-400/10 border border-lime-signal-400/20 grid place-items-center shrink-0">
            <span className="text-[18px]">📈</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-text-neo-tertiary uppercase tracking-[0.6px] mb-0.5">
              Bắt đầu từ đây · Module 1 · Bài 1
            </p>
            <p className="text-[13px] font-semibold text-text-neo-primary truncate">
              Cổ phiếu là gì?
            </p>
          </div>
          <span className="text-[11px] font-bold text-lime-signal-400 shrink-0">5 thẻ →</span>
        </div>

        {/* ── CTAs ────────────────────────────────────────────────────────── */}
        <div className="px-6 pb-8 space-y-3">
          <button
            onClick={onStart}
            className="w-full h-12 rounded-2xl bg-lime-signal-400 text-ink-violet-base font-bold text-[15px] transition-opacity active:opacity-80"
          >
            Bắt đầu Module 1
          </button>
          <button
            onClick={onExplore}
            className="w-full h-10 rounded-2xl text-text-neo-secondary text-[14px] font-medium transition-colors hover:text-text-neo-primary"
          >
            Khám phá trước
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------
function ValueRow({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 size-7 rounded-lg bg-ink-violet-raised border border-border-neo-subtle grid place-items-center mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-text-neo-primary">{title}</p>
        <p className="text-[12px] text-text-neo-tertiary">{subtitle}</p>
      </div>
    </div>
  );
}
