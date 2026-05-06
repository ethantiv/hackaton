import SwiftUI

struct JobRow: View {
    let job: JobDTO
    var body: some View {
        HStack(spacing: 12) {
            StatusDot(status: job.status)
            VStack(alignment: .leading, spacing: 4) {
                Text(job.address).font(.titleText).foregroundStyle(Color.titleInk)
                HStack(spacing: 8) {
                    Text(job.scheduledWindow).font(.mono(.regular, size: 13)).foregroundStyle(Color.muted)
                    if job.priority == .urgent { PriorityTag(priority: .urgent) }
                }
                Text(job.description).font(.bodyText).foregroundStyle(Color.bodyInk).lineLimit(2)
            }
            Spacer()
            IconView(name: .chevronRight).foregroundStyle(Color.borderHair)
        }
        .padding(.horizontal, 20)
        .frame(minHeight: Spacing.rowHeight)
    }
}
