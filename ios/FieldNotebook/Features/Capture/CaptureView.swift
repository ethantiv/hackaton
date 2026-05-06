import SwiftUI

struct CaptureView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    let jobId: String

    @State private var image: UIImage?
    @State private var description = ""
    @State private var pickerOpen = false
    @State private var uploading = false

    var body: some View {
        VStack(spacing: 0) {
            DetailTopBar(onBack: { dismiss() },
                         ticketId: store.jobs.first(where: { $0.id == jobId })?.ticketId ?? "—",
                         syncState: store.syncState)
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Dokumentacja").font(.headline).foregroundStyle(Color.titleInk)
                    if let image {
                        Image(uiImage: image)
                            .resizable().scaledToFit()
                            .frame(maxWidth: .infinity, maxHeight: 280)
                            .clipShape(RoundedRectangle(cornerRadius: Radius.lg))
                    } else {
                        Button { pickerOpen = true } label: {
                            VStack(spacing: 12) {
                                IconView(name: .plus, size: 32).foregroundStyle(Color.signal)
                                Text("Wybierz zdjęcie").font(.titleText).foregroundStyle(Color.bodyInk)
                            }
                            .frame(maxWidth: .infinity, minHeight: 200)
                            .background(Color.mist, in: RoundedRectangle(cornerRadius: Radius.lg))
                        }
                    }
                    TextField("Krótki opis (np. wymieniono baterię)", text: $description, axis: .vertical)
                        .font(.bodyText)
                        .lineLimit(3...6)
                        .padding(14)
                        .background(Color.mist, in: RoundedRectangle(cornerRadius: Radius.md))
                }
                .padding(20)
            }
            .background(Color.cream)
            .safeAreaInset(edge: .bottom) {
                BottomCTA(title: uploading ? "Wysyłanie…" : "Zakończ zlecenie",
                          enabled: !uploading && image != nil && !description.isEmpty) {
                    Task { await submit() }
                }
            }
        }
        .navigationBarBackButtonHidden(true)
        .sheet(isPresented: $pickerOpen) { PhotoPicker(image: $image) }
    }

    private func submit() async {
        guard let image, let data = image.jpegData(compressionQuality: 0.8) else { return }
        uploading = true
        defer { uploading = false }
        await store.uploadPhoto(jobId: jobId, image: data, description: description, mimeType: "image/jpeg")
        await store.completeJob(jobId)
        dismiss()
    }
}
