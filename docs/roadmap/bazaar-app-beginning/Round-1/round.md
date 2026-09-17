# Round 1 — Angular-Projekt anlegen

## Liefert

Das lauffähige Angular-Frontend-Grundgerüst der Haupt-App: Projekt-Setup, Ordnerstruktur,
Tooling — noch ohne Fachlichkeit, ohne Seiteninhalte.

## Umfang

- Angular-22-Projekt unter `src/bazaar-app/frontend/` (Standalone Components, Signals, OnPush).
- Feature-First-Ordnerstruktur (`features/`, `core/`, `shared/`) inkl. Path-Aliases
  `@core/*`, `@shared/*`, `@features/*`.
- ESLint-Konfiguration mit `no-restricted-imports` zur Durchsetzung der
  Cross-Feature-Import-Grenze (`shared/`/`core/` importieren nie aus `features/`).
- PrimeNG 22.0.0 als Abhängigkeit eingebunden (noch ohne Theme-Ausprägung — reine
  Paket-Installation).
- Fonts lokal via `@fontsource/*` (Barlow, Barlow Condensed), Icons via
  `@primeicons/angular` als npm-Paket — beides ohne CDN-Zugriff (Offline-Pflicht).
- `ng build --configuration production` läuft vollständig lokal ohne externe Ressourcen.

## Nicht enthalten

- Sidebar, Routing, Auth — das ist App-Shell-Sache.
- Theme-Farben/CSS-Tokens — nur die Bibliothek ist eingebunden, nicht ausgeprägt.
- Fachliche Seiten jeder Art.

## Referenzen

- [Epic_Projektanlage](../../requirements/bazaar-app/epics/Epic_Projektanlage/epic.md) (Story BPROJ-S01)
- [spec.md §7.0](../../requirements/bazaar-app/spec.md) (Tech-Stack)
- [spec.md §7.2](../../requirements/bazaar-app/spec.md) (Offline-Fähigkeit)

## Voraussetzung

Keine — Startpunkt der gesamten Umsetzung.
