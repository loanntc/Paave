# Paave iOS (v2.0)

Native iOS app — Swift 6 / SwiftUI, iOS 16+. See `docs/v2-native/` for the full kickoff package
(ADR, architecture, roadmap) and `CLAUDE.md` for the hard rules.

## First build (on a Mac)

```bash
brew install xcodegen swiftlint
cd apps/ios
xcodegen generate          # creates Paave.xcodeproj from project.yml
open Paave.xcodeproj       # Xcode 16+, run the Paave scheme
```

The `.xcodeproj` is generated and git-ignored — `project.yml` is the source of truth.

## Everyday commands

```bash
# unit tests for the money/core layer (works anywhere with a Swift toolchain)
swift test --package-path Packages/PaaveCore

# lint (CI fails on violations, including the custom money/token rules)
swiftlint --strict

# regenerate design tokens after editing packages/tokens/tokens.json (repo root)
node ../../packages/tokens/generate.mjs

# TestFlight build (after signing setup)
bundle exec fastlane beta
```

## Structure

```
Paave/                   app target: entry, root view, privacy manifest
Packages/
  DesignSystem/          Kinetic Drop tokens (Generated/ — do not edit) + components
  PaaveCore/             Decimal money layer + core logic (100% test target)
  PaaveAPI/              API client seam — replaced by generated client from
                         packages/contracts/openapi.yaml as endpoints land
```

## M0 remaining setup (owner/PM action needed)

- [ ] Apple Developer Program account + team ID → `project.yml` signing settings
- [ ] App Store Connect API key → fastlane (CI secrets: `ASC_KEY_ID`, `ASC_ISSUER_ID`, `ASC_KEY`)
- [ ] Space Grotesk + Manrope font files (OFL-licensed) → `Paave/Resources/Fonts/` + Info.plist
      `UIAppFonts` entries (TypeToken falls back to the system font until then)
- [ ] Crash reporting vendor decision (Sentry vs Crashlytics) — architecture doc §8
- [ ] Market-data vendor spike (R-01) before any `getQuote` implementation
