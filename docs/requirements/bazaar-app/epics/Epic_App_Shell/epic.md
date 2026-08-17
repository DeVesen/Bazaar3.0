---
code: BSHELL
status: draft
updated: 2026-08-17
---

# Epic: App Shell — Haupt-App

## Zweck

Grundgerüst der Angular-App: Sidebar-Navigation, responsives Zwei-Spalten-Layout (Desktop/Mobile), Angular-Routing-Skeleton und PrimeNG-Theme-Setup. Nach Abschluss dieses Epics navigiert die App zwischen Platzhalter-Seiten und passt ihr Layout korrekt an den Breakpoint an.

## Rollen

- **Admin** — sieht die vollständige Sidebar inklusive Einstellungen.
- **Kassenpersonal** — sieht die Sidebar ohne Einstellungen.

## Bereiche

- Sidebar mit Navigationsgruppen (Tagesgeschäft, Stammdaten, System), **rollenabhängig** — ohne Role-Toggle
- Responsives Layout: Desktop-Sidebar (fest, 228 px) / Mobile-Topbar + Burger-Menü
- Angular Routing Skeleton (Lazy Loading je Feature, funktionale `authGuard`/`adminGuard`)
- JWT-Auth-Infrastruktur in `core/auth/` (`TokenStore`, `JwtDecoder`, `AuthService` mit Signals, funktionaler `jwtInterceptor` **ohne** Refresh-Logik, `RoleService`)
- PrimeNG 22 Theme & globale CSS Custom Properties
- Druck-Layout (Sidebar/Chrome ausgeblendet)

## Abhängigkeit

Setzt `Epic_Projektanlage` (BPROJ) voraus — das Angular-Projekt muss existieren.

[Epic_Login](../Epic_Login/epic.md) (Seite) hängt von dieser Shell ab — Guards und `AuthService` müssen zuerst existieren.

> **Offen für das Review dieses Epics:** Für die Auth-Infrastruktur fehlt noch eine eigene
> Story (die Voranmelde-App hat dafür VSHELL-S04). Rollenabhängige Sidebar und Guards sind
> in den bestehenden Stories BSHELL-S01 und BSHELL-S03 noch nicht beschrieben.

## Stories

- [BSHELL-S01 — Sidebar & Navigation](stories/BSHELL-S01-sidebar-navigation.md)
- [BSHELL-S02 — Responsives Layout](stories/BSHELL-S02-responsives-layout.md)
- [BSHELL-S03 — Angular Routing Skeleton](stories/BSHELL-S03-routing-skeleton.md)
- [BSHELL-S04 — PrimeNG Theme & Global Styles](stories/BSHELL-S04-primeng-theme-setup.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #setup #app-shell #sidebar #layout #routing #primeng #responsive
