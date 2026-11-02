---
status: draft
updated: 2026-11-02
---

# Entität: Etiketten-Vordruck

Zwei Tabellen der Seite „Etiketten-Vordruck". Keine Beziehung zu Artikeln.

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

Spalten × Etikettbreite + (Spalten − 1) × waagerechter Abstand + Rand links + Rand rechts darf die
Bogenbreite um höchstens 0,5 mm übersteigen (Höhe analog). Beim Start ist kein Format gespeichert.

## Werte des letzten Drucks (`LabelPrintDefaults`, eine Zeile, `id = 1`)

| Feld | Typ | Beschreibung |
|---|---|---|
| `logoKind`, `logoValue` | string?, text? | Logo: `Icon` + Icon-Schlüssel oder `Image` + Data-URL (PNG/JPEG/SVG, ≤ 1 MB); leer = kein Logo |
| `sellerSymbolKind`, `sellerSymbolValue` | string?, text? | Verkäufer-Symbol, gleiche Regeln |
| `currencySymbol` | string | 1 bis 3 Zeichen, Standard „€" |

Startnummer, Anzahl und Startposition werden nie gespeichert.
