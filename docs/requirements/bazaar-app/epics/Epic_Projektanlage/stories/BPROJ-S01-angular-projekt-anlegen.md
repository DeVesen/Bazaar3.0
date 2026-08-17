---
id: BPROJ-S01
status: draft
depends-on: []
---

# Story: Angular-Projekt anlegen

## Ziel

Ein Entwickler legt das Angular 20 Frontend-Projekt der Haupt-App an, konfiguriert PrimeNG 22.0.0 und Material Icons als npm-Pakete, richtet die Feature-First-Verzeichnisstruktur samt erzwungener Importgrenzen ein und stellt sicher, dass das Projekt vollständig offline-fähig ist (kein CDN-Verweis).

## Kontext

Die Haupt-App läuft lokal im LAN ohne Internetzugang. Alle Abhängigkeiten müssen im npm-Bundle enthalten sein. PrimeNG ist die einzige zulässige UI-Bibliothek (siehe [`spec.md`](../../../spec.md) Abschnitt 7.0.3).

Die Major-Version **22.0.0** ist identisch zur Voranmelde-App (VPROJ-S01). Beide Apps teilen dieselben Komponenten-Muster — Sidebar, Table, AutoComplete — und dieselben eigenen Wrapper. Zwei PrimeNG-Majors in einer Suite würden dieses Wissen doppeln.

Die Struktur ist **Feature-First** (verbindliche Quelle: [`spec.md`](../../../spec.md) Abschnitt 7.0.1). „Epic" ist ein Begriff der Dokumentation, nicht der Laufzeit — im Code heißt der Ordner `features/`.

## Scope

**In Scope:** `ng new`, Standalone Components, OnPush, Signals, PrimeNG 22.0.0 installieren und konfigurieren, Angular Material Icons (npm), `provideAnimations`, Verzeichnisstruktur `features/` + `core/` + `shared/`, Path-Aliases, ESLint-Importgrenzen.

**Out of Scope:** Routing, Sidebar, Theme-CSS, Seiteninhalte (folgen in BSHELL), Testinfrastruktur (folgt in [BPROJ-S06](BPROJ-S06-test-und-architektur-setup.md)).

## Verzeichnisstruktur

```
src/app/
├── features/<feature>/   ← <feature>.routes.ts, pages/, components/, data/, model/
├── core/                 ← app-weite Singletons
└── shared/               ← wiederverwendbare, dumme UI
```

Cross-Feature-Imports sind verboten; `shared/` und `core/` importieren nie aus `features/`. Ohne maschinelle Prüfung ist diese Grenze eine Bitte und keine Regel — darum AC-6.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL ein Angular 20 Projekt mit Standalone Components, `changeDetection: ChangeDetectionStrategy.OnPush` als Default und Signals-Support erzeugen.
- [ ] **AC-2** — THE SYSTEM SHALL PrimeNG 22.0.0 (`primeng`, `@primeuix/styled`) per npm installieren und `providePrimeNG` in `app.config.ts` registrieren.
- [ ] **AC-3** — THE SYSTEM SHALL `@material-symbols/font-200` (oder äquivalentes Material-Icons-npm-Paket) installieren und in `angular.json` als Asset einbinden, sodass Icons ohne CDN-Aufruf verfügbar sind.
- [ ] **AC-4** — WHEN `ng build --configuration production` ausgeführt wird, THEN SHALL der Build-Output keinen externen CDN-Verweis (fonts.googleapis.com, cdn.jsdelivr.net o. Ä.) enthalten.
- [ ] **AC-5** — THE SYSTEM SHALL die Verzeichnisstruktur `src/app/features/`, `src/app/core/` und `src/app/shared/` anlegen.
- [ ] **AC-6** — THE SYSTEM SHALL ESLint mit `no-restricted-imports` so konfigurieren, dass (a) ein Feature nicht aus einem anderen Feature importiert und (b) `shared/` und `core/` nicht aus `features/` importieren; ein Verstoß SHALL `ng lint` fehlschlagen lassen.
- [ ] **AC-7** — THE SYSTEM SHALL die Path-Aliases `@core/*`, `@shared/*` und `@features/*` in `tsconfig.json` definieren.
- [ ] **AC-8** — WHEN `ng serve` ausgeführt wird, THEN SHALL die App unter `http://localhost:4200` erreichbar sein und keine Browser-Konsolenfehler zeigen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #angular #setup #primeng #material-icons #offline #feature-first #eslint
