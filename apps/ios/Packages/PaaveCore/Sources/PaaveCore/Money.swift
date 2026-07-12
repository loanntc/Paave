import Foundation

/// Supported display currencies (VN primary; KRW/USD are reference-market display only).
public enum Currency: String, Sendable, Codable, CaseIterable {
    case vnd = "VND"
    case krw = "KRW"
    case usd = "USD"

    /// Minor units for formatting (VND and KRW have none).
    public var minorUnits: Int {
        switch self {
        case .vnd, .krw: 0
        case .usd: 2
        }
    }
}

/// Exact money value. HARD RULE: money is never a `Double` — amounts cross the wire
/// as strings and live as `Decimal` in the app (CLAUDE.md / backend contract).
public struct Money: Equatable, Hashable, Sendable {
    public let amount: Decimal
    public let currency: Currency

    public init(amount: Decimal, currency: Currency) {
        self.amount = amount
        self.currency = currency
    }

    /// Strict wire-format parser. Accepts only `-?digits(.digits)?` — rejects partial
    /// parses like "12abc" that `Decimal(string:)` would silently accept.
    public init?(wire: String, currency: Currency) {
        guard Money.isValidWire(wire),
              let value = Decimal(string: wire, locale: Locale(identifier: "en_US_POSIX"))
        else { return nil }
        self.init(amount: value, currency: currency)
    }

    /// `-?[0-9]+(\.[0-9]+)?` — ASCII digits only, no exponent, no grouping separators.
    private static func isValidWire(_ string: String) -> Bool {
        var digits = Substring(string)
        if digits.first == "-" { digits = digits.dropFirst() }
        guard !digits.isEmpty else { return false }
        let parts = digits.split(separator: ".", omittingEmptySubsequences: false)
        guard parts.count <= 2 else { return false }
        return parts.allSatisfy { part in
            !part.isEmpty && part.allSatisfy { $0.isASCII && $0.isNumber }
        }
    }

    /// Locale-independent string for sending back over the wire.
    public var wireValue: String { "\(amount)" }

    /// Localized display string (e.g. "68.500 ₫" in vi_VN).
    public func formatted(locale: Locale = .current) -> String {
        amount.formatted(
            .currency(code: currency.rawValue)
            .precision(.fractionLength(0...currency.minorUnits))
            .locale(locale)
        )
    }

    public enum MoneyError: Error, Equatable {
        case currencyMismatch
    }

    public func adding(_ other: Money) throws -> Money {
        guard other.currency == currency else { throw MoneyError.currencyMismatch }
        return Money(amount: amount + other.amount, currency: currency)
    }

    public func subtracting(_ other: Money) throws -> Money {
        guard other.currency == currency else { throw MoneyError.currencyMismatch }
        return Money(amount: amount - other.amount, currency: currency)
    }
}
