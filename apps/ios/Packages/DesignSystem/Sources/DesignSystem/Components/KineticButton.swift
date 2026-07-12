import SwiftUI

/// The signature Kinetic Drop CTA (design-system.md §8.2).
/// Height 68pt, uppercase display text, glow by variant, 0.98 press scale.
/// Rule: only ONE `.lime` variant per screen.
public struct KineticButton: View {
    public enum Variant: Sendable {
        case lime, plasma, ghost
    }

    private let title: LocalizedStringKey
    private let variant: Variant
    private let action: () -> Void

    public init(_ title: LocalizedStringKey, variant: Variant = .lime, action: @escaping () -> Void) {
        self.title = title
        self.variant = variant
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(title)
                .kinetic(TypeScale.titleMd)
                .textCase(.uppercase)
                .frame(maxWidth: .infinity, minHeight: Layout.ctaHeight)
        }
        .buttonStyle(KineticPressStyle(variant: variant))
        .accessibilityAddTraits(.isButton)
    }
}

private struct KineticPressStyle: ButtonStyle {
    let variant: KineticButton.Variant
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .foregroundStyle(foreground)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: Radius.xl, style: .continuous))
            .overlay {
                if case .ghost = variant {
                    RoundedRectangle(cornerRadius: Radius.xl, style: .continuous)
                        .stroke(InkColor.edgeStrong, lineWidth: 1)
                }
            }
            .shadow(color: glow, radius: 15, y: 8)
            .scaleEffect(configuration.isPressed && !reduceMotion ? 0.98 : 1)
            .animation(Easing.standard(duration: Motion.fast), value: configuration.isPressed)
    }

    private var foreground: Color {
        switch variant {
        case .lime: InkColor.limeInk
        case .plasma: InkColor.white
        case .ghost: InkColor.limeSoft
        }
    }

    @ViewBuilder private var background: some View {
        switch variant {
        case .lime: InkGradient.limeDrop
        case .plasma: InkGradient.plasmaDrop
        case .ghost: Color.clear
        }
    }

    private var glow: Color {
        switch variant {
        case .lime: InkColor.limeGlow
        case .plasma: InkColor.plasmaGlow
        case .ghost: .clear
        }
    }
}

#Preview("Variants", traits: .sizeThatFitsLayout) {
    VStack(spacing: Spacing.space4) {
        KineticButton("Enter the ledger") {}
        KineticButton("Verify pulse", variant: .plasma) {}
        KineticButton("Skip for now", variant: .ghost) {}
    }
    .padding(Spacing.space6)
    .background(InkColor.ink900)
}
