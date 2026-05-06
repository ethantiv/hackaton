import SwiftUI

struct SyncIndicator: View {
    let state: AppStore.SyncState

    var body: some View {
        HStack(spacing: 6) {
            IconView(name: icon, size: 14).foregroundStyle(color)
            Text(label).font(.labelSmall).foregroundStyle(Color.muted)
        }
    }

    private var icon: IconName {
        switch state {
        case .synced:  return .check
        case .queued:  return .refreshCw          // substituted from .sync
        case .offline: return .cloudOff           // substituted from .syncOff
        }
    }
    private var color: Color {
        switch state {
        case .synced:  return Color.statusDone
        case .queued:  return Color.statusProgress
        case .offline: return Color.statusUrgent
        }
    }
    private var label: String {
        switch state {
        case .synced:                 return "Zsynchronizowane"
        case .queued(let n):          return "W kolejce: \(n)"
        case .offline:                return "Offline"
        }
    }
}
