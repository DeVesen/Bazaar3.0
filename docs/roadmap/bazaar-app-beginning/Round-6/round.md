# Round 6 — Sidebar & Navigation

## Liefert

Die Sidebar-Navigation mit den drei Gruppen (Tagesgeschäft, Stammdaten, System) — noch
ohne echte Seiteninhalte dahinter, aber mit klickbaren Menüpunkten.

## Umfang

- Sidebar-Komponente mit den Gruppen und Einträgen laut Navigationsstruktur
  (Artikelannahme, Verkauf, Abrechnung / Verkäufer, Artikel, Marken, Kategorien,
  Verkäufer-Typen / Statistik, Einstellungen) inkl. Trennlinien.
- Sidebar-Footer (Avatar, Benutzername, Rolle, Abmelden) — Anzeige-Platzhalter, echte
  Auth-Daten kommen erst mit der Auth-Infrastruktur.
- Rollenabhängige Sichtbarkeit: Kassenpersonal sieht „Einstellungen“ nicht (Sidebar
  bekommt die Rolle als Input, kein eigener Toggle wie in der Voranmelde-App).
- Sidebar-Labels deutsch, dahinterliegende Routen-Pfade bereits englisch angelegt.
- Sidebar und Sidebar-Footer als geteilte, App-übergreifende Komponenten in
  `docs/components/` verankert (bleiben „dumm“ — Labels/Items als Input, keine eigene
  Übersetzungslogik).

## Nicht enthalten

- Responsives Verhalten (Burger-Menü, Breakpoints) — eigenes Häppchen.
- Routing-Verdrahtung auf echte Seiten, Guards — eigenes Häppchen.
- Echte Rollen-/Auth-Daten — eigenes Häppchen.

## Referenzen

- [Epic_App_Shell](../../requirements/bazaar-app/epics/Epic_App_Shell/epic.md) (Story BSHELL-S01)
- [spec.md §4](../../requirements/bazaar-app/spec.md) (Navigation & Rechte)

## Voraussetzung

Setzt voraus, dass das Angular-Projekt-Grundgerüst bereits existiert.
