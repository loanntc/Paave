// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PaaveCore",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "PaaveCore", targets: ["PaaveCore"])
    ],
    targets: [
        .target(name: "PaaveCore"),
        .testTarget(name: "PaaveCoreTests", dependencies: ["PaaveCore"])
    ]
)
