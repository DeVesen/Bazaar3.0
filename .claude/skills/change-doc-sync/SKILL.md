---
name: change-doc-sync
description: Use when a stretch of Bazaar-Suite work should be checked against the docs before a session ends — explicit range given ("letzte X Tage", "Branch X gegen Y") or implicit (current session/uncommitted diff). First resolves doc-vs-code gaps and drift (UI, FE/BE-composition, requirements) with the owner, then runs dv-working-capturing's update and actual-knowledge on the settled state so they protocol the true state — replacing the manual back-to-back call of both skills.
---

# Change-Doc-Sync

## Overview

Two phases, in order:

1. **Spec-Abgleich** (this skill's own logic) — for the touched area, check the docs against the code in **both directions**: something documented but not built (Gap), and something built differently than documented (Drift). Bundle these as decisions for the owner — never write anything yet.
2. **dv-working-capturing** (`update` + `actual-knowledge`, dispatched as-is) — runs only **after** the owner's decisions from Phase 1 are applied, so it protocols the *true, settled* state instead of a state that's still mid-mismatch.

Running dv-working-capturing before Phase 1 is resolved is the one thing this skill exists to prevent — a glossary/feature/module entry written against code that's about to be changed back is a wasted write.

**REQUIRED SUB-SKILLS:** `dv-working-capturing:update`, `dv-working-capturing:actual-knowledge` — read both before Phase 2, don't improvise their ask format.

## When to Use

- Session end / branch handoff: "gleich Doku abgleichen", "commits der letzten X Tage gegen Doku prüfen"
- Explicit range given: N Tage, Commit-Range, oder Branch X vs. Branch Y
- No range given → falls back to current session context (like `actual-knowledge`) plus uncommitted working-tree diff

## When NOT to Use

- Only a glossary term / one module / one feature, already obvious, nobody asked for a sweep → call that single target skill directly
- Pure git-diff-to-knowledge-capture, no doc-drift angle at all → plain `update` is enough
- Mid-task → offer at a seam, same rule as `actual-knowledge`

## Procedure

### 1. Resolve scope and app

| Input | Scope command |
|---|---|
| "letzte X Tage" | `git log --since="X days ago" --oneline`, `git diff HEAD@{X.days.ago}...HEAD --stat` |
| Branch X vs Y | `git log X..Y --oneline`, `git diff X...Y --stat` |
| Nothing given | current session's touched files + `git status` / `git diff HEAD` (uncommitted) |

Map every changed file to its app by path, per project `CLAUDE.md`:
`src/advance-registration/** → docs/requirements/advance-registration/`, `src/bazaar-app/** → docs/requirements/bazaar-app/`. A range can span both apps — handle each separately, don't merge their candidates.

State the coverage plan (full read vs. sampled, and why) before diving in. **Guard:** if the range's diff touches more than ~150 files or spans what looks like a whole epic/module rewrite, don't silently pick a sampling strategy — ask the user how to narrow or sample it before reading on.

### 2. Phase 1 — Spec-Abgleich (Gap + Drift)

For every touched area, read the doc side that governs it — `docs/requirements/<app>/...` for behavior, `docs/components/<name>/component.md` + the epic's story doc for UI, the relevant contract/DTO description for FE/BE-composition — and compare it against the current code. Two directions, never conflated:

| Richtung | Bedeutung | Beispiel |
|---|---|---|
| **Gap** — Doku voraus | Doku beschreibt etwas, das im Code (noch) nicht existiert | Spec verlangt Feld/Verhalten X, Code hat es nicht |
| **Drift** — Code weicht ab | Code tut etwas anderes als die Doku sagt | Doku: `rows="8"`, Code: `rows="5"` |

Additionally, run **Code-Styling** as a report-only side note (against `dv-craft:*`, `dv-angular:*`, `dv-dotnet:*`, `architecture-styles`, `software-design-principles`) — no decision needed for these, they're informational only, never a Gap or Drift item.

Check existing docs first — a Gap/Drift candidate that's already tracked (even worded differently, e.g. already flagged as "geplant") is not a new candidate. A file checked with **no mismatch found** is not silence — list it under "geprüft, keine Abweichung" so the reader can tell "checked and clean" apart from "not checked".

### 3. Phase 1 — Bundled decision ask

One message, before anything is written or Phase 2 runs. Per item, ask exactly the decision that item needs:

| Kategorie | Frage an den Owner |
|---|---|
| Gap (Doku voraus) | Jetzt umsetzen, oder bewusst später geplant (→ Doku bekommt Backlog-/Planned-Vermerk)? |
| Drift (Code weicht ab) | Code an Doku anpassen, oder Doku an den neuen Code-Stand anpassen? |
| Code-Styling-Notiz | Nur FYI, keine Entscheidung nötig |

Same bundling rules as `actual-knowledge`: never one question per item, an empty result ("alles deckt sich") is valid — name what was checked and why nothing surfaced.

Code-Styling-Zeilen sind FYI, keine Entscheidungsfrage — sie enden nie auf „?" und stehen sichtbar getrennt von den Gap-/Drift-Fragen, nicht als dritte Option in derselben Frage.

### 4. Apply Phase 1 decisions

- "später geplant" → doc gets a planned/backlog note (the answer itself is the approval to write that note)
- "jetzt umsetzen" → out of this skill's scope — report it as an open implementation item, don't silently build the feature here
- "Code an Doku anpassen" → make the code edit
- "Doku an Code anpassen" → edit the doc to reflect the current code, keeping that doc's own frontmatter/status conventions
- Code-Styling notes → stay report-only regardless, never auto-fixed

### 5. Phase 2 — dv-working-capturing on the settled state

Only now, after Step 4 is applied:

- Git-based scope (range given) → run `update` on that exact range.
- Session-context scope (nothing given) → run `actual-knowledge` on the session.
- Both apply when a range was given but the session also touched uncommitted work — run both, keep candidates separate per source.

Their candidates (glossary / module-profile / feature-profile) now reflect the state Phase 1 settled on, not the pre-decision mismatch — that's the whole point of running them last.

### 6. Write only what comes back approved

- Glossar/Modul/Feature → hand off to the owning capture skill, its format, its rules (never write freehand).
- Everything from Phase 1 is already applied per Step 4 — nothing left pending there.

Report what was written and what was dropped, across both phases — nothing disappears silently.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Running `update`/`actual-knowledge` before Phase 1 decisions are in | Always Spec-Abgleich first — dv-working-capturing must see the settled state |
| Conflating Gap and Drift into one generic "difference" | Keep them separate — they need different decisions from the owner |
| Silently implementing a "jetzt umsetzen" Gap item | Report as open item, don't build the feature inside this skill |
| Reimplementing `update`'s git-diff logic instead of calling it | Dispatch to `update`/`actual-knowledge`, don't duplicate |
| "Fixing" a code-styling finding directly | Report-only — no write for this category, ever |
| Merging candidates from two apps in one range | Handle advance-registration and bazaar-app separately |
| Assuming range = "since main" without checking what the user actually gave | Use exactly the range given; only fall back to session context when none was given |
