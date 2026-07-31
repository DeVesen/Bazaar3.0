---
code: VSHELL
status: draft
updated: 2026-07-31
---

# Feature: App Shell — Voranmelde-App

## Zweck

Grundgerüst der Angular-App: Sidebar-Navigation (rollenabhängig), responsives Layout (Desktop/Tablet/Mobile), Angular-Routing-Skeleton mit Auth- und Role-Guards, JWT-Auth-Infrastruktur und PrimeNG-Theme-Setup. Nach Abschluss navigiert die App rollengerecht und schützt Admin-Routen vor unberechtigtem Zugriff.

## Rollen

- **Admin** — sieht vollständige Admin-Sidebar, kann zwischen Admin- und Verkäufer-Ansicht wechseln.
- **Verkäufer** — sieht eingeschränkte Sidebar (Mein Bereich + Konto).

## Bereiche

- Sidebar mit rollenabhängigen Navigationsgruppen + Sidebar-Footer (Avatar, Role-Toggle, Logout)
- Responsives Layout: Desktop (>1024 px) / Tablet (≤1024 px) / Mobile (≤768 px)
- Angular Routing Skeleton (Lazy Loading je Feature, AuthGuard, AdminGuard)
- JWT-Auth-Infrastruktur (AuthService, JWT-Interceptor, RoleService, Role-Toggle)
- PrimeNG 20 Theme & globale CSS Custom Properties
- ngx-translate initialisieren (DE Default, EN Fallback)

## Abhängigkeit

Setzt `Feature_Projektanlage` (VPROJ) voraus — das Angular-Projekt muss existieren.

`Feature_Login` (Seite) hängt von dieser Shell ab — die Guards und der AuthService müssen zuerst existieren.

## Stories

- [VSHELL-S01 — Sidebar & Navigation](stories/VSHELL-S01-sidebar-navigation.md)
- [VSHELL-S02 — Responsives Layout](stories/VSHELL-S02-responsives-layout.md)
- [VSHELL-S03 — Angular Routing Skeleton](stories/VSHELL-S03-routing-skeleton.md)
- [VSHELL-S04 — Auth-Infrastruktur](stories/VSHELL-S04-auth-infrastruktur.md)
- [VSHELL-S05 — PrimeNG Theme & Global Styles](stories/VSHELL-S05-primeng-theme-setup.md)

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #setup #app-shell #sidebar #layout #routing #auth #jwt #role-toggle #primeng #responsive
