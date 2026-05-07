import SwiftUI

struct SpotlightCard: View {
    let job: JobDTO
    /// e.g. "Następne zlecenie", "Pierwsze zlecenie", "Ostatnie zlecenie",
    /// "Trwa zlecenie". Caller picks based on workday state.
    let spotlightLabel: String

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            address
                .padding(.top, 16)
            if let district = job.district {
                Text(district)
                    .font(.sans(.medium, size: 14))
                    .foregroundStyle(Color.muted)
                    .padding(.top, 2)
            }
            Text(job.description)
                .font(.bodyText)
                .foregroundStyle(Color.bodyInk)
                .lineLimit(2)
                .padding(.top, 12)
            footer
                .padding(.top, 18)
        }
        .padding(Spacing.cardPad)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.mist, in: RoundedRectangle(cornerRadius: Radius.xl))
        .overlay(
            RoundedRectangle(cornerRadius: Radius.xl)
                .stroke(Color.borderSoft, lineWidth: 1)
        )
    }

    private var header: some View {
        HStack(spacing: 8) {
            ZStack {
                Circle().fill(Color.mistDeep)
                IconView(name: categoryIcon(for: job.category), size: 13)
                    .foregroundStyle(Color.bodyInk)
            }
            .frame(width: 24, height: 24)

            Text("\(spotlightLabel) · \(categoryLabel(for: job.category))")
                .font(.sans(.semibold, size: 13))
                .foregroundStyle(Color.muted)

            Spacer()

            if job.priority == .urgent {
                PriorityTag(priority: .urgent)
            }
        }
    }

    private var address: some View {
        // Address + optional unit on the same line, unit lighter weight.
        // Matches prototype line-height: -0.5 letterSpacing, 28/34.
        let suffix = job.unit.map { " " + $0 } ?? ""
        return (
            Text(job.address)
                .font(.sans(.bold, size: 28))
                .foregroundStyle(Color.titleInk)
            + Text(suffix)
                .font(.sans(.medium, size: 28))
                .foregroundStyle(Color.bodyInk)
        )
        .lineSpacing(2)
    }

    private var footer: some View {
        HStack(spacing: 16) {
            HStack(spacing: 6) {
                IconView(name: .clock, size: 15).foregroundStyle(Color.bodyInk)
                Text(job.scheduledWindow)
                    .font(.mono(.medium, size: 14))
                    .foregroundStyle(Color.bodyInk)
            }
            if let travel = job.travelTimeMin {
                HStack(spacing: 6) {
                    IconView(name: .mapPin, size: 15).foregroundStyle(Color.bodyInk)
                    Text("~ \(travel) min jazdy")
                        .font(.sans(.medium, size: 14))
                        .foregroundStyle(Color.bodyInk)
                }
            }
            Spacer()
            Text(job.ticketId)
                .font(.mono(.regular, size: 12))
                .foregroundStyle(Color.muted)
        }
    }
}
