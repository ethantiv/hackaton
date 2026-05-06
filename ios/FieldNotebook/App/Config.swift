import Foundation

enum AppConfig {
    static let apiBaseURL: URL = {
        #if DEBUG_LOCAL
        return URL(string: "http://localhost:3000")!
        #else
        return URL(string: "https://backend.mirek-rpi.org")!
        #endif
    }()
}
