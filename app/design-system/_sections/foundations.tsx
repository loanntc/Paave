import { LogoLockup } from "@/components/ds/logo-lockup";
import { Icon, ALL_ICONS } from "@/components/ds/icon";

const SECTION_HEAD = "ds-section-head";

function SectionHeader({ num, title, desc }: { num: string; title: string; desc?: string }) {
  return (
    <div className={SECTION_HEAD}>
      <span className="num">{num}</span>
      <h2 className="title">{title}</h2>
      {desc && <p className="desc">{desc}</p>}
    </div>
  );
}

export function LogoSection() {
  return (
    <section id="ds-logo" className="ds-section">
      <SectionHeader
        num="01"
        title="Logo"
        desc='The Paave mark is a geometric "P" set in a lime square — a literal price chip. Maintain clear-space equal to the height of the glyph and prefer lime-on-ink. Never re-color, outline, or slant.'
      />
      <div className="ds-subsection">
        <div className="ds-label">Primary lockup · four surfaces</div>
        <div className="logo-grid">
          {(["dark", "light", "lime", "violet"] as const).map((surface) => (
            <div key={surface} className="logo-card">
              <div className={`logo-surface ${surface}`}>
                <LogoLockup surface={surface} size="lg" />
              </div>
              <div className="logo-meta">
                <span className="lbl">{surface[0].toUpperCase() + surface.slice(1)}</span>
                <span>
                  {surface === "dark" && "#0B0A1A"}
                  {surface === "light" && "#F4F2FA"}
                  {surface === "lime" && "#B5E82F"}
                  {surface === "violet" && "#534AB7"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2 grid-gap-6">
        <div className="ds-card">
          <div className="ds-label">Size scale</div>
          <div className="flex-col-gap-4 mt-3" style={{ gap: 20 }}>
            <LogoLockup size="sm" />
            <LogoLockup size="md" />
            <LogoLockup size="lg" />
          </div>
          <div className="mt-6 text-xs text-text-neo-tertiary">
            Minimum digital size: 24px mark · 16px wordmark.
          </div>
        </div>

        <div className="ds-card">
          <div className="ds-label">Clear space</div>
          <div className="clearspace mt-3">
            <LogoLockup size="md" />
          </div>
          <div className="mt-4 text-xs text-text-neo-tertiary">
            Reserve <strong className="text-lime-signal-400">1×</strong> mark-height of clear space on all sides.
          </div>
        </div>
      </div>
    </section>
  );
}

export function IconSection() {
  return (
    <section id="ds-icons" className="ds-section">
      <SectionHeader
        num="02"
        title="Iconography"
        desc="Paave icons are 24×24, 1.75 stroke, rounded joins/caps, drawn on an even grid. Use outlined for navigation and content; filled for active tab-bar states and CTAs. Never mix stroke weights on one screen."
      />

      <div className="grid-2 grid-gap-6 mb-4">
        <div>
          <div className="ds-label">Size scale</div>
          <div className="icon-sizes mt-3">
            {[12, 16, 20, 24, 32, 40].map((s) => (
              <div key={s} className="col">
                <Icon name="bolt" size={s} />
                <div className="meta">{s}px</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ds-label">Icon library · {ALL_ICONS.length}</div>
      <div className="icon-grid mt-3">
        {ALL_ICONS.map((n) => (
          <div key={n} className="icon-tile">
            <div className="box">
              <Icon name={n} size={22} />
            </div>
            <div className="nm">{n}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GridSection() {
  const spacing: ReadonlyArray<readonly [string, string, number]> = [
    ["--space-1", "4px", 4],
    ["--space-2", "8px", 8],
    ["--space-3", "12px", 12],
    ["--space-4", "16px", 16],
    ["--space-5", "20px", 20],
    ["--space-6", "24px", 24],
    ["--space-8", "32px", 32],
    ["--space-10", "40px", 40],
    ["--space-12", "48px", 48],
    ["--space-16", "64px", 64],
    ["--space-20", "80px", 80],
  ];

  const radii: ReadonlyArray<readonly [string, string, number]> = [
    ["sm", "8px", 8],
    ["md", "12px", 12],
    ["lg", "16px", 16],
    ["xl", "24px", 24],
    ["full", "999px", 40],
  ];

  return (
    <section id="ds-grid" className="ds-section">
      <SectionHeader
        num="03"
        title="Grid & spacing"
        desc="12-column desktop grid · 4-column mobile (360–440). All spacing is on an 8pt rhythm; 4pt only for inside-pill paddings. Vertical baseline is 8px; body text rides a 24px line-height for predictable stack."
      />

      <div className="grid-2 grid-gap-6 mb-4">
        <div className="grid-demo">
          <div className="ds-label" style={{ marginBottom: 10 }}>
            12-column desktop · 1160 content max
          </div>
          <div className="grid-cols">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="col">
                {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="ds-label">Baseline grid · 8px</div>
          <div className="baseline-demo mt-3">
            <div className="h">Paave — safe, social, gamified.</div>
            <p className="p">
              Body runs at 14/24. Headings snap to 32 or 40. Small labels live on 16-line baselines.
              Never break the 8px rhythm except inside buttons or chip paddings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid-2 grid-gap-6 mt-6">
        <div className="ds-card">
          <div className="ds-label">Spacing scale · 8pt</div>
          <div className="spacing-scale mt-3">
            {spacing.map(([tk, v, w]) => (
              <div key={tk} className="spacing-row">
                <div className="k">{tk}</div>
                <div className="v">{v}</div>
                <div className="bar" style={{ width: `${w}px` }} />
              </div>
            ))}
          </div>
        </div>
        <div className="ds-card">
          <div className="ds-label">Radius scale</div>
          <div className="grid-2 grid-gap-3 mt-3">
            {radii.map(([n, v, r]) => (
              <div key={n} className="flex items-center gap-3.5">
                <div
                  className="bg-ink-violet-surface border border-border-neo"
                  style={{ width: 56, height: 56, borderRadius: r === 40 ? "50%" : r }}
                />
                <div>
                  <div className="text-[13px] font-bold">radius-{n}</div>
                  <div className="font-mono text-[11px] text-text-neo-tertiary">{v}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ShadowSection() {
  return (
    <section id="ds-shadow" className="ds-section">
      <SectionHeader
        num="04"
        title="Shadow & glow"
        desc="Dark UI is hard: shadow lifts cards above the ink surface. Use lime glow only on primary CTAs and AI-surface highlights — never on body content."
      />

      <div className="ds-subsection">
        <div className="ds-label">Elevation · 5 levels</div>
        <div className="shadow-grid mt-3">
          <div className="shadow-tile shadow-s1"><div className="nm">Level 1 · Flat</div><div className="tok">0 1px 2px rgba(0,0,0,0.35)</div></div>
          <div className="shadow-tile shadow-s2"><div className="nm">Level 2 · Card</div><div className="tok">--shadow-card</div></div>
          <div className="shadow-tile shadow-s3"><div className="nm">Level 3 · Raised</div><div className="tok">--shadow-card-raised</div></div>
          <div className="shadow-tile shadow-s4"><div className="nm">Level 4 · Popover</div><div className="tok">0 12px 40px rgba(0,0,0,0.55)</div></div>
          <div className="shadow-tile shadow-s5"><div className="nm">Level 5 · Modal</div><div className="tok">0 24px 80px rgba(0,0,0,0.70)</div></div>
        </div>
      </div>

      <div className="ds-subsection">
        <div className="ds-label">Accent glows · CTA only</div>
        <div className="shadow-grid mt-3">
          <div className="shadow-tile shadow-glow-lime"><div className="nm">Glow · lime</div><div className="tok">--shadow-glow-accent</div></div>
          <div className="shadow-tile shadow-glow-violet"><div className="nm">Glow · violet</div><div className="tok">--shadow-glow-violet</div></div>
          <div className="shadow-tile shadow-glow-peach"><div className="nm">Glow · peach</div><div className="tok">0 0 24px rgba(255,138,91,0.40)</div></div>
        </div>
      </div>
    </section>
  );
}

export function ColorSection() {
  const swatches = [
    { token: "lime-400", value: "#B5E82F", note: "Primary · CTA · positive" },
    { token: "violet-600", value: "#534AB7", note: "Secondary · info" },
    { token: "peach-400", value: "#FF8A5B", note: "Streak · XP · warning" },
    { token: "ink-base", value: "#0B0A1A", note: "Base surface" },
    { token: "ink-surface", value: "#14132B", note: "Secondary surface" },
    { token: "ink-raised", value: "#1E1C3F", note: "Raised card" },
    { token: "negative", value: "#FF5B7A", note: "Loss · destructive" },
    { token: "text-secondary", value: "#A6A2C7", note: "Body text · supporting" },
  ];

  return (
    <section id="ds-color" className="ds-section">
      <SectionHeader
        num="05"
        title="Color tokens"
        desc="Neo Lumen palette. Lime signals upside; violet anchors hierarchy; peach owns rewards & streaks. Ink-violet replaces pure black for warmer dark surfaces."
      />
      <div className="ds-subsection">
        <div className="ds-label">Core swatches</div>
        <div className="grid-4 grid-gap-3 mt-3">
          {swatches.map((s) => (
            <div
              key={s.token}
              className="rounded-lg-neo overflow-hidden border border-border-neo bg-ink-violet-raised"
            >
              <div className="h-20" style={{ background: s.value }} />
              <div className="p-3">
                <div className="text-[13px] font-bold">{s.token}</div>
                <div className="font-mono text-[11px] text-text-neo-tertiary mt-0.5">{s.value}</div>
                <div className="text-[11px] text-text-neo-secondary mt-1">{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
