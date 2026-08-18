---
id: BPROJ-S01
status: draft
depends-on: []
---

# Story: Angular-Projekt anlegen

## Ziel

Ein Entwickler legt das Angular 22 Frontend-Projekt der Haupt-App an, konfiguriert PrimeNG 22.0.0 und `@primeicons/angular` als npm-Pakete, richtet die Feature-First-Verzeichnisstruktur samt erzwungener Importgrenzen ein und stellt sicher, dass das Projekt vollständig offline-fähig ist (kein CDN-Verweis).

## Kontext

Die Haupt-App läuft lokal im LAN ohne Internetzugang. Alle Abhängigkeiten müssen im npm-Bundle enthalten sein. PrimeNG ist die einzige zulässige UI-Bibliothek (siehe [`spec.md`](../../../spec.md) Abschnitt 7.0.3).

Die Major-Version **22.0.0** ist identisch zur Voranmelde-App (VPROJ-S01). Beide Apps teilen dieselben Komponenten-Muster — Sidebar, Table, AutoComplete — und dieselben eigenen Wrapper. Zwei PrimeNG-Majors in einer Suite würden dieses Wissen doppeln.

Die Struktur ist **Feature-First** (verbindliche Quelle: [`spec.md`](../../../spec.md) Abschnitt 7.0.1). „Epic" ist ein Begriff der Dokumentation, nicht der Laufzeit — im Code heißt der Ordner `features/`.

## Voraussetzungen an die Entwicklungsumgebung

Vor `ng new` zu prüfen — die Angular CLI bricht sonst mit einer Versionsmeldung ab, bevor
irgendetwas angelegt wird:

| Werkzeug | Anforderung | Warum |
|---|---|---|
| **Node.js** | `^22.22.3` oder `^24.15.0` oder `>= 26.0.0` | Engine-Anforderung der Angular CLI 22 (`engines.node`). Ältere 24er-Versionen wie 24.12 werden abgelehnt, obwohl sie „Node 24" sind |
| **npm** | Version aus dem Node-Paket | keine eigene Anforderung |
| **.NET SDK** | 10.x | siehe BPROJ-S02 |

Die Node-Anforderung ist **nicht** dieselbe wie bei Angular 21 (`^20.19 || ^22.12 || >= 24.0.0`) —
der Sprung auf Angular 22 verschärft sie. Wer mit einer 24.x-Version unter 24.15 arbeitet,
braucht ein Node-Update, bevor diese Story beginnen kann.

## Scope

**In Scope:** `ng new`, Standalone Components, OnPush, Signals, PrimeNG 22.0.0 installieren und konfigurieren, `@primeicons/angular` (npm), `provideAnimations`, Verzeichnisstruktur `features/` + `core/` + `shared/`, Path-Aliases, ESLint-Importgrenzen.

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

- [ ] **AC-1** — THE SYSTEM SHALL ein Angular 22 Projekt mit Standalone Components, `changeDetection: ChangeDetectionStrategy.OnPush` als Default und Signals-Support erzeugen.
- [ ] **AC-2** — THE SYSTEM SHALL PrimeNG 22.0.0 (`primeng`, `@primeuix/styled`) per npm installieren und `providePrimeNG` in `app.config.ts` registrieren.
- [ ] **AC-3** — THE SYSTEM SHALL `@primeicons/angular` als npm-Paket installieren, sodass Icons ohne CDN-Aufruf importierbar sind.
- [ ] **AC-4** — WHEN `ng build --configuration production` ausgeführt wird, THEN SHALL der Build-Output keinen externen CDN-Verweis (fonts.googleapis.com, cdn.jsdelivr.net o. Ä.) enthalten.
- [ ] **AC-5** — THE SYSTEM SHALL die Verzeichnisstruktur `src/app/features/`, `src/app/core/` und `src/app/shared/` anlegen.
- [ ] **AC-6** — THE SYSTEM SHALL ESLint mit `no-restricted-imports` so konfigurieren, dass (a) ein Feature nicht aus einem anderen Feature importiert und (b) `shared/` und `core/` nicht aus `features/` importieren; ein Verstoß SHALL `ng lint` fehlschlagen lassen.
- [ ] **AC-7** — THE SYSTEM SHALL die Path-Aliases `@core/*`, `@shared/*` und `@features/*` in `tsconfig.json` definieren.
- [ ] **AC-8** — WHEN `ng serve` ausgeführt wird, THEN SHALL die App unter `http://localhost:4200` erreichbar sein und keine Browser-Konsolenfehler zeigen.
- [ ] **AC-9** — THE SYSTEM SHALL bei der Projektanlage prüfen, ob alle in der Komponenten-Doku verwendeten Icon-Namen (z. B. `delete-left`, `arrow-turn-down-left`, `camera`, `keyboard`, `th-large`) im installierten `@primeicons/angular` tatsächlich existieren; fehlt ein Icon-Name, SHALL ein Ersatz-Icon gewählt und die betroffene Komponenten-Doku entsprechend nachgezogen werden.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #angular #setup #primeng #primeicons #offline #feature-first #eslint
