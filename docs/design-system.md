# Design System

The visual language shared by **PrintAllPDFs** and **Route Planner Andalucía**. Every value below is taken from their `app/globals.css`; the ready-to-copy stylesheet is `templates/app/globals.css`.

## Principles

- **Tokens only**: components read CSS variables. A hex value outside `:root` or `html[data-theme="light"]` is a bug, with the documented exceptions (Beta badge, Google conic border, `#fff` on filled accent).
- **Dark first**: `:root` holds the dark theme. Light overrides live in `html[data-theme="light"]`.
- **One stylesheet**: `app/globals.css`, organized by commented sections (Header, Layout, Controls, Footer, Responsive). Class names are short, kebab-case and semantic (`.site-header`, `.panel`, `.beta-badge`).
- **No frameworks**: no Tailwind, no component library, no web fonts.

## Color Tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0f172a` | `#f1f5f9` | Page background (slate-900 / slate-100) |
| `--panel` | `#1e293b` | `#ffffff` | Cards, panels, footer |
| `--panel-2` | `#273449` | `#f1f5f9` | Inputs, rows, toggles, secondary buttons |
| `--border` | `#334155` | `#e2e8f0` | All 1 px borders |
| `--text` | `#e2e8f0` | `#0f172a` | Body text |
| `--muted` | `#94a3b8` | `#64748b` | Secondary text, labels, hints |
| `--accent` | `#14b8a6` | `#0d9488` | Turquoise: links, active states, icons, focus |
| `--accent-2` | `#0f766e` | `#0f766e` | Darker turquoise for depth |
| `--accent-strong` | `#2dd4bf` | `#14b8a6` | Gradient end of primary buttons |
| `--button-text` | `#042f2e` | `#f8fafc` | Text on the turquoise gradient |
| `--button-shadow` | `rgba(20,184,166,.28)` | `rgba(15,118,110,.24)` | Primary button glow |
| `--danger` | `#ef4444` | `#dc2626` | Destructive actions, errors |
| `--error-bg` | `#3f1d1d` | `#fef2f2` | Error rows and boxes |
| `--error-text` | `#fecaca` | `#991b1b` | Text inside error boxes |
| `--warn-bg` | `#3b2f12` | `#fffbeb` | Warning boxes |
| `--warn-border` | `#f59e0b` | `#fcd34d` | Warning border |
| `--warn-text` | `#fde68a` | `#92400e` | Warning text |
| `--grid-dot` | `rgba(148,163,184,.16)` | `rgba(100,116,139,.22)` | Dot grid on `body` |
| `--glow` | `rgba(20,184,166,.14)` | `rgba(13,148,136,.10)` | Header glow, hover fills |
| `--glass-bg` | `rgba(15,23,42,.55)` | `rgba(255,255,255,.55)` | Glass header fill |
| `--glass-border` | `rgba(148,163,184,.18)` | `rgba(15,23,42,.08)` | Glass header border |
| `--glass-highlight` | `rgba(255,255,255,.06)` | `rgba(255,255,255,.70)` | Inset top highlight |
| `--glass-shadow` | `0 8px 24px rgba(2,6,23,.35)` | `0 8px 24px rgba(15,23,42,.08)` | Glass header shadow |

Project-specific tokens (for example `--van` or `--drop-bg`) are allowed, must be defined in both themes, and go at the end of each block under a `/* project */` comment.

### Fixed Colors

| Element | Value | Reason |
|---|---|---|
| **Beta badge** | background `#5ea8ff`, text `#0a2a52` (dark) / `#ffffff` (light) | Same blue in every project, independent of the accent |
| **Google conic border** | `#34a853`, `#4285f4`, `#fbbc04`, `#ea4335` | Hover signature on the primary button and Beta badge |
| **Theme color** | `#0f172a` | `viewport.themeColor` and `site.webmanifest` |

## Layout

| Rule | Value |
|---|---|
| **Content width** | `max-width: 1600px; margin: 0 auto` on `.header-inner`, `.page-intro`, `.wrap` |
| **Side padding** | `40px` desktop, `16px` under 640 px |
| **Main spacing** | `.wrap` padding `24px 40px 64px` |
| **Page structure** | `body` is a flex column with `min-height: 100vh`; `main` has `flex: 1` so the footer sticks to the bottom |
| **Background** | `background-image: radial-gradient(var(--grid-dot) 1.1px, transparent 1.5px); background-size: 16px 16px` |
| **Overflow** | `overflow-x: clip` on `html, body` (never `hidden`: it breaks the sticky header) |
| **Two-column grid** | `minmax(0, 1.4fr) minmax(0, 1fr)`, gap 24 px, one column under 900 px |
| **Breakpoints** | 900 px (grids collapse), 640 px (padding 16 px, inputs 16 px font), 480 px (compact header, Beta badge hidden) |

## Typography

| Element | Size | Weight |
|---|---|---|
| **Header title** | 18 px (16 px mobile), letter-spacing `-0.2px` | 700 |
| **Section title** | 20 px | 700 |
| **Panel title (`h2`)** | 16 px | 700 |
| **Body / buttons / inputs** | 14 px | 400 / 600 |
| **Secondary text** | 13 px, `--muted` | 400 |
| **Hints and small print** | 12 to 12.5 px, line-height 1.5 | 400 |
| **Badges, uppercase labels** | 11 px, letter-spacing `0.4px`, uppercase | 600 |
| **Stats** | 22 px, `font-variant-numeric: tabular-nums` | 700 |

## Radius and Spacing

| Element | Radius |
|---|---|
| **Panels, cards, drop zones, segmented controls** | 12 px |
| **Rows, alerts, stats** | 10 px |
| **Inputs, selects, icon buttons, theme toggle** | 8 px |
| **Logo frame** | 10 px |
| **Pills: badges, language toggle, primary and secondary buttons** | `999px` |

Panels use `padding: 22px 28px` (16 px on mobile) and `border: 1px solid var(--border)`.

## Components

| Component | Spec |
|---|---|
| **Site header** | `position: sticky; top: 0; z-index: 100`; glass: `--glass-bg` plus a turquoise radial glow at 78% 50%, `backdrop-filter: blur(16px) saturate(160%)`, inset highlight and `--glass-shadow`; padding `10px 40px` |
| **Brand row** | Logo 36 px high inside a `--panel-2` frame (radius 10, padding 4), title with the second word in `--accent` (`PrintAll<span>PDFs</span>`), then the Beta badge |
| **Beta badge** | Pill, 11 px uppercase, `padding: 3px 8px`, 2 px transparent border that shows the Google conic border on hover |
| **Language toggle** | Pill group 40 px high on `--panel-2`; buttons `ES` and `EN`; active one has a sliding `--accent` pill (`layoutId="lang-pill"`) and white text |
| **Theme toggle** | 40×40 button, radius 8, sun icon in dark mode and moon in light; icon rotates in and out; turns `--accent` on hover |
| **Page intro** | Breadcrumbs (12 px, `›` separators) and a 13 px muted legend, max 820 px wide |
| **Panel** | `--panel` background, 1 px border, radius 12 |
| **Primary button** | `linear-gradient(135deg, var(--accent), var(--accent-strong))`, pill, 15 px bold, `--button-text`; hover lifts 1 px and spins the Google conic border |
| **Secondary button** | `--panel-2`, pill, 600 weight; hover turns border and text `--accent` |
| **Icon button** | 30×30, transparent; destructive version uses `--danger` border at 45% and fills on hover |
| **Inputs and selects** | `--panel-2`, radius 8, focus = `border-color: var(--accent)`, 16 px font on mobile to avoid iOS zoom |
| **Switch** | 38×22 pill, knob 16 px, checked = `--accent` background with white knob |
| **Segmented control** | `--panel-2` track radius 12, active card with a sliding `--panel` pill and an inset `--accent` ring |
| **Alerts** | Warning and error boxes: radius 10, 12.5 px text, icon 18 px on the left |
| **Footer** | `--panel` background, top border, centered 13 px muted text, padding `18px 40px`, links in `--accent` |

## Motion

All animation uses `motion/react` inside `MotionProvider` (`<MotionConfig reducedMotion="user">`), and the stylesheet ends with a `prefers-reduced-motion` block that disables transitions.

| Pattern | Settings |
|---|---|
| **Logo on mount** | `initial={{ rotate: -8, scale: 0.8, opacity: 0 }}`, spring `stiffness: 260, damping: 18` |
| **Legend on mount** | fade and rise 6 px, `duration: 0.4, delay: 0.1` |
| **Toggle pills** | shared `layoutId`, spring `stiffness: 500, damping: 35` |
| **Theme icon swap** | `AnimatePresence mode="wait"`, rotate ±90 and scale 0.5, `duration: 0.2` |
| **CSS transitions** | `0.15s ease` for color, background, border and transform |
| **Conic border spin** | `@property --gmaps-angle`, `3s linear infinite` on hover only |

## Theme and Language Behavior

- **Theme**: an inline script in `<body>` reads `localStorage("theme")`, falls back to `prefers-color-scheme`, and sets `document.documentElement.dataset.theme` before paint. `<html suppressHydrationWarning>` is required.
- **Language**: `LanguageProvider` defaults to `en`, restores `es` from `localStorage("lang")`, and updates `document.documentElement.lang`. Strings live in `lib/strings.ts` as `{ en, es }` with the same keys; functions are allowed for plurals and interpolation.
- The toggle order in the header is always **language first, theme second**.

## Brand Assets

| Asset | Spec |
|---|---|
| **Logo / favicon SVG** | 64×64 viewBox, `rect rx="14"` in `#0f172a`, artwork in `#e2e8f0`, `#14b8a6`, `#2dd4bf`, `#94a3b8` |
| **Open Graph image** | `public/og.png`, 1200×630, dark background with dot grid and turquoise accent |
| **LinkedIn cover** | 1584×396 HTML source in `tools/prompts/` or `linkedin/`, exported to PNG |
