import LocalAuthentication

enum BiometricResult {
    case success
    case failed
    case unavailable
    case userCancelled
}

@Observable @MainActor
final class BiometricAuth {
    var lastResult: BiometricResult = .unavailable

    func authenticate() async -> BiometricResult {
        let ctx = LAContext()
        ctx.localizedFallbackTitle = "Wpisz hasło"

        var err: NSError?
        guard ctx.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &err) else {
            lastResult = .unavailable
            return .unavailable
        }
        do {
            let ok = try await ctx.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: "Odblokuj aplikację, żeby zobaczyć dzisiejsze zlecenia")
            let result: BiometricResult = ok ? .success : .failed
            lastResult = result
            return result
        } catch let e as LAError where e.code == .userCancel {
            lastResult = .userCancelled
            return .userCancelled
        } catch {
            lastResult = .failed
            return .failed
        }
    }
}
