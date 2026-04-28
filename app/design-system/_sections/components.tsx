"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ds/icon";
import { Fab } from "@/components/ds/fab";
import { TabBar } from "@/components/ds/tab-bar";
import { Segmented } from "@/components/ds/segmented";
import { ButtonGroup } from "@/components/ds/button-group";
import { DotBadge, SolidBadge, NewBadge, CountBadge } from "@/components/ds/badge";
import { Switch } from "@/components/ds/switch";
import { Checkbox } from "@/components/ds/checkbox";
import { Radio, RadioCard } from "@/components/ds/radio";
import { Spinner, DotsLoading, ProgressLinear, Skeleton } from "@/components/ds/feedback";
import { Tooltip } from "@/components/ds/tooltip";
import { Breadcrumb } from "@/components/ds/breadcrumb";

function SectionHeader({ num, title, desc }: { num: string; title: string; desc?: string }) {
  return (
    <div className="ds-section-head">
      <span className="num">{num}</span>
      <h2 className="title">{title}</h2>
      {desc && <p className="desc">{desc}</p>}
    </div>
  );
}

export function ButtonsSection() {
  return (
    <section id="ds-buttons" className="ds-section">
      <SectionHeader
        num="06"
        title="Buttons"
        desc="One primary CTA per screen. Lime is reserved for the strongest single action; violet for secondary confirm; ghost/tertiary for destructive or multi-option panels. 52px target on mobile; 40/32 on dense surfaces."
      />

      <div className="ds-subsection">
        <div className="ds-label">Variants × size</div>
        <div className="flex flex-col gap-3.5">
          {(["primary", "secondary", "tertiary", "ghost", "destructive", "disabled"] as const).map((variant) => (
            <div key={variant} className="grid items-center gap-3.5" style={{ gridTemplateColumns: "120px repeat(4, 1fr)" }}>
              <div className="text-[11px] uppercase tracking-[0.6px] text-text-neo-tertiary font-bold">
                {variant}
              </div>
              <Button variant={variant}>
                {variant === "primary" && <Icon name="bolt" size={16} />}
                {variant === "destructive" && <Icon name="trash" size={16} />}
                {variant === "tertiary" && <Icon name="sparkle" size={16} />}
                {variant === "primary" ? "Trade now" : variant === "destructive" ? "Delete account" : variant === "tertiary" ? "Ask AI" : variant === "ghost" ? "Cancel" : variant === "secondary" ? "Open order" : "Continue"}
              </Button>
              <Button variant={variant} size="sm">
                {variant === "ghost" ? "Back" : "Continue"}
              </Button>
              <Button variant={variant} size="xs">
                Apply
              </Button>
              <Button variant={variant} size="default" className="!w-[52px] !p-0">
                <Icon name={variant === "destructive" ? "trash" : variant === "ghost" ? "close" : "plus"} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-subsection">
        <div className="ds-label">FAB & extended FAB</div>
        <div className="flex items-center gap-4 mt-3">
          <Fab icon={<Icon name="plus" size={22} />} />
          <Fab extended icon={<Icon name="bolt" size={18} />}>Quick trade</Fab>
          <Fab tone="violet" icon={<Icon name="sparkle" size={22} />} />
        </div>
      </div>
    </section>
  );
}

export function TogglesSection() {
  const [tab, setTab] = useState<"chart" | "book" | "trades" | "ai">("chart");
  const [seg, setSeg] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">("1D");
  const [side, setSide] = useState<"buy" | "sell">("buy");

  return (
    <section id="ds-toggles" className="ds-section">
      <SectionHeader
        num="07"
        title="Tabs · Segments · Button group"
        desc="Use segmented for mutually-exclusive toggles under 6 options. Tab bar for primary sections with counts. Button group for compact filters and Buy/Sell toggles."
      />

      <div className="grid-2 grid-gap-6">
        <div className="ds-card">
          <div className="ds-label">Tab bar · underlined</div>
          <div className="mt-3">
            <TabBar
              value={tab}
              onChange={setTab}
              items={[
                { value: "chart",  label: "Chart" },
                { value: "book",   label: "Order book", count: 24 },
                { value: "trades", label: "Trades", count: 41 },
                { value: "ai",     label: "AI", icon: <Icon name="sparkle" size={14} /> },
              ]}
            />
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-label">Segmented · pill</div>
          <div className="mt-3">
            <Segmented
              value={seg}
              onChange={setSeg}
              options={[
                { value: "1D", label: "1D" },
                { value: "1W", label: "1W" },
                { value: "1M", label: "1M" },
                { value: "3M", label: "3M" },
                { value: "1Y", label: "1Y" },
                { value: "ALL", label: "ALL" },
              ]}
            />
          </div>

          <div className="ds-label mt-6">Buy / Sell toggle</div>
          <div className="mt-3">
            <ButtonGroup
              value={side}
              onChange={setSide}
              options={[
                { value: "buy",  label: "Buy" },
                { value: "sell", label: "Sell", tone: "negative" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function BadgesSection() {
  return (
    <section id="ds-badges" className="ds-section">
      <SectionHeader
        num="08"
        title="Badges & tags"
        desc="Dot badges for live/offline state; solid badges for categorical tags; count badges for notifications; NEW stamp for unseen drops."
      />

      <div className="grid-2 grid-gap-6">
        <div className="ds-card">
          <div className="ds-label">Dot badges</div>
          <div className="row-gap-8 mt-3">
            <DotBadge tone="live">Live · HOSE</DotBadge>
            <DotBadge tone="delayed">Delayed 15s</DotBadge>
            <DotBadge tone="closed">Closed</DotBadge>
            <DotBadge tone="preopen">KOSPI preopen</DotBadge>
            <DotBadge tone="offline">Offline</DotBadge>
          </div>
        </div>
        <div className="ds-card">
          <div className="ds-label">Solid tags</div>
          <div className="row-gap-8 mt-3">
            <SolidBadge tone="pro">PRO</SolidBadge>
            <SolidBadge tone="beta">BETA</SolidBadge>
            <SolidBadge tone="hot">HOT</SolidBadge>
            <SolidBadge tone="risky">RISKY</SolidBadge>
            <NewBadge />
          </div>
        </div>
        <div className="ds-card">
          <div className="ds-label">Notification counters</div>
          <div className="row-gap-16 mt-3">
            {(["bell", "message", "briefcase"] as const).map((icon, i) => (
              <div key={icon} className="relative">
                <div className="grid place-items-center w-10 h-10 rounded-full bg-ink-violet-surface text-text-neo-secondary">
                  <Icon name={icon} />
                </div>
                <CountBadge
                  count={[3, 12, 200][i] ?? 0}
                  className="absolute -top-1 -right-1"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ChoiceSection() {
  const [check, setCheck] = useState({ a: true, b: false });
  const [radio, setRadio] = useState<"market" | "limit" | "stop">("limit");
  const [sw, setSw] = useState({ a: true, b: false, c: true });
  const [tier, setTier] = useState<"basic" | "plus" | "legend">("plus");

  return (
    <section id="ds-choice" className="ds-section">
      <SectionHeader
        num="09"
        title="Checkbox · Radio · Switch"
        desc="All three share the same lime primary fill. Toggles for settings (immediate effect); checkboxes for multi-select; radios for mutually-exclusive options."
      />

      <div className="grid-3 grid-gap-6">
        <div className="ds-card">
          <div className="ds-label">Checkbox group</div>
          <div className="flex flex-col gap-3.5 mt-3">
            <Checkbox checked={check.a} onChange={(v) => setCheck({ ...check, a: v })}>
              Enable biometric login
            </Checkbox>
            <Checkbox checked={check.b} onChange={(v) => setCheck({ ...check, b: v })}>
              Send weekly portfolio summary
            </Checkbox>
            <Checkbox checked="indeterminate">Market alerts (2 of 3 markets)</Checkbox>
            <Checkbox checked={false} disabled>
              Real-money trading <span className="text-text-neo-tertiary">· paper-only</span>
            </Checkbox>
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-label">Radio · inline</div>
          <div className="flex flex-col gap-3.5 mt-3">
            {(["market", "limit", "stop"] as const).map((k) => (
              <Radio key={k} name="order-type" value={k} selected={radio} onChange={setRadio}>
                <span className="capitalize">{k} order</span>
              </Radio>
            ))}
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-label">Toggle</div>
          <div className="flex flex-col gap-3.5 mt-3">
            {[
              ["Dark mode", "a"],
              ["Sound effects", "b"],
              ["Push notifications", "c"],
            ].map(([l, k]) => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span>{l}</span>
                <Switch checked={sw[k as keyof typeof sw]} onChange={(v) => setSw({ ...sw, [k]: v })} />
              </div>
            ))}
            <div className="flex items-center justify-between text-sm opacity-40">
              <span>Beta features</span>
              <Switch checked={false} disabled />
            </div>
          </div>
        </div>
      </div>

      <div className="ds-subsection">
        <div className="ds-label">Radio cards · plan selector</div>
        <div className="grid-3 grid-gap-3">
          <RadioCard
            name="plan"
            value="basic"
            selected={tier}
            onChange={setTier}
            title="Basic"
            description="Free forever · 30-min delayed data"
          />
          <RadioCard
            name="plan"
            value="plus"
            selected={tier}
            onChange={setTier}
            title="Paave +"
            description="Real-time HOSE/KOSPI · AI explainer · 50.000 ₫/mo"
          />
          <RadioCard
            name="plan"
            value="legend"
            selected={tier}
            onChange={setTier}
            title="Legend"
            description="Everything + private coach · 120.000 ₫/mo"
          />
        </div>
      </div>
    </section>
  );
}

export function FeedbackSection() {
  return (
    <section id="ds-feedback" className="ds-section">
      <SectionHeader
        num="10"
        title="Loading & progress"
        desc="Prefer skeleton screens over spinners on first paint. Spinners only for explicit user action under 2s. Dot-pulse for background AI work."
      />

      <div className="grid-4 grid-gap-3">
        <div className="ds-card grid place-items-center min-h-[160px] gap-3">
          <Spinner size="lg" />
          <div className="text-xs text-text-neo-tertiary">Spinner · lg</div>
        </div>
        <div className="ds-card grid place-items-center min-h-[160px] gap-4">
          <DotsLoading />
          <div className="text-xs text-text-neo-tertiary">AI thinking…</div>
        </div>
        <div className="ds-card flex flex-col justify-center min-h-[160px] gap-4">
          <ProgressLinear indeterminate />
          <div className="text-xs text-text-neo-tertiary text-center">Indeterminate bar</div>
        </div>
        <div className="ds-card flex flex-col justify-center min-h-[160px] gap-3">
          <ProgressLinear value={68} className="h-2" />
          <div className="text-xs text-text-neo-tertiary text-center">Determinate · 68%</div>
        </div>
      </div>

      <div className="ds-subsection">
        <div className="ds-label">Skeleton — stock card</div>
        <div className="grid-3 grid-gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ds-card flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} rounded="full" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton width="40%" />
                  <Skeleton width="60%" />
                </div>
              </div>
              <Skeleton height={60} rounded="md" />
              <Skeleton width="80%" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TooltipSection() {
  return (
    <section id="ds-tooltip" className="ds-section">
      <SectionHeader
        num="11"
        title="Tooltip"
        desc="Tooltips teach without taking over. Simple tooltips for labels; rich tooltips to explain a financial term inline."
      />
      <div className="grid-2 grid-gap-6">
        <div className="ds-card grid place-items-center min-h-[180px]">
          <Tooltip content="Refresh quote · ⌘R">
            <Button variant="ghost" size="sm">
              <Icon name="refresh" size={16} />
              Refresh
            </Button>
          </Tooltip>
        </div>
        <div className="ds-card grid place-items-center min-h-[180px]">
          <Tooltip
            rich
            title="P/E ratio"
            content='Price-to-earnings — how many years of current profit it would take to "pay back" the share price. Lower can mean cheaper, but context matters.'
          >
            <Button variant="ghost" size="sm">
              <Icon name="help" size={16} />
              What&apos;s P/E?
            </Button>
          </Tooltip>
        </div>
      </div>
    </section>
  );
}

export function BreadcrumbSection() {
  return (
    <section id="ds-breadcrumb" className="ds-section">
      <SectionHeader num="12" title="Breadcrumb" />
      <div className="grid-2 grid-gap-6">
        <div className="ds-card">
          <div className="ds-label">Simple</div>
          <div className="mt-3">
            <Breadcrumb
              items={[
                { label: "Home", href: "#" },
                { label: "Markets", href: "#" },
                { label: "HOSE", href: "#" },
                { label: "VIC" },
              ]}
            />
          </div>
        </div>
        <div className="ds-card">
          <div className="ds-label">Icon + overflow</div>
          <div className="mt-3">
            <Breadcrumb
              items={[
                { label: "Home", href: "#", icon: <Icon name="home" size={14} /> },
                { label: "Learn", href: "#" },
                { label: "…", href: "#" },
                { label: "Candlestick patterns", href: "#" },
                { label: "Hammer & hanging man" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
