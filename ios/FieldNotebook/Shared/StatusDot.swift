import SwiftUI

struct StatusDot: View {
    let status: JobStatus
    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 8, height: 8)
            .accessibilityHidden(true)
    }
    private var color: Color {
        switch status {
        case .pending: return Color.statusPending
        case .in_progress: return Color.statusProgress
        case .done: return Color.statusDone
        }
    }
}
