---
status: draft
updated: 2026-11-05
---

# Component: Etikett und Etikettenbogen

**Verwendung:** Haupt-App, Seite „Etiketten-Vordruck" (Vorschau) und deren Druck.
Ablage: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/`.

PrimeNG liefert dafür keine Komponente — eigene Leaf-Komponenten (Grundregel → [overview.md](../overview.md)).

| Komponente | Selektor | Inhalt |
|---|---|---|
| Etikett | `app-label-card` | QR-Code (Nummer) mit Klartext darunter, Logo daneben, Preisfeld (Schreiblinie + Währungssymbol) rechts, Verkäufer-Symbol oben rechts und unten links, optional Falzlinie in der Mitte |
| Etikettenbogen | `app-label-sheet` | Bogen mit Rand und Raster; Plätze leer, ausgegraut (vor der Startposition) oder mit Etikett |
| Druckdokument | `app-label-sheets-document` | Alle Bögen eines Drucks in Originalgröße, mit Falzlinie |
| Logo/Symbol | `app-label-graphic` | Icon der Icon-Liste oder eigenes Bild (Data-URL) |

## Skalierung

Lage in Prozent der Etikett- bzw. Bogengröße, Schrift in `cqw` des Etiketts. Dasselbe Markup
skaliert in der Vorschau mit der Containerbreite (Seitenverhältnis über `aspect-ratio`) und liegt
im Druck in mm (Breite `<Bogenbreite>mm`). Der Inhalt eines Etiketts skaliert mit der Etikettgröße:
105 × 35 mm = Maßstab 1, bei anderem Seitenverhältnis gilt das kleinere Verhältnis.

## Schnittstelle

`app-label-card`: `width`, `height` (mm, Pflicht), `number` (`null` = ohne QR-Code und Klartext),
`logo`, `sellerSymbol` (`null` = Platz bleibt leer), `currencySymbol`, `showFoldLine`.

`app-label-sheet`: `geometry` und `slots` (Pflicht), `content`, `width` (CSS-Länge, Standard `100%`),
`maxHeight` (Vorschau), `outlineSlots`, `showFoldLines`, `applyOffset` (Standard `false`).

Der Druckversatz (`offsetX`/`offsetY` der Geometrie) wird nur mit `applyOffset` angewendet: `app-label-sheets-document` setzt es auf `true`, die Vorschau nicht. Die Platzberechnung `slotRects(geometry, { applyOffset })` verschiebt dann alle Plätze um den Versatz.

Eigene Bilder (auch SVG) werden nur über `<img [src]>` mit der Data-URL gerendert, nie per
`innerHTML` oder inline-SVG.

Keine Outputs, kein Service, kein HTTP.
