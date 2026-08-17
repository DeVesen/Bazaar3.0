---
code: BSHELL
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: App Shell — Haupt-App

## Zweck

Grundgerüst der Angular-App: Sidebar-Navigation, responsives Zwei-Spalten-Layout (Desktop/Mobile), Angular-Routing-Skeleton und PrimeNG-Theme-Setup. Nach Abschluss dieses Epics navigiert die App zwischen Platzhalter-Seiten und passt ihr Layout korrekt an den Breakpoint an.

## Rollen

- **Admin** — sieht die vollständige Sidebar inklusive Einstellungen.
- **Kassenpersonal** — sieht die Sidebar ohne Einstellungen.

Component-Details → [`topbar`](../../components/topbar.md) · [`sidebar`](../../../../components/sidebar/component.md) · [`sidebar-footer`](../../../../components/sidebar-footer/component.md)

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

## Entscheidungen aus dem Review

| Thema | Entscheidung |
|---|---|
| Routen-Pfade | **englisch** (`/intake`, `/checkout`, `/settlement`, `/sellers`, …) gemäß Sprachregel; Menü-Labels deutsch im Sidebar-Template |
| Sidebar-Footer | bestehende Komponente **C-009 auf beide Apps erweitern**, Role-Toggle wird optional und bleibt der Voranmelde-App vorbehalten |
| Sidebar-Komponente | gehört **suite-weit** nach `docs/components/sidebar/`; app-spezifisch bleiben nur Farben und Einträge (Verschieben → `element-extraction`) |
| i18n | Sidebar bleibt **dumm** und erhält Labels als Input — die Haupt-App hat keine Übersetzungsschicht |
| Farben | ACs referenzieren **CSS-Tokens**; Hex-Werte stehen nur in BSHELL-S04 und [`spec.md`](../../spec.md) Abschnitt 10.1 |
| Drucken | Shell liefert nur die `@media print`-**Basisregel**; fachliche Druckansichten gehören zu [Epic_Druckfunktionen](../Epic_Druckfunktionen/epic.md). **Keine Route, kein Sidebar-Eintrag** |
| Badge | „offen" = angenommen, aber nicht freigegeben; Laden bei Routenwechsel und nach Änderung, **kein Polling** |
| Token-Ablauf | `AuthService` prüft `exp` beim App-Start; Interceptor ist die zweite Verteidigungslinie |

## Stories

- [BSHELL-S01 — Sidebar & Navigation](stories/BSHELL-S01-sidebar-navigation.md)
- [BSHELL-S02 — Responsives Layout](stories/BSHELL-S02-responsives-layout.md)
- [BSHELL-S03 — Angular Routing Skeleton](stories/BSHELL-S03-routing-skeleton.md)
- [BSHELL-S04 — PrimeNG Theme & Global Styles](stories/BSHELL-S04-primeng-theme-setup.md)
- [BSHELL-S05 — Auth-Infrastruktur (`core/auth/`)](stories/BSHELL-S05-auth-infrastruktur.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #setup #app-shell #sidebar #layout #routing #primeng #responsive #auth #guards
