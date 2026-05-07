# Hackaton — Field Notebook

Mobile-only prototype for building-maintenance technicians. The repo holds three pieces:

- `app/` — Expo prototype (TypeScript + React Native + NativeWind).
- `ios/` — native SwiftUI port (XcodeGen project).
- `backend/` — Bun + Hono + SQLite REST API. Deployed to Coolify on the RPi at https://backend.mirek-rpi.org.

`PRODUCT.md` is the strategic spec, `DESIGN.md` is the visual system, `CLAUDE.md` is the orientation file for Claude Code agents.

## Run the iOS app locally on macOS

You need a Mac with Xcode (the iOS Simulator is bundled with it; Command Line Tools alone are not enough).

1. Install **Xcode** from the Mac App Store (~15 GB).
2. Install **XcodeGen** — the `ios/` directory is generated from `ios/project.yml`:
   ```bash
   brew install xcodegen
   ```
3. Generate and open the Xcode project:
   ```bash
   cd ios
   xcodegen generate
   open FieldNotebook.xcodeproj
   ```
4. In Xcode pick any iPhone simulator from the scheme bar (e.g. "iPhone 16"), then **⌘R**. The simulator boots and installs the app.

The default `Release` configuration points at the production backend (`https://backend.mirek-rpi.org`). Log in with one of the seeded accounts (see `backend/README.md` — e.g. `marek@firma.pl` / `test1234`).

### Hitting a local backend instead of production

1. In Xcode: **Product → Scheme → Edit Scheme → Run → Build Configuration → `Debug-Local`**. That sets `DEBUG_LOCAL` and points `Config.swift` at `http://localhost:3000`.
2. In a second terminal:
   ```bash
   cd backend
   bun install        # first time only
   bun run migrate    # creates ./data/app.db
   bun run seed       # inserts the four test accounts
   bun run dev
   ```
3. ⌘R in Xcode again — the simulator now talks to your laptop instead of the RPi.

### CI artifact

`.github/workflows/ios.yml` builds the iOS Simulator `.app` and publishes it as the `FieldNotebook-simulator` GitHub Actions artifact (14-day retention). Download and install instructions live in `ios/README.md` → **CI**.
