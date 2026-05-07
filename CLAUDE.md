# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

Mobile-only prototype of a field-service workday tool for building-maintenance technicians (electricians, plumbers, HVAC, locksmiths, handymen). The app walks one technician through a closed daily ticket queue: see assignment → start job → capture photo + short note → mark complete → next.

`PRODUCT.md` is the strategic spec (users, voice, anti-references, accessibility) and `DESIGN.md` is the visual system spec ("The Steel Field Notebook"). Both are load-bearing — visual or UX changes must be checked against them, especially the explicit anti-references (no corporate ERP, no Uber-Driver, no SaaS-dashboard, no glassmorphism, no uppercase labels, signal-blue accent ≤5% per screen).

The Expo prototype lives in `app/`. A native SwiftUI port sits in `ios/` (built only on macos-14 CI — see `.github/workflows/ios.yml`; the Linux dev container has no Xcode/xcodegen). The Hono API is in `backend/`. The repo root `public/` is a deploy artifact and should not be edited by hand.

## Build & Run

Package manager is **bun** (`bun.lock` is the source of truth — do not introduce `package-lock.json` / `yarn.lock`). Run all commands from `app/`:

- Install: `bun install`
- Dev (Metro + QR): `bun start`
- Web: `bun run web`
- iOS sim / Android emu: `bun run ios` / `bun run android`

## Validation

There are no test, lint, or dedicated typecheck scripts wired up. TypeScript is in strict mode — typecheck via `bun x tsc --noEmit` from `app/`.

For UI changes, verify in the browser (`bun run web`) using the `agent-browser` skill. The `DemoToggle` segmented control at the top of `TodayScreen` switches between `default | offline | new | empty` demo states — exercise all four when changing list/spotlight/empty-state behavior.

## Architecture

**Navigation is hand-rolled, not React Navigation.** `App.tsx` mounts a `ScreenSwitcher` that branches on `screen: "today" | "detail" | "capture"` from `AppState`. Adding a screen means adding a `Screen` union member, a reducer transition, and a branch in `ScreenSwitcher`.

**State is a single Context + `useReducer`** in `app/src/state/AppState.tsx`. The reducer owns: demo state, current screen, current job id, jobs list, photos-by-job, and the "new job" banner flag. Sync state (`synced | queued | offline`) and `queuedCount` are derived from `demoState`, not stored separately. There is no persistence and no real network — `addPhoto` stores an in-memory record with empty `uri`.

**Data is mock-only.** `app/src/data/mockJobs.ts` exports `mockJobs` and a separate `newIncomingJob` used only by the `new` demo state. `buildJobs(demoState)` in `AppState.tsx` is what assembles the visible list per demo state — keep that as the single place demo-state branching happens.

**Design tokens are the styling source of truth.** `app/src/design/tokens.ts` defines colors, type scale, spacing, and font helpers; `tailwind.config.js` re-exports them into NativeWind so the same names work in both inline styles and `className`. Don't introduce raw hex values, ad-hoc font sizes, or new spacing primitives — extend `tokens.ts` and let Tailwind pick them up. Hex values are sRGB approximations of OKLCH anchors documented in `DESIGN.md`; comments next to each token cite the OKLCH original.

**Per-weight font loading is deliberate.** React Native does not synthesize bold from a regular cut — each weight is a separate font family (`Inter_400Regular`, `Inter_600SemiBold`, …). Always pick a weight via the `fontSans(weight)` / `fontMono(weight)` helpers from `tokens.ts` rather than hand-setting `fontFamily` + `fontWeight`. App-wide font loading happens in `App.tsx` via `useFonts`; splash is held until fonts resolve.

**Icons are inline SVGs** in `app/src/components/Icon.tsx` — a fixed `IconName` union with hand-authored 24×24 paths via `react-native-svg`. Do not pull in `@expo/vector-icons` or `lucide-react-native`; add a new path to the `paths` map and extend the union. `categoryIcon` maps `JobCategory` → `IconName`.

**Native-vs-web styling.** `nativewind` + Tailwind handles class-based styles cross-platform; `global.css` is the web-only entry that applies `html/body/#root` resets. `metro.config.js` wires NativeWind into Metro; `babel.config.js` configures `jsxImportSource: "nativewind"` and the NativeWind babel plugin. Don't edit these unless adding a real new platform integration.

## iOS native port (`ios/`)

- **No local builds.** Linux dev container has no Xcode toolchain. `xcodebuild`/`xcodegen` run only in CI; commit blind and let `.github/workflows/ios.yml` validate.
- **Icon enum is bounded.** `IconName` cases in `ios/FieldNotebook/Shared/IconView.swift` come from `app/src/components/Icon.tsx` (16 cases). Designs/plans referring to `.sync`/`.warning`/`.camera` map to existing cases at call sites: `.refreshCw`, `.alertTriangle`, `.plus`. Don't add aliases.
- **Color tokens use qualified form.** Always `Color.muted` / `Color.statusUrgent` etc. — leading-dot shorthand `.muted` fails type inference in `.foregroundStyle()` / `.background()` modifiers.
- **Encodable existential.** Use `(any Encodable)?` everywhere (Swift 5.9 strict). Bare `Encodable?` is a compiler error.
- **AppIcon is mandatory.** `Assets.xcassets/AppIcon.appiconset/` must contain ≥1 PNG entry; iOS 17 actool fails the build otherwise. `ASSETCATALOG_COMPILER_APPICON_NAME=""` does NOT suppress the requirement.
- **Two icon copies.** `Design/Icons/<name>.svg` is canonical source; `Assets.xcassets/<name>.imageset/<name>.svg` is the build mirror. `project.yml` excludes `Design/Icons/**` from sources so SVGs don't ship as raw resources.
- **API base URL.** Release builds hit `https://backend.mirek-rpi.org` (Coolify on the RPi, app uuid `k3740dkxfg4otahb6rn6hvw2`). Use `Debug-Local` configuration (`#if DEBUG_LOCAL` in `Config.swift`) for `http://localhost:3000`.
- **CI workflow specifics.** `actions/checkout@v5` (Node 24), `maxim-lobanov/setup-xcode@v1` with `latest-stable` (XcodeGen project format must match Xcode major). First Appetize push bootstraps a slot — workflow prints `publicKey` in the run summary; copy it into the `APPETIZE_PUBLIC_KEY` repo secret to reuse the slot on subsequent pushes. Display name is `iOS Build & Deploy`, file is `ios.yml` — query runs with `gh run list --workflow=ios.yml` (the bare name `iOS` doesn't match).

## Operational notes

### Codebase patterns

- **Components are presentational and read state via `useAppState()`** rather than receiving navigation/state props. New screens follow the `TodayScreen` / `JobDetailScreen` / `CaptureScreen` shape: `SafeAreaView` (top edge only) + `ScrollView` body + a sticky `BottomCTA` outside the scroll view, with `useSafeAreaInsets()` to pad above the home indicator.
- **CTA placement is a hard rule from PRODUCT.md.** Primary actions live in `BottomCTA` (bottom 60% of the screen, ≥64 pt height). Top bars carry title + sync status only — never destructive or primary actions.
- **Status is always color + icon + label**, never color alone. `StatusBadge` and `StatusDot` enforce this; reuse them instead of styling new badges.
- **Polish copy is the primary language.** All user-facing strings are in Polish (see existing screens for tone — direct, operational, no encouragement copy, no gamification). Sentence case for every label and chip — uppercase is forbidden by `DESIGN.md`.
- **Screenshots in `app/screenshots/` are reference renders** for the documented demo states. Regenerate them after meaningful UI changes; don't hand-edit them.

### Things to avoid

- Adding a router, navigation lib, or deep-linking until there's a real reason — the screen-union switcher is intentional for a 3-screen prototype.
- Adding decorative animation, gradients, glassmorphism, or pure `#000` / `#fff` — all forbidden by name in `DESIGN.md` §6.
- Configuring per-user theme/density/font toggles — `DESIGN.md` commits to one right way; the only legitimate settings are font scale, language, dark-mode opt-in.
- Committing real photo URIs or wiring a backend — this is a prototype; `addPhoto` is intentionally URI-less.

### Multi-session coordination

- The `ios` branch hosts iOS, backend, and the Expo prototype simultaneously. Multiple Claude sessions may commit here in parallel. Always `git add <specific-paths>` (never `git add -A` or `git add .`) and scope each commit to your subdirectory (`ios/`, `backend/`, or `app/`).
