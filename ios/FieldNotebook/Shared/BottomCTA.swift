import SwiftUI

struct BottomCTA: View {
    let title: String
    var enabled: Bool = true
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.sans(.semibold, size: 17))
                .foregroundStyle(Color.inkOnSignal)
                .frame(maxWidth: .infinity, minHeight: Spacing.ctaHeight)
                .background(enabled ? Color.signal : Color.signal.opacity(0.4),
                            in: RoundedRectangle(cornerRadius: Radius.lg))
        }
        .disabled(!enabled)
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(Color.cream)
        .overlay(alignment: .top) {
            Rectangle().fill(Color.borderSoft).frame(height: 1)
        }
    }
}
