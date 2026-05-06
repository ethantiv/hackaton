import SwiftUI

enum SansWeight: String {
    case regular  = "Inter-Regular"
    case medium   = "Inter-Medium"
    case semibold = "Inter-SemiBold"
    case bold     = "Inter-Bold"
}

enum MonoWeight: String {
    case regular = "JetBrainsMono-Regular"
    case medium  = "JetBrainsMono-Medium"
}

extension Font {
    static func sans(_ weight: SansWeight, size: CGFloat) -> Font {
        .custom(weight.rawValue, size: size)
    }
    static func mono(_ weight: MonoWeight = .regular, size: CGFloat) -> Font {
        .custom(weight.rawValue, size: size)
    }

    // Type roles from DESIGN.md §3
    static let labelSmall = Font.sans(.medium, size: 13)
    static let bodyText   = Font.sans(.regular, size: 16)
    static let bodyLarge  = Font.sans(.regular, size: 17)
    static let titleText  = Font.sans(.semibold, size: 18)
    static let headline   = Font.sans(.semibold, size: 24)
    static let display    = Font.sans(.bold, size: 32)
}
