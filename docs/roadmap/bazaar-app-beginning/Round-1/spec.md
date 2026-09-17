---
round: Round-1
status: geklärt
---

# Spec: Round 1 — Angular-Projekt anlegen

## Fein-Spezifikation

### Ziel

Lauffähiges Angular-22-Frontend-Grundgerüst der Haupt-App unter
`src/bazaar-app/frontend/` — Standalone Components, OnPush, Signals,
Feature-First-Struktur mit ESLint-Grenzen, PrimeNG 22 als Paket (ohne
Theme-Ausprägung), Fonts/Icons lokal, offline-fähiger Production-Build.
Kein Routing, keine Sidebar, kein Theme, keine Fachlichkeit (folgt in
Epic_App_Shell bzw. den fachlichen Epics).

### Abweichung von spec.md / BPROJ-S01 (mit Nutzer abgestimmt)

`spec.md` §7.0.3 und BPROJ-S01 (AC-2, AC-3, AC-9) schreiben `@primeicons/angular`
(Einzelimport je Icon) und Jest wörtlich vor. Die tatsächliche Referenz-Implementierung
[`src/advance-registration/frontend/BAR.App`](../../../../src/advance-registration/frontend/BAR.App)
nutzt aber `primeicons` (CSS-Klassen-Icons) + `@lucide/angular` sowie **Vitest** statt Jest.

Mit dem Nutzer abgestimmt (2026-09-17): **Round-1 spiegelt die Referenz-App**, nicht den
wörtlichen Spec-Text — beide Apps der Suite sollen denselben Icon- und Test-Ansatz
teilen. `spec.md` §7.0/§7.0.3 und BPROJ-S01 (AC-2, AC-3, AC-9) sowie
Epic_Projektanlage/BPROJ-S06 sind damit **veraltet** und sollten in einem separaten
Doku-Abgleich (nicht Teil dieses Rounds) nachgezogen werden.

Damit gelten für Round-1 folgende **korrigierte** Festlegungen (ersetzen den Wortlaut aus
round.md/BPROJ-S01 dort, wo sie widersprechen):

| Bereich | round.md / Spec (wörtlich) | Tatsächlich umzusetzen |
|---|---|---|
| Icons | `@primeicons/angular`, Einzelimport, `data-p-icon` | `primeicons` (CSS-Klassen) + `@lucide/angular`, `provideLucideConfig` |
| Tests | Jest | Vitest (siehe Skill `dv-angular:angular-testing-vitest-conventions`) |

Fonts (`@fontsource/barlow`, `@fontsource/barlow-condensed`), PrimeNG 22.0.0 als reines
Paket ohne Theme, Feature-First-Struktur, Path-Aliases und ESLint-Boundaries bleiben wie
in round.md/BPROJ-S01 beschrieben.

### Akzeptanzkriterien (angepasst an obige Abweichung)

- **AC-1** — Angular 22 Projekt, Standalone Components, `ChangeDetectionStrategy.OnPush`
  als Default (`angular.json` `schematics.@schematics/angular:component.changeDetection`),
  Signals-Support.
- **AC-2** — PrimeNG 22.x + `@primeuix/themes` per npm installiert, `providePrimeNG` in
  `app.config.ts` registriert — **ohne** `theme.preset` (Theme-Ausprägung ist
  App-Shell-Sache; Platzhalter-Konfiguration ohne Preset, s. u.).
- **AC-3** — `primeicons` + `@lucide/angular` per npm installiert, `provideLucideConfig`
  in `app.config.ts` registriert, Icons ohne CDN-Aufruf nutzbar.
- **AC-4** — `ng build --configuration production` erzeugt keinen externen CDN-Verweis
  (fonts.googleapis.com, cdn.jsdelivr.net o. Ä.) im Output.
- **AC-5** — Verzeichnisse `src/app/features/`, `src/app/core/`, `src/app/shared/`
  angelegt (mit `.gitkeep`, da anfangs leer).
- **AC-6** — ESLint mit `eslint-plugin-boundaries` erzwingt: kein Feature importiert aus
  einem anderen Feature; `shared/`/`core/` importieren nie aus `features/`. Verstoß lässt
  `ng lint` fehlschlagen.
- **AC-7** — Path-Aliases `@core/*`, `@shared/*`, `@features/*` in `tsconfig.json`.
- **AC-8** — `ng serve` erreichbar unter `http://localhost:4200`, keine
  Browser-Konsolenfehler.
- **AC-9** entfällt in dieser Form (kein `@primeicons/angular`) — stattdessen: alle in der
  Komponenten-Doku (`docs/components/`) referenzierten Icon-Namen existieren als
  Lucide-Icon-Name; fehlt einer, wird ein Ersatz gewählt und die Komponenten-Doku
  nachgezogen (gleiche Prüfung wie in BPROJ-S01, nur gegen Lucide statt PrimeIcons).

### Bewusst nicht in diesem Round

Routing, Sidebar, Auth/JWT-Interceptor, i18n (`@ngx-translate`), Theme-Preset,
`@zxing/library` (QR/Barcode) — alles App-Shell bzw. fachliche Epics.

