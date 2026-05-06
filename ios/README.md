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

`.github/workflows/ios.yml` builds the simulator `.app` on every push to `main` or `ios` and uploads it to a fixed Appetize.io slot.

Required GitHub repository secrets:

| Secret | Source |
|---|---|
| `APPETIZE_API_TOKEN` | Appetize dashboard → Account → API Token |
| `APPETIZE_PUBLIC_KEY` | Appetize dashboard → App → publicKey |

The stable tester URL is `https://appetize.io/app/<APPETIZE_PUBLIC_KEY>` and is printed in each CI job's Summary.

## Smoke checklist (after every Appetize upload)

- [ ] Open Appetize URL in a desktop browser, simulator boots
- [ ] Login as `marek@firma.pl` / `test1234` → today list shows 8 jobs (3 done, 5 pending)
- [ ] Tap a pending job → Detail → Start → Capture → pick photo from simulator's photo library → Finish
- [ ] Logout → Login as `kasia@firma.pl` → empty state visible
- [ ] Logout → Login as `anna@firma.pl` → SyncIndicator shows offline; transitions land in pending queue
- [ ] Logout → Login as `piotr@firma.pl` → New Job banner visible at top
- [ ] Brute-force 5× wrong password on `marek@firma.pl` → 423 lockout error with countdown
