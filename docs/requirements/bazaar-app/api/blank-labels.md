---
status: draft
updated: 2026-11-02
---

# API: Etiketten-Vordruck

Bogenformate und die Werte des letzten Drucks der Seite „Etiketten-Vordruck". Fachliche Quelle →
[`docs/forge/2026-11-02-etiketten-vordruck/spec.md`](../../../forge/2026-11-02-etiketten-vordruck/spec.md),
Entitäten → [`entities/etiketten-vordruck.md`](../entities/etiketten-vordruck.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/label-sheet-formats` | `admin` |
| `POST /api/label-sheet-formats` | `admin` |
| `DELETE /api/label-sheet-formats/{id}` | `admin` |
| `GET /api/label-print-defaults` | `admin` |
| `PUT /api/label-print-defaults` | `admin` |

Auch das Lesen ist Admin-Sache: Die Seite gibt es für Kassenpersonal nicht.

## Bogenformate

`GET` liefert alle Formate nach Name sortiert:
`[{ id, name, sheetWidth, sheetHeight, labelWidth, labelHeight, marginTop, marginRight, marginBottom, marginLeft, gapHorizontal, gapVertical, columns, rows }]` (Maße in mm).

`POST` speichert unter einem Namen; Body wie oben ohne `id`, dazu `overwrite`:

| Fall | Antwort |
|---|---|
| Name neu | `200` mit dem gespeicherten Format |
| Name vorhanden (exakt gleich, nach Trimmen), `overwrite: false` | `409` `label_sheet_format.name_taken` — die Seite fragt „Überschreiben?" |
| Name vorhanden, `overwrite: true` | `200`, das vorhandene Format behält seine `id` und bekommt die neuen Maße |
| Formatfehler (Name leer oder > 50 Zeichen, Maß ≤ 0 bzw. < 0 oder > 10000 mm, mehr als eine Nachkommastelle, Spalten/Zeilen < 1 oder > 1000, Raster überragt den Bogen um mehr als 0,5 mm) | `400` mit `errors` |

Die Obergrenzen (jedes Maß höchstens 10000 mm, Spalten und Zeilen höchstens 1000) schützen die
Rasterprüfung vor Überlauf; die Seite prüft sie vorab mit den Fehlertexten „Höchstens 10000 mm"
bzw. „Höchstens 1000".

`DELETE` → `204`; unbekannte `id` → `404` `label_sheet_format.not_found`.

## Werte des letzten Drucks

`GET` → `{ logo, sellerSymbol, currencySymbol }`; `logo` und `sellerSymbol` sind `null` oder
`{ kind: "icon", value: "<icon-schlüssel>" }` bzw. `{ kind: "image", value: "data:image/png;base64,…" }`.
Ohne bisherigen Druck: `{ logo: null, sellerSymbol: null, currencySymbol: "€" }`.

`PUT` mit demselben Body → `204`; die Seite sendet ihn bei jedem Druck. `400`, wenn ein Bild kein
PNG/JPEG/SVG als Base64-Data-URL oder größer als 1 MB ist, ein Icon-Schlüssel nicht `^[a-z0-9-]{1,30}$`
entspricht oder das Währungssymbol nicht 1 bis 3 Zeichen hat. Das Backend prüft nur Medientyp und
Größe, nicht den Inhalt; ein Bild ohne Nutzdaten (0 Byte) gilt als gültig. Der nginx-Proxy lässt
dafür 3000k zu.
