---
id: VSHELL-S05
status: draft
depends-on: [VPROJ-S01]
---

# Story: PrimeNG Theme & Global Styles

## Ziel

PrimeNG 20 ist mit dem Teal/Grün-Branding der Voranmelde-App konfiguriert. Globale CSS Custom Properties stellen Farben, Borders und Abstände einheitlich bereit. ngx-translate ist mit DE (Default) und EN initialisiert.

## Kontext

Die Voranmelde-App verwendet Teal `#1b3a4b` und Grün `#0e8a5f` als Branding — unterschiedlich zur Haupt-App. CSS Custom Properties sorgen dafür, dass Feature-Komponenten keine Farben hardcoden. ngx-translate wird hier initialisiert, damit alle Features ab dem ersten Tag mit Übersetzungs-Keys arbeiten können.

## Scope

**In Scope:** PrimeNG-Theme-Konfiguration (Preset, Primärfarbe `#0e8a5f`), `styles.scss` mit CSS Custom Properties, ngx-translate mit DE/EN, globale Reset-/Basis-Styles. Kein CDN-Verweis erforderlich (Cloud, kein Offline-Zwang — aber npm bevorzugt).

**Out of Scope:** Feature-spezifische Styles, Übersetzungs-Keys für Features.

## UI-Spezifikation

**CSS Custom Properties (global in `styles.scss`):**

| Variable | Wert | Verwendung |
|---|---|---|
| `--sidebar-bg` | `#1b3a4b` | Sidebar, Topbar |
| `--accent` | `#0e8a5f` | Aktive Nav-Items, Primär-Buttons |
| `--avatar-accent` | `#3ecf8e` | Avatar-Hintergrund im Footer |
| `--content-bg` | `#f0f4f7` | Content-Bereich Hintergrund |
| `--title-color` | `#0d1f2a` | Seitentitel |
| `--border` | `#d4e8dc` | Card-Borders, Panel-Borders (Grünton) |
| `--muted` | `#5a7a6a` | Sekundäre Texte, Labels |

**PrimeNG-Farb-Tokens** werden auf die Primärfarbe `#0e8a5f` gemappt.

**ngx-translate:**
- Default-Sprache: DE
- Fallback-Sprache: EN
- Übersetzungs-Dateien: `assets/i18n/de.json`, `assets/i18n/en.json`

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL PrimeNG 20 mit einem konfigurierten Preset in `providePrimeNG()` initialisieren, das die Primärfarbe auf `#0e8a5f` setzt.
- [ ] **AC-2** — THE SYSTEM SHALL alle sieben CSS Custom Properties in `styles.scss` auf `:root` definieren.
- [ ] **AC-3** — THE SYSTEM SHALL `provideTranslateService` in `app.config.ts` initialisieren: DE als Standardsprache, EN als Fallback, Loader auf `assets/i18n/`.
- [ ] **AC-4** — WHEN eine Komponente `translate.instant('key')` aufruft und der Key in `de.json` vorhanden ist, THEN SHALL der deutsche Text zurückgegeben werden.
- [ ] **AC-5** — WHEN eine Komponente `translate.instant('key')` aufruft und der Key nicht in `de.json` vorhanden, aber in `en.json` ist, THEN SHALL der englische Text zurückgegeben werden.
- [ ] **AC-6** — WHEN eine PrimeNG-Komponente (`p-button`, `p-table`) gerendert wird, THEN SHALL sie die konfigurierten Farb-Tokens korrekt anwenden (Primary-Button in `#0e8a5f`).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | PrimeNG und ngx-translate müssen bereits installiert sein |

## Tags & Piles

**Tags:** #primeng #theme #css-custom-properties #styles #ngx-translate #i18n
