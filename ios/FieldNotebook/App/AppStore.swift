import Foundation
import Network

@MainActor
@Observable
final class AppStore {
    enum SyncState: Equatable {
        case synced
        case queued(Int)
        case offline
    }

    enum Phase {
        case bootstrapping
        case loggedOut
        case lockedOut
        case ready
    }

    // Public state
    var phase: Phase = .bootstrapping
    var user: UserDTO?
    var jobs: [JobDTO] = []
    var photosByJob: [String: [PhotoDTO]] = [:]
    var pendingNewJobBanner = false
    var syncState: SyncState = .synced

    // Internal
    private let api: APIClient
    private let keychain: KeychainStore
    private var pendingActions: [PendingAction] = []
    private let monitor = NWPathMonitor()
    private let monitorQueue = DispatchQueue(label: "AppStore.monitor")

    init(api: APIClient = APIClient(), keychain: KeychainStore = KeychainStore()) {
        self.api = api
        self.keychain = keychain
        Task { await api.setTokenSource(self) }
        startMonitor()
    }

    // MARK: - Bootstrap

    func bootstrap() async {
        if keychain.load(.refreshToken) != nil {
            await loadProfileAndJobs()
        } else {
            phase = .loggedOut
        }
    }

    // MARK: - Auth

    func login(email: String, password: String) async throws {
        let body = ["email": email, "password": password]
        let res: LoginResponse = try await api.send("POST", "/auth/login", body: body, as: LoginResponse.self)
        try keychain.save(res.accessToken, for: .accessToken)
        try keychain.save(res.refreshToken, for: .refreshToken)
        try keychain.save(res.user.id, for: .userId)
        user = res.user
        await loadJobs()
        applyOfflineSimulationFlag()
        phase = .ready
    }

    func logout() async {
        if let refresh = keychain.load(.refreshToken) {
            try? await api.sendVoid("POST", "/auth/logout", body: ["refreshToken": refresh])
        }
        keychain.clearAll()
        user = nil
        jobs = []
        photosByJob = [:]
        pendingNewJobBanner = false
        syncState = .synced
        phase = .loggedOut
    }

    // MARK: - Jobs

    func loadProfileAndJobs() async {
        do {
            let me: UserDTO = try await api.send("GET", "/me", as: UserDTO.self)
            user = me
            await loadJobs()
            applyOfflineSimulationFlag()
            phase = .ready
        } catch APIError.unauthorized {
            keychain.clearAll()
            phase = .loggedOut
        } catch {
            phase = .loggedOut
        }
    }

    func loadJobs() async {
        do {
            let res: [JobDTO] = try await api.send("GET", "/jobs", as: [JobDTO].self)
            jobs = res
            pendingNewJobBanner = res.contains { $0.isNew }
        } catch {
            // keep cached list, surface offline state
            syncState = .offline
        }
    }

    func startJob(_ id: String) async {
        await mutateJob(id, path: "/jobs/\(id)/start")
    }

    func completeJob(_ id: String) async {
        await mutateJob(id, path: "/jobs/\(id)/complete")
    }

    private func mutateJob(_ id: String, path: String) async {
        if isOfflineSim {
            enqueue(.transition(jobId: id, path: path))
            applyOptimisticTransition(id: id, path: path)
            syncState = .queued(pendingActions.count)
            return
        }
        do {
            let updated: JobDTO = try await api.send("POST", path, as: JobDTO.self)
            apply(updated)
        } catch {
            enqueue(.transition(jobId: id, path: path))
            applyOptimisticTransition(id: id, path: path)
            syncState = .queued(pendingActions.count)
        }
    }

    func uploadPhoto(jobId: String, image: Data, description: String, mimeType: String) async {
        do {
            let photo: PhotoDTO = try await api.sendMultipart(
                "/jobs/\(jobId)/photos",
                fields: ["description": description],
                fileField: "file",
                fileData: image, filename: "photo.jpg", mimeType: mimeType,
                as: PhotoDTO.self)
            var list = photosByJob[jobId] ?? []
            list.append(photo)
            photosByJob[jobId] = list
        } catch {
            enqueue(.uploadPhoto(jobId: jobId, data: image, description: description, mimeType: mimeType))
            syncState = .queued(pendingActions.count)
        }
    }

    func acceptNewJob() {
        pendingNewJobBanner = false
    }

    func dismissNewJobBanner() {
        pendingNewJobBanner = false
    }

    // MARK: - Helpers

    private func apply(_ job: JobDTO) {
        if let idx = jobs.firstIndex(where: { $0.id == job.id }) {
            jobs[idx] = job
        }
    }

    private func applyOptimisticTransition(id: String, path: String) {
        guard let idx = jobs.firstIndex(where: { $0.id == id }) else { return }
        let next: JobStatus = path.hasSuffix("/start") ? .in_progress : .done
        let j = jobs[idx]
        jobs[idx] = JobDTO(
            id: j.id, ticketId: j.ticketId, category: j.category, address: j.address,
            unit: j.unit, district: j.district, description: j.description,
            scheduledWindow: j.scheduledWindow, scheduledStart: j.scheduledStart,
            estimatedDurationMin: j.estimatedDurationMin, status: next, priority: j.priority,
            contactName: j.contactName, contactPhone: j.contactPhone,
            travelTimeMin: j.travelTimeMin, isNew: j.isNew)
    }

    // MARK: - Offline queue

    enum PendingAction {
        case transition(jobId: String, path: String)
        case uploadPhoto(jobId: String, data: Data, description: String, mimeType: String)
    }

    private func enqueue(_ a: PendingAction) {
        pendingActions.append(a)
    }

    private func startMonitor() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                guard let self else { return }
                if path.status == .satisfied {
                    await self.flushPending()
                } else {
                    self.syncState = .offline
                }
            }
        }
        monitor.start(queue: monitorQueue)
    }

    private func flushPending() async {
        guard !pendingActions.isEmpty, !isOfflineSim else { return }
        var remaining: [PendingAction] = []
        for action in pendingActions {
            do {
                switch action {
                case .transition(_, let path):
                    let updated: JobDTO = try await api.send("POST", path, as: JobDTO.self)
                    apply(updated)
                case .uploadPhoto(let jobId, let data, let desc, let mime):
                    let photo: PhotoDTO = try await api.sendMultipart(
                        "/jobs/\(jobId)/photos",
                        fields: ["description": desc],
                        fileField: "file", fileData: data, filename: "photo.jpg",
                        mimeType: mime, as: PhotoDTO.self)
                    var list = photosByJob[jobId] ?? []
                    list.append(photo)
                    photosByJob[jobId] = list
                }
            } catch {
                remaining.append(action)
            }
        }
        pendingActions = remaining
        syncState = pendingActions.isEmpty ? .synced : .queued(pendingActions.count)
    }

    // Anna's account is the offline-scenario stand-in.
    private var isOfflineSim: Bool { user?.email == "anna@firma.pl" }

    private func applyOfflineSimulationFlag() {
        if isOfflineSim {
            syncState = .offline
        } else if pendingActions.isEmpty {
            syncState = .synced
        }
    }
}

// MARK: - TokenSource

extension AppStore: TokenSource {
    nonisolated var accessToken: String? {
        get async { await MainActor.run { keychain.load(.accessToken) } }
    }

    nonisolated func handleUnauthorized() async -> String? {
        guard let refresh = await MainActor.run(body: { keychain.load(.refreshToken) }) else { return nil }
        do {
            let res: RefreshResponse = try await api.send(
                "POST", "/auth/refresh",
                body: ["refreshToken": refresh],
                as: RefreshResponse.self)
            try await MainActor.run {
                try keychain.save(res.accessToken, for: .accessToken)
                try keychain.save(res.refreshToken, for: .refreshToken)
            }
            return res.accessToken
        } catch {
            await MainActor.run {
                keychain.clearAll()
                phase = .loggedOut
            }
            return nil
        }
    }
}
