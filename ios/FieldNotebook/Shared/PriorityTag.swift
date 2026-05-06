import SwiftUI

struct PriorityTag: View {
    let priority: JobPriority
    var body: some View {
        if priority == .urgent {
            HStack(spacing: 4) {
                IconView(name: .alertTriangle, size: 12)   // substituted from .warning
                Text("Pilne").font(.labelSmall)
            }
            .foregroundStyle(Color.statusUrgent)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Color.statusUrgentSoft, in: RoundedRectangle(cornerRadius: Radius.sm))
        }
    }
}
