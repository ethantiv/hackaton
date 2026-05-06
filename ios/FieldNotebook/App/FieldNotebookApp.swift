import SwiftUI

@main
struct FieldNotebookApp: App {
    var body: some Scene {
        WindowGroup {
            VStack(spacing: 12) {
                Text("Field Notebook").font(.display).foregroundStyle(Color.titleInk)
                Text("Steel Field Notebook").font(.headline).foregroundStyle(Color.bodyInk)
                Text("body 16 pt floor").font(.bodyText).foregroundStyle(Color.bodyInk)
                Text("ZL-26-0429").font(.mono(.medium, size: 14)).foregroundStyle(Color.muted)
            }
            .padding()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.cream)
        }
    }
}
