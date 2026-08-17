---
id: VPROJ-S01
status: draft
depends-on: []
---

# Story: Angular-Projekt anlegen

## Ziel

Ein Entwickler legt das Angular 22 Frontend-Projekt der Voranmelde-App an, konfiguriert PrimeNG 22.0.0, Material Icons und ngx-translate (DE/EN) und stellt die Grundstruktur für eine mehrsprachige Cloud-App bereit.

## Kontext

Die Voranmelde-App läuft in der Cloud und unterstützt Deutsch (Default) und Englisch. ngx-translate wird von Beginn an eingebunden, damit alle späteren Epic-Texte über Übersetzungs-Keys angebunden werden. Die App benötigt keine Offline-Fähigkeit (kein CDN-Ausschluss wie in der Haupt-App).

## Voraussetzungen an die Entwicklungsumgebung

Vor `ng new` zu prüfen — die Angular CLI bricht sonst mit einer Versionsmeldung ab, bevor
irgendetwas angelegt wird:

| Werkzeug | Anforderung | Warum |
|---|---|---|
| **Node.js** | `^22.22.3` oder `^24.15.0` oder `>= 26.0.0` | Engine-Anforderung der Angular CLI 22 (`engines.node`). Ältere 24er-Versionen wie 24.12 werden abgelehnt, obwohl sie „Node 24" sind |
| **npm** | Version aus dem Node-Paket | keine eigene Anforderung |
| **.NET SDK** | 10.x | siehe VPROJ-S02 |

Die Node-Anforderung ist **nicht** dieselbe wie bei Angular 21 (`^20.19 || ^22.12 || >= 24.0.0`) —
der Sprung auf Angular 22 verschärft sie. Wer mit einer 24.x-Version unter 24.15 arbeitet,
braucht ein Node-Update, bevor diese Story beginnen kann.

## Scope

**In Scope:** `ng new`, Standalone Components, OnPush, Signals, PrimeNG 22.0.0 (stabile Version, nicht die parallel laufende 22.1.0-rc — verwendet für die neue `Sidebar`-Compound-Komponentenfamilie, siehe Epic_App_Shell VSHELL-S01), Angular Material Icons (npm), `ngx-translate` installieren und initialisieren (DE/EN JSON-Dateien anlegen), App-Verzeichnisstruktur anlegen.

**Out of Scope:** Routing, Sidebar, Theme-CSS, Übersetzungs-Keys für Epics (folgen in den jeweiligen Epics).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL ein Angular 22 Projekt mit Standalone Components und Signals-Support erzeugen und in `angular.json` unter `schematics` `ChangeDetectionStrategy.OnPush` als Default für neu generierte Komponenten konfigurieren.
- [ ] **AC-2** — THE SYSTEM SHALL PrimeNG in Version `22.0.0` (npm dist-tag `latest`, stabil) installieren und `providePrimeNG({ theme: { preset: Aura } })` in `app.config.ts` registrieren (Aura als Placeholder; wird in Epic_App_Shell durch das finale Preset ersetzt).
- [ ] **AC-3** — THE SYSTEM SHALL `@ngx-translate/core` und `@ngx-translate/http-loader` installieren und `provideTranslateService` in `app.config.ts` mit DE als Standardsprache und EN als Fallback registrieren.
- [ ] **AC-4** — THE SYSTEM SHALL leere Übersetzungs-Dateien `src/assets/i18n/de.json` und `src/assets/i18n/en.json` anlegen.
- [ ] **AC-5** — THE SYSTEM SHALL `@material-symbols/font-200` als npm-Paket installieren und in `angular.json` als Asset einbinden.
- [ ] **AC-6** — THE SYSTEM SHALL die Feature-First-Verzeichnisstruktur `src/app/features/`, `src/app/core/`, `src/app/shared/` anlegen. Pro Feature gilt die Konvention `features/<feature>/` mit `<feature>.routes.ts`, `pages/`, `components/`, `data/` (Api + Store), `model/`.
- [ ] **AC-7** — WHEN `ng serve` ausgeführt wird, THEN SHALL die App unter `http://localhost:4200` erreichbar sein und keine Browser-Konsolenfehler zeigen.
- [ ] **AC-8** — THE SYSTEM SHALL in `tsconfig.json` die Path-Aliases `@core/*`, `@shared/*` und `@features/*` auf die entsprechenden Verzeichnisse konfigurieren.
- [ ] **AC-9** — THE SYSTEM SHALL per ESLint-Regel `no-restricted-imports` folgende Import-Grenzen erzwingen: kein Import zwischen zwei Features (`features/a` → `features/b`), kein Import aus `shared/` nach `features/` oder `core/`, kein Import aus `core/` nach `features/`. Ein Verstoß SHALL den Lint-Lauf mit Fehler beenden.

## Sprach- und Struktur-Konvention

Alle Klassen-, Datei-, Verzeichnis- und Signal-Namen sind **englisch** — ebenso die
Routen-Pfade (`/my-articles`, `/seller-types`). Sichtbare Texte kommen
ausschließlich aus den ngx-translate-Dateien. Begründung: Die App ist zweisprachig,
sprachneutrale URLs vermeiden eine dritte Übersetzungsebene.

**Komponenten-Rollen** (verbindlich für alle Features, Details →
[`components/overview.md`](../../../components/overview.md)):

| Rolle | Ort | Darf |
|---|---|---|
| Integration | `pages/<x>.page.ts` | Store injizieren, Kinder verdrahten, Layout — keine eigene Render-Logik |
| Leaf | `components/**` | nur `input()`/`output()`, kein Service-Inject, kein HTTP |

## Tags & Piles

**Tags:** #angular #setup #primeng #ngx-translate #i18n #material-icons
