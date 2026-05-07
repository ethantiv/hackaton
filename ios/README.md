# Field Notebook — iOS

Native SwiftUI port of the Expo prototype in `app/`. Targets iOS 17.

## Local development

```bash
cd ios
brew install xcodegen   # one-time
xcodegen generate
open FieldNotebook.xcodeproj
```

Pick the **Debug-Local** scheme to point at `http://localhost:3000`. Default **Debug**/**Release** schemes use the production URL in `App/Config.swift`.

## Tests

```bash
xcodebuild test \
  -project FieldNotebook.xcodeproj \
  -scheme FieldNotebook \
  -destination 'platform=iOS Simulator,name=iPhone 15'
```

## CI

`.github/workflows/ios.yml` builds the iOS Simulator `.app` on every push to `main` or `ios` (and via `workflow_dispatch`) and publishes it as a GitHub Actions artifact named `FieldNotebook-simulator` (14-day retention). No external services, no secrets required.

### Download and run the artifact on macOS

Requires Xcode installed (the bundled iOS Simulator is enough for `xcrun simctl`).

```bash
# 1. Fetch the latest artifact (or pass --run <id> for a specific run).
gh run download -R <owner>/<repo> -n FieldNotebook-simulator -D /tmp/fn
unzip /tmp/fn/FieldNotebook.zip -d /tmp/fn

# 2. Pick any installed simulator and boot it.
xcrun simctl list devices available | grep iPhone
xcrun simctl boot "iPhone 15"        # name from the list above
open -a Simulator

# 3. Install and launch the .app by bundle id.
xcrun simctl install booted /tmp/fn/FieldNotebook.app
xcrun simctl launch booted dev.zaniewicz.fieldnotebook
```

The default `Release` configuration points at the production backend (`https://backend.mirek-rpi.org`). Test accounts are listed in `backend/README.md`.

## Smoke checklist (after installing the artifact)

- [ ] `xcrun simctl install booted` exits cleanly, app icon appears in the Simulator
- [ ] Login as `marek@firma.pl` / `test1234` → today list shows 8 jobs (3 done, 5 pending)
- [ ] Tap a pending job → Detail → Start → Capture → pick photo from simulator's photo library → Finish
- [ ] Logout → Login as `kasia@firma.pl` → empty state visible
- [ ] Logout → Login as `anna@firma.pl` → SyncIndicator shows offline; transitions land in pending queue
- [ ] Logout → Login as `piotr@firma.pl` → New Job banner visible at top
- [ ] Brute-force 5× wrong password on `marek@firma.pl` → 423 lockout error with countdown
