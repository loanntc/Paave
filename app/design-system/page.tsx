import "./design-system.css";

import { DSSidebar } from "./_components/sidebar";
import {
  LogoSection,
  IconSection,
  GridSection,
  ShadowSection,
  ColorSection,
} from "./_sections/foundations";
import {
  ButtonsSection,
  TogglesSection,
  BadgesSection,
  ChoiceSection,
  FeedbackSection,
  TooltipSection,
  BreadcrumbSection,
} from "./_sections/components";
import {
  AvatarSection,
  MetricSection,
  InfoSection,
} from "./_sections/patterns";

export const metadata = {
  title: "Paave Design System v2 · Components & patterns",
};

export default function DesignSystemPage() {
  return (
    <div className="ds-app">
      <DSSidebar />
      <main className="ds-main">
        <header className="ds-hero">
          <div className="ds-hero-eyebrow">Version 2 · Extended library</div>
          <h1 className="ds-hero-title">
            Components, <span className="blue">patterns</span> &amp; <span className="peach">tokens</span>.
          </h1>
          <p className="ds-hero-sub">
            The working surfaces of Paave — buttons, inputs, badges, switches, tooltips, metric cards,
            avatars, info cards. Each component is shown in its states and in the context of the Paave
            product (HOSE tickers, XP bars, paper trades, Vietnamese copy).
          </p>
          <div className="ds-hero-meta">
            <div className="ds-hero-meta-item">
              <div className="k">Components</div>
              <div className="v">15</div>
            </div>
            <div className="ds-hero-meta-item">
              <div className="k">Icons</div>
              <div className="v">75</div>
            </div>
            <div className="ds-hero-meta-item">
              <div className="k">Tokens</div>
              <div className="v">120+</div>
            </div>
            <div className="ds-hero-meta-item">
              <div className="k">Surfaces</div>
              <div className="v">3</div>
            </div>
          </div>
        </header>

        <LogoSection />
        <IconSection />
        <GridSection />
        <ShadowSection />
        <ColorSection />

        <ButtonsSection />
        <TogglesSection />
        <BadgesSection />
        <ChoiceSection />
        <FeedbackSection />
        <TooltipSection />
        <BreadcrumbSection />

        <AvatarSection />
        <MetricSection />
        <InfoSection />

        <footer className="mt-16 pt-6 border-t border-border-neo-subtle flex justify-between items-center gap-6 flex-wrap">
          <div>
            <div className="text-base font-bold">Paave Design System v2</div>
            <div className="text-xs text-text-neo-tertiary mt-1">
              Updated April 2026 · Maintained by the Paave design guild
            </div>
          </div>
          <div className="text-xs text-text-neo-tertiary">
            Made with Pretendard + JetBrains Mono · © Paave 2026
          </div>
        </footer>
      </main>
    </div>
  );
}
