import SwiftUI

struct BiometricGateView<Content: View>: View {
    @Environment(\.scenePhase) private var scenePhase
    @Environment(AppStore.self) private var store
    @State private var unlocked = false
    @State private var biometricUnavailable = false
    @State private var auth = BiometricAuth()
    let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        ZStack {
            if unlocked {
                content()
            } else {
                lockedView
            }
        }
        .task { await tryUnlock() }
        .onChange(of: scenePhase) { _, new in
            if new == .background { unlocked = false }
            if new == .active && !unlocked { Task { await tryUnlock() } }
        }
    }

    private var lockedView: some View {
        VStack(spacing: 16) {
            IconView(name: .check, size: 48).foregroundStyle(Color.signal)
            Text("Field Notebook").font(.headline)
            if biometricUnavailable {
                Text("Zaloguj się hasłem aplikacji, żeby kontynuować.").font(.bodyText).foregroundStyle(Color.muted)
                Button("Zaloguj hasłem") { Task { await store.logout() } }
                    .buttonStyle(.borderedProminent)
            } else {
                Button("Odblokuj") { Task { await tryUnlock() } }
                    .buttonStyle(.borderedProminent)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.cream)
    }

    private func tryUnlock() async {
        let r = await auth.authenticate()
        switch r {
        case .success: unlocked = true
        case .unavailable:
            biometricUnavailable = true
            #if targetEnvironment(simulator)
            unlocked = true
            #endif
        case .failed, .userCancelled: break
        }
    }
}
