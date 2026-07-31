---
id: VPROJ-S01
status: draft
depends-on: []
---

# Story: Angular-Projekt anlegen

## Ziel

Ein Entwickler legt das Angular 20 Frontend-Projekt der Voranmelde-App an, konfiguriert PrimeNG 20, Material Icons und ngx-translate (DE/EN) und stellt die Grundstruktur für eine mehrsprachige Cloud-App bereit.

## Kontext

Die Voranmelde-App läuft in der Cloud und unterstützt Deutsch (Default) und Englisch. ngx-translate wird von Beginn an eingebunden, damit alle späteren Feature-Texte über Übersetzungs-Keys angebunden werden. Die App benötigt keine Offline-Fähigkeit (kein CDN-Ausschluss wie in der Haupt-App).

## Scope

**In Scope:** `ng new`, Standalone Components, OnPush, Signals, PrimeNG 20, Angular Material Icons (npm), `ngx-translate` installieren und initialisieren (DE/EN JSON-Dateien anlegen), App-Verzeichnisstruktur anlegen.

**Out of Scope:** Routing, Sidebar, Theme-CSS, Übersetzungs-Keys für Features (folgen in den jeweiligen Features).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL ein Angular 20 Projekt mit Standalone Components, `ChangeDetectionStrategy.OnPush` als Default und Signals-Support erzeugen.
- [ ] **AC-2** — THE SYSTEM SHALL PrimeNG 20 installieren und `providePrimeNG` in `app.config.ts` registrieren.
- [ ] **AC-3** — THE SYSTEM SHALL `@ngx-translate/core` und `@ngx-translate/http-loader` installieren und `provideTranslateService` in `app.config.ts` mit DE als Standardsprache und EN als Fallback registrieren.
- [ ] **AC-4** — THE SYSTEM SHALL leere Übersetzungs-Dateien `src/assets/i18n/de.json` und `src/assets/i18n/en.json` anlegen.
- [ ] **AC-5** — THE SYSTEM SHALL `@material-symbols/font-200` als npm-Paket installieren und in `angular.json` als Asset einbinden.
- [ ] **AC-6** — THE SYSTEM SHALL die Verzeichnisstruktur `src/app/epics/`, `src/app/core/`, `src/app/shared/` anlegen.
- [ ] **AC-7** — WHEN `ng serve` ausgeführt wird, THEN SHALL die App unter `http://localhost:4200` erreichbar sein und keine Browser-Konsolenfehler zeigen.

## Tags & Piles

**Tags:** #angular #setup #primeng #ngx-translate #i18n #material-icons
