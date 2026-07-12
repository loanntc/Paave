import SwiftUI
import DesignSystem

@main
struct PaaveApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
                .preferredColorScheme(.dark) // Kinetic Drop is dark-first, dark-only in v2.0
                .background(InkColor.ink900)
        }
    }
}
