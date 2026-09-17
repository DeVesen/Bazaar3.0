---
round: Round-1
status: geplant
---

# Plan: Round 1 — Angular-Projekt anlegen

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

Keine — Round-1 ist Startpunkt der gesamten Umsetzung (round.md, Abschnitt
„Voraussetzung"). `src/bazaar-app/` existiert im Repo noch nicht.

## Implementationsplan

### 1. Werkzeug-Voraussetzungen prüfen

- `node -v`: muss `^22.22.3`, `^24.15.0` oder `>= 26.0.0` sein (Angular-CLI-22-Engine).
- Kein `ng new` starten, bevor das nicht stimmt — die CLI bricht sonst vor jeder Anlage ab.

### 2. Projekt anlegen

```
ng new bazaar-app --directory=src/bazaar-app/frontend --standalone --routing=false \
  --style=scss --ssr=false --skip-git
```

- `--routing=false`: Routing kommt erst mit Epic_App_Shell.
- Default-`ChangeDetectionStrategy` auf `OnPush` stellen: `angular.json` →
  `projects.bazaar-app.schematics."@schematics/angular:component".changeDetection: "OnPush"`.
- Generiertes Test-Setup (Karma/Jasmine) wird in Schritt 5 durch Vitest ersetzt.

### 3. Abhängigkeiten installieren

Runtime (angelehnt an [`BAR.App/package.json`](../../../../src/advance-registration/frontend/BAR.App/package.json), ohne die dort nicht zu Round-1 gehörenden Pakete `@ngx-translate/*`, `@zxing/library`):

```
npm install primeng @primeuix/themes primeicons @lucide/angular @fontsource/barlow @fontsource/barlow-condensed
```

Dev (Lint + Boundaries + Vitest, analog Referenz-App):

```
npm install -D eslint angular-eslint @eslint/js typescript-eslint \
  eslint-plugin-boundaries eslint-import-resolver-typescript \
  vitest jsdom
```

`ng add @angular-eslint/schematics` für Grundgerüst, falls nicht bereits über `angular-eslint` abgedeckt.

### 4. `app.config.ts`

```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import { provideLucideConfig } from '@lucide/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({ options: { darkModeSelector: false } }), // Theme-Preset folgt in Epic_App_Shell
    provideLucideConfig({ strokeWidth: 1.5 }),
  ],
};
```

Kein `MessageService`/`ConfirmationService` in diesem Round — die gehören zur ersten
fachlichen Nutzung, nicht zum Grundgerüst.

### 5. Fonts einbinden

In `src/styles.scss`:

```scss
@import '@fontsource/barlow';
@import '@fontsource/barlow-condensed';
```

### 6. Verzeichnisstruktur

```
src/app/features/.gitkeep
src/app/core/.gitkeep
src/app/shared/.gitkeep
```

### 7. Path-Aliases (`tsconfig.json`)

```json
"paths": {
  "@core/*": ["./src/app/core/*"],
  "@shared/*": ["./src/app/shared/*"],
  "@features/*": ["./src/app/features/*"]
}
```

### 8. ESLint mit Boundaries

`eslint.config.js` analog
[`BAR.App/eslint.config.js`](../../../../src/advance-registration/frontend/BAR.App/eslint.config.js),
aber **ohne Abteilungsebene** — die Haupt-App gruppiert Features nicht nach Abteilung
(siehe CLAUDE.md-Architektur-Tabelle: `src/app/features/<feature>/` direkt, kein
`<abteilung>/<feature>/`):

```javascript
settings: {
  'import/resolver': { typescript: { project: path.join(__dirname, 'tsconfig.json') } },
  'boundaries/include': ['src/app/**/*.ts'],
  'boundaries/elements': [
    { type: 'core', pattern: 'src/app/core/**' },
    { type: 'shared', pattern: 'src/app/shared/**' },
    { type: 'feature', pattern: 'src/app/features/*/**', capture: ['feature'] },
  ],
},
rules: {
  'boundaries/dependencies': ['error', {
    default: 'disallow',
    message: '{{from.type}} must not import from {{to.type}} (modulith boundary).',
    policies: [
      { from: { element: { type: 'core' } }, allow: { to: { element: { type: 'core' } } } },
      { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
      {
        from: { element: { type: 'feature' } },
        allow: [
          { to: { element: { type: 'core' } } },
          { to: { element: { type: 'shared' } } },
          { to: { element: { type: 'feature', captured: { feature: '{{from.captured.feature}}' } } } },
        ],
      },
    ],
  }],
},
```

### 9. Vitest-Setup

Karma/Jasmine-Reste (`karma.conf.js`, `src/test.ts`, `tsconfig.spec.json`
Jasmine-Types) entfernen bzw. auf Vitest umstellen — Vorgehen gemäß Skill
`dv-angular:angular-testing-vitest-conventions`. Kein Testfall in diesem Round nötig
(kein Fachcode), nur lauffähiges `npm test` gegen ein Platzhalter-Spec
(`app.spec.ts` der generierten `AppComponent`).

### 10. Icon-Namen-Abgleich (AC-9, angepasst)

Alle Icon-Namen aus `docs/components/**/component.md` sammeln, gegen die in
`@lucide/angular` verfügbaren Namen prüfen (Paket exportiert pro Icon eine
PascalCase-Komponente). Fehlt ein Name, Ersatz-Icon wählen und betroffene
Komponenten-Doku nachziehen (separater Schritt, kein Teil der Implementierung selbst,
aber vor Abschluss von Round-1 zu erledigen).

### 11. Verifikation

- `npm run lint` — muss grün sein, inkl. eines bewussten Testverstoßes gegen
  `boundaries/dependencies` (temporärer Import `features/x` → `features/y`), der den
  Fehler auslöst, danach wieder entfernen — Nachweis, dass AC-6 tatsächlich greift.
- `npm test` — Vitest läuft durch.
- `ng serve` — `http://localhost:4200` ohne Konsolenfehler (AC-8).
- `ng build --configuration production` — Output nach CDN-Strings durchsuchen
  (`grep -r "fonts.googleapis\|cdn.jsdelivr" dist/`) — keine Treffer (AC-4).

## Reihenfolge

Schritte 1–8 sequenziell (jeder baut auf dem vorigen auf), 9 kann parallel zu 6–8
vorbereitet werden, 10 unabhängig, 11 abschließend nach allen anderen.
