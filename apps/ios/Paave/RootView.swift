import SwiftUI
import DesignSystem
import PaaveCore

/// M0 scaffold screen — proves the token pipeline, type scale, money layer, and the
/// signature CTA render correctly on device. Replaced by FeatureOnboarding in M1.
struct RootView: View {
    private let samplePortfolio = Money(wire: "68500000", currency: .vnd)

    var body: some View {
        VStack(spacing: Spacing.space8) {
            Spacer()

            Text(verbatim: "PAAVE")
                .kinetic(TypeScale.titleLg)
                .textCase(.uppercase)
                .foregroundStyle(InkColor.limeSoft)

            VStack(spacing: Spacing.space2) {
                Text(verbatim: "M0 · Kinetic scaffold")
                    .kinetic(TypeScale.captionPulse)
                    .textCase(.uppercase)
                    .foregroundStyle(InkColor.plasma)

                if let samplePortfolio {
                    Text(verbatim: samplePortfolio.formatted(locale: Locale(identifier: "vi_VN")))
                        .kinetic(TypeScale.displayLg)
                        .foregroundStyle(InkColor.limeSoft)
                        .monospacedDigit()
                }

                Text(verbatim: "Decimal-exact · tokens only · dark-first")
                    .kinetic(TypeScale.bodyMd)
                    .foregroundStyle(InkColor.fog)
            }
            .padding(Spacing.space8)
            .frame(maxWidth: .infinity)
            .background(InkColor.ink800)
            .clipShape(RoundedRectangle(cornerRadius: Radius.xxl, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: Radius.xxl, style: .continuous)
                    .stroke(InkColor.edge, lineWidth: 1)
            }

            Spacer()

            KineticButton("Enter the ledger") {
                // M1: routes into FeatureOnboarding
            }
        }
        .padding(Spacing.space6)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(InkColor.ink900)
    }
}

#Preview {
    RootView()
}
