import Foundation
import Security

struct KeychainStore {
    private let service: String

    init(service: String = "FieldNotebook") {
        self.service = service
    }

    enum Account: String {
        case accessToken
        case refreshToken
        case userId
    }

    func save(_ value: String, for account: Account) throws {
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
    }

    func load(_ account: Account) -> String? {
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
    }

    func delete(_ account: Account) {
        SecItemDelete([
            kSecClass as String:        kSecClassGenericPassword,
            kSecAttrService as String:  service,
            kSecAttrAccount as String:  account.rawValue,
        ] as CFDictionary)
    }

    func clearAll() {
        Account.allCases.forEach { delete($0) }
    }
}

extension KeychainStore.Account: CaseIterable {}

struct KeychainError: Error {
    let status: OSStatus
}
