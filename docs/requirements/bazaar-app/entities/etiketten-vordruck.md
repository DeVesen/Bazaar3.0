---
status: draft
updated: 2026-11-05
---

# Entität: Etiketten-Vordruck

Drei Tabellen der Seite „Etiketten-Vordruck". Keine Beziehung zu Artikeln.

## Bogenformat (`LabelSheetFormats`)

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string(8) | ID nach Abschnitt 9.5 der App-Spec |
| `name` | string(50) | Eindeutig, exakt verglichen, an den Enden getrimmt |
| `sheetWidth`, `sheetHeight` | decimal(6,1) | Bogengröße in mm, > 0, höchstens 10000 |
| `labelWidth`, `labelHeight` | decimal(6,1) | Etikettgröße in mm, > 0, höchstens 10000 |
| `marginTop`, `marginRight`, `marginBottom`, `marginLeft` | decimal(6,1) | Leerer Rand in mm, ≥ 0, höchstens 10000 |
| `gapHorizontal`, `gapVertical` | decimal(6,1) | Abstand zwischen den Etiketten in mm, ≥ 0, höchstens 10000 |
| `columns`, `rows` | int | 1 bis 1000; Anzahl pro Seite = `columns × rows` |
| `offsetX`, `offsetY` | decimal(6,1) | Druckversatz in mm, −20 bis +20, höchstens eine Nachkommastelle, Pflicht, Standard 0 (auch für Bestandsformate); DB-Spalten `Geometry_OffsetX`, `Geometry_OffsetY` |

Spalten × Etikettbreite + (Spalten − 1) × waagerechter Abstand + Rand links + Rand rechts darf die
Bogenbreite um höchstens 0,5 mm übersteigen (Höhe analog). Beim Start ist kein Format gespeichert.

Der Druckversatz verschiebt den gesamten Druck (Plus: nach rechts bzw. unten, Minus: nach links bzw. oben), z. B. wenn der Drucker links abschneidet. Er wirkt nur im Druck, nicht in der Vorschau, und ändert weder die Rasterprüfung noch „Etiketten pro Seite“ noch die Lage der Etiketten zueinander. Fehlermeldung: „Zwischen −20 und 20 mm“.

## Werte des letzten Drucks (`LabelPrintDefaults`, eine Zeile, `id = 1`)

| Feld | Typ | Beschreibung |
|---|---|---|
| `logoKind`, `logoValue` | string?, text? | Logo: `Icon` + Icon-Schlüssel oder `Image` + Data-URL (PNG/JPEG/SVG, ≤ 1 MB); leer = kein Logo |
| `sellerSymbolKind`, `sellerSymbolValue` | string?, text? | Verkäufer-Symbol, gleiche Regeln |
| `currencySymbol` | string | 1 bis 3 Zeichen, Standard „€" |
| `sizes.qrCode` | decimal(5,1) | Breite = Höhe des QR-Codes in mm, Standard 21,5; DB-Spalte `QrCodeSize` |
| `sizes.sellerSymbol` | decimal(5,1) | Breite = Höhe beider Verkäufer-Symbole in mm, Standard 5; DB-Spalte `SellerSymbolSize` |
| `sizes.numberHeight` | decimal(5,1) | Höhe (= Schriftgröße) der Artikel-Nummer in mm, Standard 10,5; DB-Spalte `NumberHeight` |
| `sizes.currencyHeight` | decimal(5,1) | Höhe (= Schriftgröße) des Währungssymbols in mm, Standard 12; DB-Spalte `CurrencyHeight` |

`sizes` ist das Wertobjekt `LabelElementSizes` (in EF als Complex Type in derselben Zeile, die vier
Spalten `NOT NULL` mit den Standardwerten als Spalten-Default). Die vier Größen sind Pflicht, 0,1 bis 100 mm mit höchstens einer Nachkommastelle, und gelten absolut
auf dem gedruckten Etikett (nicht mit der Etikettgröße skaliert). Eine schon gespeicherte Zeile bekommt
beim Migrieren (`AddLabelPrintDefaultsSizes`) die Standardwerte. Das Logo hat keine eigene Größe: Es füllt
die freie Fläche neben dem QR-Code (→ [`docs/components/label-sheet/component.md`](../../../components/label-sheet/component.md)).

Startnummer, Anzahl und Startposition werden nie gespeichert.

## Bilder-Bibliothek (`LabelImages`)

Gemeinsame Bibliothek eigener Bilder für Logo und Verkäufer-Symbol (kein getrenntes Fach je Feld).

| Feld | Typ | Beschreibung |
|---|---|---|
| `id` | string(8) | ID nach Abschnitt 9.5 der App-Spec |
| `name` | string(50) | 1 bis 50 Zeichen, an den Enden getrimmt; nicht eindeutig; kein Umbenennen. Das Frontend schlägt den Dateinamen ohne Endung vor, gekürzt auf 50 Zeichen |
| `dataUrl` | text | Bild als Base64-Data-URL: PNG, JPEG oder SVG, höchstens 1 MB |
| `mediaType` | string(20) | `image/png`, `image/jpeg` oder `image/svg+xml` |
| `sizeBytes` | int | Größe der Bildbytes |
| `contentHash` | string(64) | SHA-256 der Bildbytes als Hex; **eindeutig** (Unique-Index) |
| `createdAt` | timestamp | Zeitpunkt des Hochladens; die Liste ist nach `createdAt` absteigend sortiert |

- Höchstens 50 Bilder. Ein inhaltsgleiches Bild (gleicher `contentHash`) legt keinen zweiten Eintrag an; der vorhandene Eintrag wird zurückgegeben, auch bei voller Bibliothek.
- Die Bibliothek ist **Kopierquelle, keine Referenz**: Beim Wählen kopiert die Seite die Data-URL in `logoValue` bzw. `sellerSymbolValue` von `LabelPrintDefaults`. `LabelPrintDefaults` verweist nicht auf `LabelImages`; Löschen eines Bildes ändert kein gewähltes Logo oder Symbol.
- Einmalige Übernahme beim Start: Bilder, die schon als Logo oder Verkäufer-Symbol in `LabelPrintDefaults` stehen (`Image`), kommen mit den Namen „Logo“ bzw. „Verkäufer-Symbol“ in die Bibliothek, sofern ihr Hash dort fehlt (wiederholbar ohne Wirkung; ohne Höchstzahl-Prüfung, höchstens zwei Bilder).
- Keine Beziehung zu Artikeln.
