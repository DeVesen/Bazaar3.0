# BAR.App

**Kind:** spa <!-- kein Standard-Kind trifft: läuft nicht als eigener Prozess (kein service), ist aber auch keine library/executable im klassischen Sinn — Browser-Bundle -->
**Artifact:** `BAR.App` in `src/advance-registration/frontend/BAR.App/angular.json` → `projects` → Angular-Browser-Bundle (per `ng build`)
**Purpose:** Das gesamte Angular-Frontend der Voranmelde-App — ein Angular-Workspace-Projekt nach der Feature-First-Struktur mit Abteilungs-Gruppierung (`features/<abteilung>/<feature>/` + `core/` + `shared/`).
**Identity:** Ein Build-Artefakt nach der Regel "ein `angular.json`-Projekt = ein Modul" — die 10 Unterordner unter `features/` sind **keine** eigenen Module, sondern Feature-Profil-Kandidaten innerhalb dieses einen Moduls.
**Maturity:** sketch
**Last updated:** 2026-09-15

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

## Notes
- Maturity `sketch`: nur Verzeichnisstruktur gelistet, kein Signature-Level-Walk durch Components/Services/Routing durchgeführt. Für `reviewed` fehlt noch ein echter Review-Mode-Durchgang (Routing-Tabelle, Guards, HTTP-Interceptors, State-Management).
- Die 10 Feature-Ordner werden separat als Feature-Profile erfasst (siehe `docs/knowledge/feature-profile/`), nicht hier als Unterstruktur dieses Moduls im Detail wiederholt.
- Dev-Server-Proxy (`proxy.conf.json`): `/api` und `/health` → `http://localhost:5001` (muss mit `BAR.Host`s `launchSettings.json`-Port übereinstimmen, siehe `bar-host` Modul-Profil — Mismatch verursacht 502 Bad Gateway auf jedem Backend-Call).
