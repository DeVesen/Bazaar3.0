# Page (Seitenrahmen)

**Bibliothek:** Angular-Layout-Komponente ohne PrimeNG-Widget (reines Layout)
**Verwendung:** Bazaar Haupt-App — jede Hauptseite (Artikelannahme, Verkauf, Abrechnung,
Verkäufer, Artikel, Marken, Kategorien, Verkäufer-Typen, Statistik, Einstellungen)

## Überblick

`app-page` rahmt eine Hauptseite ein: oben der Page-Header (Titel links, optionale Actions
rechts), darunter der Seiteninhalt. Der Titel ist ein fester Text und entspricht dem Menüeintrag.

## Verhalten

| Fensterbreite | Verhalten |
|---|---|
| ≤ 768 px | Header und Inhalt nutzen die volle Breite |
| ≥ 769 px | Header und Inhalt höchstens 75 % der **Fensterbreite**, horizontal zentriert |

- Header-Format: siehe [Page-Header-Format](../overview.md#page-header-format).
- Breite Inhalte (Tabellen) scrollen in sich waagerecht, die Seite selbst nie.
- `fill`: ab 769 px ist die Seite genau fensterhoch (Fensterhöhe − 52 px Shell-Padding); der
  Inhalt bekommt die Resthöhe als Flex-Spalte. Einsatz: Verkäufer-Kachelliste mit eigenem
  Scrollbereich.

## Parameter

| Parameter | Typ | Default | Bedeutung |
|---|---|---|---|
| `title` | `string` | — (Pflicht) | Seitentitel |
| `fill` | `boolean` | `false` | Seite fensterhoch, Inhalt füllt die Resthöhe |

| Slot | Inhalt |
|---|---|
| `[pageActions]` | Buttons rechts im Header (z. B. „+ Neu" bei Marken/Kategorien/Verkäufer-Typen) |
| Default | Seiteninhalt |

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Titel als Überschrift im Page-Header-Format anzeigen.
2. **AC-2** — WHILE die Fensterbreite größer als 768 px ist, SHALL das System Header und Inhalt auf höchstens 75vw begrenzen und horizontal zentrieren.
3. **AC-3** — WHILE die Fensterbreite höchstens 768 px beträgt, SHALL das System Header und Inhalt in voller Breite anzeigen.
4. **AC-4** — WHERE `[pageActions]`-Inhalt übergeben wird, SHALL das System ihn rechts im Header anzeigen.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #component #page #layout #page-header
