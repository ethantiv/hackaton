import SwiftUI

struct SpotlightCard: View {
    let job: JobDTO
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Następne").font(.labelSmall).foregroundStyle(Color.muted)
                Spacer()
                Text(job.ticketId).font(.mono(.medium, size: 13)).foregroundStyle(Color.muted)
            }
            Text(job.address).font(.headline).foregroundStyle(Color.titleInk)
            Text(job.description).font(.bodyText).foregroundStyle(Color.bodyInk).lineLimit(3)
            HStack(spacing: 8) {
                Text(job.scheduledWindow).font(.mono(.regular, size: 14))
                if job.priority == .urgent { PriorityTag(priority: .urgent) }
            }
            .foregroundStyle(Color.muted)
        }
        .padding(Spacing.cardPad)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.mist, in: RoundedRectangle(cornerRadius: Radius.xl))
    }
}
