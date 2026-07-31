---
code: BSHELL
status: draft
updated: 2026-07-31
---

# Epic: App Shell — Haupt-App

## Zweck

Grundgerüst der Angular-App: Sidebar-Navigation, responsives Zwei-Spalten-Layout (Desktop/Mobile), Angular-Routing-Skeleton und PrimeNG-Theme-Setup. Nach Abschluss dieses Features navigiert die App zwischen Platzhalter-Seiten und passt ihr Layout korrekt an den Breakpoint an.

## Rollen

- **Admin** — navigiert zwischen Bereichen über die Sidebar.
- **Kassenpersonal** — navigiert zwischen Tagesgeschäft-Seiten über die Sidebar.

## Bereiche

- Sidebar mit Navigationsgruppen (Tagesgeschäft, Stammdaten, System)
- Responsives Layout: Desktop-Sidebar (fest, 228 px) / Mobile-Topbar + Burger-Menü
- Angular Routing Skeleton (Lazy Loading je Feature)
- PrimeNG 20 Theme & globale CSS Custom Properties
- Druck-Layout (Sidebar/Chrome ausgeblendet)

## Abhängigkeit

Setzt `Epic_Projektanlage` (BPROJ) voraus — das Angular-Projekt muss existieren.

## Stories

- [BSHELL-S01 — Sidebar & Navigation](stories/BSHELL-S01-sidebar-navigation.md)
- [BSHELL-S02 — Responsives Layout](stories/BSHELL-S02-responsives-layout.md)
- [BSHELL-S03 — Angular Routing Skeleton](stories/BSHELL-S03-routing-skeleton.md)
- [BSHELL-S04 — PrimeNG Theme & Global Styles](stories/BSHELL-S04-primeng-theme-setup.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #setup #app-shell #sidebar #layout #routing #primeng #responsive
