import Foundation

/// Maps `JobDTO.category` (raw string from the backend) to the bounded
/// `IconName` set in `IconView.swift`. Mirrors `categoryIcon` from
/// `app/src/components/Icon.tsx`. Unknown categories fall back to `.wrench`
/// so we never crash on a backend-side typo.
func categoryIcon(for category: String) -> IconName {
    switch category {
    case "elektryka":    return .lightning
    case "hydraulika":   return .droplet
    case "klimatyzacja": return .snowflake
    case "stolarka":     return .hammer
    case "ogolne":       return .wrench
    default:             return .wrench
    }
}

/// Polish display label for a `JobDTO.category`. Mirrors `categoryLabel`
/// from `app/src/data/mockJobs.ts`. Unknown categories fall back to the
/// generic "Ogólne" so the UI never shows a raw slug.
func categoryLabel(for category: String) -> String {
    switch category {
    case "elektryka":    return "Elektryka"
    case "hydraulika":   return "Hydraulika"
    case "klimatyzacja": return "Klimatyzacja"
    case "stolarka":     return "Stolarka"
    case "ogolne":       return "Ogólne"
    default:             return "Ogólne"
    }
}
