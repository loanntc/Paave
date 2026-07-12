import Testing
import Foundation
@testable import PaaveCore

@Suite("Money — decimal-exact trust layer")
struct MoneyTests {
    @Test("parses a plain wire amount")
    func parsesWire() {
        let money = Money(wire: "68500", currency: .vnd)
        #expect(money?.amount == Decimal(68500))
    }

    @Test("parses decimals and negatives exactly")
    func parsesDecimal() {
        #expect(Money(wire: "0.1", currency: .usd)?.amount == Decimal(string: "0.1"))
        #expect(Money(wire: "-12.34", currency: .usd)?.amount == Decimal(string: "-12.34"))
    }

    @Test("rejects garbage and partial parses", arguments: ["abc", "12abc", "1,000", "", " 5", "1.2.3", "1e5"])
    func rejectsInvalid(wire: String) {
        #expect(Money(wire: wire, currency: .vnd) == nil)
    }

    @Test("0.1 + 0.2 is exactly 0.3 (the float trap)")
    func floatTrap() throws {
        let a = try #require(Money(wire: "0.1", currency: .usd))
        let b = try #require(Money(wire: "0.2", currency: .usd))
        #expect(try a.adding(b).amount == Decimal(string: "0.3"))
    }

    @Test("wire round-trip is lossless")
    func wireRoundTrip() throws {
        let money = try #require(Money(wire: "12345.6789", currency: .usd))
        #expect(money.wireValue == "12345.6789")
    }

    @Test("cross-currency arithmetic throws")
    func currencyMismatch() throws {
        let vnd = try #require(Money(wire: "1000", currency: .vnd))
        let usd = try #require(Money(wire: "1", currency: .usd))
        #expect(throws: Money.MoneyError.currencyMismatch) { try vnd.adding(usd) }
    }

    @Test("VND formats with no minor units")
    func vndFormatting() throws {
        let money = try #require(Money(wire: "68500", currency: .vnd))
        let formatted = money.formatted(locale: Locale(identifier: "vi_VN"))
        #expect(formatted.contains("68"))
        #expect(!formatted.contains(",00") && !formatted.contains(".00"))
    }
}
