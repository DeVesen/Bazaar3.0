---
id: BSHELL-S03
status: draft
depends-on: [BSHELL-S02]
---

# Story: Angular Routing Skeleton

## Ziel

Die App definiert alle Feature-Routen als Lazy-Loaded-Routes. Die Root-Route `/` leitet automatisch auf `/artikelannahme` weiter. Jede Feature-Seite erhält eine Platzhalter-Komponente, die beim Navigieren angezeigt wird.

## Kontext

Lazy Loading reduziert den initialen Bundle-Größe. Das Routing-Skeleton ermöglicht es, alle späteren Feature-Teams unabhängig voneinander zu entwickeln — jede Route landet in einem eigenen Feature-Modul-Verzeichnis.

## Scope

**In Scope:** `app.routes.ts` mit Lazy-Routes für alle 11 Seiten der Haupt-App, Redirect `/` → `/artikelannahme`, Wildcard-Route `**` → 404-Platzhalter, `provideRouter` in `app.config.ts`.

**Out of Scope:** Seiteninhalte, Guards (keine Auth-Guards in der Haupt-App), Preloading-Strategie.

## UI-Spezifikation

```
Route-Tabelle:
/                       → redirect → /artikelannahme
/artikelannahme         → lazy: ArtikelannahmeComponent
/verkauf                → lazy: VerkaufComponent
/abrechnung             → lazy: AbrechnungComponent
/verkaeufer             → lazy: VerkaeuferlComponent
/artikel                → lazy: ArtikelComponent
/marken                 → lazy: MarkenComponent
/kategorien             → lazy: KategorienComponent
/verkaeufer-types       → lazy: VerkaeufertypesComponent
/statistik              → lazy: StatistikComponent
/einstellungen          → lazy: EinstellungenComponent
/druckfunktionen        → lazy: DruckfunktionenComponent
**                      → NotFoundComponent (Platzhalter)
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL alle Feature-Routen als Lazy-Loaded-Routes in `app.routes.ts` definieren (je eine Datei pro Feature unter `src/app/features/<name>/`).
- [ ] **AC-2** — WHEN der Nutzer `/` aufruft, THEN SHALL Angular automatisch zu `/artikelannahme` weiterleiten (HTTP 302 / Router-Redirect).
- [ ] **AC-3** — WHEN der Nutzer eine unbekannte Route aufruft, THEN SHALL die `NotFoundComponent` mit dem Text „Seite nicht gefunden" angezeigt werden.
- [ ] **AC-4** — THE SYSTEM SHALL für jede Route eine Platzhalter-Komponente bereitstellen, die den Seitennamen anzeigt, bis das fachliche Feature implementiert ist.
- [ ] **AC-5** — WHEN der Nutzer zwischen zwei Routen navigiert, THEN SHALL nur das jeweilige Lazy-Chunk geladen werden (kein erneutes Laden bereits geladener Chunks).
- [ ] **AC-6** — THE SYSTEM SHALL `withRouterConfig({ onSameUrlNavigation: 'reload' })` nicht setzen (Standard-Verhalten); Navigation auf dieselbe Route löst keinen Reload aus.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BSHELL-S02 | Shell-Layout mit `<router-outlet>` muss existieren |

## Tags & Piles

**Tags:** #routing #lazy-loading #angular #skeleton
