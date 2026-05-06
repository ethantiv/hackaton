import XCTest
@testable import FieldNotebook

final class KeychainStoreTests: XCTestCase {
    let store = KeychainStore(service: "FieldNotebookTests")

    override func tearDown() async throws {
        store.clearAll()
    }

    func testRoundTrip() throws {
        try store.save("token-123", for: .accessToken)
        XCTAssertEqual(store.load(.accessToken), "token-123")
    }

    func testOverwrite() throws {
        try store.save("first", for: .refreshToken)
        try store.save("second", for: .refreshToken)
        XCTAssertEqual(store.load(.refreshToken), "second")
    }

    func testDelete() throws {
        try store.save("x", for: .userId)
        store.delete(.userId)
        XCTAssertNil(store.load(.userId))
    }
}
