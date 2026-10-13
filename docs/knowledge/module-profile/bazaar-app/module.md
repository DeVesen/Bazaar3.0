# bazaar-app (Frontend)

**Kind:** spa (kein Standard-Kind passt: läuft nicht als eigener Prozess/Deployable, ist keine Library, kein On-Demand-Executable — ein im Browser ausgeführtes Bundle, das ein Backend über HTTP anspricht)
**Artifact:** `angular.json` → `projects.bazaar-app` (`projectType: application`) → `ng build` erzeugt Browser-Bundle nach `dist/bazaar-app`
**Purpose:** Operativer Basar-Betrieb für Basar-Mitarbeiter/-Admins — Verkäufer-Intake, Checkout, Abrechnung, Stammdatenverwaltung, Statistik, Einstellungen. Das Bedien-Frontend der Haupt-App (CLAUDE.md: Bazaar Suite).
**Identity:** Angular-22-Standalone-SPA, einziges Frontend-Projekt in diesem Workspace (`angular.json` hat nur einen Eintrag: `bazaar-app`), Feature-First-Struktur wie in CLAUDE.md vorgegeben.
**Maturity:** sketch (opportunistischer Durchlauf — Routing, Ordnerstruktur, package.json gelesen; nicht jede Komponente einzeln gewalkt)
**Last updated:** 2026-10-13

## Responsibilities
- Gesamtes Bedien-UI der Haupt-App: Setup-Wizard, Login, Intake, Checkout, Settlement, Sellers, Articles, Brands, Categories, Seller-Types, Statistics, Settings (inkl. User-Management, Import, Dev-Tools)
- Auth-State, Routing-Guards (`core/auth/`, `core/bootstrap/`), App-Shell (`core/shell/`), Theming (`core/theme/`), Print-Support (`core/print/`)
- Nicht zuständig: Geschäftslogik/Validierung, die serverseitig entschieden werden muss (Backend ist alleinige Quelle der Wahrheit) — Frontend spiegelt nur

## Consumed By
- Niemand im Sinne von Code-Referenzen — Endpunkt ist der Browser der Basar-Mitarbeiter, kein anderes System bindet dieses Bundle ein

## Public Surface
- Es gibt keine exportierte API — Konsumenten sind Menschen über den Browser. Die einzige "Schnittstelle" ist die Routen-Tabelle (`app.routes.ts`): `/setup`, `/login`, `/intake`, `/checkout`, `/settlement`, `/sellers`, `/articles`, `/brands`, `/categories`, `/seller-types`, `/statistics`, `/settings`, `/change-password`

## Talks To
- `Bazaar.Api` (Backend) — über `/api/*` per HTTP; im Dev-Server per `proxy.conf.json` auf `https://localhost:7006` geproxied, im Insel-Betrieb (`docker-compose.local.yml`, Service `frontend`) leitet ein Nginx-Container auf Port 80/443 `/api/` und `/health` an `http://backend:5000` weiter und liefert die SPA mit Fallback auf `index.html` (`nginx/nginx.conf.template`, per Volume als `/etc/nginx/templates/default.conf.template` gemountet)

## Structure
- `src/app/core/` — `auth/` (Guards: `auth.guard`, `admin.guard`, `guest.guard`, `password-change.guard`), `bootstrap/` (`no-admin.guard`, `admin-exists.guard` — Setup-Wizard-Routing), `shell/` (App-Rahmen), `theme/`, `print/`
- `src/app/features/<name>/` — je Feature: `pages/`, `components/`, `data/` (API-Clients), eigene `<name>.routes.ts`; 13 Features: articles, brands, categories, change-password, checkout, intake, login, seller-types, sellers, settings, settlement, setup, statistics (+ `not-found` als Fallback-Route)
- `src/app/shared/components/` — cross-feature UI-Bausteine (z. B. `barcode-scanner`)
  - `input/` (`app-input`) — eigenständiges Text-Input nach dem PrimeNG-`p-iftalabel`-Muster (`input.ts`); `addonLeft`/`addonRight` mit `addonClick(key)`, entprelltes `valueChange` (`debounceMs`, Default 800 ms, `0` = sofort), Outputs `enter`/`keyUp`/`keyDown`/`blurred`. Konsumenten: `features/intake/components/intake-article-entry/`, `features/intake/components/intake-renumber-lookup-popup/`, `features/checkout/pages/checkout-page/`, `shared/components/payment-panel/`
  - `input-group/` (`app-input-group`) — zusätzlich `addonActionButtons`, `extraModeButton` (`{icon, badge}`, optionaler dritter Mode-Button mit Badge) + Output `extraModeClicked`, Methode `focusAndSelect()` (`input-group.ts`, seit `94734ed`)
  - `numpad/` — zeigt immer alle Tasten, `showDecimal`/`showEnter` entfernt (`3238a31`); Grid-Platzierung über `class` am `p-button`-Host statt `styleClass` (`9c786a2`)
  - `autocomplete-create/` — Plus-Button als `p-inputgroup-addon` innerhalb `p-inputgroup`, `showClear` aktiv (`autocomplete-create.html`, `24965ca`)
- Cross-Feature-Imports werden laut CLAUDE.md per `eslint-plugin-boundaries` erzwungen (in `package.json` devDependency vorhanden, Regeln selbst nicht gelesen)

## Notes
- Angular 22.1 (signal-basiert, Standalone Components, `@angular/build` esbuild-Pipeline), PrimeNG 22.1.1 als einzige UI-Bibliothek (CLAUDE.md-Vorgabe, kein natives HTML)
- Testrunner: Vitest über `@angular/build:unit-test` (nicht Karma) — `ng test` ruft intern Vitest auf
- `proxy.conf.json` fest auf Port 7006 (Backend-Dev-Port) verdrahtet — nicht per Env konfigurierbar
- `primeicons.css` steht seit `67cbe11` in `angular.json` → `styles` — vorher wurden die Icons nie geladen (alle `pi pi-*`-Klassen unsichtbar)
- Deployment im Insel-Betrieb: `docker-compose.local.yml` baut `frontend` aus `src/bazaar-app/frontend/Dockerfile` (Nginx-Image) und `backend` aus `src/bazaar-app/backend`; die Nginx-Konfig kommt als Template vom Repo-Root (`nginx/nginx.conf.template`, envsubst für `LOCAL_HOSTNAME`), TLS-Zertifikate aus `nginx/certs`
- `nginx/nginx.conf.template` setzt in `location /api/` `client_max_body_size 2100k` sowie `proxy_read_timeout` und `proxy_send_timeout` von je 180 s; größere oder längere Requests brechen dort ab, bevor das Backend antwortet
- Das Frontend hat keinen globalen HTTP-Timeout: `app.config.ts` registriert nur `jwtInterceptor` (`provideHttpClient(withInterceptors([jwtInterceptor]))`); lediglich `ArticleImportApi` setzt eigene 180 s (`IMPORT_TIMEOUT_MS`)
