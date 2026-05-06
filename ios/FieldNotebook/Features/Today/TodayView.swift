import SwiftUI

struct TodayView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        @Bindable var store = store
        let pending = store.jobs.filter { $0.status != .done }
        let done    = store.jobs.filter { $0.status == .done }
        let next    = pending.first

        VStack(spacing: 0) {
            TopBar(title: store.user?.displayName ?? "Field Notebook",
                   syncState: store.syncState)
            ScrollView {
                VStack(spacing: 16) {
                    if store.pendingNewJobBanner {
                        NewJobBanner(onAccept: store.acceptNewJob,
                                     onDismiss: store.dismissNewJobBanner)
                    }
                    if let next {
                        NavigationLink(value: Route.jobDetail(jobId: next.id)) {
                            SpotlightCard(job: next).padding(.horizontal, 16)
                        }
                        .buttonStyle(.plain)
                    } else {
                        emptyState
                    }
                    ForEach(pending.dropFirst()) { job in
                        NavigationLink(value: Route.jobDetail(jobId: job.id)) {
                            JobRow(job: job)
                        }
                        .buttonStyle(.plain)
                    }
                    if !done.isEmpty {
                        DoneAccordion(doneJobs: done)
                    }
                }
                .padding(.vertical, 16)
            }
            .background(Color.cream)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            IconView(name: .check, size: 32).foregroundStyle(Color.statusDone)
            Text("Wszystko zrobione na dziś").font(.titleText).foregroundStyle(Color.titleInk)
            Text("Wracaj jutro o 8:00.").font(.bodyText).foregroundStyle(Color.muted)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 48)
    }
}
