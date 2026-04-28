import { Avatar, AvatarStack } from "@/components/ds/avatar";
import { MetricCard } from "@/components/ds/metric-card";
import { InfoCard } from "@/components/ds/info-card";
import { Icon } from "@/components/ds/icon";

function SectionHeader({ num, title, desc }: { num: string; title: string; desc?: string }) {
  return (
    <div className="ds-section-head">
      <span className="num">{num}</span>
      <h2 className="title">{title}</h2>
      {desc && <p className="desc">{desc}</p>}
    </div>
  );
}

export function AvatarSection() {
  return (
    <section id="ds-avatars" className="ds-section">
      <SectionHeader
        num="13"
        title="Avatars"
        desc="Lime is reserved for the active user; peach/violet/blush for community members. Rounded gradient initials by default — never raw photos in dense lists."
      />

      <div className="grid-2 grid-gap-6">
        <div className="ds-card">
          <div className="ds-label">Sizes</div>
          <div className="row-gap-16 mt-3">
            <Avatar size="sm" tone="lime" initials="VQ" />
            <Avatar size="md" tone="lime" initials="VQ" />
            <Avatar size="lg" tone="lime" initials="VQ" />
            <Avatar size="xl" tone="lime" initials="VQ" />
          </div>
        </div>
        <div className="ds-card">
          <div className="ds-label">Tones · with status</div>
          <div className="row-gap-16 mt-3">
            <Avatar tone="lime"   initials="VQ" status="online" />
            <Avatar tone="peach"  initials="HM" status="away" />
            <Avatar tone="violet" initials="AN" status="off" />
            <Avatar tone="blush"  initials="LK" />
          </div>
        </div>
        <div className="ds-card">
          <div className="ds-label">Stack · members of a study group</div>
          <div className="mt-3">
            <AvatarStack more={28}>
              <Avatar tone="lime"   initials="VQ" />
              <Avatar tone="peach"  initials="HM" />
              <Avatar tone="violet" initials="AN" />
              <Avatar tone="blush"  initials="LK" />
            </AvatarStack>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MetricSection() {
  return (
    <section id="ds-metrics" className="ds-section">
      <SectionHeader
        num="14"
        title="Metric cards"
        desc="Hero variant for the headline figure on each screen; default for grid. Always tabular nums; deltas right-aligned with the value."
      />
      <div className="grid-3 grid-gap-3">
        <MetricCard
          variant="hero"
          label="Portfolio value"
          value="12.450.000 ₫"
          delta={{ value: "▲ +2,45% · 298k ₫", tone: "positive" }}
          caption="vs. yesterday close"
        />
        <MetricCard
          label="Day P&L"
          value="+298.500 ₫"
          delta={{ value: "▲ +2,45%", tone: "positive" }}
        />
        <MetricCard
          label="Cash"
          value="4.250.000 ₫"
          delta={{ value: "−800k ₫", tone: "negative" }}
          caption="locked in pending orders"
        />
      </div>
    </section>
  );
}

export function InfoSection() {
  return (
    <section id="ds-infocards" className="ds-section">
      <SectionHeader
        num="15"
        title="Info cards"
        desc="Inline guidance — never use modals to teach. Lime for tips, violet for explainers, peach for warnings, negative for blocking errors."
      />
      <div className="grid-2 grid-gap-3">
        <InfoCard
          tone="lime"
          icon={<Icon name="sparkle" />}
          title="Daily streak unlocked"
          description="You've checked in 7 days in a row. +120 XP to your portfolio coach."
        />
        <InfoCard
          tone="violet"
          icon={<Icon name="info" />}
          title="What is a limit order?"
          description="A limit order only fills at your chosen price or better. It won't execute if the market never reaches your price."
        />
        <InfoCard
          tone="peach"
          icon={<Icon name="alert" />}
          title="Concentrated position"
          description="VIC is 38% of your portfolio. Consider diversifying before earnings on May 14."
        />
        <InfoCard
          tone="negative"
          icon={<Icon name="xCircle" />}
          title="Order cannot be placed"
          description="Insufficient buying power. Top up paper cash or reduce order size."
        />
      </div>
    </section>
  );
}
