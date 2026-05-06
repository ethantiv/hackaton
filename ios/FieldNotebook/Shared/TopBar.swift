import SwiftUI

struct TopBar: View {
    let title: String
    let syncState: AppStore.SyncState

    var body: some View {
        HStack {
            Text(title).font(.titleText).foregroundStyle(Color.titleInk)
            Spacer()
            SyncIndicator(state: syncState)
        }
        .padding(.horizontal, 20)
        .frame(height: Spacing.topBarHeight)
        .background(Color.cream)
        .overlay(alignment: .bottom) {
            Rectangle().fill(Color.borderSoft).frame(height: 1)
        }
    }
}
