# R00 Fundament (Voranmelde-App) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the Restumfang of Roadmap-Schritt R00 for the Voranmelde-App — Angular frontend fundament, App-Shell (Sidebar, responsive layout, routing, auth infrastructure, PrimeNG theme), EF-Core backend fundament, the `frontend` Compose service, and the eleven due doc corrections — so that `docker compose up` boots a runnable, empty, demoable app.

**Architecture:** Frontend is Angular 22 standalone/Signals, Feature-First (`core/`, `shared/`, `features/<feature>/`), PrimeNG 22.1.0 themed via `definePreset` on Aura with the Industry design tokens, icons via `@lucide/angular`. Backend is a four-project hexagon (`BAR.Domain`/`BAR.Application`/`BAR.Infrastructure`/`BAR.Host`) on .NET 10 Minimal API with EF Core/Npgsql confined to `BAR.Infrastructure`. Both apps and PostgreSQL run as three Docker Compose services (`frontend`, `api`, `db`).

**Tech Stack:** Angular 22.1, PrimeNG 22.1.0 (`@primeuix/themes`), `@lucide/angular`, `@ngx-translate/core` + `@ngx-translate/http-loader`, Vitest; .NET 10, EF Core 10 + `Npgsql.EntityFrameworkCore.PostgreSQL` 10.0.3, xUnit v3, NetArchTest, Testcontainers.PostgreSql; PostgreSQL 18-alpine; Docker Compose.

**Spec:** [docs/dv-test/2026-09-09-r00-fundament/02-spec.md](../../dv-test/2026-09-09-r00-fundament/02-spec.md)

## Global Constraints

Copied verbatim from the spec's `## Boundaries` and `## Constraints` sections — every task below implicitly obeys these:

- Keine Geschäftslogik und kein fachlicher Endpoint entsteht in diesem Schritt.
- `/api/auth/*` als echter Endpoint, das Login-Formular und die Registrierung selbst entstehen nicht — nur die Auth-Infrastruktur im Frontend und die leeren Platzhalter-Seiten `/register` und `/set-password`.
- Englische Übersetzungstexte entstehen nicht — `en.json` bleibt leer. `de.json` wird laut Roadmap R00-fundament.md erst **ab R01** gepflegt — sichtbare Shell-Texte in diesem Schritt bleiben deshalb hartkodierte deutsche Strings, nicht `translate.instant()`-Aufrufe; die ngx-translate-Infrastruktur selbst muss trotzdem stehen.
- Die Platzhalter-Seiten zeigen keinen fachlichen Inhalt, nur ihren Seitennamen.
- Es entsteht keine Migration mit Tabellenänderungen — `InitialCreate` bleibt leer.
- Es entsteht keine Azure-Container-Apps-Deploy-Konfiguration, keine CI/CD-Pipeline, keine SSL-Terminierung.
- `@primeicons/angular` wird nicht installiert.
- Die PostgreSQL-Major bleibt `postgres:18-alpine`.
- Schriftarten werden lokal über `@fontsource/barlow` und `@fontsource/barlow-condensed` gebündelt, kein Google-Fonts-CDN.
- Ausschließlich PrimeNG als UI-Bibliothek, kein natives HTML für interaktive Elemente, keine weitere UI-Library — mit der dokumentierten Ausnahme des Icon-Sets für Icons.
- Der Compose-Servicename für das Backend bleibt `api`, nicht `backend`.
- Sprachregel (spec.md §10.0.1): Code, Routen-Pfade, JSON-Contract und Feldnamen englisch; Doku-Prosa deutsch.

**Zwei bewusste Abweichungen von der wörtlichen Spec-Formulierung** (technisch geprüft gegen die reale PrimeNG-22.1.0- bzw. Lucide-API, siehe Task 6):

1. **Icons (R-6):** Die Spec verlangt einen "globalen PassThrough-Block in `providePrimeNG({ pt: … })`", der Icon-Slots ersetzt. Geprüft gegen die reale PrimeNG-Pass-Through-API: `pt` customized ausschließlich PrimeNG-eigene interne DOM-Knoten (z. B. `pcBadge` in einem Button) — nicht Icon-Markup, das die App selbst in ihre eigenen Templates schreibt (genau wie es die offiziellen Sidebar-Demos tun: `<svg data-p-icon="home">` steht direkt im App-Template, nicht in PrimeNGs interner DOM). Ein PrimeNG-`pt`-Block kann dieses Markup nicht global umbiegen. Die tatsächlich globale, wachsende Konfigurationsstelle ist `provideLucideConfig({ strokeWidth: 1.5 })` aus `@lucide/angular` — sie setzt Stroke-Width 1.5 App-weit an einer Stelle, exakt im Sinne von R-6, nur über den echten Lucide-Mechanismus statt über PrimeNGs `pt`.
2. **Lucide-Paketname:** `lucide-angular` (der in der Spec genannte Name) ist laut Lucide-eigenem Migrationsleitfaden der veraltete Vorgänger von `@lucide/angular` — installiert wird `@lucide/angular` (aktuell gepflegtes Paket derselben Bibliothek, moderne Standalone-Icon-Komponenten statt `NgModule.pick()`).

Beide Punkte werden in Task 27 (Doku-Neufassung VSHELL-S01/S05) so dokumentiert, damit die Story-Texte die tatsächliche Implementierung beschreiben.

## File Structure

```
src/advance-registration/
├── compose.yaml                              [NEU — verschoben aus backend/]
├── .env.example                              [NEU]
├── frontend/BAR.App/
│   ├── Dockerfile                            [NEU]
│   ├── nginx.conf                            [NEU]
│   ├── angular.json                          [ÄNDERT — SSR-Keys entfernt]
│   ├── package.json                          [ÄNDERT]
│   ├── tsconfig.json                         [ÄNDERT — Path-Aliases]
│   ├── eslint.config.js                      [NEU via ng add]
│   └── src/
│       ├── main.ts                           [unverändert]
│       ├── styles.scss                       [ÄNDERT — Custom Properties, Fonts]
│       ├── public/i18n/de.json, en.json      [NEU]
│       └── app/
│           ├── app.config.ts                 [ÄNDERT]
│           ├── app.routes.ts                 [ÄNDERT — 15 Routen]
│           ├── app.ts / app.html             [ÄNDERT — Shell übernimmt Rendering]
│           ├── core/
│           │   ├── auth/
│           │   │   ├── token-store.ts (+.spec.ts)
│           │   │   ├── jwt-decoder.ts (+.spec.ts)
│           │   │   ├── auth.service.ts (+.spec.ts)
│           │   │   ├── role.service.ts (+.spec.ts)
│           │   │   ├── auth.guard.ts (+.spec.ts)
│           │   │   ├── admin.guard.ts (+.spec.ts)
│           │   │   └── jwt.interceptor.ts (+.spec.ts)
│           │   └── shell/
│           │       ├── shell.ts (+.html, .scss)
│           │       └── sidebar/
│           │           ├── sidebar.ts (+.html, .scss, .spec.ts)
│           │           └── sidebar-title.ts (+.html)
│           ├── shared/
│           │   └── blueprint/
│           │       ├── bar-blueprint.ts (+.html, .scss, .spec.ts)
│           └── features/
│               ├── home/, my-articles/, sellers/, articles/, brands/, categories/,
│               │ seller-types/, profile/, settings/, export/, number-blocks/,
│               │ login/, register/, set-password/, countdown-embed/, not-found/
│               └── (je Feature: <feature>.routes.ts, pages/<Name>Page)
└── backend/
    ├── BAR.Infrastructure/
    │   └── Persistence/
    │       ├── BarDbContext.cs               [NEU]
    │       └── Migrations/InitialCreate*.cs  [NEU, generiert]
    ├── BAR.Host/
    │   ├── Program.cs                        [ÄNDERT]
    │   └── Features/Public/HealthEndpoints.cs [ÄNDERT — /health/ready]
    └── Directory.Packages.props              [ÄNDERT — neues Health-Check-Paket]

docs/requirements/advance-registration/
├── spec.md                                   [ÄNDERT — §13, §10.0.4, Tech-Stack-Tabelle]
├── design/industry-styleguide.md             [ÄNDERT — §8]
├── roadmap/R00-fundament.md                  [ÄNDERT — Fake-JWT-Zeilen]
└── epics/
    ├── Epic_Projektanlage/
    │   ├── epic.md                           [ÄNDERT]
    │   └── stories/VPROJ-S01/-S03/-S05.md    [ÄNDERT]
    └── Epic_App_Shell/stories/
        ├── VSHELL-S01-sidebar-navigation.md  [NEUFASSUNG]
        ├── VSHELL-S02-responsives-layout.md  [ÄNDERT]
        ├── VSHELL-S03-routing-skeleton.md    [ÄNDERT]
        └── VSHELL-S05-primeng-theme-setup.md [NEUFASSUNG]
```

---

# PHASE A — Frontend-Fundament

### Task 1: SSR-Rückbau

**Files:**
- Delete: `src/advance-registration/frontend/BAR.App/src/server.ts`
- Delete: `src/advance-registration/frontend/BAR.App/src/main.server.ts`
- Delete: `src/advance-registration/frontend/BAR.App/src/app/app.config.server.ts`
- Delete: `src/advance-registration/frontend/BAR.App/src/app/app.routes.server.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/angular.json`
- Modify: `src/advance-registration/frontend/BAR.App/package.json`

**Interfaces:**
- Produces: `appConfig` (`ApplicationConfig`) in `app.config.ts`, now without `provideClientHydration()` — every later task that edits `app.config.ts` (Tasks 4, 5, 6, 13) builds on this reduced provider list.

- [ ] **Step 1: Delete the four SSR files**

```bash
rm src/advance-registration/frontend/BAR.App/src/server.ts \
   src/advance-registration/frontend/BAR.App/src/main.server.ts \
   src/advance-registration/frontend/BAR.App/src/app/app.config.server.ts \
   src/advance-registration/frontend/BAR.App/src/app/app.routes.server.ts
```

- [ ] **Step 2: Remove `provideClientHydration` from `app.config.ts`**

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
```

- [ ] **Step 3: Remove SSR keys from `angular.json`**

In the `projects.BAR.App.architect.build.options` block, delete the `"server"`, `"outputMode"` and `"ssr"` keys entirely (the `"browser"` entry point and everything else stays). The build output becomes `dist/BAR.App/browser`.

- [ ] **Step 4: Remove SSR packages and the SSR script from `package.json`**

Remove the `"serve:ssr:BAR.App"` script entry. Then:

```bash
cd src/advance-registration/frontend/BAR.App
npm uninstall @angular/ssr @angular/platform-server express @types/express
```

- [ ] **Step 5: Verify the app still builds and serves**

```bash
npm run build
```

Expected: build succeeds, output at `dist/BAR.App/browser`, no reference to `server.ts`/`main.server.ts` in the build log.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App
git commit -m "refactor(voranmelde-app): SSR aus Angular-Projekt zurueckgebaut"
```

---

### Task 2: Verzeichnisstruktur, Path-Aliases, Default-Placeholder entfernen

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/.gitkeep`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/.gitkeep`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/.gitkeep`
- Modify: `src/advance-registration/frontend/BAR.App/tsconfig.json`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.spec.ts`

**Interfaces:**
- Produces: TypeScript path aliases `@core/*` → `src/app/core/*`, `@shared/*` → `src/app/shared/*`, `@features/*` → `src/app/features/*`, used by every subsequent frontend task's imports.
- Produces: `App` component reduced to a bare `<router-outlet />` host — Task 15 replaces this outlet's content indirectly by making `/` render the shell.

- [ ] **Step 1: Create the three top-level directories**

```bash
mkdir -p src/advance-registration/frontend/BAR.App/src/app/core \
         src/advance-registration/frontend/BAR.App/src/app/shared \
         src/advance-registration/frontend/BAR.App/src/app/features
touch src/advance-registration/frontend/BAR.App/src/app/core/.gitkeep \
      src/advance-registration/frontend/BAR.App/src/app/shared/.gitkeep \
      src/advance-registration/frontend/BAR.App/src/app/features/.gitkeep
```

- [ ] **Step 2: Add path aliases to `tsconfig.json`**

Add a `"paths"` block inside `compilerOptions`:

```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"]
    }
  }
}
```

- [ ] **Step 3: Strip the default `ng new` placeholder markup from `app.html`**

```html
<router-outlet />
```

- [ ] **Step 4: Simplify `app.ts`** (remove the unused `title` signal, since it only existed for the deleted placeholder markup)

```ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
```

- [ ] **Step 5: Fix `app.spec.ts`** (the default spec asserts on the removed title signal/text)

```ts
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App]
    }).compileComponents();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

- [ ] **Step 6: Run the test suite**

```bash
npm test
```

Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App
git commit -m "feat(voranmelde-app): Feature-First-Verzeichnisstruktur und Path-Aliases angelegt"
```

---

### Task 3: ESLint-Import-Grenzen

**Files:**
- Create/Modify: `src/advance-registration/frontend/BAR.App/eslint.config.js`
- Modify: `src/advance-registration/frontend/BAR.App/package.json`

**Interfaces:**
- Produces: three ESLint override blocks enforcing the import-boundary convention every later feature/shared/core file (Tasks 8–17) must follow: files under `features/**` never import through the `@features/*` alias (same-feature code only ever uses relative imports; only `@core/*` and `@shared/*` are reachable across the boundary); files under `shared/**` never import `@features/*` or `@core/*`; files under `core/**` never import `@features/*`.

- [ ] **Step 1: Run the Angular ESLint schematic**

```bash
cd src/advance-registration/frontend/BAR.App
ng add @angular/eslint
```

This generates `eslint.config.js` (flat config) and adds `@angular-eslint/*`/`typescript-eslint` devDependencies plus an `ng lint` architect target wired to `npm run lint` (the schematic adds a `"lint": "ng lint"` script to `package.json`).

- [ ] **Step 2: Append the three import-boundary overrides to `eslint.config.js`**

Add these objects to the exported config array (after the blocks the schematic generated):

```js
{
  files: ['src/app/features/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@features/*'],
        message: 'Kein Import zwischen zwei Features — Cross-Feature-Code gehoert nach @core/ oder @shared/.'
      }]
    }]
  }
},
{
  files: ['src/app/shared/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@features/*', '@core/*'],
        message: 'shared/ darf nicht aus features/ oder core/ importieren.'
      }]
    }]
  }
},
{
  files: ['src/app/core/**/*.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@features/*'],
        message: 'core/ darf nicht aus features/ importieren.'
      }]
    }]
  }
}
```

**Konvention (verbindlich ab jetzt):** Code innerhalb eines Features referenziert sein eigenes Feature ausschließlich relativ (`../model/x`, niemals `@features/my-articles/...` von innerhalb `features/my-articles/` selbst) — nur so bleibt `@features/*` als Cross-Feature-Sperre wirksam, ohne intra-Feature-Imports zu blockieren.

- [ ] **Step 3: Verify the rule fires on a real violation**

Temporarily create `src/app/shared/tmp-violation.ts` with `import { x } from '@core/tmp';`, run `npm run lint`, confirm it fails with the `no-restricted-imports` message, then delete the temp file.

- [ ] **Step 4: Run lint clean**

```bash
npm run lint
```

Expected: PASS, no errors (nothing under `features/`/`shared/`/`core/` exists yet beyond `.gitkeep`).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App
git commit -m "feat(voranmelde-app): ESLint mit Feature-Import-Grenzen eingerichtet"
```

---

### Task 4: ngx-translate & i18n-Dateien

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/public/i18n/de.json`
- Create: `src/advance-registration/frontend/BAR.App/public/i18n/en.json`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/package.json`

**Interfaces:**
- Consumes: `appConfig.providers` array from Task 1.
- Produces: `provideTranslateService(...)` registered in `app.config.ts` — later tasks (5, 6, 13) append further providers to the same array without touching this one.

- [ ] **Step 1: Install ngx-translate**

```bash
cd src/advance-registration/frontend/BAR.App
npm install @ngx-translate/core @ngx-translate/http-loader
```

- [ ] **Step 2: Create the two empty translation files**

`public/i18n/de.json`:
```json
{}
```

`public/i18n/en.json`:
```json
{}
```

- [ ] **Step 3: Register ngx-translate in `app.config.ts`**

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      lang: 'de',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
    })
  ]
};
```

- [ ] **Step 4: Write a smoke test proving the loader resolves**

`src/app/app.spec.ts` — extend the existing spec (from Task 2) with a translate-loader check:

```ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          lang: 'de',
          fallbackLang: 'en',
          loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
        })
      ]
    }).compileComponents();
  });

  it('creates the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('loads the German translation file on startup', () => {
    const translate = TestBed.inject(TranslateService);
    const httpMock = TestBed.inject(HttpTestingController);
    translate.use('de');
    const req = httpMock.expectOne('/i18n/de.json');
    req.flush({});
    httpMock.verify();
  });
});
```

- [ ] **Step 5: Run the tests**

```bash
npm test
```

Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App
git commit -m "feat(voranmelde-app): ngx-translate mit DE/EN eingerichtet"
```

---

### Task 5: PrimeNG-Theme (Industry-Preset)

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/theme/industry-preset.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/styles.scss`
- Modify: `src/advance-registration/frontend/BAR.App/package.json`

**Interfaces:**
- Produces: `IndustryPreset` (exported `const`) — a `definePreset(Aura, …)` result — consumed only by `app.config.ts`'s `providePrimeNG` call.
- Produces: CSS Custom Properties on `:root` in `styles.scss` (`--space-1`..`--space-8`, `--shadow-sm/-md/-lg`, `--font-heading`, `--font-body`, `--color-divider`) — consumed by Tasks 7 (blueprint), 14 (sidebar), 15 (layout) for anything PrimeNG's own token system doesn't cover.

- [ ] **Step 1: Install PrimeNG, the theme package and the fonts**

```bash
cd src/advance-registration/frontend/BAR.App
npm install primeng@22.1.0 @primeuix/themes @fontsource/barlow @fontsource/barlow-condensed
```

- [ ] **Step 2: Write the Industry preset**

`src/app/core/theme/industry-preset.ts` — maps the Industry Accent ramp onto PrimeNG's `primary` semantic scale and the Neutral ramp onto the light-mode `surface` scale (values copied verbatim from `design/industry-styleguide.md` §2):

```ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const IndustryPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef6ff',
      100: '#eef6ff',
      200: '#d6ebff',
      300: '#b5d9fd',
      400: '#94bce3',
      500: '#749dc4',
      600: '#597ea3',
      700: '#416180',
      800: '#2c455d',
      900: '#1d2d3d',
      950: '#1d2d3d'
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f5f5f8',
          100: '#f5f5f8',
          200: '#e7e7ea',
          300: '#d4d4d7',
          400: '#b7b7ba',
          500: '#98989b',
          600: '#7a7a7d',
          700: '#5d5d60',
          800: '#424244',
          900: '#2b2b2d',
          950: '#2b2b2d'
        }
      }
    }
  }
});
```

- [ ] **Step 3: Register the preset in `app.config.ts`**

```ts
import { providePrimeNG } from 'primeng/config';
import { IndustryPreset } from './core/theme/industry-preset';
// ...existing imports from Task 4...

export const appConfig: ApplicationConfig = {
  providers: [
    // ...existing providers from Tasks 1 and 4...
    providePrimeNG({
      theme: {
        preset: IndustryPreset,
        options: { darkModeSelector: false }
      }
    })
  ]
};
```

`darkModeSelector: false` disables PrimeNG's automatic dark-mode media query — the Industry styleguide (§7) explicitly has no dark variant.

- [ ] **Step 4: Write `styles.scss`**

```scss
@use '@fontsource/barlow/400.css';
@use '@fontsource/barlow/500.css';
@use '@fontsource/barlow/700.css';
@use '@fontsource/barlow-condensed/400.css';
@use '@fontsource/barlow-condensed/600.css';

:root {
  --space-1: 3.4px;
  --space-2: 6.8px;
  --space-3: 10.2px;
  --space-4: 13.6px;
  --space-6: 20.4px;
  --space-8: 27.2px;

  --shadow-sm: 0 1px 2px rgba(29, 31, 32, 0.12);
  --shadow-md: 0 3px 10px rgba(29, 31, 32, 0.14);
  --shadow-lg: 0 12px 32px rgba(29, 31, 32, 0.16);

  --font-heading: 'Barlow Condensed', sans-serif;
  --font-body: 'Barlow', sans-serif;

  --color-divider: color-mix(in srgb, #1d1f20 16%, transparent);
}

body {
  font-family: var(--font-body);
  margin: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

- [ ] **Step 5: Verify the app still builds**

```bash
npm run build
```

Expected: PASS, no PrimeNG/theme import errors.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App
git commit -m "feat(voranmelde-app): PrimeNG Industry-Theme via definePreset konfiguriert"
```

---

### Task 6: Icons — `@lucide/angular`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/package.json`

**Interfaces:**
- Produces: `provideLucideConfig({ strokeWidth: 1.5 })` registered globally — every icon placed by Tasks 14/15 (`LucideHome`, `LucideSidebar`, `LucideLogOut`, …) inherits stroke-width 1.5 without repeating it per usage.
- Convention for later tasks: import each icon as a named standalone component from `@lucide/angular` (e.g. `import { LucideHome } from '@lucide/angular'`), add it to the consuming component's `imports` array, and render `<svg lucideHome></svg>` (attribute-directive selector, exactly like the official Lucide Angular docs) — the same tree-shakeable, one-import-per-icon pattern the codebase already used for `@primeicons/angular` before this step.

- [ ] **Step 1: Install `@lucide/angular`**

```bash
cd src/advance-registration/frontend/BAR.App
npm install @lucide/angular
```

- [ ] **Step 2: Register the global stroke-width in `app.config.ts`**

```ts
import { provideLucideConfig } from '@lucide/angular';
// ...existing imports...

export const appConfig: ApplicationConfig = {
  providers: [
    // ...existing providers from Tasks 1, 4, 5...
    provideLucideConfig({ strokeWidth: 1.5 })
  ]
};
```

- [ ] **Step 3: Smoke-test one icon renders**

Extend `app.html` temporarily is not needed — this is proven directly in Task 7's blueprint test and Task 14's sidebar test, which both render at least one Lucide icon. No standalone test needed here; skip to build verification.

- [ ] **Step 4: Verify the app still builds**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App
git commit -m "feat(voranmelde-app): @lucide/angular als Icon-Set eingerichtet"
```

---

### Task 7: `bar-blueprint`-Komponente (TDD)

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/blueprint/bar-blueprint.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/blueprint/bar-blueprint.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/blueprint/bar-blueprint.scss`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/blueprint/bar-blueprint.spec.ts`

**Interfaces:**
- Produces: standalone component `BarBlueprint`, selector `bar-blueprint`, content-projecting (`<ng-content>`) — available to any later feature via `@shared/blueprint/bar-blueprint` once features exist (not consumed anywhere in R00 itself, but this is the "lauffähiger Beispieltest" the spec's Test-Approach requires for the frontend).

- [ ] **Step 1: Write the failing test**

```ts
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BarBlueprint } from './bar-blueprint';

describe('BarBlueprint', () => {
  it('projects its content inside the blueprint container', () => {
    TestBed.overrideComponent(BarBlueprint, {
      set: { template: '<bar-blueprint><p>Inhalt</p></bar-blueprint>' }
    });
    const fixture = TestBed.createComponent(BarBlueprint);
    fixture.detectChanges();
    const projected = fixture.debugElement.query(By.css('p'));
    expect(projected.nativeElement.textContent).toBe('Inhalt');
  });

  it('renders exactly four corner-cross elements', () => {
    const fixture = TestBed.createComponent(BarBlueprint);
    fixture.detectChanges();
    const corners = fixture.debugElement.queryAll(By.css('.corner'));
    expect(corners.length).toBe(4);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- bar-blueprint
```

Expected: FAIL — `bar-blueprint.ts` does not exist yet.

- [ ] **Step 3: Implement the component**

`bar-blueprint.ts`:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'bar-blueprint',
  templateUrl: './bar-blueprint.html',
  styleUrl: './bar-blueprint.scss'
})
export class BarBlueprint {}
```

`bar-blueprint.html`:
```html
<div class="blueprint">
  <i class="corner tl"></i>
  <i class="corner tr"></i>
  <i class="corner bl"></i>
  <i class="corner br"></i>
  <ng-content />
</div>
```

`bar-blueprint.scss` (per Industry-Styleguide §5, with the local override from spec.md §12 R-7: dialogs get a solid `#f2f2f3` fill, not transparency):

```scss
.blueprint {
  position: relative;
  border: 1px solid var(--color-divider);
  border-radius: 0;
  background: transparent;
}

.corner {
  position: absolute;
  width: 11px;
  height: 11px;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    background: color-mix(in srgb, #1d1f20 55%, transparent);
  }

  &::before {
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    transform: translateY(-50%);
  }

  &::after {
    left: 50%;
    top: 0;
    width: 1px;
    height: 100%;
    transform: translateX(-50%);
  }

  &.tl { top: -5px; left: -5px; }
  &.tr { top: -5px; right: -5px; }
  &.bl { bottom: -5px; left: -5px; }
  &.br { bottom: -5px; right: -5px; }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npm test -- bar-blueprint
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/blueprint
git commit -m "feat(voranmelde-app): bar-blueprint-Komponente mit Registrierkreuzen"
```

---

# PHASE B — Auth-Infrastruktur (`core/auth/`)

### Task 8: `TokenStore`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/token-store.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/token-store.spec.ts`

**Interfaces:**
- Produces: `TokenStore` (`@Injectable({ providedIn: 'root' })`) with methods `getToken()`, `setToken(token: string)`, `getRefreshToken()`, `setRefreshToken(token: string)`, `getActiveRole()`, `setActiveRole(role: string)`, `clear()`. Consumed by Tasks 10 (`AuthService`), 11 (`RoleService`), 13 (`jwtInterceptor`).

- [ ] **Step 1: Write the failing test**

```ts
import { TokenStore } from './token-store';

describe('TokenStore', () => {
  beforeEach(() => localStorage.clear());

  it('stores and retrieves the access token', () => {
    const store = new TokenStore();
    store.setToken('abc');
    expect(store.getToken()).toBe('abc');
  });

  it('stores and retrieves the refresh token', () => {
    const store = new TokenStore();
    store.setRefreshToken('refresh-abc');
    expect(store.getRefreshToken()).toBe('refresh-abc');
  });

  it('stores and retrieves the active role', () => {
    const store = new TokenStore();
    store.setActiveRole('admin');
    expect(store.getActiveRole()).toBe('admin');
  });

  it('returns null for unset values', () => {
    const store = new TokenStore();
    expect(store.getToken()).toBeNull();
  });

  it('clear() removes all three keys', () => {
    const store = new TokenStore();
    store.setToken('abc');
    store.setRefreshToken('def');
    store.setActiveRole('admin');
    store.clear();
    expect(store.getToken()).toBeNull();
    expect(store.getRefreshToken()).toBeNull();
    expect(store.getActiveRole()).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- token-store
```

Expected: FAIL — `token-store.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
import { Injectable } from '@angular/core';

const TOKEN_KEY = 'bazaar_token';
const REFRESH_TOKEN_KEY = 'bazaar_refresh_token';
const ACTIVE_ROLE_KEY = 'bazaar_active_role';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getActiveRole(): string | null {
    return localStorage.getItem(ACTIVE_ROLE_KEY);
  }

  setActiveRole(role: string): void {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- token-store
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/auth/token-store.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/token-store.spec.ts
git commit -m "feat(voranmelde-app): TokenStore als einziger localStorage-Zugriff"
```

---

### Task 9: `JwtDecoder`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt-decoder.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt-decoder.spec.ts`

**Interfaces:**
- Produces: `interface DecodedToken { sub: string; role: 'admin' | 'seller'; exp: number }` and `function decodeJwt(token: string): DecodedToken | null` (pure function, no Angular DI). Consumed by Tasks 10 (`AuthService`), 13 (`jwtInterceptor`'s refresh handling doesn't need it directly, but `AuthService` does). Also consumed by Task 17's Abnahme-Anleitung, which builds fake tokens whose payload shape this function must accept.

- [ ] **Step 1: Write the failing test**

```ts
import { decodeJwt } from './jwt-decoder';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('decodeJwt', () => {
  it('decodes a valid token into sub/role/exp', () => {
    const token = fakeToken({ sub: 'user-1', role: 'admin', exp: 9999999999 });
    expect(decodeJwt(token)).toEqual({ sub: 'user-1', role: 'admin', exp: 9999999999 });
  });

  it('returns null for a token with only two segments', () => {
    expect(decodeJwt('only.two')).toBeNull();
  });

  it('returns null for a payload missing required fields', () => {
    const token = fakeToken({ sub: 'user-1' });
    expect(decodeJwt(token)).toBeNull();
  });

  it('returns null for an unparseable payload', () => {
    expect(decodeJwt('a.!!!not-base64!!!.c')).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- jwt-decoder
```

Expected: FAIL — `jwt-decoder.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
export interface DecodedToken {
  sub: string;
  role: 'admin' | 'seller';
  exp: number;
}

export function decodeJwt(token: string): DecodedToken | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>;
    if (
      typeof payload['sub'] !== 'string' ||
      (payload['role'] !== 'admin' && payload['role'] !== 'seller') ||
      typeof payload['exp'] !== 'number'
    ) {
      return null;
    }
    return { sub: payload['sub'], role: payload['role'], exp: payload['exp'] };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- jwt-decoder
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt-decoder.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt-decoder.spec.ts
git commit -m "feat(voranmelde-app): JwtDecoder als reine Funktion"
```

---

### Task 10: `AuthService`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.service.spec.ts`

**Interfaces:**
- Consumes: `TokenStore` (Task 8), `decodeJwt`/`DecodedToken` (Task 9).
- Produces: `AuthService` (`@Injectable({ providedIn: 'root' })`) with `currentUser: Signal<DecodedToken | null>`, `isLoggedIn: Signal<boolean>` (computed), `login(accessToken: string, refreshToken: string): void`, `logout(): void`. Consumed by Tasks 11 (`RoleService`), 12 (guards), 13 (`jwtInterceptor`), 14 (sidebar template reads `currentUser()`).

- [ ] **Step 1: Write the failing test**

```ts
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('has no current user when no token is stored', () => {
    const service = TestBed.inject(AuthService);
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('decodes a stored non-expired token as the current user on construction', () => {
    const store = TestBed.inject(TokenStore);
    store.setToken(fakeToken({ sub: 'user-1', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
    const service = TestBed.inject(AuthService);
    expect(service.currentUser()).toEqual(expect.objectContaining({ sub: 'user-1', role: 'admin' }));
    expect(service.isLoggedIn()).toBe(true);
  });

  it('treats an expired token as logged out', () => {
    const store = TestBed.inject(TokenStore);
    store.setToken(fakeToken({ sub: 'user-1', role: 'admin', exp: Math.floor(Date.now() / 1000) - 3600 }));
    const service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login() stores both tokens and sets currentUser', () => {
    const service = TestBed.inject(AuthService);
    const token = fakeToken({ sub: 'user-2', role: 'seller', exp: Math.floor(Date.now() / 1000) + 3600 });
    service.login(token, 'refresh-token-value');
    expect(service.currentUser()?.sub).toBe('user-2');
    expect(TestBed.inject(TokenStore).getRefreshToken()).toBe('refresh-token-value');
  });

  it('logout() clears storage and currentUser', () => {
    const service = TestBed.inject(AuthService);
    service.login(fakeToken({ sub: 'user-2', role: 'seller', exp: Math.floor(Date.now() / 1000) + 3600 }), 'r');
    service.logout();
    expect(service.currentUser()).toBeNull();
    expect(TestBed.inject(TokenStore).getToken()).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- auth.service
```

Expected: FAIL — `auth.service.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
import { Injectable, computed, inject, signal } from '@angular/core';
import { TokenStore } from './token-store';
import { DecodedToken, decodeJwt } from './jwt-decoder';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStore = inject(TokenStore);

  readonly currentUser = signal<DecodedToken | null>(this.decodeStoredToken());

  readonly isLoggedIn = computed(() => {
    const user = this.currentUser();
    return user !== null && user.exp * 1000 > Date.now();
  });

  login(accessToken: string, refreshToken: string): void {
    this.tokenStore.setToken(accessToken);
    this.tokenStore.setRefreshToken(refreshToken);
    this.currentUser.set(decodeJwt(accessToken));
  }

  logout(): void {
    this.tokenStore.clear();
    this.currentUser.set(null);
  }

  private decodeStoredToken(): DecodedToken | null {
    const token = this.tokenStore.getToken();
    return token ? decodeJwt(token) : null;
  }
}
```

Decoding happens exactly once, in the field initializer that runs when the singleton is constructed at app start — matching spec R-12 ("Token wird beim App-Start einmal dekodiert, nicht bei jedem Guard-Aufruf").

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- auth.service
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.service.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.service.spec.ts
git commit -m "feat(voranmelde-app): AuthService mit currentUser-Signal und einmaligem Token-Decode"
```

---

### Task 11: `RoleService`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/role.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/role.service.spec.ts`

**Interfaces:**
- Consumes: `TokenStore` (Task 8), `AuthService` (Task 10).
- Produces: `type Role = 'admin' | 'seller'`, `RoleService` with `activeRole: Signal<Role>`, `setRole(role: Role): void`. Consumed by Task 14 (sidebar group filtering and Role-Toggle).

- [ ] **Step 1: Write the failing test**

```ts
import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';
import { TokenStore } from './token-store';
import { AuthService } from './auth.service';

function fakeToken(payload: unknown): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

describe('RoleService', () => {
  beforeEach(() => localStorage.clear());

  it('defaults activeRole to the JWT role when no toggle was ever set', () => {
    TestBed.inject(TokenStore).setToken(
      fakeToken({ sub: 'u', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })
    );
    TestBed.inject(AuthService);
    const roleService = TestBed.inject(RoleService);
    expect(roleService.activeRole()).toBe('admin');
  });

  it('restores a previously toggled role from TokenStore', () => {
    TestBed.inject(TokenStore).setActiveRole('seller');
    const roleService = TestBed.inject(RoleService);
    expect(roleService.activeRole()).toBe('seller');
  });

  it('setRole updates the signal and persists to TokenStore', () => {
    const roleService = TestBed.inject(RoleService);
    roleService.setRole('seller');
    expect(roleService.activeRole()).toBe('seller');
    expect(TestBed.inject(TokenStore).getActiveRole()).toBe('seller');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- role.service
```

Expected: FAIL — `role.service.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
import { Injectable, inject, signal } from '@angular/core';
import { TokenStore } from './token-store';
import { AuthService } from './auth.service';

export type Role = 'admin' | 'seller';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly tokenStore = inject(TokenStore);
  private readonly authService = inject(AuthService);

  readonly activeRole = signal<Role>(this.initialRole());

  setRole(role: Role): void {
    this.activeRole.set(role);
    this.tokenStore.setActiveRole(role);
  }

  private initialRole(): Role {
    const stored = this.tokenStore.getActiveRole();
    if (stored === 'admin' || stored === 'seller') {
      return stored;
    }
    return this.authService.currentUser()?.role ?? 'seller';
  }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npm test -- role.service
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/auth/role.service.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/role.service.spec.ts
git commit -m "feat(voranmelde-app): RoleService fuer den Role-Toggle"
```

---

### Task 12: `authGuard` & `adminGuard`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.guard.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/admin.guard.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.guard.spec.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/admin.guard.spec.ts`

**Interfaces:**
- Consumes: `AuthService` (Task 10).
- Produces: `authGuard: CanActivateFn`, `adminGuard: CanActivateFn`. Consumed by Task 16 (`app.routes.ts`).

- [ ] **Step 1: Write the failing tests**

`auth.guard.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  it('allows navigation when logged in', () => {
    const authService = { isLoggedIn: () => true } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/profile' } as any)
    );
    expect(result).toBe(true);
  });

  it('redirects to /login with returnUrl when not logged in', () => {
    const authService = { isLoggedIn: () => false } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/profile' } as any)
    );
    const tree = router.serializeUrl(result as any);
    expect(tree).toBe('/login?returnUrl=%2Fprofile');
  });
});
```

`admin.guard.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

describe('adminGuard', () => {
  it('allows navigation for an admin', () => {
    const authService = { currentUser: () => ({ role: 'admin' }) } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('redirects a non-admin to /home', () => {
    const authService = { currentUser: () => ({ role: 'seller' }) } as Partial<AuthService> as AuthService;
    TestBed.overrideProvider(AuthService, { useValue: authService });
    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(router.serializeUrl(result as any)).toBe('/home');
  });
});
```

- [ ] **Step 2: Run to verify both fail**

```bash
npm test -- auth.guard admin.guard
```

Expected: FAIL — neither guard file exists.

- [ ] **Step 3: Implement `auth.guard.ts`**

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

- [ ] **Step 4: Implement `admin.guard.ts`**

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()?.role === 'admin') {
    return true;
  }
  return router.createUrlTree(['/home']);
};
```

- [ ] **Step 5: Run to verify both pass**

```bash
npm test -- auth.guard admin.guard
```

Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.guard.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/admin.guard.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.guard.spec.ts src/advance-registration/frontend/BAR.App/src/app/core/auth/admin.guard.spec.ts
git commit -m "feat(voranmelde-app): authGuard und adminGuard"
```

---

### Task 13: `jwtInterceptor` inkl. Token-Refresh bei 401

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt.interceptor.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt.interceptor.spec.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`

**Interfaces:**
- Consumes: `TokenStore` (Task 8), `AuthService` (Task 10).
- Produces: `jwtInterceptor: HttpInterceptorFn`, registered via `provideHttpClient(withInterceptors([jwtInterceptor]))` in `app.config.ts` — replaces the plain `provideHttpClient()` call added in Task 4.

- [ ] **Step 1: Write the failing test**

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { jwtInterceptor } from './jwt.interceptor';
import { TokenStore } from './token-store';
import { AuthService } from './auth.service';

describe('jwtInterceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting()
      ]
    });
  });

  it('adds the Authorization header for a non-excluded request', () => {
    TestBed.inject(TokenStore).setToken('token-abc');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/profile').subscribe();
    const req = httpMock.expectOne('/api/profile');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush({});
    httpMock.verify();
  });

  it('does not add the header for /api/auth/* requests', () => {
    TestBed.inject(TokenStore).setToken('token-abc');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.post('/api/auth/refresh', {}).subscribe();
    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    httpMock.verify();
  });

  it('refreshes the token once on 401 and retries the original request', () => {
    TestBed.inject(TokenStore).setToken('expired-token');
    TestBed.inject(TokenStore).setRefreshToken('refresh-abc');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    let result: unknown;
    http.get('/api/profile').subscribe((r) => (result = r));

    const firstReq = httpMock.expectOne('/api/profile');
    firstReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne('/api/auth/refresh');
    refreshReq.flush({ accessToken: 'new-token', refreshToken: 'new-refresh' });

    const retriedReq = httpMock.expectOne('/api/profile');
    expect(retriedReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retriedReq.flush({ ok: true });

    expect(result).toEqual({ ok: true });
    expect(TestBed.inject(TokenStore).getToken()).toBe('new-token');
    expect(TestBed.inject(TokenStore).getRefreshToken()).toBe('new-refresh');
    httpMock.verify();
  });

  it('logs out and navigates to /login when the refresh call itself fails', () => {
    TestBed.inject(TokenStore).setToken('expired-token');
    TestBed.inject(TokenStore).setRefreshToken('bad-refresh');
    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);
    const router = TestBed.inject(Router);
    const navigateByUrlSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    http.get('/api/profile').subscribe({ error: () => {} });
    httpMock.expectOne('/api/profile').flush(null, { status: 401, statusText: 'Unauthorized' });
    httpMock.expectOne('/api/auth/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(TestBed.inject(TokenStore).getToken()).toBeNull();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/login');
    httpMock.verify();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- jwt.interceptor
```

Expected: FAIL — `jwt.interceptor.ts` does not exist.

- [ ] **Step 3: Implement**

```ts
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store';

const EXCLUDED_PREFIXES = ['/health', '/api/auth/', '/api/public/'];

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshInFlight: Observable<string> | null = null;

function isExcluded(url: string): boolean {
  return EXCLUDED_PREFIXES.some((prefix) => url.includes(prefix));
}

function refreshAccessToken(http: HttpClient, tokenStore: TokenStore): Observable<string> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = http
    .post<RefreshResponse>('/api/auth/refresh', { refreshToken: tokenStore.getRefreshToken() })
    .pipe(
      switchMap((response) => {
        tokenStore.setToken(response.accessToken);
        tokenStore.setRefreshToken(response.refreshToken);
        refreshInFlight = null;
        return [response.accessToken];
      }),
      catchError((error: unknown) => {
        refreshInFlight = null;
        return throwError(() => error);
      })
    );
  return refreshInFlight;
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isExcluded(req.url)) {
    return next(req);
  }

  const token = tokenStore.getToken();
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      return refreshAccessToken(http, tokenStore).pipe(
        switchMap((newToken) => next(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }))),
        catchError((refreshError: unknown) => {
          authService.logout();
          router.navigateByUrl('/login');
          return throwError(() => refreshError);
        })
      );
    })
  );
};
```

- [ ] **Step 4: Register the interceptor in `app.config.ts`** (replaces the plain `provideHttpClient()` from Task 4)

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/auth/jwt.interceptor';
// ...

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(withInterceptors([jwtInterceptor])),
    // ...
  ]
};
```

- [ ] **Step 5: Run to verify it passes**

```bash
npm test -- jwt.interceptor
```

Expected: PASS (4 tests).

- [ ] **Step 6: Run the full frontend suite to catch regressions from the `app.config.ts` change**

```bash
npm test
```

Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App
git commit -m "feat(voranmelde-app): jwtInterceptor mit geteiltem Token-Refresh bei 401"
```

---

# PHASE C — App-Shell (Sidebar, Layout, Routing)

### Task 14: Sidebar-Komponente

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar-title.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar-title.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar.scss`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar.spec.ts`

**Interfaces:**
- Consumes: `AuthService.currentUser` (Task 10), `RoleService.activeRole`/`setRole` (Task 11).
- Produces: `NAV_GROUPS: NavGroup[]` (exported const, `interface NavGroup { label: string; roles: Role[]; items: NavItem[] }`, `interface NavItem { label: string; route: string; icon: unknown }`), `Sidebar` component (selector `app-sidebar`, inputs `open: boolean`, output `openChange: boolean`). Consumed by Task 15 (shell layout hosts `<app-sidebar>`).

**Technical note:** implemented against the real PrimeNG 22.1.0 Sidebar compound API (verified via the PrimeNG MCP docs server, not against the possibly-stale story text) — includes `<p-sidebar-spacer />` (reserves the layout gap for the sidebar's width; present in every official PrimeNG Sidebar demo, omitted from VSHELL-S01's ASCII sketch).

- [ ] **Step 1: Write the failing test**

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Sidebar } from './sidebar';
import { AuthService } from '../../auth/auth.service';
import { RoleService } from '../../auth/role.service';

describe('Sidebar', () => {
  function setup(role: 'admin' | 'seller') {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => ({ sub: 'u', role, exp: 0 }) } },
        { provide: RoleService, useValue: { activeRole: () => role, setRole: () => {} } }
      ]
    });
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    return fixture;
  }

  it('renders four groups with ten items for an admin', () => {
    const fixture = setup('admin');
    const items = fixture.debugElement.queryAll(By.css('[data-nav-item]'));
    const groups = fixture.debugElement.queryAll(By.css('[data-nav-group]'));
    expect(groups.length).toBe(4);
    expect(items.length).toBe(10);
  });

  it('renders two groups with four items for a seller', () => {
    const fixture = setup('seller');
    const items = fixture.debugElement.queryAll(By.css('[data-nav-item]'));
    const groups = fixture.debugElement.queryAll(By.css('[data-nav-group]'));
    expect(groups.length).toBe(2);
    expect(items.length).toBe(4);
  });

  it('shows the role toggle only for admin', () => {
    expect(setup('admin').debugElement.query(By.css('[data-role-toggle]'))).toBeTruthy();
    expect(setup('seller').debugElement.query(By.css('[data-role-toggle]'))).toBeFalsy();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- sidebar
```

Expected: FAIL — `sidebar.ts` does not exist.

- [ ] **Step 3: Implement `sidebar-title.ts`/`.html`**

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar-title',
  templateUrl: './sidebar-title.html'
})
export class SidebarTitle {}
```

```html
<span class="sidebar-title">Basar <span class="sidebar-title-accent">Voranmelde</span></span>
```

- [ ] **Step 4: Implement `sidebar.ts`**

```ts
import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { LucideHome, LucideFileText, LucideUsers, LucidePackage, LucideTag, LucideFolder, LucideUserCog, LucideWrench, LucideSettings, LucideUpload, LucideBox, LucideLogOut } from '@lucide/angular';
import { AuthService } from '../../auth/auth.service';
import { RoleService, Role } from '../../auth/role.service';
import { SidebarTitle } from './sidebar-title';

interface NavItem {
  label: string;
  route: string;
}

interface NavGroup {
  label: string;
  roles: Role[];
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Mein Bereich', roles: ['admin', 'seller'], items: [
    { label: 'Home', route: '/home' },
    { label: 'Meine Artikel', route: '/my-articles' }
  ]},
  { label: 'Verwaltung', roles: ['admin'], items: [
    { label: 'Verkäufer', route: '/sellers' },
    { label: 'Artikel', route: '/articles' }
  ]},
  { label: 'Stammdaten', roles: ['admin'], items: [
    { label: 'Marken', route: '/brands' },
    { label: 'Kategorien', route: '/categories' },
    { label: 'Verkäufer-Typen', route: '/seller-types' }
  ]},
  { label: 'System', roles: ['admin'], items: [
    { label: 'Profil', route: '/profile' },
    { label: 'Einstellungen', route: '/settings' },
    { label: 'Export', route: '/export' }
  ]},
  { label: 'Konto', roles: ['seller'], items: [
    { label: 'Profil', route: '/profile' },
    { label: 'Nummernblöcke', route: '/number-blocks' }
  ]}
];

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink, RouterLinkActive, FormsModule,
    AvatarModule, SelectButtonModule, ButtonModule, SidebarModule,
    LucideHome, LucideFileText, LucideUsers, LucidePackage, LucideTag, LucideFolder,
    LucideUserCog, LucideWrench, LucideSettings, LucideUpload, LucideBox, LucideLogOut,
    SidebarTitle
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  protected readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);

  readonly open = input(true);
  readonly openChange = output<boolean>();

  readonly isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
  readonly activeRole = this.roleService.activeRole;

  readonly visibleGroups = computed(() =>
    NAV_GROUPS.filter((group) => group.roles.includes(this.activeRole()))
  );

  readonly initials = computed(() => (this.authService.currentUser()?.sub ?? '?').charAt(0).toUpperCase());

  readonly roleOptions = [
    { label: 'Admin', value: 'admin' as Role },
    { label: 'Verkäufer', value: 'seller' as Role }
  ];

  setRole(role: Role): void {
    this.roleService.setRole(role);
  }

  logout(): void {
    this.authService.logout();
  }
}
```

- [ ] **Step 5: Implement `sidebar.html`**

```html
<p-sidebar-spacer />
<p-sidebar-aside>
  <p-sidebar-panel>
    <p-sidebar-header>
      <app-sidebar-title />
    </p-sidebar-header>
    <p-sidebar-content>
      @for (group of visibleGroups(); track group.label) {
        <p-sidebar-group data-nav-group>
          <p-sidebar-group-label>{{ group.label.toUpperCase() }}</p-sidebar-group-label>
          <p-sidebar-group-content>
            <p-sidebar-menu>
              @for (item of group.items; track item.route) {
                <p-sidebar-menu-item data-nav-item>
                  <button pSidebarMenuButton [routerLink]="item.route" routerLinkActive="active" #rla="routerLinkActive" [isActive]="rla.isActive">
                    <span>{{ item.label }}</span>
                  </button>
                </p-sidebar-menu-item>
              }
            </p-sidebar-menu>
          </p-sidebar-group-content>
        </p-sidebar-group>
        <hr />
      }
    </p-sidebar-content>
    <p-sidebar-footer>
      <p-avatar [label]="initials()" shape="circle" [style]="{ 'background-color': 'var(--p-primary-400)', color: '#ffffff', width: '36px', height: '36px' }" />
      <span class="sidebar-username">{{ authService.currentUser()?.sub }}</span>
      @if (isAdmin()) {
        <p-selectbutton
          data-role-toggle
          [options]="roleOptions"
          optionLabel="label"
          optionValue="value"
          [ngModel]="activeRole()"
          (ngModelChange)="setRole($event)"
          [allowEmpty]="false"
        />
      }
      <button pButton link (click)="logout()">
        <svg lucideLogOut></svg>
        <span>Abmelden</span>
      </button>
    </p-sidebar-footer>
  </p-sidebar-panel>
</p-sidebar-aside>
```

`authService` is declared `protected` (not `private`) in Step 4 precisely so the template's `authService.currentUser()?.sub` binding above compiles.

- [ ] **Step 6: Write `sidebar.scss`**

```scss
:host {
  display: block;
}

.sidebar-username {
  display: block;
  font-size: 13px;
  font-weight: 600;
}

hr {
  border: none;
  border-top: 1px solid var(--color-divider);
  margin: var(--space-2) var(--space-3);
}

hr:last-of-type {
  display: none;
}
```

- [ ] **Step 7: Run to verify it passes**

```bash
npm test -- sidebar
```

Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar
git commit -m "feat(voranmelde-app): rollenabhaengige Sidebar auf PrimeNG-22-Sidebar-Compound"
```

---

### Task 15: Responsive Shell-Layout

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.scss`
- Test: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.spec.ts`

**Interfaces:**
- Consumes: `Sidebar` component (Task 14).
- Produces: `Shell` component (selector `app-shell`) hosting `<router-outlet>` for every non-embed route. Consumed by Task 16 (`app.routes.ts` wraps all shell routes as children of a route whose component is `Shell`).

- [ ] **Step 1: Write the failing test**

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Shell } from './shell';
import { AuthService } from '../auth/auth.service';
import { RoleService } from '../auth/role.service';

describe('Shell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { currentUser: () => ({ sub: 'u', role: 'admin', exp: 0 }) } },
        { provide: RoleService, useValue: { activeRole: () => 'admin', setRole: () => {} } }
      ]
    });
  });

  it('starts with the sidebar open on a desktop-width viewport', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const sidebar = fixture.debugElement.query(By.css('app-sidebar'));
    expect(sidebar).toBeTruthy();
  });

  it('renders a single trigger button in the content header', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const triggers = fixture.debugElement.queryAll(By.css('[data-sidebar-trigger]'));
    expect(triggers.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- shell
```

Expected: FAIL — `shell.ts` does not exist.

- [ ] **Step 3: Implement `shell.ts`**

```ts
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LucideMenu } from '@lucide/angular';
import { Sidebar } from './sidebar/sidebar';

const MOBILE_BREAKPOINT = '(max-width: 1024px)';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ButtonModule, LucideMenu, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell implements OnInit, OnDestroy {
  readonly isMobile = signal(false);
  readonly open = signal(true);

  private mediaQuery?: MediaQueryList;
  private mediaQueryListener?: (event: MediaQueryListEvent) => void;

  ngOnInit(): void {
    this.mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    this.isMobile.set(this.mediaQuery.matches);
    this.open.set(!this.mediaQuery.matches);
    this.mediaQueryListener = (event) => {
      this.isMobile.set(event.matches);
      this.open.set(!event.matches);
    };
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    if (this.mediaQuery && this.mediaQueryListener) {
      this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }

  toggle(): void {
    this.open.set(!this.open());
  }
}
```

- [ ] **Step 4: Implement `shell.html`**

```html
@if (isMobile() && open()) {
  <p-sidebar-backdrop (click)="open.set(false)" />
}
<p-sidebar
  id="app-nav"
  [collapsible]="isMobile() ? 'offcanvas' : 'icon'"
  [overlay]="isMobile()"
  [(open)]="open"
>
  <app-sidebar [open]="open()" />
</p-sidebar>
<p-sidebar-main>
  <header class="content-header">
    <button pButton pSidebarTrigger target="app-nav" severity="secondary" text data-sidebar-trigger (click)="toggle()">
      <svg lucideMenu></svg>
    </button>
  </header>
  <div class="content-body">
    <router-outlet />
  </div>
</p-sidebar-main>
```

- [ ] **Step 5: Implement `shell.scss`**

```scss
:host {
  display: flex;
  min-height: 100vh;
}

.content-header {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  background: var(--color-surface, #e9e9ea);
}

.content-body {
  background: var(--p-surface-50, #f5f5f8);
  padding: 26px 22px;
}

@media (max-width: 768px) {
  .content-body {
    padding: 14px 12px;
  }
}
```

- [ ] **Step 6: Run to verify it passes**

```bash
npm test -- shell
```

Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.scss src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.spec.ts
git commit -m "feat(voranmelde-app): responsives Shell-Layout mit vereinheitlichtem Trigger"
```

---

### Task 16: Routing-Skeleton (15 Routen)

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.routes.ts`
- Create: sixteen feature route files and page components, one pair per feature (`home`, `my-articles`, `sellers`, `articles`, `brands`, `categories`, `seller-types`, `profile`, `settings`, `export`, `number-blocks`, `login`, `register`, `set-password`, `countdown-embed`, `not-found`):
  - `src/advance-registration/frontend/BAR.App/src/app/features/<feature>/<feature>.routes.ts`
  - `src/advance-registration/frontend/BAR.App/src/app/features/<feature>/pages/<Name>Page.ts` (+ `.html`)
- Test: `src/advance-registration/frontend/BAR.App/src/app/app.routes.spec.ts`

**Interfaces:**
- Consumes: `authGuard`, `adminGuard` (Task 12), `Shell` (Task 15).
- Produces: the final `routes: Routes` array — this is the last frontend task and nothing downstream in this plan consumes it further (Epic-level work in later roadmap steps replaces the placeholder pages).

- [ ] **Step 1: Write the failing routing test**

```ts
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';

describe('app.routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: { isLoggedIn: () => false, currentUser: () => null } }
      ]
    });
  });

  it('redirects / to /home which then redirects to /login (not logged in)', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigateByUrl('/');
    expect(location.path()).toContain('/login');
  });

  it('redirects an unknown route to the not-found page content', async () => {
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/does-not-exist');
    expect(router.url).toBe('/does-not-exist');
  });

  it('keeps /embed/countdown outside the guarded shell', async () => {
    const router = TestBed.inject(Router);
    const location = TestBed.inject(Location);
    await router.navigateByUrl('/embed/countdown');
    expect(location.path()).toBe('/embed/countdown');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- app.routes
```

Expected: FAIL — `app.routes.ts` is still the empty `[]` array from before this task.

- [ ] **Step 3: Create the sixteen placeholder pages**

Each page is a one-line standalone component showing only its own name (per spec Boundaries: "Die Platzhalter-Seiten zeigen keinen fachlichen Inhalt, nur ihren Seitennamen"). Example for `home` (repeat the same shape for all sixteen, substituting the class name and label):

`features/home/pages/HomePage.ts`:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  template: `<h1>Home</h1>`
})
export class HomePage {}
```

`features/home/home.routes.ts`:
```ts
import { Routes } from '@angular/router';
import { HomePage } from './pages/HomePage';

export const HOME_ROUTES: Routes = [
  { path: '', component: HomePage }
];
```

Repeat for the other fourteen guarded/public features with these exact class and folder names:

| Feature-Ordner | Seiten-Komponente | Label |
|---|---|---|
| `my-articles` | `MyArticlesPage` | Meine Artikel |
| `sellers` | `SellersPage` | Verkäufer |
| `articles` | `ArticlesPage` | Artikel |
| `brands` | `BrandsPage` | Marken |
| `categories` | `CategoriesPage` | Kategorien |
| `seller-types` | `SellerTypesPage` | Verkäufer-Typen |
| `profile` | `ProfilePage` | Profil |
| `settings` | `SettingsPage` | Einstellungen |
| `export` | `ExportPage` | Export |
| `number-blocks` | `NumberBlocksPage` | Nummernblöcke |
| `login` | `LoginPage` | Login |
| `register` | `RegisterPage` | Registrierung |
| `set-password` | `SetPasswordPage` | Passwort setzen |
| `countdown-embed` | `CountdownEmbedPage` | Countdown |
| `not-found` | `NotFoundPage` | Seite nicht gefunden |

Each `<feature>.routes.ts` follows the exact `HOME_ROUTES` shape above with its own array name (`MY_ARTICLES_ROUTES`, `SELLERS_ROUTES`, …).

- [ ] **Step 4: Assemble `app.routes.ts`**

```ts
import { Routes } from '@angular/router';
import { Shell } from './core/shell/shell';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: 'embed/countdown', loadChildren: () => import('./features/countdown-embed/countdown-embed.routes').then((m) => m.COUNTDOWN_EMBED_ROUTES) },
  { path: 'login', loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
  { path: 'register', loadChildren: () => import('./features/register/register.routes').then((m) => m.REGISTER_ROUTES) },
  { path: 'set-password', loadChildren: () => import('./features/set-password/set-password.routes').then((m) => m.SET_PASSWORD_ROUTES) },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', canActivate: [authGuard], loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
      { path: 'my-articles', canActivate: [authGuard], loadChildren: () => import('./features/my-articles/my-articles.routes').then((m) => m.MY_ARTICLES_ROUTES) },
      { path: 'profile', canActivate: [authGuard], loadChildren: () => import('./features/profile/profile.routes').then((m) => m.PROFILE_ROUTES) },
      { path: 'number-blocks', canActivate: [authGuard], loadChildren: () => import('./features/number-blocks/number-blocks.routes').then((m) => m.NUMBER_BLOCKS_ROUTES) },
      { path: 'sellers', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/sellers/sellers.routes').then((m) => m.SELLERS_ROUTES) },
      { path: 'articles', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/articles/articles.routes').then((m) => m.ARTICLES_ROUTES) },
      { path: 'brands', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/brands/brands.routes').then((m) => m.BRANDS_ROUTES) },
      { path: 'categories', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES) },
      { path: 'seller-types', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/seller-types/seller-types.routes').then((m) => m.SELLER_TYPES_ROUTES) },
      { path: 'settings', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
      { path: 'export', canActivate: [authGuard, adminGuard], loadChildren: () => import('./features/export/export.routes').then((m) => m.EXPORT_ROUTES) },
      { path: '**', loadChildren: () => import('./features/not-found/not-found.routes').then((m) => m.NOT_FOUND_ROUTES) }
    ]
  }
];
```

Note: `/login` redirecting an already-logged-in user to `/home` (VSHELL-S03 AC-7) belongs inside `LoginPage`'s own logic once Epic_Login builds the real login flow — R00's Boundaries explicitly exclude the login form itself, so this plan does not implement that redirect (it would need a real `AuthService.isLoggedIn()` check wired into a route guard on `/login`, which the spec's Scope reserves for Epic_Login).

- [ ] **Step 5: Run to verify it passes**

```bash
npm test -- app.routes
```

Expected: PASS (3 tests).

- [ ] **Step 6: Run the full frontend suite**

```bash
npm test
npm run lint
npm run build
```

Expected: all PASS/succeed.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app
git commit -m "feat(voranmelde-app): Routing-Skeleton mit 15 Routen und Guards"
```

---

### Task 17: Fake-JWT-Abnahme-Anleitung

**Files:**
- Modify: `docs/requirements/advance-registration/roadmap/R00-fundament.md`

**Interfaces:** none (documentation only).

- [ ] **Step 1: Add the two copy-paste console lines to the roadmap's acceptance checklist**

In `## Fertig, wenn — von Hand prüfbar`, insert a new item between the current items 2 and 3 (renumbering the rest), giving the two ready-to-paste browser-console lines the spec's R-13 requires. Payloads use `exp` nine months out so the demo token doesn't expire mid-review:

```markdown
2b. Ohne echten Login vorführen: Browser-Konsole öffnen und eine der beiden Zeilen einfügen —
    Rolle **admin**:
    ```js
    localStorage.setItem('bazaar_token', `${btoa(JSON.stringify({alg:'none',typ:'JWT'}))}.${btoa(JSON.stringify({sub:'demo-admin',role:'admin',exp:Math.floor(Date.now()/1000)+23328000}))}.demo`);
    location.reload();
    ```
    Rolle **seller**:
    ```js
    localStorage.setItem('bazaar_token', `${btoa(JSON.stringify({alg:'none',typ:'JWT'}))}.${btoa(JSON.stringify({sub:'demo-seller',role:'seller',exp:Math.floor(Date.now()/1000)+23328000}))}.demo`);
    location.reload();
    ```
```

- [ ] **Step 2: Update the frontmatter `updated` date**

```yaml
updated: 2026-09-09
```

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/advance-registration/roadmap/R00-fundament.md
git commit -m "docs(voranmelde-app): Fake-JWT-Zeilen in der R00-Abnahme-Anleitung ergaenzt"
```

---

# PHASE D — Backend

### Task 18: EF-Core-Grundgerüst (`BarDbContext`, `InitialCreate`)

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/BarDbContext.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/BAR.Infrastructure.csproj`
- Modify: `src/advance-registration/backend/BAR.Host/BAR.Host.csproj`
- Modify: `src/advance-registration/backend/Directory.Packages.props`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Modify: `src/advance-registration/backend/BAR.Host/appsettings.Development.json`
- Create (generated): `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/*InitialCreate*.cs`

**Interfaces:**
- Produces: `BarDbContext` (public, in `BAR.Infrastructure.Persistence`), `AddInfrastructure(this IServiceCollection, IConfiguration)` extension overload. Consumed by Task 19 (`Program.cs` migration cascade) and Task 20 (`/health/ready`'s `AddDbContextCheck<BarDbContext>()`).

- [ ] **Step 1: Add the two new package references**

`BAR.Infrastructure.csproj` — add inside the existing `<ItemGroup>`:
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" />
<PackageReference Include="Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore" />
```

`Directory.Packages.props` — add the health-check package version next to the existing EF Core entries:
```xml
<PackageVersion Include="Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore" Version="10.0.11" />
```

`BAR.Host.csproj` — add the EF Core design-time tooling package (needed for `dotnet ef`, referenced from the startup project per EF Core convention):
```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" />
```

- [ ] **Step 2: Write `BarDbContext`**

```csharp
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence;

public sealed class BarDbContext(DbContextOptions<BarDbContext> options) : DbContext(options)
{
}
```

- [ ] **Step 3: Extend `AddInfrastructure` with the `IConfiguration` overload**

```csharp
using BAR.Infrastructure.Persistence;
using BAR.Infrastructure.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IClock, SystemClock>();
        return services;
    }

    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<IClock, SystemClock>();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<BarDbContext>(options =>
            options.UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddHealthChecks()
            .AddDbContextCheck<BarDbContext>("database", tags: ["ready"]);

        return services;
    }
}
```

- [ ] **Step 4: Switch `Program.cs` to the new overload**

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

(replaces the existing no-arg `builder.Services.AddInfrastructure();` call).

- [ ] **Step 5: Add the local dev connection string**

`appsettings.Development.json` — add:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=bar;Username=bar;Password=devpassword"
  }
}
```

- [ ] **Step 6: Restore and generate the empty `InitialCreate` migration**

```bash
cd src/advance-registration/backend
dotnet restore
dotnet ef migrations add InitialCreate -p BAR.Infrastructure -s BAR.Host
```

Expected: a new `Persistence/Migrations/` folder appears under `BAR.Infrastructure` with `<timestamp>_InitialCreate.cs`, `<timestamp>_InitialCreate.Designer.cs` and `BarDbContextModelSnapshot.cs` — all three with empty `Up()`/`Down()` bodies (no `DbSet` exists yet, matching the spec's "keine Tabellenänderungen").

- [ ] **Step 7: Verify the migration list**

```bash
dotnet ef migrations list -p BAR.Infrastructure -s BAR.Host
```

Expected: exactly one entry, `InitialCreate`.

- [ ] **Step 8: Build the solution**

```bash
dotnet build
```

Expected: succeeds, no warnings-as-errors from the new references.

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/backend
git commit -m "feat(voranmelde-app): EF-Core-Grundgerued mit BarDbContext und leerer InitialCreate-Migration"
```

---

### Task 19: Migration-Startup mit Retry-Kaskade

**Files:**
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`

**Interfaces:**
- Consumes: `BarDbContext` (Task 18).
- Produces: `WaitForDatabaseAsync`/`ApplyMigrationsAsync` local functions invoked once at startup, before the app starts accepting requests — no downstream task consumes these directly, but Task 28's end-to-end walkthrough exercises this cascade against a real `db` container.

- [ ] **Step 1: Write the retry cascade and migration application in `Program.cs`**

Insert after `var app = builder.Build();` and before `app.MapHealthEndpoints();`:

```csharp
using BAR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;
// ...existing usings...

await ApplyMigrationsAsync(app);

// ...existing app.MapOpenApi()/app.UseCors()/app.MapHealthEndpoints() calls...

app.Run();

static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BarDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (!await WaitForDatabaseAsync(dbContext, logger))
    {
        Environment.Exit(1);
        return;
    }

    try
    {
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        var pending = (await dbContext.Database.GetPendingMigrationsAsync()).FirstOrDefault() ?? "unbekannt";
        logger.LogCritical(ex, "Migration {Migration} fehlgeschlagen: {Message}", pending, ex.Message);
        Environment.Exit(1);
    }
}

static async Task<bool> WaitForDatabaseAsync(BarDbContext dbContext, ILogger logger)
{
    const int maxAttempts = 10;
    var maxTotalWait = TimeSpan.FromSeconds(60);
    var delay = TimeSpan.FromSeconds(1);
    var elapsed = TimeSpan.Zero;

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        if (await dbContext.Database.CanConnectAsync())
        {
            return true;
        }

        if (attempt == maxAttempts || elapsed + delay > maxTotalWait)
        {
            break;
        }

        await Task.Delay(delay);
        elapsed += delay;
        delay = TimeSpan.FromSeconds(Math.Min(delay.TotalSeconds * 2, 15));
    }

    var connectionString = new NpgsqlConnectionStringBuilder(dbContext.Database.GetConnectionString());
    logger.LogCritical(
        "Datenbank nicht erreichbar: Host={Host}, Port={Port}, Database={Database}",
        connectionString.Host, connectionString.Port, connectionString.Database);
    return false;
}
```

The connection-string log line intentionally reads only `Host`/`Port`/`Database` off the parsed `NpgsqlConnectionStringBuilder` — never the raw connection string or its `Password` property — matching spec R-15's "ohne Passwort" requirement.

- [ ] **Step 2: Build**

```bash
cd src/advance-registration/backend
dotnet build
```

Expected: succeeds.

- [ ] **Step 3: Extend `BAR.Host.IntegrationTests` to prove the app still serves through the new startup path**

Modify `tests/BAR.Host.IntegrationTests/Features/Public/HealthEndpointTests.cs` — this file already exercises `WebApplicationFactory<Program>` against `GET /health`; add a Testcontainers-backed PostgreSQL fixture so the factory's `ConnectionStrings__DefaultConnection` points at a real, reachable database (otherwise `ApplyMigrationsAsync` now blocks every integration test for up to 60 seconds before failing). This fixture is also what Task 20's `/health/ready` test needs — implement it once, here:

```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.PostgreSql;
using Xunit;

namespace BAR.Host.IntegrationTests.Features.Public;

public sealed class PostgresWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:18-alpine")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:DefaultConnection", _postgres.GetConnectionString());
    }

    public new async Task DisposeAsync()
    {
        await _postgres.DisposeAsync();
    }
}

public sealed class HealthEndpointTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public HealthEndpointTests(PostgresWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetHealth_Always_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/health");
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }
}
```

- [ ] **Step 4: Run the integration test** (requires a running Docker daemon per VPROJ-S05's Testcontainers prerequisite)

```bash
dotnet test tests/BAR.Host.IntegrationTests
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend
git commit -m "feat(voranmelde-app): Migrations-Startup mit Retry-Kaskade und Testcontainers-Fixture"
```

---

### Task 20: Health/Readiness-Endpoints

**Files:**
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: extend `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Public/HealthEndpointTests.cs`

**Interfaces:**
- Consumes: `PostgresWebApplicationFactory` (Task 19).
- Produces: `GET /health/ready` endpoint (200 with DB reachable, 503 without). No downstream task consumes this beyond Task 28's manual walkthrough.

- [ ] **Step 1: Write the failing test**

Append to `HealthEndpointTests`:
```csharp
[Fact]
public async Task GetHealthReady_WhenDatabaseReachable_ReturnsOk()
{
    var client = _factory.CreateClient();
    var response = await client.GetAsync("/health/ready");
    Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
}
```

- [ ] **Step 2: Run to verify it fails**

```bash
dotnet test tests/BAR.Host.IntegrationTests --filter GetHealthReady_WhenDatabaseReachable_ReturnsOk
```

Expected: FAIL (404 — no `/health/ready` route registered yet).

- [ ] **Step 3: Register the readiness endpoint in `Program.cs`**

```csharp
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

// ...after app.MapHealthEndpoints();...

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var status = report.Status == HealthStatus.Healthy ? "healthy" : "unhealthy";
        await context.Response.WriteAsync($$"""{"status":"{{status}}"}""");
    }
}).AllowAnonymous();
```

- [ ] **Step 4: Run to verify it passes**

```bash
dotnet test tests/BAR.Host.IntegrationTests
```

Expected: PASS (all tests, including the new one).

- [ ] **Step 5: Run the full backend suite including architecture tests**

```bash
cd src/advance-registration/backend
dotnet test
```

Expected: all PASS, including `BAR.Architecture.Tests`.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend
git commit -m "feat(voranmelde-app): GET /health/ready mit Datenbank-Check"
```

---

# PHASE E — Compose & Docker

### Task 21: `compose.yaml` verschieben, `frontend`-Service (Dockerfile + nginx)

**Files:**
- Move: `src/advance-registration/backend/compose.yaml` → `src/advance-registration/compose.yaml`
- Create: `src/advance-registration/frontend/BAR.App/Dockerfile`
- Create: `src/advance-registration/frontend/BAR.App/nginx.conf`

**Interfaces:** none (infrastructure only).

- [ ] **Step 1: Move `compose.yaml` and fix the `api` build context**

```bash
git mv src/advance-registration/backend/compose.yaml src/advance-registration/compose.yaml
```

Edit the moved file so `api.build.context` points at `backend` (relative to the file's new location) and add the `frontend` service:

```yaml
services:

  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: bar
      POSTGRES_USER: bar
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD muss gesetzt sein}
    ports:
      - "5432:5432"
    volumes:
      - bar-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bar -d bar"]
      interval: 5s
      timeout: 3s
      retries: 10

  api:
    image: bar-backend
    build:
      context: backend
      dockerfile: BAR.Host/Dockerfile
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ASPNETCORE_HTTP_PORTS: "8080"
      ConnectionStrings__DefaultConnection: "Host=db;Port=5432;Database=bar;Username=bar;Password=${POSTGRES_PASSWORD}"
    ports:
      - "5001:8080"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    image: bar-frontend
    build:
      context: frontend/BAR.App
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - api

volumes:
  bar-db-data:
```

- [ ] **Step 2: Write `nginx.conf`**

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /health {
        proxy_pass http://api:8080;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 3: Write the frontend `Dockerfile`**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS final
COPY --from=build /app/dist/BAR.App/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 4: Verify the compose stack builds**

```bash
cd src/advance-registration
docker compose config
```

Expected: valid merged config, no errors, all three services listed.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration
git commit -m "feat(voranmelde-app): compose.yaml verschoben, frontend-Service mit nginx ergaenzt"
```

---

### Task 22: `.env.example`

**Files:**
- Create: `src/advance-registration/.env.example`

**Interfaces:** none.

- [ ] **Step 1: Write the file**

```
POSTGRES_PASSWORD=
JWT_SECRET=
JWT_ISSUER=
JWT_AUDIENCE=
CORS_ALLOWED_ORIGIN=
```

- [ ] **Step 2: Confirm `.env` itself stays gitignored**

Check `src/advance-registration/backend/.dockerignore` already excludes `**/.env` (confirmed present) — that only affects the Docker build context, not git. Add a root-level `.gitignore` entry if none currently covers it:

```bash
grep -rn "^\.env$" .gitignore || echo ".env" >> .gitignore
```

- [ ] **Step 3: Commit**

```bash
git add src/advance-registration/.env.example .gitignore
git commit -m "feat(voranmelde-app): .env.example fuer alle Compose-Secrets"
```

---

# PHASE F — Dokumentation (R-20, elf Stellen + R-13-Folgeanpassung bereits in Task 17)

### Task 23: Projektanlage-Epic Doku-Korrekturen (R-20 Punkte 4, 5, 6, 8)

**Files:**
- Modify: `docs/requirements/advance-registration/epics/Epic_Projektanlage/stories/VPROJ-S01-angular-projekt-anlegen.md`
- Modify: `docs/requirements/advance-registration/epics/Epic_Projektanlage/stories/VPROJ-S03-docker-compose-setup.md`
- Modify: `docs/requirements/advance-registration/epics/Epic_Projektanlage/stories/VPROJ-S05-test-und-architektur-setup.md`
- Modify: `docs/requirements/advance-registration/epics/Epic_Projektanlage/epic.md`

**Interfaces:** none (documentation only).

- [ ] **Step 1: VPROJ-S01 — AC-4, remove AC-5/AC-10, add SSR note**

Change AC-4 from `src/assets/i18n/` to:
```markdown
- [ ] **AC-4** — THE SYSTEM SHALL leere Übersetzungs-Dateien `public/i18n/de.json` und `public/i18n/en.json` anlegen.
```

Delete AC-5 and AC-10 entirely (icon-package installation and icon-name verification — both obsolete now that Lucide replaces `@primeicons/angular`). Renumber no further ACs are needed since AC-5/AC-10 simply disappear (AC-6 through AC-9 keep their numbers — the list is not required to be contiguous once entries are struck; leave AC-6..AC-9 as-is to avoid touching unrelated line numbers other tooling may reference).

Add a new line to the **Scope** paragraph's "In Scope" sentence, right after "Feature-First-Verzeichnisstruktur anlegen":
```markdown
kein SSR (Angular-App bleibt reine Browser-App, siehe R00-Restumfang R-1).
```

- [ ] **Step 2: VPROJ-S03 — AC-1, compose location and service name**

```markdown
- [ ] **AC-1** — THE SYSTEM SHALL eine `compose.yaml` unter `src/advance-registration/` bereitstellen, die die Services `frontend`, `api` und `db` definiert; `db` SHALL das Image `postgres:18-alpine` verwenden.
```

- [ ] **Step 3: VPROJ-S05 — AC-1 and the Ziel/Scope sentences, Jest → Vitest**

Ziel-Satz:
```markdown
Ein Entwickler richtet die Testinfrastruktur beider Seiten ein — **Vitest** für das Angular-Frontend, xUnit für das .NET-Backend...
```

AC-1:
```markdown
- [ ] **AC-1** — THE SYSTEM SHALL im Frontend Vitest über den `@angular/build:unit-test`-Builder konfigurieren; `npm test` SHALL die `.spec.ts`-Dateien ausführen (kein Karma, kein Jest).
```

Scope-Satz "In Scope":
```markdown
**In Scope:** Vitest im Frontend, xUnit v3 + Moq im Backend, Testprojekt-Struktur, ...
```

- [ ] **Step 4: Epic_Projektanlage/epic.md — monorepo correction**

Replace the "Hinweis" section's repository sentence:
```markdown
Die Voranmelde-App lebt in diesem Monorepo unter `src/advance-registration/` —
`frontend/` und `backend/` liegen dort nebeneinander (siehe Root-`CLAUDE.md`).
```

- [ ] **Step 5: Commit**

```bash
git add docs/requirements/advance-registration/epics/Epic_Projektanlage
git commit -m "docs(voranmelde-app): VPROJ-S01/S03/S05 und Epic-Hinweis auf R00-Stand nachgezogen"
```

---

### Task 24: Konflikt-Auflösung in `spec.md` und Styleguide (R-20 Punkte 1, 2, 3)

**Files:**
- Modify: `docs/requirements/advance-registration/spec.md`
- Modify: `docs/requirements/advance-registration/design/industry-styleguide.md`

**Interfaces:** none.

- [ ] **Step 1: spec.md §13, row 3 — mark resolved**

```markdown
| 3 | Industry-Styleguide vs. PrimeNG-Grundregel (Lucide-Icons, eigene CSS-Klassen, Blueprint-Eckkreuze) | ✅ Entschieden — Icon-Konflikt zugunsten Lucide (§10.0.4), die übrigen drei Konfliktzeilen in [`design/industry-styleguide.md`](design/industry-styleguide.md) Abschnitt 8 sind keine echten Widersprüche |
```

- [ ] **Step 2: spec.md §10.0.4 — replace the icon paragraph**

Replace the whole "Icons." paragraph (from "**Icons.** Icons kommen aus `@primeicons/angular`..." through the closing "...taugt nicht als Katalog." including its code block) with:

```markdown
**Icons.** Icons kommen aus `@lucide/angular` und werden als eigenständige Angular-Komponenten
eingebunden — ein Import je Icon, als Attribut-Direktive auf einem `<svg>`-Element gesetzt:

```typescript
import { LucideCamera } from '@lucide/angular';
// imports: [LucideCamera] am Component, dann im Template:
// <button pButton iconOnly><svg lucideCamera></svg></button>
```

Stroke-Width 1.5 gilt App-weit über eine einzige zentrale Stelle: `provideLucideConfig({ strokeWidth: 1.5 })`
in `app.config.ts`. `@primeicons/angular` wird nicht installiert.
```

- [ ] **Step 3: spec.md §10.0 tech-stack table — Icons and Tests rows**

```markdown
| **Icons** | `@lucide/angular` (npm-Paket, ein Import je Icon, Stroke-Width 1.5 global via `provideLucideConfig` — siehe Abschnitt 10.0.4) |
| **Tests** | Vitest (Frontend) · xUnit v3 + Moq (Backend) |
```

- [ ] **Step 4: industry-styleguide.md §8 — resolve rows 1–4**

```markdown
| # | Konflikt | Styleguide sagt | App-Spec sagt | Status |
|---|---|---|---|---|
| 1 | Icon-Set | Lucide, Stroke 1.5 | `@lucide/angular`, Einzelimport | ✅ Entschieden — Lucide gewinnt, siehe spec.md §10.0.4 |
| 2 | Komponenten-CSS | Eigene Klassen `.btn`, `.input`, `.card`, `.dialog`, `.table`, `.tag` auf nativem HTML | PrimeNG-Komponenten, kein natives HTML für interaktive Elemente | ✅ Entschieden — PrimeNG-Komponenten setzen das visuelle Bild um, kein natives HTML |
| 3 | Theming-Mechanismus | Freie CSS-Variablen (`--color-*`, `--space-*`) | PrimeNG-Theme mit eigenen Design-Tokens | ✅ Entschieden — beide koexistieren: Farb-/Surface-Tokens über `definePreset` (PrimeNG-Skalen), Spacing/Shadow/Font/Divider als eigene CSS Custom Properties |
| 4 | Blueprint-Eckkreuze | Vier `<i class="corner">`-Kindelemente im Container | kein Mechanismus vorgesehen | ✅ Entschieden — eigene `bar-blueprint`-Komponente in `shared/` |
| 5 | Dunkle Sidebar | nicht vorgesehen | bisher dunkles Teal | ✅ Entschieden — Sidebar hell auf `--color-surface`, siehe Abschnitt 7 |
```

- [ ] **Step 5: Commit**

```bash
git add docs/requirements/advance-registration/spec.md docs/requirements/advance-registration/design/industry-styleguide.md
git commit -m "docs(voranmelde-app): Icon-Konflikt und Styleguide-Konfliktliste aufgeloest"
```

---

### Task 25: VSHELL-S02 und VSHELL-S03 Korrekturen (R-20 Punkte 9, 11)

**Files:**
- Modify: `docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S02-responsives-layout.md`
- Modify: `docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S03-routing-skeleton.md`

**Interfaces:** none.

- [ ] **Step 1: VSHELL-S02 — Content-BG and title-bar background token**

In the "Desktop" ASCII block, replace:
```
│   Content-BG: #f0f4f7, 26/22px │
```
with:
```
│   Content-BG: --color-bg (#f2f2f3), 26/22px │
```

Add a line to the "Tablet/Mobile" ASCII block's Content-Header row noting the title-bar background, or — simpler and consistent with R-10b — add a sentence right after the ASCII block:

```markdown
Die Titelleiste (Content-Header) trägt den Hintergrund `--color-surface` (`#e9e9ea`) — bislang ohne
festgelegten Wert.
```

- [ ] **Step 2: VSHELL-S03 — route table correction**

Change:
```
/all-articles        → authGuard + adminGuard, AllArticlesPage
```
to:
```
/articles             → authGuard + adminGuard, ArticlesPage
```

- [ ] **Step 3: Commit**

```bash
git add docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S02-responsives-layout.md docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S03-routing-skeleton.md
git commit -m "docs(voranmelde-app): VSHELL-S02/S03 auf Industry-Token und /articles nachgezogen"
```

---

### Task 26: VSHELL-S01 Neufassung (R-20 Punkt 10)

**Files:**
- Modify (full rewrite of the color/icon-bearing sections): `docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S01-sidebar-navigation.md`

**Interfaces:** none.

- [ ] **Step 1: Replace every hardcoded Teal/Grün value with its Industry-token equivalent**

Apply these substitutions throughout the file (Ziel, UI-Spezifikation ASCII blocks, style tables, AC-1/AC-2/AC-7):

| Alt | Neu |
|---|---|
| `#1b3a4b` (Sidebar-Hintergrund) | `--color-surface` (`#e9e9ea`) |
| `#0e8a5f` (Akzent/„Voranmelde"-Wort/aktiver Toggle) | `--color-accent` (`#5980a6`) |
| `#3ecf8e` (Avatar) | Accent 400 (`#94bce3`) |
| `#8ab4c4` (Gruppen-Label, muted) | Neutral 500 (`#98989b`) |
| `rgba(255,255,255,0.08)` (Trenner/Toggle-Container auf dunklem Grund) | `var(--color-divider)` auf hellem Grund |

- [ ] **Step 2: Replace the icon row in "PrimeNG-Element-Mapping"**

```markdown
| Icons | `@lucide/angular` — Tree-Shakable-Attribut-Direktiven, ein Import je Icon, gesetzt als `<svg lucideXxx>` (siehe [`spec.md`](../../../spec.md) Abschnitt 10.0.4) |
```

- [ ] **Step 3: Correct "Alle Artikel" → "Artikel" in the ASCII diagrams**

Both the expanded-admin-sidebar ASCII block and the collapsed-icon ASCII block currently show "Alle Artikel" — change to "Artikel", consistent with VSHELL-S03's corrected route.

- [ ] **Step 4: Add a note on the SelectButton binding style used for the Role-Toggle**

Below the "Sidebar-Footer-Maße" table:
```markdown
**Implementierungshinweis Role-Toggle:** `p-selectbutton` erwartet eine Forms-Bindung (kein reiner
`[value]`-Input) — gebunden über `[ngModel]`/`(ngModelChange)` gegen `RoleService.activeRole()`, ohne
umschließendes `<form>`.
```

- [ ] **Step 5: Commit**

```bash
git add docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S01-sidebar-navigation.md
git commit -m "docs(voranmelde-app): VSHELL-S01 auf Industry-Token und Lucide-Icons neu gefasst"
```

---

### Task 27: VSHELL-S05 Neufassung (R-20 Punkt 7)

**Files:**
- Modify (full rewrite): `docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S05-primeng-theme-setup.md`

**Interfaces:** none.

- [ ] **Step 1: Rewrite Ziel/Kontext away from Teal/Grün**

```markdown
## Ziel

PrimeNG 22.1.0 ist mit dem Industry-Theme der Voranmelde-App konfiguriert (`definePreset` auf
Aura-Basis). Globale CSS Custom Properties stellen Spacing, Shadow, Fonts und den Divider-Ton
einheitlich bereit — Farb-/Surface-Tokens laufen über PrimeNGs eigenes Preset-System, nicht über
eigene `--color-*`-Variablen. ngx-translate ist mit DE (Default) und EN initialisiert.

## Kontext

Die Voranmelde-App verwendet das Design System „Industry" (helle Stahlblau-Palette,
`design/industry-styleguide.md`) — anders als die frühere Teal/Grün-Fassung dieser Story. Die
Accent-Farbramp ersetzt PrimeNGs `primary`-Skala, die Neutral-Ramp ersetzt die `surface`-Skala.
```

- [ ] **Step 2: Rewrite the CSS Custom Properties table**

```markdown
**CSS Custom Properties (global in `styles.scss`)** — nur die Werte ohne PrimeNG-Token-Äquivalent:

| Variable | Wert | Verwendung |
|---|---|---|
| `--space-1` … `--space-8` | 3.4px … 27.2px (Dichte 0.85) | Abstände |
| `--shadow-sm` / `-md` / `-lg` | siehe Styleguide §4 | Elevation |
| `--font-heading` | `'Barlow Condensed', sans-serif` | Überschriften |
| `--font-body` | `'Barlow', sans-serif` | Fließtext |
| `--color-divider` | `color-mix(in srgb, #1d1f20 16%, transparent)` | Trennlinien, Blueprint-Rahmen |

Farb- und Flächen-Tokens (Sidebar-/Content-Hintergrund, Akzentfarbe, Avatar) laufen über PrimeNGs
generierte Variablen (`--p-primary-*`, `--p-surface-*`) aus dem `definePreset`-Aufruf, nicht über
eigene `--color-*`-Namen.

**PrimeNG-Preset:** `definePreset(Aura, { semantic: { primary: {...Accent-Ramp...}, colorScheme:
{ light: { surface: {...Neutral-Ramp...} } } } })`.

**ngx-translate:**
- Default-Sprache: DE
- Fallback-Sprache: EN
- Übersetzungs-Dateien: `public/i18n/de.json`, `public/i18n/en.json`
```

- [ ] **Step 3: Rewrite the acceptance criteria**

```markdown
- [ ] **AC-1** — THE SYSTEM SHALL PrimeNG 22.1.0 mit einem via `definePreset(Aura, …)` konfigurierten
      Preset in `providePrimeNG()` initialisieren, das die Accent-Ramp auf `primary` und die
      Neutral-Ramp auf `surface` (Light-Colorscheme) mapped.
- [ ] **AC-2** — THE SYSTEM SHALL die fünf token-losen CSS Custom Properties (`--space-1`…`--space-8`,
      `--shadow-sm/-md/-lg`, `--font-heading`, `--font-body`, `--color-divider`) in `styles.scss`
      auf `:root` definieren.
- [ ] **AC-3** — THE SYSTEM SHALL `provideTranslateService` in `app.config.ts` initialisieren: DE als
      Standardsprache, EN als Fallback, Loader auf `public/i18n/`.
- [ ] **AC-4** — WHEN eine Komponente `translate.instant('key')` aufruft und der Key in `de.json`
      vorhanden ist, THEN SHALL der deutsche Text zurückgegeben werden.
- [ ] **AC-5** — WHEN eine Komponente `translate.instant('key')` aufruft und der Key nicht in
      `de.json`, aber in `en.json` vorhanden ist, THEN SHALL der englische Text zurückgegeben werden.
- [ ] **AC-6** — WHEN eine PrimeNG-Komponente (`p-button`, `p-table`) gerendert wird, THEN SHALL sie
      die Accent-Ramp über die `primary`-Tokens anwenden (Primary-Button in `--color-accent`,
      `#5980a6`).
```

- [ ] **Step 4: Commit**

```bash
git add docs/requirements/advance-registration/epics/Epic_App_Shell/stories/VSHELL-S05-primeng-theme-setup.md
git commit -m "docs(voranmelde-app): VSHELL-S05 auf Industry-Preset und Lucide neu gefasst"
```

---

### Task 28: Abschluss-Verifikation (gesamte Acceptance-Liste)

**Files:** none — this task only runs commands and reports results.

**Interfaces:** none.

- [ ] **Step 1: Frontend and backend automated suites**

```bash
cd src/advance-registration/frontend/BAR.App
npm test
npm run lint
npm run build
cd ../../backend
dotnet test
```

Expected: everything green, including the `BAR.Architecture.Tests` NetArchTest suite.

- [ ] **Step 2: Prove the architecture test actually fails on a forbidden reference**

Temporarily add `using Microsoft.EntityFrameworkCore;` plus a throwaway `DbContext`-typed field to any class in `BAR.Domain`, run `dotnet test tests/BAR.Architecture.Tests`, confirm it fails naming the violating type, then revert the change (spec Acceptance item 8 explicitly requires this negative-path proof, not just a green run).

- [ ] **Step 3: `docker compose up`**

```bash
cd src/advance-registration
cp .env.example .env
# fill in POSTGRES_PASSWORD, JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, CORS_ALLOWED_ORIGIN in .env
docker compose up --build
```

Expected: `db`, `api`, `frontend` all start without errors (Acceptance 1).

- [ ] **Step 4: Browser walkthrough**

Open `http://localhost:4200` — no console errors (Acceptance 2). Open the browser console and paste the **admin** line from Task 17's roadmap update, reload: sidebar shows four groups/ten items, Role-Toggle visible and switches to the seller view (Acceptance 3). Paste the **seller** line, reload: two groups/four items, no Role-Toggle (Acceptance 4). Resize the window to 1024px and 768px: sidebar becomes the burger menu, title bar appears, footer stays pinned, modals are borderless at 768px (Acceptance 5 — no modal exists yet in R00, so this check is limited to sidebar/title-bar behavior).

- [ ] **Step 5: Health and migration checks**

```bash
curl -i http://localhost:5001/health
curl -i http://localhost:5001/health/ready
docker compose stop db
curl -i http://localhost:5001/health/ready
docker compose start db
```

Expected: `/health` always 200; `/health/ready` 200 while `db` runs, 503 while it's stopped (Acceptance 6).

```bash
cd src/advance-registration/backend
dotnet ef migrations list -p BAR.Infrastructure -s BAR.Host
```

Expected: `InitialCreate` only (Acceptance 7).

- [ ] **Step 6: Tear down**

```bash
cd src/advance-registration
docker compose down
```

- [ ] **Step 7: Report results**

Summarize pass/fail for all eight spec Acceptance items in the PR description or hand-off note — no commit for this task (verification only).
