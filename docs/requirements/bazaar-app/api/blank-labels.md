---
status: draft
updated: 2026-11-05
---

# API: Etiketten-Vordruck

Bogenformate, Bilder-Bibliothek und die Werte des letzten Drucks der Seite „Etiketten-Vordruck". Fachliche Quelle →
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
| `GET /api/label-images` | `admin` |
| `GET /api/label-images/{id}` | `admin` |
| `POST /api/label-images` | `admin` |
| `DELETE /api/label-images/{id}` | `admin` |

Auch das Lesen ist Admin-Sache: Die Seite gibt es für Kassenpersonal nicht.

## Bogenformate

`GET` liefert alle Formate nach Name sortiert:
`[{ id, name, sheetWidth, sheetHeight, labelWidth, labelHeight, marginTop, marginRight, marginBottom, marginLeft, gapHorizontal, gapVertical, columns, rows, offsetX, offsetY }]` (Maße in mm).
`offsetX`/`offsetY` sind der Druckversatz: positiv nach rechts/unten, negativ nach links/oben,
Betrag höchstens 20 mm, eine Nachkommastelle; sie zählen nicht zur Rasterprüfung. Formate von vor
dem Offset haben `0`.

`POST` speichert unter einem Namen; Body wie oben ohne `id`, dazu `overwrite`:

| Fall | Antwort |
|---|---|
| Name neu | `200` mit dem gespeicherten Format |
| Name vorhanden (exakt gleich, nach Trimmen), `overwrite: false` | `409` `label_sheet_format.name_taken` — die Seite fragt „Überschreiben?" |
| Name vorhanden, `overwrite: true` | `200`, das vorhandene Format behält seine `id` und bekommt die neuen Maße |
| Formatfehler (Name leer oder > 50 Zeichen, Maß ≤ 0 bzw. < 0 oder > 10000 mm, mehr als eine Nachkommastelle, Spalten/Zeilen < 1 oder > 1000, Offset außerhalb −20…20 mm, Raster überragt den Bogen um mehr als 0,5 mm) | `400` mit `errors` |

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

## Bilder-Bibliothek

Gemeinsame Bibliothek für Logo und Verkäufer-Symbol, höchstens 50 Bilder. Bei gleichzeitigen Uploads kann die Grenze kurzzeitig um wenige Bilder überschritten werden; für einen lokalen Admin bewusst hingenommen. Sie ist Kopierquelle:
die Seite übernimmt die Data-URL in den Wert des letzten Drucks (`kind: "image"`), es gibt keinen
Verweis auf die `id`. Löschen eines Bildes ändert deshalb kein gewähltes Logo oder Symbol.

`GET /api/label-images` → `200` `[{ id, name, mediaType, sizeBytes, createdAt }]`, neueste zuerst,
ohne Bildinhalt.

`GET /api/label-images/{id}` → `200` `{ id, name, dataUrl }` (`dataUrl` = `data:<medientyp>;base64,…`);
unbekannte `id` → `404` `label_image.not_found`. Das Bild wird nie als eigenes Dokument
ausgeliefert, nur als JSON; die Seite zeigt es per `<img [src]>` (SVG kann Skripte enthalten).

`POST /api/label-images` mit Body `{ name, dataUrl }`:

| Fall | Antwort |
|---|---|
| Bild neu | `201` mit `{ id, name, mediaType, sizeBytes, createdAt }` |
| Inhaltsgleiches Bild (SHA-256 der Bildbytes) schon vorhanden | `200` mit dem vorhandenen Eintrag (Name und `id` des vorhandenen); nichts wird gespeichert |
| Name leer oder > 50 Zeichen (nach Trimmen); `dataUrl` kein PNG/JPEG/SVG als Base64-Data-URL oder > 1 MB | `400` mit `errors` (Schlüssel `name` bzw. `dataUrl`) |
| 50 Bilder vorhanden und Bild neu | `409` `label_image.library_full` |

Der Name wird getrimmt gespeichert; das Frontend schlägt den Dateinamen ohne Endung vor, gekürzt auf 50 Zeichen.
Ein inhaltsgleiches Bild wird vor der Höchstzahl-Prüfung erkannt, ist die Bibliothek voll, kommt also
auch dafür `200`. Der nginx-Proxy lässt Bodies bis 3000k zu.

`DELETE /api/label-images/{id}` → `204`; unbekannte `id` → `404` `label_image.not_found`.

Beim Start übernimmt das Backend Bilder, die schon als Logo oder Verkäufer-Symbol gemerkt sind, in die
Bibliothek (Namen „Logo“ bzw. „Verkäufer-Symbol“), sofern ihr Inhalt dort fehlt; wiederholbar ohne Wirkung.
