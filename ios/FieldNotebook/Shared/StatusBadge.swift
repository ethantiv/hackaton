import SwiftUI

struct StatusBadge: View {
    let status: JobStatus

    var body: some View {
        HStack(spacing: 6) {
            IconView(name: icon, size: 14)
            Text(label).font(.labelSmall)
        }
        .foregroundStyle(foreground)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(background, in: RoundedRectangle(cornerRadius: Radius.sm))
        .accessibilityLabel(label)
    }

    private var label: String {
        switch status {
        case .pending:     return "Zaplanowane"
        case .in_progress: return "W trakcie"
        case .done:        return "Zakończone"
        }
    }
    private var icon: IconName {
        switch status {
        case .pending: return .clock
        case .in_progress: return .refreshCw      // substituted from .sync
        case .done: return .check
        }
    }
    private var foreground: Color {
        switch status {
        case .pending: return Color.statusPending
        case .in_progress: return Color.statusProgress
        case .done: return Color.statusDone
        }
    }
    private var background: Color {
        switch status {
        case .pending: return Color.statusPendingSoft
        case .in_progress: return Color.statusProgressSoft
        case .done: return Color.statusDoneSoft
        }
    }
}
