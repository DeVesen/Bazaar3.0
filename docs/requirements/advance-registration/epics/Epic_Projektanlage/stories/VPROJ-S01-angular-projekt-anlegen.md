---
id: VPROJ-S01
status: draft
depends-on: []
---

# Story: Angular-Projekt anlegen

## Ziel

Ein Entwickler legt das Angular 20 Frontend-Projekt der Voranmelde-App an, konfiguriert PrimeNG 22.0.0, Material Icons und ngx-translate (DE/EN) und stellt die Grundstruktur für eine mehrsprachige Cloud-App bereit.

## Kontext

Die Voranmelde-App läuft in der Cloud und unterstützt Deutsch (Default) und Englisch. ngx-translate wird von Beginn an eingebunden, damit alle späteren Epic-Texte über Übersetzungs-Keys angebunden werden. Die App benötigt keine Offline-Fähigkeit (kein CDN-Ausschluss wie in der Haupt-App).

## Scope

**In Scope:** `ng new`, Standalone Components, OnPush, Signals, PrimeNG 22.0.0 (stabile Version, nicht die parallel laufende 22.1.0-rc — verwendet für die neue `Sidebar`-Compound-Komponentenfamilie, siehe Epic_App_Shell VSHELL-S01), Angular Material Icons (npm), `ngx-translate` installieren und initialisieren (DE/EN JSON-Dateien anlegen), App-Verzeichnisstruktur anlegen.

**Out of Scope:** Routing, Sidebar, Theme-CSS, Übersetzungs-Keys für Epics (folgen in den jeweiligen Epics).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL ein Angular 20 Projekt mit Standalone Components und Signals-Support erzeugen und in `angular.json` unter `schematics` `ChangeDetectionStrategy.OnPush` als Default für neu generierte Komponenten konfigurieren.
- [ ] **AC-2** — THE SYSTEM SHALL PrimeNG in Version `22.0.0` (npm dist-tag `latest`, stabil) installieren und `providePrimeNG({ theme: { preset: Aura } })` in `app.config.ts` registrieren (Aura als Placeholder; wird in Epic_App_Shell durch das finale Preset ersetzt).
- [ ] **AC-3** — THE SYSTEM SHALL `@ngx-translate/core` und `@ngx-translate/http-loader` installieren und `provideTranslateService` in `app.config.ts` mit DE als Standardsprache und EN als Fallback registrieren.
- [ ] **AC-4** — THE SYSTEM SHALL leere Übersetzungs-Dateien `src/assets/i18n/de.json` und `src/assets/i18n/en.json` anlegen.
- [ ] **AC-5** — THE SYSTEM SHALL `@material-symbols/font-200` als npm-Paket installieren und in `angular.json` als Asset einbinden.
- [ ] **AC-6** — THE SYSTEM SHALL die Verzeichnisstruktur `src/app/epics/`, `src/app/core/`, `src/app/shared/` anlegen.
- [ ] **AC-7** — WHEN `ng serve` ausgeführt wird, THEN SHALL die App unter `http://localhost:4200` erreichbar sein und keine Browser-Konsolenfehler zeigen.

## Tags & Piles

**Tags:** #angular #setup #primeng #ngx-translate #i18n #material-icons
