# Round 7 — Responsives Layout & Routing-Skeleton

## Liefert

Das vollständige App-Layout (Desktop/Mobile) und das Routing-Grundgerüst mit
Platzhalter-Seiten für jede Route — die App ist nach diesem Häppchen navigierbar.

## Umfang

- Responsives Zwei-Spalten-Layout: Desktop feste Sidebar (228 px), Mobile
  Burger-Menü/Slide-in, Breakpoint 768 px.
- Titelleiste (Hintergrundfarbe = Sidebar-Farbe), auf Mobile sichtbar, auf Desktop
  keine.
- Routing-Skeleton mit Lazy Loading je Feature für alle Routen laut Navigationsplan
  (`/intake`, `/checkout`, `/settlement`, `/sellers`, `/articles`, `/brands`,
  `/categories`, `/seller-types`, `/statistics`, `/settings`) — jede Route zunächst mit
  einer leeren Platzhalter-Komponente.
- `Home` leitet automatisch auf `/intake` weiter.
- Funktionale Guards `authGuard`/`adminGuard` als Grundgerüst — Prüflogik greift auf die
  Auth-Infrastruktur zu, die in einem eigenen Häppchen entsteht; hier zunächst die
  Route-Verdrahtung.
- Basis-Druckregel (`@media print`, blendet nur die Chrome — Sidebar/Titelleiste — aus;
  fachlicher Druckinhalt ist ein eigenes Epic).
- `/login` als eigene Route außerhalb der AppShell (ohne Sidebar, ohne Titelleiste).

## Nicht enthalten

- Auth-Infrastruktur selbst (Token, Interceptor, Rollen) — eigenes Häppchen, folgt direkt
  danach.
- Theme-Farben — eigenes Häppchen.
- Fachlicher Seiteninhalt jeder Route.

## Referenzen

- [Epic_App_Shell](../../requirements/bazaar-app/epics/Epic_App_Shell/epic.md) (Stories BSHELL-S02, BSHELL-S03)
- [spec.md §4](../../requirements/bazaar-app/spec.md) (Navigation & Rechte)
- [spec.md §7.1](../../requirements/bazaar-app/spec.md) (Responsive Design)

## Voraussetzung

Setzt voraus, dass die Sidebar-Navigation bereits existiert.
