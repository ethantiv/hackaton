import Foundation

enum Route: Hashable {
    case jobDetail(jobId: String)
    case capture(jobId: String)
}
