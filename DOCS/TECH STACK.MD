# Taxflow AI — Product & Technical Plan
### A Windows desktop app for solo Chartered Accountants

---

## 1. Product framing

**Who it's for:** a solo CA or a 2–5 person CA office, not a large firm — so the tech has to stay cheap to run, mostly local-first, and simple enough for one person to maintain.

**Core promise:** the CA's documents live in one predictable local vault, get read by a vision model instead of typed by hand, clients get nudged automatically, and returns pull numbers from the vault instead of being re-typed.

**Why "local-first," not "cloud-first":** CA data is financial and sensitive (GSTINs, bank statements, income data). A solo CA also doesn't want a monthly cloud-storage bill for every client's five years of documents. So the architecture below treats the **local machine as the source of truth**, and the cloud as a thin layer for the things that genuinely require it: WhatsApp delivery, the vision model call, the AI agent, and optional encrypted backup.

---

## 2. Recommended tech stack

| Layer | Choice | Why this over the alternatives |
|---|---|---|
| **App shell / packaging** | **Tauri 2.0** (Rust core + system WebView) | Produces a real Windows `.exe`/`.msi`, ~10–15MB instead of Electron's ~150MB+. Rust backend gives fast, safe filesystem access for the vault (critical, since folder-tree management is a core feature). Lower RAM footprint matters for a CA running this alongside Tally/Excel all day. |
| **UI framework** | **React 18 + TypeScript** | What you already prototyped in the HTML artifact translates directly. Large ecosystem, easy to hire for later if the app grows. |
| **Styling** | **Tailwind CSS + a small custom token layer** (matching `taxflow-ai-design-system.md`) | Tailwind for velocity, but hard-code the design tokens (colors, radii, type scale) as CSS variables so the app doesn't drift into generic Tailwind defaults. |
| **Component layer** | **shadcn/ui** (Radix primitives, unstyled) restyled to the design system | Gives accessible dropdowns, dialogs, tooltips, toasts for free without importing a heavy opinionated component library. |
| **State management** | **Zustand** | Lightweight, no boilerplate — appropriate for a single-user desktop app. Skip Redux; there's no need for the ceremony. |
| **Local database (index/metadata)** | **SQLite**, via Tauri's `tauri-plugin-sql` (rusqlite under the hood) | Stores client records, extraction metadata, reminder logs, reconciliation state, filing drafts — anything you need to query/filter/sort. The **actual files** (raw scans, extracted JSON, generated returns) live as real files in the vault folder tree, not blobs in the DB, so a CA can always open the folder in File Explorer and see exactly what's there. |
| **Vault file structure** | Plain OS folders under `Documents/Taxflow AI/Clients/<Client>/Data/<Year>/<Month>/{Raw, Extracted}` | This *is* the backup strategy too — it's just files, so any existing backup tool (OneDrive, Google Drive desktop, an external HDD) already protects it without custom cloud infra. |
| **Vision / document extraction** | **Claude API (vision-capable model)** as primary, called from a small serverless function, not directly from the desktop app | Keeps your API key off the client. A thin backend (see below) receives the image, calls the model with a structured-extraction prompt, returns clean JSON. Add a confidence check and a "flag for manual review" path for anything under ~90%. |
| **Thin cloud backend** | **Node.js + Fastify (or Python + FastAPI)**, deployed on **Fly.io / Render / a small VPS** | Only handles: (1) proxying vision extraction calls, (2) WhatsApp send/webhook handling, (3) license validation, (4) the AI agent's tool-calling loop when it needs to query things via API rather than local SQLite directly. Keep this stateless — it should not store client documents. |
| **WhatsApp** | **WhatsApp Business Cloud API**, via a BSP (Business Solution Provider) like **Interakt, Gupshup, or Twilio** rather than raw Meta onboarding | A solo CA won't want to handle Meta's business verification and template-approval process alone; a BSP handles that and gives a simple REST API + delivery webhooks. Approved template messages are mandatory for the first message in a 24-hour window — factor template approval time (a few days) into the plan. |
| **AI agent (chat panel)** | **Claude API with tool use**, tools = read-only functions against the local SQLite index (exposed to the backend via a lightweight local sync or a Tauri command bridge) | The agent should only ever read data, never directly send messages or file returns without a confirm step — mirror the "Confirm & save to vault" pattern from the UI. |
| **ITR / GSTR generation** | Start with **structured JSON/Excel output matching the GST offline utility's import format**, not live e-filing | Live GSTN/e-filing API access requires GSP (GST Suvidha Provider) registration — a real but separate business step. Phase 1 goal: produce a return draft the CA can review and upload through the existing government portal/offline tool. Phase 2 (once volume justifies it): integrate a GSP API (e.g. via ClearTax's or Zoho's GSP APIs) for direct filing. |
| **Reconciliation engine** | Local, rule-based matching first (amount + date-window + fuzzy description match) | This does not need an LLM — it needs deterministic fuzzy-matching logic (a scoring function per bank-line-vs-book-line pair). Reserve AI for explaining *why* something didn't match, not for doing the matching itself. |
| **Auth / licensing** | Simple license-key activation via **Keygen.sh** or a self-rolled license server, not full multi-tenant auth | This is a single-operator desktop tool, not a multi-user web SaaS — don't build user accounts/roles until there's demand for a team tier. |
| **Auto-update** | **Tauri's built-in updater** | Ships signed update bundles; important since a CA won't manually reinstall software mid-filing-season. |
| **Error/usage monitoring** | **Sentry** (desktop SDK) for crash reports; a simple self-hosted event log for feature usage | Keep telemetry opt-in and minimal — financial-software users are (rightly) wary of "phone home" behavior. |

### Why not Electron / why not a pure web app
- **Electron** would work but roughly 10x the bundle size and RAM for no real benefit here — Tauri's Rust core is also a better fit for the heavy filesystem work the vault requires.
- **A pure web app (no desktop shell)** breaks the core promise of a local, always-available vault the CA can browse in File Explorer, and it puts sensitive documents in the browser's sandbox/cloud by default — the opposite of what this product is for. The brief explicitly wants a Windows app, and the vault feature genuinely needs native filesystem access, so this isn't just a stylistic choice.
- **.NET MAUI / WinUI 3** is a legitimate alternative if you're more comfortable in C# than Rust/TS — it's more "natively Windows" but has a smaller open-source ecosystem for the AI/chat/table-heavy UI you need, and hiring/community support is thinner. Tauri + React is the better default unless you already know .NET well.

---

## 3. System architecture (high level)

```
┌───────────────────────────── Windows Desktop (Tauri) ─────────────────────────────┐
│  React UI  ⇄  Zustand store  ⇄  Tauri commands (Rust)                              │
│                                        │                                            │
│                          ┌─────────────┼─────────────┐                             │
│                          ▼             ▼              ▼                             │
│                    Local SQLite   Local Vault    Local cache /                      │
│                    (index/meta)  (raw + extracted  offline queue                    │
│                                    files, folders)                                   │
└──────────────────────────────────────┬──────────────────────────────────────────────┘
                                        │  HTTPS (only for: vision calls, WhatsApp,
                                        │  agent tool calls, license check, backup)
                                        ▼
                        ┌───────────────────────────────┐
                        │   Thin cloud backend (stateless)│
                        │   Fastify/FastAPI on Fly.io      │
                        └───────┬──────────┬─────────────┘
                                │          │
                     Claude API │          │ WhatsApp Cloud API (via BSP)
                     (vision +  │          │
                      agent)    ▼          ▼
                          extraction    delivery/read
                            result       webhooks
```

Everything a CA needs to *see* (vault, dashboard, clients, filings, reconciliation) works fully offline once documents are extracted. Only extraction itself, WhatsApp sending, and the chat agent require connectivity.

---

## 4. Build order (phased, solo-developer realistic)

Building the vault first is deliberate: every other feature (extraction, filings, reconciliation, the agent) reads from or writes to it, so it has to be right before anything else is built on top of it.

### Phase 0 — Foundation (2–3 weeks)
- Tauri + React shell, the exact layout from the design system (title bar, sidebar, chat panel stub, status bar).
- Local SQLite schema: clients, documents, extraction_records, reminders_log, reconciliation_rows, filing_drafts.
- Vault engine: create/read the `Clients/<name>/Data/<year>/<month>/{Raw,Extracted}` structure programmatically; client CRUD.
- **Exit criteria:** you can add a client and see their folder tree appear on disk and in the UI.

### Phase 1 — Vision Extract (2–3 weeks)
- Thin backend endpoint that accepts an image/PDF, calls Claude's vision capability with a strict extraction schema (vendor, invoice no., date, amount, tax breakdown, category), returns JSON + a confidence score.
- Desktop side: dropzone → progress steps → result review → "confirm & save to vault," writing both the raw file and the extracted JSON into the correct year/month folder, and indexing it in SQLite.
- **Exit criteria:** a real scanned invoice becomes a correctly-filed JSON file with >90% field accuracy on a test set of ~30 real documents.

### Phase 2 — Reminders (1–2 weeks)
- BSP account setup (Interakt/Gupshup/Twilio), template submission and approval (budget a few days of lead time here — this is the one phase gated by an external approval process, not your own build speed).
- Reminder rules: which clients are "missing documents" (derived from vault contents vs. an expected-documents checklist per client).
- Send flow + delivery/read webhook handling + message log.
- **Exit criteria:** a real WhatsApp template message reaches a real test number and the delivery status updates in the app.

### Phase 3 — Dashboard & Clients (1 week)
- Roll up everything built so far: stat cards, compliance calendar (hand-maintained due-date rules per return type to start), attention list, activity feed.
- **Exit criteria:** dashboard numbers are computed from real local data, not mock data.

### Phase 4 — Reconciliation (2 weeks)
- Bank statement import (CSV/Excel, or vision-extracted from a scanned statement using Phase 1's pipeline).
- Deterministic matching engine (amount + date window + description similarity scoring); manual override UI for partial/unmatched rows.
- **Exit criteria:** a real one-month bank statement reconciles against real books data with sensible match rates.

### Phase 5 — ITR/GSTR Studio (3–4 weeks, the most compliance-sensitive phase)
- Map vault-extracted fields to the GST offline utility's expected import format first (lower integration risk, no GSP registration needed).
- Build the auto-fill + draft preview + export flow.
- **Exit criteria:** a generated draft imports cleanly into the government's own offline utility without manual correction, for at least a handful of real test filings.
- *(Later, optional)*: GSP API integration for direct filing, once there's real usage to justify the registration/compliance overhead.

### Phase 6 — Agent chat (2 weeks)
- Built last on purpose: it's a thin conversational layer over data every other module already produces, so it has almost nothing to do until those modules exist.
- Tool-use functions: `get_pending_documents(client?)`, `get_filing_status(client?, period?)`, `summarize_vault(client)`, `get_unmatched_transactions(client, period)` — all read-only, all backed by local SQLite.
- **Exit criteria:** the agent answers every question the mock chips in the prototype demonstrate, using real data.

### Phase 7 — Packaging, licensing, distribution (1–2 weeks, can overlap earlier phases)
- Code-signing the Windows build (a code-signing certificate is worth the cost — unsigned installers get flagged by Windows SmartScreen, which kills trust immediately for a finance tool).
- License-key activation flow, auto-update channel.
- A simple landing page + Gumroad/Paddle for purchase, since this is a solo-operator sale, not enterprise procurement.

**Rough total:** ~14–18 weeks of solo, focused build time to a genuinely usable v1, assuming Phase 1 (vision) and Phase 5 (filings) are the ones that eat unplanned time — budget slack there specifically.

---

## 5. Data & security notes (non-negotiable for this category)
- **Encrypt the local SQLite file and vault at rest** using Windows' built-in DPAPI or a library like `age`/`sqlcipher` — this is client financial data.
- **Never log document contents** in crash/error reporting; scrub PII before sending any telemetry.
- **API keys for Claude/WhatsApp live only on the backend**, never bundled in the desktop app.
- If you ever add cloud backup, make it **opt-in and client-side encrypted before upload** — the CA should be able to say "yes, back this client up" per-client, not have a default that syncs everything.

## 6. Pricing shape (for a solo-CA tool)
A simple two-tier model fits this product best:
- **Solo** — flat monthly/annual license, up to a client-count cap, WhatsApp sends metered (BSP charges per message, so this cost needs to be passed through or capped).
- **Practice** — higher client cap, multiple staff logins to the same vault (this is the point at which you'd need to revisit the "no multi-user auth" decision above).

Usage-based costs to track per customer: vision extraction calls (Claude API), WhatsApp template messages (BSP pricing), and optional cloud backup storage — these should inform the tier pricing, not be an afterthought.