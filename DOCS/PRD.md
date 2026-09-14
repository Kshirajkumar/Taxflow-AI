# Taxflow AI — Product Requirements Document (PRD)

**Product:** Taxflow AI — a Windows desktop app for solo Chartered Accountants
**Doc status:** v1.0 draft
**Owner:** Solo founder / CA
**Related docs:** `taxflow-ai-design-system.md`, `taxflow-ai-product-tech-plan.md`

---

## 1. Problem statement

A solo CA (or a 2–5 person practice) loses a large share of every month to work that has nothing to do with actual accounting judgment:
- Manually chasing clients over calls and WhatsApp for invoices, bills, and bank statements.
- Re-typing figures from scanned bills into Excel or filing software.
- Hunting for a specific document across email, WhatsApp Web, and a messy local drive.
- Manually matching bank statement lines against the books.
- Re-typing already-extracted figures a second time into GSTR/ITR forms.
- Having no single view of which of their ~30–50 clients are on track versus at risk this month.

None of this requires a CA's expertise — it's pure overhead that eats the hours that should go to review, advisory, and filing quality. Taxflow AI removes the overhead and leaves the judgment calls to the CA.

## 2. Goals

| Goal | How we'll know |
|---|---|
| Cut document-chasing time to near zero | Reminders go out automatically; CA only handles exceptions |
| Eliminate manual data entry from scanned documents | >90% of fields extracted correctly without manual correction, on a test set of real bills |
| Give every client one predictable, browsable home for their documents | Zero "where is this file" moments — vault structure is identical for every client |
| Make monthly bank reconciliation a review task, not a data-entry task | Majority of transaction lines auto-matched; CA reviews only flagged exceptions |
| Turn return preparation into review-and-file, not type-from-scratch | Draft return auto-fills from vault data the CA has already verified |
| Give the CA one place to ask "what's outstanding" | Agent answers correctly from live local data, no need to open five files |

### Non-goals (explicitly out of scope for v1)
- Multi-user / team accounts with roles and permissions.
- Direct e-filing to the GSTN or Income Tax portal (v1 produces a review-ready draft; direct filing is a later phase pending GSP registration).
- Payroll, audit workflow, or non-tax accounting modules.
- Mobile app (desktop-first; a mobile companion is a possible later phase, not v1).
- Multi-firm/white-label support.

## 3. Target user

**Primary persona — "Shreya," solo/small-practice CA**
- Runs a practice with ~30–50 active clients (proprietorships, partnerships, small Pvt Ltd companies).
- Handles GST filings monthly, ITR filings seasonally, and ad-hoc advisory year-round.
- Has 0–2 junior staff/articled assistants doing data entry and document collection today.
- Comfortable with Tally/Excel and WhatsApp; not necessarily comfortable with complex enterprise software — the tool has to feel as simple as the tools she already uses.
- Cares about client data confidentiality more than most software buyers — this shapes the local-first architecture decision in the tech plan.

**Secondary persona — the junior staff member**
- Does the actual document collection, filing prep, and reconciliation legwork today.
- Is the one who'll use Vision Extract and Reconciliation most heavily day to day; the CA mostly uses Dashboard, Clients, and the agent chat to check status.

## 4. Scope — features mapped to pain points

Each feature below exists because it solves one of the ten pain points identified for this practice (see the Pain Points page in the app for the full list). This mapping is the spec for what "done" means per feature — a feature is not done until the pain point it targets is actually gone, not just until the screen exists.

### 4.1 Dashboard
- **Solves:** no single view of the practice; missed deadlines.
- **Requirements:**
  - Stat cards: active clients, filings due this week, documents extracted this month, estimated hours saved.
  - Compliance calendar strip showing upcoming due dates with a per-deadline count of clients still pending.
  - "Clients needing attention" table, ranked by urgency, each row deep-linking to the relevant action (reminders, extraction, reconciliation).
  - Recent activity feed pulling real events from every other module.
- **Acceptance:** every number on this page is computed from real local data (SQLite/vault), not hardcoded, by the end of Phase 3 in the tech plan.

### 4.2 Reminders (WhatsApp automation)
- **Solves:** manually chasing clients for invoices and bills.
- **Requirements:**
  - Configurable message templates (invoice/bill reminder, missing bank statement, GST document checklist, filing deadline warning), sent via WhatsApp Business Cloud API through a BSP.
  - Per-client "missing documents" detection, derived from comparing vault contents against an expected-documents checklist per client per period.
  - One-click "send to this client" and "send all pending" actions.
  - Delivery/read status tracked via webhook and shown in a message log.
- **Acceptance:** a real WhatsApp message reaches a real client and its delivered/read status updates in the app without manual refresh.

### 4.3 Vision Extract
- **Solves:** manual data entry from scanned bills and invoices.
- **Requirements:**
  - Select client + document type, attach a scanned image or PDF.
  - Vision model extracts: vendor, invoice/bill number, date, amount, tax breakdown, category, with a confidence score.
  - Fields under a confidence threshold are visibly flagged for manual review before saving — never silently saved as-is.
  - On confirm, both the raw file and the structured extraction are written into the correct client/year/month vault folder and indexed.
- **Acceptance:** ≥90% field-level accuracy on a real test set of ~30 documents across invoice, bill, and receipt types, before this is considered usable day-to-day.

### 4.4 Client Vault
- **Solves:** documents scattered across email/WhatsApp/drives; inconsistent naming causing errors.
- **Requirements:**
  - Identical folder structure for every client: `Clients/<Client>/Data/<Year>/<Month>/{Raw, Extracted}`.
  - Folder-tree browser in-app, matched 1:1 to the real folder structure on disk (a CA can open the same folders in File Explorer and see the same thing).
  - File grid per folder showing type, name, and "auto-filed" provenance.
- **Acceptance:** creating a client creates the real folder structure on disk; every document that enters the app (via extraction or manual upload) lands in the correct folder automatically, with no manual filing step required.

### 4.5 Clients
- **Solves:** slow onboarding for new staff; no consistent client-level status view.
- **Requirements:**
  - Searchable list of all clients with GSTIN, category, document count, filing status, and a health indicator (on track / attention / critical).
  - Add-client flow that provisions the vault structure and an expected-documents checklist.
- **Acceptance:** a new staff member can find any client's status and documents using only this page and the vault, without being told where anything is.

### 4.6 ITR/GSTR Studio
- **Solves:** re-typing already-extracted figures into return forms.
- **Requirements:**
  - Select client, return type (GSTR-3B, GSTR-1, ITR-4 for v1), and period.
  - "Auto-fill from vault" pulls figures from confirmed extraction records for that client/period and produces a review draft (taxable value, output tax, ITC, net payable, source document count, average confidence).
  - Export in a format that imports cleanly into the existing government offline utility (v1); direct e-filing is a later phase, not v1 scope.
- **Acceptance:** a generated draft imports into the government's own offline utility without manual correction, for a handful of real test filings.

### 4.7 Reconciliation
- **Solves:** bank reconciliation eating a full day per client per month.
- **Requirements:**
  - Import a bank statement (CSV/Excel, or scanned via the same vision pipeline as Vision Extract).
  - Deterministic matching engine (amount + date window + description similarity) auto-matches obvious pairs.
  - Matched / partial / unmatched counts shown up top; only partial and unmatched rows need CA attention.
  - "Auto-reconcile" action re-runs matching and reports how many new matches it found.
- **Acceptance:** a real one-month bank statement reconciles with a majority of lines auto-matched and zero false matches (a wrong match is worse than an unmatched line, since it hides a real discrepancy).

### 4.8 Practice Agent (chat panel)
- **Solves:** "what's still pending" requiring digging through multiple files.
- **Requirements:**
  - Persistent chat panel available from every page.
  - Answers questions about filing status, pending documents, vault contents, and reconciliation exceptions, using only real local data via read-only tool calls.
  - Never sends a message, saves a file, or changes any record on its own — any action it suggests routes to the relevant page's existing confirm step.
- **Acceptance:** the agent correctly answers each of the four example questions surfaced as suggested chips in the prototype, using live data, for at least three different real clients.

## 5. Non-functional requirements

| Category | Requirement |
|---|---|
| **Performance** | App shell and dashboard load in under 2 seconds on a typical office laptop; vision extraction result returns in under 15 seconds per document. |
| **Offline behavior** | Dashboard, Vault, Clients, and Reconciliation must be fully usable offline (they read only local SQLite/vault data). Reminders, Vision Extract, and the Agent require connectivity and should fail with a clear, specific message when offline — never a silent hang. |
| **Data security** | Local vault and SQLite index encrypted at rest. API keys for Claude/WhatsApp never bundled in the desktop client. No document content in crash/telemetry logs. |
| **Reliability** | A failed vision extraction or reminder send must be retryable and must never leave a document half-filed (partially written into the vault) or a reminder logged as sent when it wasn't. |
| **Accessibility** | Meets the accessibility floor defined in the design system (visible focus states, status never conveyed by color alone, 32px minimum tap targets). |
| **Compliance/legal** | GST/ITR draft outputs are clearly labeled as drafts requiring CA review before filing — the product assists preparation, it does not represent itself as a filing authority. |

## 6. Key user flows

**Flow A — Monthly document collection**
Dashboard shows 9 clients with pending documents → CA opens Reminders → reviews template → sends all pending → clients respond over WhatsApp/upload → CA (or staff) runs Vision Extract on each received document → confirms and saves to vault → Dashboard's "documents extracted" count and "clients needing attention" list update automatically.

**Flow B — Preparing a GSTR-3B**
CA opens ITR/GSTR Studio → selects client and period → auto-fills from vault → reviews the draft against source document count and confidence → exports the draft → uploads it through the existing government offline utility.

**Flow C — Monthly bank reconciliation**
Staff imports the month's bank statement → runs auto-reconcile → reviews the handful of partial/unmatched rows → resolves each manually (correcting a book entry or flagging a real discrepancy for the CA).

**Flow D — "What's outstanding" check**
CA opens the app, doesn't want to click through five pages → asks the agent "who has pending GSTR-3B?" → gets a direct answer naming the specific clients and specific missing items → jumps straight to Reminders from there.

## 7. Success metrics (first 90 days of real use)
- ≥70% reduction in time spent on document chasing (self-reported CA time-tracking, before/after).
- ≥90% of scanned documents require no manual field correction after extraction.
- ≥80% of bank statement lines auto-matched on a typical month.
- Zero instances of a document "lost" (not findable in the vault) after being processed through the app.
- CA opens the agent chat at least a few times a week rather than treating it as a novelty — a proxy for whether it's genuinely faster than clicking through pages.

## 8. Risks & open questions

| Risk | Notes |
|---|---|
| WhatsApp template approval delays | BSP-dependent, typically a few days; must be planned for, not discovered late (see Phase 2 in the tech plan). |
| Vision extraction accuracy on poor-quality scans | Real client-submitted photos are often worse than clean test scans; needs a real-world test set, not just clean samples, before trusting the >90% target. |
| GST/ITR schema changes | Government return formats change periodically; the ITR/GSTR Studio's field mapping needs to be treated as a maintained component, not a one-time build. |
| Client trust in a cloud-touching tool for financial documents | Local-first architecture is the mitigation; this should stay a visible selling point, not just an implementation detail. |
| Solo-developer bandwidth | The phased build order in the tech plan sequences by dependency, but the ITR/GSTR Studio phase in particular has historically underestimated compliance-detail time in similar products — budget slack there specifically. |

## 9. Release plan
Follows the phased build order in `taxflow-ai-product-tech-plan.md`: Foundation → Vision Extract → Reminders → Dashboard/Clients → Reconciliation → ITR/GSTR Studio → Agent → Packaging/licensing. Each phase has its own exit criteria (above and in the tech plan) and should not be considered shippable to a real client until that criteria is met — the risk in a CA tool is a wrong number or a lost document, not a rough edge in the UI.