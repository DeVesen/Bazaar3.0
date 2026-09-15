# BAR.App

**Kind:** spa <!-- kein Standard-Kind trifft: läuft nicht als eigener Prozess (kein service), ist aber auch keine library/executable im klassischen Sinn — Browser-Bundle -->
**Artifact:** `BAR.App` in `src/advance-registration/frontend/BAR.App/angular.json` → `projects` → Angular-Browser-Bundle (per `ng build`)
**Purpose:** Das gesamte Angular-Frontend der Voranmelde-App — ein Angular-Workspace-Projekt nach der Feature-First-Struktur mit Abteilungs-Gruppierung (`features/<abteilung>/<feature>/` + `core/` + `shared/`).
**Identity:** Ein Build-Artefakt nach der Regel "ein `angular.json`-Projekt = ein Modul" — die 10 Unterordner unter `features/` sind **keine** eigenen Module, sondern Feature-Profil-Kandidaten innerhalb dieses einen Moduls.
**Maturity:** sketch
**Last updated:** 2026-09-15

**Container-Image:** wird per `.github/workflows/advance-registration-docker.yml` gebaut (Nginx-Image, siehe `Dockerfile`) und als `devesen/bazaar-advance-registration-frontend` auf Docker Hub veröffentlicht (Trigger: Push auf `master` mit Änderung in `src/advance-registration/**`, oder manuell).

## Responsibilities
- Gesamtes UI der Voranmelde-App: Login, Home, Master-Data-Verwaltung (Brands/Categories/SellerTypes), Registration (Articles/Number-Blocks/My-Articles), Seller-Management (Profile/Register/Sellers/Set-Password), Export, Countdown-Embed, Operations/Settings
- `core/`: `auth/`, `public-info/`, `shell/` (inkl. `page-layout/`, `sidebar/`), `theme/`

## Consumed By
- Endanwender über Browser — kein Code-Konsument innerhalb der Solution (Frontend ist Blatt im Abhängigkeitsgraphen)

## Public Surface
HTTP-Client-Aufrufe gegen `BAR.Host`s Endpoints — kein eigener Vertrag, den andere Einheiten konsumieren.

## Talks To
- `BAR.Host` (REST, per Angular `HttpClient`)

## Structure
`src/app/features/<feature>/`, `src/app/core/{auth,public-info,shell,theme}/`, `public/i18n/{de,en}.json` (Übersetzungen).

## Layout & Routing
Kein `MainLayout` im Code — zwei Layouts:
- `PageLayout` (`core/shell/page-layout/`) — Titelleiste + `router-outlet`, für alle authentifizierten Routen außer `/home`.
- `LoginLayout` (`features/login/components/login-layout.ts`) — nur für `/login`.

Routing (`app.routes.ts`): `/home` läuft direkt unter `Shell` (`HomePage`, kein `PageLayout`). Alle anderen geschützten Routen (`my-articles`, `profile`, `number-blocks`, `sellers`, `articles`, `brands`, `categories`, `seller-types`, `settings`, `export`) laufen `Shell` → `PageLayout`.

Height-Capping-Konvention (Flexbox, kein `calc()`/vh-Zahlen): `Shell` `:host` fix `height:100vh; overflow:hidden`; `.content-body` Flex-Column mit `overflow-y:auto` als Fallback für Routen ohne `PageLayout` (z. B. `/home`). `PageLayout` selbst Flex-Column `height:100%`; Titelleiste `flex-shrink:0` bleibt fix; `.page-content` `flex:1; min-height:0; overflow-y:auto` scrollt intern — Gesamthöhe wächst nie über den Viewport hinaus.

## Notes
- Maturity `sketch`: nur Verzeichnisstruktur gelistet, kein vollständiger Signature-Level-Walk durch Components/Services/Routing durchgeführt. Für `reviewed` fehlt noch ein echter Review-Mode-Durchgang (Guards, HTTP-Interceptors, State-Management) — Routing/Layout-Grundstruktur ist oben bereits erfasst.
- Die 10 Feature-Ordner werden separat als Feature-Profile erfasst (siehe `docs/knowledge/feature-profile/`), nicht hier als Unterstruktur dieses Moduls im Detail wiederholt.
- Dev-Server-Proxy (`proxy.conf.json`): `/api` und `/health` → `http://localhost:5001` (muss mit `BAR.Host`s `launchSettings.json`-Port übereinstimmen, siehe `bar-host` Modul-Profil — Mismatch verursacht 502 Bad Gateway auf jedem Backend-Call).
- Frontend-Nginx-Image setzte bis `1e0b606` keinen `Cache-Control`-Header für `index.html` — ein Browser, der die Origin schon vor einem Redeploy besucht hatte, konnte eine alte `index.html` mit Verweisen auf nicht mehr existierende Bundle-Dateien weiter ausliefern (stiller Stillstand auf altem Code, kein sichtbarer Fehler). Fix in `nginx.conf`: eigener `location = /index.html`-Block mit `Cache-Control: no-cache`.
