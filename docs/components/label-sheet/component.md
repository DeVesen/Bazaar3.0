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
| Etikett | `app-label-card` | QR-Code (Nummer) mit Artikel-Nummer (Klartext) darunter, Logo daneben, Preiszeile (Schreiblinie + Währungssymbol) rechts, Verkäufer-Symbol oben rechts und unten links, optional Falzlinie in der Mitte |
| Etikettenbogen | `app-label-sheet` | Bogen mit Rand und Raster; Plätze leer, ausgegraut (vor der Startposition) oder mit Etikett |
| Druckdokument | `app-label-sheets-document` | Alle Bögen eines Drucks in Originalgröße, mit Falzlinie |
| Logo/Symbol | `app-label-graphic` | Icon der Icon-Liste oder eigenes Bild (Data-URL) |

## Skalierung

Lage in Prozent der Etikett- bzw. Bogengröße, Schrift in `cqw` des Etiketts. Dasselbe Markup
skaliert in der Vorschau mit der Containerbreite (Seitenverhältnis über `aspect-ratio`) und liegt
im Druck in mm (Breite `<Bogenbreite>mm`). Ränder und Anker eines Etiketts skalieren mit der
Etikettgröße (Maßstab k): 105 × 35 mm = 1, bei anderem Seitenverhältnis gilt das kleinere Verhältnis.
Die Elementgrößen (`sizes`) und die 1,5 mm um die Logo-Fläche gelten dagegen absolut in mm.

## Layout

Berechnet in `label-layout.ts` (`labelLayout(width, height, sizes)`), alle Werte in mm. Keine
Kollisionsprüfung: Elemente dürfen sich überlappen.

| Element | Lage | Größe |
|---|---|---|
| QR-Code | oben links, links auf einer Linie mit dem Verkäufer-Symbol unten links (Rand 1,5 mm × Maßstab), oben derselbe Abstand; ohne Ruhezone gezeichnet (`app-qr-code` mit `size` 0, `margin` 0), damit die Module an der Box-Kante beginnen; wächst nach unten rechts | `sizes.qrCode` (Breite = Höhe) |
| Logo | füllt die freie Fläche: links rechte Kante QR-Code + 1,5 mm, rechts Falzlinie − 1,5 mm, oben Rand + 1,5 mm, unten Oberkante Artikel-Nummer − 1,5 mm; darin so groß wie möglich, nie verzerrt (`object-fit: contain` bzw. `preserveAspectRatio`), zentriert | aus der Fläche; ist sie 0 breit oder hoch, entfällt das Logo |
| Artikel-Nummer (`numberText`) | feste horizontale Mitte `(8 k + Falzlinie − 1,5 k) / 2`, abgeleitet aus Vorgabe-Symbol 5 k + Rändern (hängt nicht von `sizes.sellerSymbol` ab); Unterkante fest (Rand − 1,5 k) | Schriftgröße = `sizes.numberHeight` |
| Verkäufer-Symbol oben rechts | rechte und obere Kante 1,5 k vom Rand; wächst nach unten links | `sizes.sellerSymbol` |
| Verkäufer-Symbol unten links | linke und untere Kante 1,5 k vom Rand; wächst nach oben rechts | `sizes.sellerSymbol` |
| Preiszeile (`priceRow`) | von `width − 48 k` bis `width − 1,5 k`, Unterkante wie Artikel-Nummer; Flex-Zeile aus Schreiblinie (`flex: 1`) und rechtsbündigem Währungssymbol | Höhe = Schriftgröße = `sizes.currencyHeight`; die Schreiblinie schrumpft auf den Restplatz, bis 0 |

Vorgaben `DEFAULT_LABEL_ELEMENT_SIZES`: QR-Code 21,5, Verkäufer-Symbol 5, Artikel-Nummer 10,5,
Währungssymbol 12 mm (frühere feste Werte bei 105 × 35 mm).

## Schnittstelle

`app-label-card`: `width`, `height` (mm, Pflicht), `number` (`null` = ohne QR-Code und Klartext),
`logo`, `sellerSymbol` (`null` = Platz bleibt leer), `currencySymbol`, `showFoldLine`,
`sizes` (`LabelElementSizes { qrCode, sellerSymbol, numberHeight, currencyHeight }` in mm, Standard
`DEFAULT_LABEL_ELEMENT_SIZES`).

`app-label-sheet`: `geometry` und `slots` (Pflicht), `content` (`LabelContent` mit `logo`,
`sellerSymbol`, `currencySymbol`, `sizes`; reicht `sizes` an jedes Etikett durch), `width` (CSS-Länge, Standard `100%`),
`maxHeight` (Vorschau), `outlineSlots`, `showFoldLines`, `applyOffset` (Standard `false`).

Der Druckversatz (`offsetX`/`offsetY` der Geometrie) wird nur mit `applyOffset` angewendet: `app-label-sheets-document` setzt es auf `true`, die Vorschau nicht. Die Platzberechnung `slotRects(geometry, { applyOffset })` verschiebt dann alle Plätze um den Versatz. Mit `applyOffset` schneidet der Bogen über seinen Rand ragende Etiketten ab (`overflow: hidden`), damit der Druck nicht verkleinert oder umbrochen wird; Größe und Abstände bleiben exakt.

Eigene Bilder (auch SVG) werden nur über `<img [src]>` mit der Data-URL gerendert, nie per
`innerHTML` oder inline-SVG.

Keine Outputs, kein Service, kein HTTP.
