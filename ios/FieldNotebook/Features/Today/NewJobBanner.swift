import SwiftUI

struct NewJobBanner: View {
    let onAccept: () -> Void
    let onDismiss: () -> Void

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Nowe zlecenie").font(.titleText).foregroundStyle(Color.inkOnSignal)
                Text("Dodano w trakcie dnia.").font(.labelSmall).foregroundStyle(Color.inkOnSignal.opacity(0.78))
            }
            Spacer()
            Button("Akceptuj", action: onAccept)
                .buttonStyle(.borderedProminent).tint(Color.inkOnSignal)
            Button(action: onDismiss) { IconView(name: .check) }
                .foregroundStyle(Color.inkOnSignal)
        }
        .padding(16)
        .background(Color.signal, in: RoundedRectangle(cornerRadius: Radius.lg))
        .padding(.horizontal, 16)
    }
}
