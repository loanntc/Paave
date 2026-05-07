"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BellOff, ChevronRight, Globe, Moon, TrendingDown, TrendingUp } from "lucide-react";
import { AmbientBackground } from "@/components/brand/ambient-background";
import { PaaveNav } from "@/components/paave/paave-nav";
import { cn } from "@/lib/utils";

type WatchItem = {
  symbol: string;
  name: string;
  price: string;
  changePct: string;
  up: boolean;
};

const WATCHLIST: WatchItem[] = [
  { symbol: "VCB", name: "Vietcombank", price: "₫88.000", changePct: "+2,15%", up: true },
  { symbol: "FPT", name: "FPT Corp", price: "₫121.500", changePct: "+2,10%", up: true },
  { symbol: "VIC", name: "Vingroup", price: "₫45.200", changePct: "+3,19%", up: true },
  { symbol: "HPG", name: "Hòa Phát", price: "₫26.100", changePct: "-1,51%", up: false },
  { symbol: "REE", name: "REE Corp", price: "₫68.700", changePct: "+2,84%", up: true },
  { symbol: "MWG", name: "Mobile World", price: "₫52.400", changePct: "+2,14%", up: true },
  { symbol: "TCB", name: "Techcombank", price: "₫48.200", changePct: "-0,82%", up: false },
  { symbol: "NVL", name: "Novaland", price: "₫12.400", changePct: "+1,23%", up: true },
];

type Alert = {
  id: string;
  symbol: string;
  condition: ">=" | "<=";
  threshold: string;
  active: boolean;
};

const INITIAL_ALERTS: Alert[] = [
  { id: "1", symbol: "VCB", condition: ">=", threshold: "₫90.000", active: true },
  { id: "2", symbol: "FPT", condition: "<=", threshold: "₫115.000", active: true },
  { id: "3", symbol: "HPG", condition: ">=", threshold: "₫30.000", active: false },
];

const AVATAR_COLORS = [
  "#CAFD00", "#D277FF", "#10B981", "#F59E0B", "#3B82F6", "#EF4444",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const USER_NAME = "Alex Trần";

export function ProfileView() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [showAllWatch, setShowAllWatch] = useState(false);

  const visibleWatch = showAllWatch ? WATCHLIST : WATCHLIST.slice(0, 5);
  const avatarColor = getAvatarColor(USER_NAME);
  const avatarInk = avatarColor === "#CAFD00" ? "#516700" : "#0E0E0E";

  function toggleAlert(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900 pb-28">
      <AmbientBackground />

      <header className="relative z-20 px-6 pt-14 pb-4">
        <h1 className="font-display text-[20px] font-bold text-lime-soft">Tôi</h1>
      </header>

      <div className="relative z-10 mx-4 space-y-5">
        <section
          aria-label="User identity"
          className="flex items-center gap-4 rounded-3xl border border-edge bg-ink-800/60 p-5 backdrop-blur"
        >
          <div
            className="grid size-14 shrink-0 place-items-center rounded-full font-display text-[18px] font-bold"
            style={{ background: avatarColor, color: avatarInk }}
            aria-hidden
          >
            {getInitials(USER_NAME)}
          </div>
          <div>
            <p className="font-display text-[18px] font-bold text-lime-soft">
              {USER_NAME}
            </p>
            <p className="mt-0.5 font-body text-[12px] text-fog">
              Nhà đầu tư Gen Z · Thành viên từ 04/2026
            </p>
            <p className="mt-1 font-body text-[12px] text-fog-muted">
              {WATCHLIST.length} CP theo dõi · {INITIAL_ALERTS.filter((a) => a.active).length} cảnh báo
            </p>
          </div>
        </section>

        <section aria-label="Watchlist">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[13px] uppercase tracking-drop text-lime-soft">
              Danh sách theo dõi
            </h2>
            {WATCHLIST.length > 5 && (
              <button
                onClick={() => setShowAllWatch((v) => !v)}
                className="font-display text-[11px] uppercase tracking-pulse text-plasma"
              >
                {showAllWatch
                  ? "Thu gọn"
                  : `Xem tất cả (${WATCHLIST.length})`}
              </button>
            )}
          </div>
          {WATCHLIST.length === 0 ? (
            <div className="rounded-3xl border border-edge bg-ink-800/60 p-8 text-center">
              <p className="font-display text-[14px] text-fog">Chưa theo dõi cổ phiếu nào</p>
              <Link
                href="/discover"
                className="mt-2 inline-block font-display text-[12px] uppercase tracking-pulse text-plasma"
              >
                Khám phá ngay →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleWatch.map((w) => (
                <Link
                  key={w.symbol}
                  href={`/stock/${w.symbol}`}
                  className="flex items-center gap-3 rounded-2xl border border-edge bg-ink-800/60 px-4 py-3 backdrop-blur transition-colors hover:bg-ink-700"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-full border border-edge bg-ink-600 font-display text-[11px] font-bold text-lime-soft">
                    {w.symbol.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[14px] font-semibold text-lime-soft">
                      {w.symbol}
                    </p>
                    <p className="font-body text-[12px] text-fog truncate">
                      {w.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[14px] font-semibold tabular-nums text-lime-soft">
                      {w.price}
                    </p>
                    <p
                      className={cn(
                        "font-display text-[11px] tabular-nums",
                        w.up ? "text-positive" : "text-negative",
                      )}
                    >
                      {w.changePct}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section aria-label="Price alerts">
          <h2 className="mb-3 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Cảnh báo giá
          </h2>
          {alerts.length === 0 ? (
            <div className="rounded-3xl border border-edge bg-ink-800/60 p-8 text-center">
              <p className="font-display text-[14px] text-fog">Chưa có cảnh báo nào</p>
              <Link
                href="/discover"
                className="mt-2 inline-block font-display text-[12px] uppercase tracking-pulse text-plasma"
              >
                Đặt cảnh báo →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 rounded-2xl border border-edge bg-ink-800/60 px-4 py-3 backdrop-blur"
                >
                  <div
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      alert.active ? "bg-plasma/15" : "bg-ink-600",
                    )}
                  >
                    {alert.active ? (
                      <Bell className="size-4 text-plasma" strokeWidth={2} />
                    ) : (
                      <BellOff className="size-4 text-fog-muted" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[14px] font-semibold text-lime-soft">
                      {alert.symbol}
                    </p>
                    <p className="flex items-center gap-1 font-body text-[12px] text-fog">
                      {alert.condition === ">=" ? (
                        <TrendingUp className="size-3" strokeWidth={2} />
                      ) : (
                        <TrendingDown className="size-3" strokeWidth={2} />
                      )}
                      {alert.condition} {alert.threshold}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    aria-label={alert.active ? "Tắt cảnh báo" : "Bật cảnh báo"}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors duration-200",
                      alert.active ? "bg-plasma" : "bg-ink-500",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200",
                        alert.active ? "translate-x-[22px]" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          aria-label="App settings"
          className="rounded-3xl border border-edge bg-ink-800/60 overflow-hidden backdrop-blur"
        >
          <h2 className="border-b border-edge/60 px-5 py-4 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Cài đặt ứng dụng
          </h2>
          {[
            { icon: Globe, label: "Ngôn ngữ", value: "Tiếng Việt" },
            { icon: Moon, label: "Giao diện", value: "Tối" },
          ].map(({ icon: Icon, label, value }) => (
            <button
              key={label}
              className="flex w-full items-center gap-3 border-b border-edge/60 px-5 py-4 transition-colors hover:bg-ink-700 last:border-0"
            >
              <Icon className="size-4 text-fog" strokeWidth={2} />
              <span className="flex-1 text-left font-body text-[14px] text-lime-soft">
                {label}
              </span>
              <span className="font-body text-[13px] text-fog">{value}</span>
              <ChevronRight className="size-4 text-fog-muted" strokeWidth={2} />
            </button>
          ))}
        </section>

        <section
          aria-label="App info"
          className="rounded-3xl border border-edge bg-ink-800/60 overflow-hidden backdrop-blur"
        >
          <h2 className="border-b border-edge/60 px-5 py-4 font-display text-[13px] uppercase tracking-drop text-lime-soft">
            Thông tin
          </h2>
          {[
            { label: "Phiên bản ứng dụng", value: "1.0.0", tappable: false },
            { label: "Điều khoản dịch vụ", value: null, tappable: true },
            { label: "Chính sách bảo mật", value: null, tappable: true },
          ].map(({ label, value, tappable }) => (
            <button
              key={label}
              disabled={!tappable}
              className="flex w-full items-center gap-3 border-b border-edge/60 px-5 py-4 transition-colors hover:bg-ink-700 last:border-0 disabled:cursor-default"
            >
              <span className="flex-1 text-left font-body text-[14px] text-lime-soft">
                {label}
              </span>
              {value && (
                <span className="font-body text-[13px] text-fog">{value}</span>
              )}
              {tappable && (
                <ChevronRight className="size-4 text-fog-muted" strokeWidth={2} />
              )}
            </button>
          ))}
        </section>

        <button className="w-full rounded-2xl border border-negative/30 bg-negative/10 py-4 font-display text-[13px] uppercase tracking-pulse text-negative transition-colors hover:bg-negative/20">
          Đặt lại thông tin cá nhân
        </button>
      </div>

      <PaaveNav />
    </main>
  );
}
