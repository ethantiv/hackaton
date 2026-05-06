import SwiftUI

extension Color {
    init(hex: UInt32) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }

    // Brand
    static let signal      = Color(hex: 0x1262C4)
    static let signalDark  = Color(hex: 0x0E4F9C)
    static let signalLight = Color(hex: 0xDBE7F6)

    // Neutrals
    static let cream      = Color(hex: 0xF6F7F9)
    static let mist       = Color(hex: 0xEAECF1)
    static let mistDeep   = Color(hex: 0xDFE2E8)
    static let borderHair = Color(hex: 0xC8CCD5)
    static let borderSoft = Color(hex: 0xDADDE4)
    static let muted      = Color(hex: 0x4A5260)
    static let bodyInk    = Color(hex: 0x2C3138)
    static let titleInk   = Color(hex: 0x1A1F26)
    static let inkOnSignal = Color(hex: 0xFBFCFE)

    // Status
    static let statusPending  = Color(hex: 0x4A5260)
    static let statusProgress = Color(hex: 0x1262C4)
    static let statusDone     = Color(hex: 0x216B3E)
    static let statusUrgent   = Color(hex: 0x7A570B)

    static let statusPendingSoft  = Color(hex: 0xE5E7EB)
    static let statusProgressSoft = Color(hex: 0xDBE7F6)
    static let statusDoneSoft     = Color(hex: 0xD8ECDF)
    static let statusUrgentSoft   = Color(hex: 0xFDF3DC)
}

enum Spacing {
    static let tapMin: CGFloat = 56
    static let ctaHeight: CGFloat = 64
    static let cardPad: CGFloat = 24
    static let rowHeight: CGFloat = 76
    static let topBarHeight: CGFloat = 64
}

enum Radius {
    static let sm: CGFloat = 6
    static let md: CGFloat = 10
    static let lg: CGFloat = 14
    static let xl: CGFloat = 20
    static let xxl: CGFloat = 24
}
