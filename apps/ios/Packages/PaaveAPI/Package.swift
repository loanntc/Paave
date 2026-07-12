// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "PaaveAPI",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "PaaveAPI", targets: ["PaaveAPI"])
    ],
    dependencies: [
        .package(path: "../PaaveCore")
    ],
    targets: [
        .target(name: "PaaveAPI", dependencies: ["PaaveCore"])
    ]
)
