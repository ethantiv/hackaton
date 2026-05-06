import Foundation
import Security

// On real devices we go through the Keychain. On the iOS Simulator the app is
// unsigned, has no keychain-access-groups entitlement, and SecItemAdd returns
// errSecMissingEntitlement (-34018). UserDefaults is good enough there — this
// build is for prototyping only and never ships to a real distribution channel
// via the simulator.
struct KeychainStore {
    private let service: String

    init(service: String = "FieldNotebook") {
        self.service = service
    }

    enum Account: String, CaseIterable {
        case accessToken
        case refreshToken
        case userId
    }

    func save(_ value: String, for account: Account) throws {
        #if targetEnvironment(simulator)
        UserDefaults.standard.set(value, forKey: defaultsKey(account))
        #else
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String:           kSecClassGenericPassword,
            kSecAttrService as String:     service,
            kSecAttrAccount as String:     account.rawValue,
        ]
        SecItemDelete(query as CFDictionary)
        let attrs: [String: Any] = query.merging([
            kSecAttrAccessible as String:  kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            kSecValueData as String:       data,
        ]) { _, new in new }
        let status = SecItemAdd(attrs as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeychainError(status: status) }
        #endif
    }

    func load(_ account: Account) -> String? {
        #if targetEnvironment(simulator)
        return UserDefaults.standard.string(forKey: defaultsKey(account))
        #else
        let query: [String: Any] = [
            kSecClass as String:            kSecClassGenericPassword,
            kSecAttrService as String:      service,
            kSecAttrAccount as String:      account.rawValue,
            kSecReturnData as String:       true,
            kSecMatchLimit as String:       kSecMatchLimitOne,
        ]
        var item: CFTypeRef?
        guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
              let data = item as? Data else { return nil }
        return String(data: data, encoding: .utf8)
        #endif
    }

    func delete(_ account: Account) {
        #if targetEnvironment(simulator)
        UserDefaults.standard.removeObject(forKey: defaultsKey(account))
        #else
        SecItemDelete([
            kSecClass as String:        kSecClassGenericPassword,
            kSecAttrService as String:  service,
            kSecAttrAccount as String:  account.rawValue,
        ] as CFDictionary)
        #endif
    }

    func clearAll() {
        Account.allCases.forEach { delete($0) }
    }

    private func defaultsKey(_ account: Account) -> String {
        "\(service).\(account.rawValue)"
    }
}

struct KeychainError: Error {
    let status: OSStatus
}
