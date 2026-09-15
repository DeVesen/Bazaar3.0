---
name: change-doc-sync
description: Use when a stretch of Bazaar-Suite work should be checked against the docs before a session ends — explicit range given ("letzte X Tage", "Branch X gegen Y") or implicit (current session/uncommitted diff). Combines dv-working-capturing's update and actual-knowledge with UI-, FE/BE-composition- and Code-Styling-Abgleich into one bundled ask, replacing the manual back-to-back call of both skills.
---

# Change-Doc-Sync

## Overview

One combined sweep over a change range: what `update` (git diff → glossary/module/feature candidates) and `actual-knowledge` (session sweep) already find, **plus** three more dimensions this repo cares about — UI (Styling/Positionierung/Größe/Art/Verhalten), Frontend↔Backend-Komposition, Code-Styling. One bundled ask at the end, not five separate ones.

This skill is an **orchestrator, not a replacement** — it dispatches to `update` / `actual-knowledge` for their targets and only adds logic for the three dimensions they don't cover.

**REQUIRED SUB-SKILLS:** `dv-working-capturing:update`, `dv-working-capturing:actual-knowledge` — read both before running Step 2/3, don't improvise their ask format.

## When to Use

- Session end / branch handoff: "gleich Doku abgleichen", "commits der letzten X Tage gegen Doku prüfen"
- Explicit range given: N Tage, Commit-Range, oder Branch X vs. Branch Y
- No range given → falls back to current session context (like `actual-knowledge`) plus uncommitted working-tree diff

## When NOT to Use

- Only a glossary term / one module / one feature, already obvious, nobody asked for a sweep → call that single target skill directly
- Pure git-diff-to-knowledge-capture, no UI/composition/style angle at all → plain `update` is enough
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

State the coverage plan (full read vs. sampled, and why) before diving in — same rule as `update` Step 3. **Guard:** if the range's diff touches more than ~150 files or spans what looks like a whole epic/module rewrite, don't silently pick a sampling strategy — ask the user how to narrow or sample it before reading on.

### 2. Run the two existing sweeps

- Git-based scope (range given) → run `update` on that exact range.
- Session-context scope (nothing given) → run `actual-knowledge` on the session.
- Both apply when a range was given but the session also touched uncommitted work — run both, keep their candidates separate per source.

Collect their candidates (glossary / module-profile / feature-profile) but **do not let them submit their ask yet** — hold everything for the one combined bundle in Step 4.

### 3. Run the three extra dimensions

Only on files touched in scope from Step 1.

| Dimension | Compare against | Candidate shape |
|---|---|---|
| **UI** — Styling, Positionierung, Größe, Art, Verhalten | `docs/components/<name>/component.md` (suite-wide) + the touched epic's story doc (app-specific ausprägung) | "Komponente X: Doku sagt A, Code macht B" |
| **FE/BE-Komposition** | DTO/Contract-Shape zwischen `frontend` und `backend` desselben Moduls gegen `docs/requirements/<app>/...` | "Contract Y: Backend liefert Feld Z, Frontend-Modell/Doku kennt es nicht (oder umgekehrt)" |
| **Code-Styling** | Projekt-Konventionen aus den craft-/style-Skills (`dv-craft:*`, `dv-angular:*`, `dv-dotnet:*`, `architecture-styles`, `software-design-principles`) | Abweichungsnotiz — **kein Fix**, nur Fund |

Check existing docs first, same as `update` Step 4 — a UI/composition candidate that's already documented (even worded differently) is not a candidate.

Code-Styling findings never get written anywhere automatically — they are report-only notes in the bundle, for the owner to act on or wave off.

### 4. One bundled ask

Group everything from Step 2 and Step 3 into a single message, by category:

`Glossar | Modul-Profil | Feature-Profil | Komponenten-Doku (UI) | Anforderungs-Doku (Komposition) | Code-Styling-Notizen`

Same rules as `actual-knowledge`: mark solid vs. guess, never one question per candidate, an empty sweep is a valid result — name what was considered and why it was dropped. A file checked against its doc with **no drift found** is not silence — list it under "geprüft, keine Abweichung" so the reader can tell "checked and clean" apart from "not checked".

### 5. Write only what comes back approved

- Glossar/Modul/Feature → hand off to the owning capture skill, its format, its rules (never write freehand).
- Komponenten-Doku / Anforderungs-Doku → propose the concrete edit to `docs/components/<name>/component.md` or `docs/requirements/<app>/...`, keeping that doc's own frontmatter/status conventions; write only the approved parts.
- Code-Styling-Notizen → report only, no file touched.

Report what was written and what was dropped — nothing disappears silently.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Reimplementing `update`'s git-diff logic instead of calling it | Dispatch to `update`/`actual-knowledge`, add only the 3 extra dimensions |
| Five separate asks (one per dimension) | One bundled ask across all categories |
| "Fixing" a code-styling finding directly | Report-only — no write for this category |
| Treating a UI wording difference as new without checking `component.md` first | Check existing component/epic docs before proposing |
| Merging candidates from two apps in one range | Handle advance-registration and bazaar-app separately |
| Assuming range = "since main" without checking what the user actually gave | Use exactly the range given; only fall back to session context when none was given |
