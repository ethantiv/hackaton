import SwiftUI

struct LoginView: View {
    @Environment(AppStore.self) private var store
    @State private var email = ""
    @State private var password = ""
    @State private var error: APIError?
    @State private var lockedUntil: Date?
    @State private var submitting = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Field Notebook")
                .font(.display).foregroundStyle(Color.titleInk)
                .padding(.top, 32)
            Text("Zaloguj się, żeby zobaczyć dzisiejsze zlecenia.")
                .font(.bodyText).foregroundStyle(Color.bodyInk)

            VStack(spacing: 12) {
                TextField("E-mail", text: $email)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding(14)
                    .background(Color.mist, in: RoundedRectangle(cornerRadius: Radius.md))

                SecureField("Hasło", text: $password)
                    .padding(14)
                    .background(Color.mist, in: RoundedRectangle(cornerRadius: Radius.md))
            }
            .font(.bodyText)
            .padding(.top, 8)

            if let error {
                Text(message(for: error))
                    .font(.labelSmall).foregroundStyle(Color.statusUrgent)
            }

            Spacer()

            Text("Konta testowe: zobacz README backendu.")
                .font(.labelSmall).foregroundStyle(Color.muted)
        }
        .padding(.horizontal, 20)
        .background(Color.cream)
        .safeAreaInset(edge: .bottom) {
            BottomCTA(title: submitting ? "Logowanie…" : "Zaloguj",
                      enabled: !submitting && !email.isEmpty && !password.isEmpty) {
                Task { await submit() }
            }
        }
    }

    private func submit() async {
        submitting = true
        defer { submitting = false }
        error = nil
        do {
            try await store.login(email: email, password: password)
        } catch let e as APIError {
            self.error = e
            if case .accountLocked(let until) = e { lockedUntil = until }
        } catch let e as KeychainError {
            self.error = .underlying("Keychain status \(e.status)")
        } catch {
            self.error = .underlying(String(describing: error))
        }
    }

    private func message(for e: APIError) -> String {
        if case .accountLocked(let until) = e {
            let minutes = max(0, Int(until.timeIntervalSinceNow / 60))
            return "Konto zablokowane (~\(minutes) min)."
        }
        return e.userMessagePolish
    }
}
