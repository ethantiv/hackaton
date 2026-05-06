/**
 * Design tokens — derived from DESIGN.md ("The Steel Field Notebook").
 *
 * Values are sRGB hex approximations of the OKLCH anchors documented in DESIGN.md.
 * Hex chosen for cross-platform safety (iOS/Android/Web color parsers) at this
 * fidelity level. The OKLCH canonical values are kept as comments next to each
 * token for the eventual scan-mode `/impeccable document` re-pass and for
 * porting to native Swift/Kotlin where OKLCH support is improving.
 */

export const tokens = {
  colors: {
    // Brand accent — used on ≤5% of any screen.
    signal: {
      DEFAULT: "#1262c4", // oklch(50% 0.18 240)
      dark: "#0e4f9c", // active / pressed state
      light: "#dbe7f6", // tinted background for selected rows
    },

    // Neutrals (the "paper of the notebook").
    // Every neutral carries a trace of the accent hue (chroma 0.005–0.02).
    cream: "#f6f7f9", // oklch(97% 0.005 240) — dominant page background
    mist: "#eaecf1", // oklch(94% 0.006 240) — grouped surfaces, spotlight card
    "mist-deep": "#dfe2e8", // pressed / hover tint on mist
    border: "#c8ccd5", // oklch(85% 0.008 240) — dividers, hairlines
    "border-soft": "#dadde4", // very subtle dividers
    // Secondary text — darkened from #6b7280 so it clears WCAG AA on `mist`
    // (≥4.5:1) and AAA on `cream` (≥7:1). Anchor: oklch(40% 0.02 240).
    muted: "#4a5260",
    body: "#2c3138", // oklch(25% 0.015 240) — body text
    title: "#1a1f26", // oklch(18% 0.02 240) — titles, headers

    // White on signal-blue surfaces — slight blue tint preserves the
    // Same-Light Rule (every neutral carries a trace of the accent hue).
    "ink-on-signal": "#fbfcfe",

    // Status palette — color is never the only signal; pair with icon + label.
    // Foreground hues meet WCAG AA on both `cream` and the matching `*-soft`
    // wash listed below.
    "status-pending": "#4a5260", // neutral, "zaplanowane"
    "status-progress": "#1262c4", // signal blue, "w trakcie"
    "status-done": "#216b3e", // oklch(45% 0.10 145) — darker forest green
    "status-urgent": "#7a570b", // oklch(45% 0.14 70) — deep amber, "pilne"

    // Soft status washes — every wash is hue-aligned (chroma 0.02–0.04 on the
    // matching status hue). Replace ad-hoc hexes inside StatusBadge.
    "status-pending-soft": "#e5e7eb",
    "status-progress-soft": "#dbe7f6",
    "status-done-soft": "#d8ecdf",
    "status-urgent-soft": "#fdf3dc",

    // White/black — never used directly; expose for explicit override only.
    "pure-white": "#ffffff",
    "pure-black": "#000000",
  },

  // React Native treats each weight as a separate font family, so we expose
  // explicit per-weight font names. Use the `font(weight)` helper below in
  // component styles instead of hand-picking entries.
  fontFamily: {
    sans: {
      "400": "Inter_400Regular",
      "500": "Inter_500Medium",
      "600": "Inter_600SemiBold",
      "700": "Inter_700Bold",
    },
    mono: {
      "400": "JetBrainsMono_400Regular",
      "500": "JetBrainsMono_500Medium",
    },
  },

  fontSize: {
    // Hierarchy from DESIGN.md §3 Typography.
    label: ["13px", { lineHeight: "18px", letterSpacing: "0.04em" }],
    body: ["16px", { lineHeight: "24px" }], // 16 pt floor, never below
    "body-lg": ["17px", { lineHeight: "26px" }],
    title: ["18px", { lineHeight: "24px" }],
    headline: ["24px", { lineHeight: "30px" }],
    display: ["32px", { lineHeight: "36px" }],
    "display-lg": ["40px", { lineHeight: "44px" }],
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  letterSpacing: {
    tight: "-0.01em",
    normal: "0",
    wide: "0.04em",
  },

  spacing: {
    // Base 4 px scale, plus named tokens for ergonomics from PRODUCT.md.
    "tap-min": "56px", // minimum touch target (gloves spec)
    "cta-h": "64px", // primary CTA height
    "card-pad": "24px", // spotlight card internal padding
    "row-h": "76px", // job row height (allows 2 lines + meta)
    "topbar-h": "64px",
  },

  borderRadius: {
    sm: "6px",
    md: "10px",
    lg: "14px",
    xl: "20px",
    "2xl": "24px",
  },
} as const;

export type Tokens = typeof tokens;

/**
 * Per-weight font helper for React Native.
 *
 * RN treats each weight as a separate font family — `fontWeight: "700"` is
 * ignored unless the runtime can find a synthesized bold for the chosen
 * `fontFamily`. Always set `fontFamily` via this helper to get the right cut.
 *
 * Web preserves `fontWeight` as a hint for system rendering.
 */
export type SansWeight = 400 | 500 | 600 | 700;
export type MonoWeight = 400 | 500;

export function fontSans(weight: SansWeight) {
  return {
    fontFamily: tokens.fontFamily.sans[String(weight) as keyof typeof tokens.fontFamily.sans],
    fontWeight: String(weight) as "400" | "500" | "600" | "700",
  } as const;
}

export function fontMono(weight: MonoWeight = 400) {
  return {
    fontFamily: tokens.fontFamily.mono[String(weight) as keyof typeof tokens.fontFamily.mono],
    fontWeight: String(weight) as "400" | "500",
  } as const;
}
