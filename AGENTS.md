# AGENTS.md — Design & UX Direction for VentureScope AI

This file exists so any AI coding agent (Claude Code, Cursor, Copilot, etc.) working on
this repo makes UI decisions consistent with a deliberate design direction, instead of
defaulting to generic patterns. Read this before touching `app/page.tsx`,
`app/page.module.css`, or `app/globals.css`.

## Reference direction

The product follows a **persistent-sidebar SaaS dashboard** layout (reference: internal
mockup — left nav rail, top header with page title, card-based main content, right rail
for status/context). This is a deliberate, proven layout for a research tool where users
come back repeatedly and need navigation (Dashboard, New Research, Research History,
Watchlist, Settings) — not a marketing landing page. Follow this structure; don't revert
to a single-column hero-first layout.

Because this layout pattern is common, spend distinctiveness in two specific places:
**(1)** the verdict/score presentation, and **(2)** the live research-progress panel.
Everything else (nav, cards, tables) should be clean and unremarkable on purpose — a
research tool should feel calm and legible, not decorative.

## Layout structure

```
┌──────────┬──────────────────────────────────────────┬───────────────┐
│  SIDEBAR │  HEADER: page title + subtitle    (?) (PK)│               │
│          ├──────────────────────────────────────────┤               │
│ ◈InvestAI│  Start your research                       │ RESEARCH      │
│          │  [search input.............] [Research →] │ STEPS         │
│ Dashboard│  Popular: Apple · Microsoft · NVIDIA ...   │ ✓ Company     │
│ New Res. ├──────────────────────────────────────────┤   Overview    │
│ History  │  Apple Inc. (AAPL)          [Download ⬇]  │ ✓ Financial   │
│ Watchlist│  Last updated: ...                          │   Analysis   │
│ Settings │ ┌────────────┬────────────┬─────────────┐ │ ● Industry    │
│          │ │ Decision   │ Score (○87)│ Summary text │ │   Analysis    │
│          │ │ INVEST     │            │ View full →  │ │   (running)   │
│          │ └────────────┴────────────┴─────────────┘ │ ○ News &      │
│ [Upgrade │  Key Metrics: Revenue · Net Income · ROE.. │   Sentiment   │
│  to Pro] │  AI Investment Thesis: Strengths|Risks|... │   pending     │
│ PK  user │                                              │ Key Financials│
│          │                                              │ Recent Rsrch. │
└──────────┴──────────────────────────────────────────┴───────────────┘
```

## Design tokens

**Palette:**
- `--bg` `#FFFFFF` — main canvas
- `--surface` `#F7F8FA` — sidebar background, card fills, input backgrounds
- `--border` `#E5E7EB` — hairline borders on cards, dividers, table rows
- `--ink` `#111827` — primary text, headings
- `--muted` `#6B7280` — secondary text, timestamps, labels
- `--primary` `#4F46E5` — indigo/blue accent: primary buttons, active nav item, links,
  "Research →" CTA, progress bars. This is the ONE brand accent — don't introduce a
  second accent color for decoration.
- `--invest` `#16A34A` — INVEST verdict, positive deltas (↑ 2.1%), "completed" checkmarks
- `--pass` `#DC2626` — PASS/reject verdict, negative deltas, risk flags

Do not add gradients, glassmorphism, or a second brand hue. The restraint here is what
keeps a sidebar dashboard from looking like a generic template — clean is the choice,
not the default.

**Typography:**
- Single grotesque/geometric sans throughout (Inter or system-ui stack) for UI, labels,
  nav, body text — matches the reference exactly, don't introduce a display serif.
- Financial figures (`$383.3B`, `28.4x`, `164.8%`) use `font-variant-numeric: tabular-nums`
  so columns of numbers align and don't jitter when they update live.
- Weight scale: 600 for card titles and nav labels, 400 for body/muted text, 700 only for
  the verdict word itself (`INVEST` / `PASS`) and the score number — these are the two
  things a user's eye should land on first.

## Where to spend distinctiveness

**1. The verdict block (Decision + Score + Summary row).** The reference shows a circular
score gauge (87/100) next to an INVEST/PASS label. Keep the circular gauge — it's
legible and scannable — but render it as an animated SVG arc that draws in from 0 to the
final score once the verdict lands (300–500ms ease-out), rather than appearing instantly.
This is the one moment of motion on the results page; don't add competing animation
elsewhere. If the build already has the 5-axis radar chart (growth/moat/valuation/risk/
sentiment) from an earlier pass, keep both: the circular gauge for the at-a-glance
number, the radar for the breakdown underneath "View Full Summary" — that combination
(single score + multi-axis breakdown) is more informative than most tools in this space,
which usually show only one or the other.

**2. The Research Steps panel (right rail).** This is the single best differentiation
opportunity in the whole layout, because it's the part of the screen the user actually
watches during the 30–60s the pipeline runs. Wire it directly to the SSE progress events
already coming from `app/api/research/route.ts` (`{ type: "progress", node, status,
message }`):
- `✓` completed step — solid `--invest` checkmark
- `●` active step — pulsing `--primary` dot (subtle scale pulse, ~1.5s loop, respects
  `prefers-reduced-motion`), with the live `message` text from the backend shown as a
  one-line subtitle under the step name (e.g. "Analyzing 12 sources...") instead of a
  static "In Progress" label
- `○` pending step — `--muted`, no animation

This turns a generic numbered checklist into an actual live status feed without changing
the layout footprint the reference established. Optionally add elapsed time per
completed step (`Completed · 2.1s`) — cheap to compute, reinforces that real work happened.

**3. Everything else stays quiet.** Sidebar, cards, tables, buttons: standard, clean, no
flourishes. Restraint here is what makes the two signature moments above actually land.

## Component inventory (map to the reference)

- `Sidebar` — logo, nav list (active state = `--primary` bg tint + left border accent),
  Upgrade card pinned above user footer, user avatar + plan label at bottom
- `PageHeader` — title + one-line subtitle, help icon, avatar (top right)
- `SearchCard` — input + primary button + "Popular:" chip row (chips are plain
  `--surface` pills with `--border`, not colored)
- `VerdictRow` — three cards: Decision (verdict word + confidence bar), Score (circular
  gauge), Summary (2–3 lines + "View Full Summary →" link in `--primary`)
- `KeyMetricsRow` — horizontal stat row, label above value, small colored delta
  (`--invest`/`--pass`) under each
- `ThesisColumns` — three even columns (Strengths / Risks / Catalysts), each with a
  small icon + bullet list, icon color matches column intent (green/red/neutral)
- `ResearchStepsPanel` — right rail, see distinctiveness section above
- `KeyFinancialsPanel` — right rail, label/value pairs, "View All" link top right
- `RecentResearchList` — right rail, company logo/initial + name + date + verdict pill

## Writing guidance

- Name things by what the user controls: "Research →" not "Submit," "Download Report"
  not "Export Artifact."
- Verdict copy is decisive, never hedged: "INVEST" / "PASS," not "Likely Invest" or
  "Consider Investing."
- Step labels in the Research Steps panel describe the actual work in plain terms
  ("Financial Analysis," "News & Sentiment") — not internal node names
  (`financialAnalyst`, `webResearcher`).
- Errors inline in the affected card, specific about what happened and what to do next —
  never a generic toast.

## Restraint checklist before shipping any UI change

- [ ] Only `--primary` (indigo) as the brand accent — no second accent color introduced?
- [ ] Is animation limited to the score-gauge draw-in and the active-step pulse — no
      competing motion added elsewhere?
- [ ] Do financial numbers use tabular figures so columns stay aligned?
- [ ] Does the Research Steps panel show real backend messages, not static labels?
- [ ] Visible keyboard focus on nav items, buttons, and the search input?
- [ ] Holds up with `prefers-reduced-motion: reduce` set?
