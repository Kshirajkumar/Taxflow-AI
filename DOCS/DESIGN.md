# Taxflow AI — Design System

A ledger-inspired, Fluent-adjacent design language for a solo-CA Windows desktop app. Every rule below is the one actually used in the working prototype — treat this as the spec to build the real app against.

---

## 1. Design principles

1. **Financial, not "AI-generic."** No terracotta/cream gradients, no dark-mode-with-neon-accent. The palette reads like a ledger book and a brass desk seal — trustworthy, precise, slightly old-world — not like a generic startup dashboard.
2. **One accent, spent carefully.** Brass/gold is the *only* accent color. It marks primary actions, active states, and money-adjacent numbers. It never decorates.
3. **Structure carries meaning.** Borders, numbering, and dividers are used only where the content is genuinely a list, a sequence, or a boundary — e.g. the 10 pain points are numbered because they are literally a ranked list; nothing else in the app uses numbered markers.
4. **Windows-native chrome, own identity inside it.** The title bar, window controls, and status bar borrow Fluent/Win11 conventions (because the brief calls for a Windows app), but the content area does not borrow Fluent's blue accent or Mica-purple — it uses the ledger palette.
5. **Quiet by default, confident in one place per screen.** Every page has exactly one primary (brass) button. Everything else is neutral.

---

## 2. Color

### 2.1 Core palette (use these hex values exactly)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0F1B2E` | Title bar, sidebar, status bar background |
| `--ink-soft` | `#182C48` | Sidebar hover surface |
| `--ink-line` | `#28405F` | Borders inside dark chrome |
| `--paper` | `#F3F1EC` | App canvas / main background (warm off-white, not pure white) |
| `--surface` | `#FFFFFF` | Cards, panels, tables |
| `--line` | `#E3E0D6` | Default borders on light surfaces |
| `--line-soft` | `#ECE9DF` | Row dividers, subtle separators |
| `--brass` | `#A87C2E` | Primary accent — buttons, active nav, links, key numbers |
| `--brass-deep` | `#7E5A1E` | Brass gradient end, hover state, deep accent text |
| `--brass-tint` | `#F4E9D4` | Accent background fill (badges, selected states) |
| `--ok` | `#2F7D5D` | Success / matched / on-track |
| `--ok-tint` | `#E4F2EB` | Success background fill |
| `--warn` | `#B5540C` | Attention / pending / partial |
| `--warn-tint` | `#FBEBDD` | Warning background fill |
| `--bad` | `#B23A3A` | Overdue / unmatched / critical |
| `--bad-tint` | `#F9E7E5` | Error background fill |
| `--text` | `#1B2231` | Primary text |
| `--text-soft` | `#5B6472` | Secondary text |
| `--text-faint` | `#8B93A0` | Tertiary text, metadata, placeholders |

### 2.2 Rules
- Status colors (`ok` / `warn` / `bad`) are **only** for state — never for decoration or branding.
- Brass is reserved for the single primary action per screen and for genuinely important numbers (money, confidence %, active nav). If more than one brass element appears "at rest" on a page, demote the extra one to neutral.
- Dark chrome (`--ink` family) is confined to the title bar, sidebar, and status bar. The content area is always on `--paper`/`--surface` — never invert this.
- Minimum contrast: body text on `--paper`/`--surface` must meet WCAG AA (4.5:1). `--text-faint` is for metadata only, never for anything a user must read to complete a task.

---

## 3. Typography

| Role | Family | Notes |
|---|---|---|
| Display / page titles / large stat numbers | **Fraunces** (serif, optical size 9–144) | Weight 500–600. Used sparingly — page `<h1>`, panel numerals, deadline day numbers. Gives the "ledger" character. |
| UI / body / tables / buttons | **Inter** | Weight 400 (body), 600–700 (labels, buttons, strong cells). This is 95% of the interface. |
| Structured data / JSON / code | **IBM Plex Mono** | Only for machine-readable output (extracted JSON preview). Never for UI labels. |

### Type scale
- Page title (`h1`): 26px / Fraunces 500
- Panel heading (`h3`): 14.5px / Inter 600
- Stat card value: 28px / Fraunces 500
- Body / table text: 12.8–13.5px / Inter 400
- Labels / meta / eyebrows: 10.5–11.5px / Inter 600, **sentence case, not tracked-out caps** (the one exception: section labels in the sidebar, which are intentionally uppercase + letterspaced because they are wayfinding chrome, not content)

### Rules
- Never use more than two families on one screen.
- Do not bold or color a single word inside a sentence for emphasis — use a full short sentence or a badge instead.
- Line length for descriptive text (pain point descriptions, empty states): keep under ~70 characters per line.

---

## 4. Layout

### 4.1 App shell (fixed, non-negotiable structure)
```
┌────────────────────────────────────────────────────────────┐
│ Title bar — 44px — window controls · brand · search · user  │
├───────────┬──────────────────────────────────┬──────────────┤
│ Sidebar   │ Main content (scrollable)         │ Agent chat   │
│ 224px     │ flexible, padding 26/32px         │ 318px fixed  │
│ fixed     │                                    │ fixed        │
├───────────┴──────────────────────────────────┴──────────────┤
│ Status bar — 26px — sync state · connections · build tag     │
└────────────────────────────────────────────────────────────┘
```
- Sidebar and chat panel widths are fixed, not fluid. Only the center column resizes.
- Below 1180px: collapse the chat panel first (it's a companion, not core navigation), before touching the sidebar.
- Window corner radius: 12px. Nothing inside the window should have a larger radius than the window itself.

### 4.2 Spacing scale
Use multiples of 2px, anchored to: **4, 6, 8, 10, 12, 14, 16, 18, 22, 26, 32**. Panel body padding is 16–18px; page padding is 26px top / 32px sides.

### 4.3 Grids
- Stat cards: 4-column grid, 14px gutter, collapses to 2 columns under 1180px.
- Two-column content (e.g. calendar+table / activity feed): 1.4fr : 1fr ratio, 16px gutter, stacks to 1 column on narrow widths.
- File grid (vault): `repeat(auto-fill, minmax(150px, 1fr))`, 12px gutter.

### 4.4 Radius
- Cards / panels / inputs: 7–10px
- Pills / badges / avatars / chat bubbles: full round
- Never mix a sharp corner and a heavily rounded corner in the same component family.

---

## 5. Components

### 5.1 Buttons
- **Primary (`.btn-brass`)**: brass gradient fill, one per screen max. Used for the single most important action (Send reminders, Run extraction, Auto-reconcile, Generate).
- **Secondary (`.btn`)**: white surface, 1px `--line` border. Default for everything else.
- **Ghost (`.btn-ghost`)**: no border, used for low-emphasis or repeated-per-row actions (table row buttons).
- All buttons: 7px radius, 13px Inter 600, 9×16px padding (7×11 for `.btn-sm` in tables). Press state scales to 0.98; hover adds a soft shadow, never a color shift on secondary/ghost buttons.

### 5.2 Cards & panels
- Every panel has: 1px `--line` border, `--radius` (10px), `--shadow-1` (a whisper of shadow, `0 1px 2px rgba(15,27,46,.06)` — never a heavy drop shadow).
- Panel header: title (Inter 600, 14.5px) + optional right-aligned hint text (`--text-faint`, 11.5px). No icons in panel headers.
- Stat cards follow the same border/shadow rules; the only differentiator is the Fraunces numeral.

### 5.3 Tables
- Header row: 11px uppercase Inter 600, `--text-faint`, bottom border only (no header background fill).
- Row divider: `--line-soft`, not `--line` (softer than card borders).
- Row hover: near-white wash (`#FBFAF7`), not a shadow or border change.
- Primary cell (name/title): Inter 600, `--ink`. Secondary line under it (GSTIN, filename): `--text-faint`, 11px.
- Status is always a pill badge, never plain colored text.

### 5.4 Badges
- Shape: full pill, 3×9px padding, 11px Inter 600.
- Semantic only: `ok` (green tint), `warn` (amber tint), `bad` (red tint), `neutral` (grey), `brass` (accent tint for channel/category tags — not status).

### 5.5 Folder tree (vault)
- Dashed connecting lines (`--line`), not solid — reads as structure, not a border.
- Selected node: brass-tint background, brass-deep text, bold.
- Chevron rotates 90° on open; folders always show file counts inline, right-aligned, `--text-faint`.

### 5.6 Progress / step indicators (vision extraction)
- Vertical step list, not a horizontal progress bar — this is a sequence of distinct operations (upload → detect → extract → validate → save), so it should read as discrete steps, not a continuous fill.
- Each step: outline dot → spinner (active) → filled check (done). Active step label goes bold; future steps stay `--text-faint`.

### 5.7 Chat panel
- User messages: dark ink bubble, right-aligned, tight radius on the tail corner only.
- Bot messages: warm neutral (`#F1EFE6`) bubble, left-aligned, same tail-corner treatment.
- Typing state: three-dot pulse, never a spinner (keeps it feeling conversational, not like a loading screen).
- Suggested prompts are chips below the transcript, not inside the input — they're a starting point, not autocomplete.

### 5.8 Toast
- Single style, bottom-center, dark ink background, one icon + one line of text. Auto-dismiss ~2.6s. Never stack multiple toasts — the latest replaces the prior one.

---

## 6. Iconography
- Line icons only, 1.6–2px stroke, `stroke-linecap/linejoin: round`, no fills except the send-icon triangle and status dots.
- Icon size: 17px in navigation, 13–16px inline with text, 26–46px only in empty states.
- Never mix a filled icon set with the line set on the same screen.

## 7. Motion
- Page switches: 250ms fade + 4px rise. That's the only page-level transition.
- No hover-lift on cards. Hover changes are color/background only (buttons, table rows, nav items).
- Reserve any "showy" animation for the one moment that deserves it: the vision-extraction step sequence. Nothing else in the app should compete with it for attention.
- Respect `prefers-reduced-motion`: disable the fade/rise and spinner animations, keep state changes instant.

## 8. Writing rules
- Buttons are verbs describing exactly what happens: "Send all pending reminders," "Auto-fill from vault," "Confirm & save to vault" — never "Submit" or "Go."
- Status labels are plain, not clever: "Docs pending," "Reconciled," "Overdue" — not "Uh oh!" or "All set!"
- Empty states explain what will appear and what to do: "Attach a document and run extraction to see structured fields here" — not "Nothing here yet 👀."
- Numbers are never rounded to the point of being wrong (extraction confidence, tax figures) — precision is part of the CA's trust in the tool.

## 9. Accessibility floor
- All interactive elements have a visible focus ring (2px, brass-tinted outline offset by 1px).
- Color is never the only signal: every status pill has text, not just a color.
- Minimum tap/click target: 32px height on all buttons and table row actions.
- Sidebar and chat collapse gracefully rather than clipping content on smaller windows.

## 10. What to avoid
- No tracked-out ALL-CAPS body copy.
- No middle-dot-joined meta strings ("A · B · C") outside the status bar, where it's chrome, not content.
- No card-soup: not every block needs to be its own rounded-shadow card — use plain dividers inside a panel for sub-groups.
- No gradient washes as decoration — the only gradient in the whole app is the brass button/mark gradient, and it's structural (implies "the metal accent"), not decorative.
-