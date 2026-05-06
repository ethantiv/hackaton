import SwiftUI

struct DoneAccordion: View {
    let doneJobs: [JobDTO]
    @State private var expanded = false

    var body: some View {
        VStack(spacing: 0) {
            Button {
                withAnimation(.easeOut(duration: 0.2)) { expanded.toggle() }
            } label: {
                HStack {
                    Text("Zakończone (\(doneJobs.count))")
                        .font(.titleText).foregroundStyle(Color.titleInk)
                    Spacer()
                    IconView(name: .chevronRight)
                        .rotationEffect(.degrees(expanded ? 90 : 0))
                        .foregroundStyle(Color.muted)
                }
                .padding(.horizontal, 20)
                .frame(height: Spacing.tapMin)
            }
            if expanded {
                ForEach(doneJobs) { JobRow(job: $0) }
            }
        }
        .background(Color.cream)
    }
}
