import SwiftUI

struct TodayView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        let pending  = store.jobs.filter { $0.status != .done }
        let done     = store.jobs.filter { $0.status == .done }
        let spotlight = pickSpotlight(in: pending)
        let restOfDay = spotlight.map { s in pending.filter { $0.id != s.id } } ?? pending

        VStack(spacing: 0) {
            TopBar(date: Date(), syncState: store.syncState)

            ScrollView {
                VStack(spacing: 16) {
                    if store.pendingNewJobBanner {
                        NewJobBanner(onAccept: store.acceptNewJob,
                                     onDismiss: store.dismissNewJobBanner)
                    }

                    if let spotlight {
                        NavigationLink(value: Route.jobDetail(jobId: spotlight.id)) {
                            SpotlightCard(
                                job: spotlight,
                                spotlightLabel: spotlightLabelText(
                                    for: spotlight,
                                    pendingCount: pending.count,
                                    doneCount: done.count
                                )
                            )
                            .padding(.horizontal, 16)
                        }
                        .buttonStyle(.plain)
                    } else {
                        emptyState
                    }

                    if !restOfDay.isEmpty {
                        VStack(alignment: .leading, spacing: 0) {
                            sectionHeader(title: "Reszta dnia", count: restOfDay.count)
                                .padding(.top, 12)

                            ForEach(Array(restOfDay.enumerated()), id: \.element.id) { idx, job in
                                if idx > 0 {
                                    Rectangle()
                                        .fill(Color.borderSoft)
                                        .frame(height: 1)
                                        .padding(.leading, 20)
                                }
                                NavigationLink(value: Route.jobDetail(jobId: job.id)) {
                                    JobRow(job: job)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    if !done.isEmpty {
                        DoneAccordion(doneJobs: done)
                            .padding(.top, 8)
                    }
                }
                .padding(.vertical, 16)
            }
            .background(Color.cream)
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if let spotlight {
                    bottomCta(for: spotlight)
                }
            }
        }
    }

    // MARK: - Spotlight selection

    /// Prefer an in-progress job; otherwise the first pending one. Mirrors
    /// `pickSpotlight` in `app/src/screens/TodayScreen.tsx`.
    private func pickSpotlight(in pending: [JobDTO]) -> JobDTO? {
        if let inProgress = pending.first(where: { $0.status == .in_progress }) {
            return inProgress
        }
        return pending.first
    }

    /// Mirrors `spotlightLabel` in `app/src/screens/TodayScreen.tsx`.
    private func spotlightLabelText(
        for spotlight: JobDTO,
        pendingCount: Int,
        doneCount: Int
    ) -> String {
        if spotlight.status == .in_progress { return "Trwa zlecenie" }
        if doneCount == 0                   { return "Pierwsze zlecenie" }
        if pendingCount == 1                { return "Ostatnie zlecenie" }
        return "Następne zlecenie"
    }

    // MARK: - Bottom CTA

    @ViewBuilder
    private func bottomCta(for spotlight: JobDTO) -> some View {
        let title = spotlight.status == .in_progress ? "Otwórz zlecenie" : "Rozpocznij"
        NavigationLink(value: Route.jobDetail(jobId: spotlight.id)) {
            Text(title)
                .font(.sans(.semibold, size: 17))
                .foregroundStyle(Color.inkOnSignal)
                .frame(maxWidth: .infinity, minHeight: Spacing.ctaHeight)
                .background(Color.signal, in: RoundedRectangle(cornerRadius: Radius.lg))
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(TapGesture().onEnded {
            if spotlight.status == .pending {
                Task { await store.startJob(spotlight.id) }
            }
        })
        .background(Color.cream)
        .overlay(alignment: .top) {
            Rectangle().fill(Color.borderSoft).frame(height: 1)
        }
    }

    // MARK: - Section header

    private func sectionHeader(title: String, count: Int) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            Text(title)
                .font(.sans(.bold, size: 15))
                .foregroundStyle(Color.titleInk)
            Text("\(count)")
                .font(.sans(.medium, size: 13))
                .foregroundStyle(Color.muted)
            Spacer()
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }

    // MARK: - Empty state

    private var emptyState: some View {
        VStack(spacing: 8) {
            IconView(name: .check, size: 32).foregroundStyle(Color.statusDone)
            Text("Wszystko zrobione na dziś")
                .font(.titleText)
                .foregroundStyle(Color.titleInk)
            Text("Wracaj jutro o 8:00.")
                .font(.bodyText)
                .foregroundStyle(Color.muted)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
    }
}
