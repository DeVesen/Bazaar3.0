---
id: BPROJ-S01
status: draft
depends-on: []
---

# Story: Angular-Projekt anlegen

## Ziel

Ein Entwickler legt das Angular 20 Frontend-Projekt der Haupt-App an, konfiguriert PrimeNG 20 und Material Icons als npm-Pakete und stellt sicher, dass das Projekt vollständig offline-fähig ist (kein CDN-Verweis).

## Kontext

Die Haupt-App läuft lokal im LAN ohne Internetzugang. Alle Abhängigkeiten müssen im npm-Bundle enthalten sein. PrimeNG 20 ist die einzige zulässige UI-Bibliothek.

## Scope

**In Scope:** `ng new`, Standalone Components, OnPush, Signals, PrimeNG 20 installieren und konfigurieren, Angular Material Icons (npm), `provideAnimations`, App-Verzeichnisstruktur anlegen.

**Out of Scope:** Routing, Sidebar, Theme-CSS, Seiteninhalte (folgen in BSHELL).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL ein Angular 20 Projekt mit Standalone Components, `changeDetection: ChangeDetectionStrategy.OnPush` als Default und Signals-Support erzeugen.
- [ ] **AC-2** — THE SYSTEM SHALL PrimeNG 20 (`primeng`, `@primeuix/styled`) per npm installieren und `providePrimeNG` in `app.config.ts` registrieren.
- [ ] **AC-3** — THE SYSTEM SHALL `@material-symbols/font-200` (oder äquivalentes Material-Icons-npm-Paket) installieren und in `angular.json` als Asset einbinden, sodass Icons ohne CDN-Aufruf verfügbar sind.
- [ ] **AC-4** — WHEN `ng build --configuration production` ausgeführt wird, THEN SHALL der Build-Output keinen externen CDN-Verweis (fonts.googleapis.com, cdn.jsdelivr.net o. Ä.) enthalten.
- [ ] **AC-5** — THE SYSTEM SHALL die Verzeichnisstruktur `src/app/features/`, `src/app/core/`, `src/app/shared/` anlegen.
- [ ] **AC-6** — WHEN `ng serve` ausgeführt wird, THEN SHALL die App unter `http://localhost:4200` erreichbar sein und keine Browser-Konsolenfehler zeigen.

## Tags & Piles

**Tags:** #angular #setup #primeng #material-icons #offline
