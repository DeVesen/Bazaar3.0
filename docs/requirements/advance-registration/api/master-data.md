---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Stammdaten — Marken & Kategorien

Marken und Kategorien sind endpoint-seitig **identisch**: gleiche vier Routen,
gleiche Semantik, gleiches `original`-Flag, gleicher Konfliktfall. Daher eine
Datei mit Varianten-Tabelle statt zwei fast wortgleicher Dokumente.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epics → [Epic_Marken](../epics/Epic_Marken/epic.md) ·
[Epic_Kategorien](../epics/Epic_Kategorien/epic.md) ·
Entities → [`entities/marke.md`](../entities/marke.md),
[`entities/kategorie.md`](../entities/kategorie.md) ·
Components → [`stammdaten-popup.md`](../components/forms/stammdaten-popup.md)

---

## Varianten

| Ressource | Basis-Pfad | Epic | Feld im Artikel |
|---|---|---|---|
| Marken | `/api/brands` | Epic_Marken | `brand` |
| Kategorien | `/api/categories` | Epic_Kategorien | `category` |

Im Folgenden steht `<resource>` für `brands` oder `categories`. Alles gilt
unverändert für beide.

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/<resource>` | `authenticated` | Vollständige Liste |
| `POST /api/<resource>` | `authenticated` | Anlegen |
| `PUT /api/<resource>/{id}` | `admin` | Name und/oder `original` ändern |
| `DELETE /api/<resource>/{id}` | `admin` | Löschen |

> **Auth-Korrektur gegenüber den Epics.** `GET` und `POST` standen dort als
> „Auth + Admin". Das war nicht haltbar: Ein Verkäufer braucht die Liste für
> das AutoComplete im Artikel-Dialog und für die `p-select`-Filter im
> Filter-Panel, und er legt über den `+`-Modus des AutoComplete neue Einträge
> an (Epic_Meine_Artikel Abschnitt 3, Epic_Marken Abschnitt 3). `PUT` und
> `DELETE` bleiben Admin-only — anlegen darf jeder, umbenennen und löschen nur
> der Admin.

---

## Objekt

```json
{ "id": "m4k2p8q1", "name": "Jako-O", "original": true, "articleCount": 37 }
```

| Feld | Bemerkung |
|---|---|
| `id` | string, 8 Zeichen, backend-generiert |
| `name` | Anzeigename, unique (siehe Duplikat-Prüfung) |
| `original` | `true` = kuratiert (Badge „✓ Original", grün), `false` = während der Voranmeldephase von einem Verkäufer angelegt (Badge „Neu", orange) |
| `articleCount` | **Nur für die Admin-Rolle enthalten** — für Verkäufer wird das Feld weggelassen, nicht auf `null` gesetzt |

---

## 1. `GET /api/<resource>`

Vollständige Liste, **nicht paginiert** — die Liste dient gleichzeitig als
Dropdown-Quelle und ist zweistellig
([`cross-cutting.md`](cross-cutting.md) Abschnitt 4).

**Response `200`**
```json
[ { "id": "m4k2p8q1", "name": "Jako-O", "original": true, "articleCount": 37 } ]
```

### `articleCount` und die Denormalisierung

`brand`/`category` sind im Artikel **denormalisierte Strings, keine FKs**
(siehe [`entities/artikel.md`](../entities/artikel.md)). Der Zähler ist daher
ein Namens-Match:

```
articleCount = COUNT(*) FROM article WHERE brand = <name>
```

Dieselbe Bedingung entscheidet über die Löschsperre (Abschnitt 4) — Zähler und
`409` können damit nicht auseinanderlaufen.

---

## 2. `POST /api/<resource>`

**Request**
```json
{ "name": "Jako-O" }
```

**`original` wird nie vom Client gesetzt**, sondern serverseitig aus der Rolle
abgeleitet:

| Rolle des Aufrufers | `original` | Herkunft |
|---|---|---|
| `admin` | `true` | Admin-Anlage ist per Definition kuratiert (Epic_Marken Abschnitt 2) |
| `seller` | `false` | Inline-Anlage über das AutoComplete-Modal (Epic_Marken Abschnitt 3) |

So bleibt es ein Create-Endpoint statt zweier Pfade für denselben Datensatz,
und die Regel liegt an genau einer Stelle.

**Response `201`** — angelegter Datensatz

**Fehler**

| Code | `detail` |
|---|---|
| `400` | `name` leer |
| `409` | `errorCode: master_data.name_taken` — „&lt;Name&gt; existiert bereits" |

### Duplikat-Prüfung

Match **case-insensitiv nach Trim**: „nike", „Nike " und „NIKE" gelten als
derselbe Eintrag. Der `+`-Modus des AutoComplete öffnet das Anlegen-Modal zwar
nur bei fehlendem *exaktem* Treffer — ohne diese Prüfung füllte sich die
Stammdatentabelle genau mit den Schreibvarianten, die das `original`-Flag
sichtbar machen soll.

---

## 3. `PUT /api/<resource>/{id}`

**Request**
```json
{ "name": "Jako-O", "original": true }
```

Beide Felder änderbar. Der `original`-Toggle im Edit-Popup erlaubt dem Admin,
einen von einem Verkäufer angelegten „Neu"-Eintrag nachträglich zu „Original"
zu befördern — oder umgekehrt (Epic_Marken AC-4).

**Response `200`** — aktualisierter Datensatz

### Namens-Kaskade in die Artikel

Wird `name` geändert, schreibt das Backend den neuen Wert **in derselben
Transaktion** in alle Artikel, die den alten String tragen. Ohne diese Kaskade
zerfiele der `brand`/`category`-Filter und `articleCount` fiele auf 0 —
unmittelbare Folge der Denormalisierung.

Die Response enthält bewusst keine Zahl aktualisierter Artikel; der aktuelle
`articleCount` steht ohnehin im zurückgegebenen Datensatz.

**Fehler**

| Code | `detail` |
|---|---|
| `409` | `errorCode: master_data.name_taken` — „&lt;Name&gt; existiert bereits", Umbenennen auf einen belegten Namen. **Kein automatisches Verschmelzen** zweier Stammdatensätze; ein Merge-Feature ist nicht spezifiziert. |
| `404` | Unbekannte ID |

---

## 4. `DELETE /api/<resource>/{id}`

**Response `204`**

**Fehler**

| Code | `detail` |
|---|---|
| `409` | `errorCode: brand.in_use` bzw. `category.in_use` — „Marke wird noch verwendet" / „Kategorie wird noch verwendet", sobald mindestens ein Artikel den Namen trägt (Epic_Marken AC-3, Epic_Kategorien AC-3) |
| `404` | Unbekannte ID |

Kein Kaskadenlöschen — Referenzschutz nach
[`cross-cutting.md`](cross-cutting.md) Abschnitt 5.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #stammdaten #marken #kategorien #crud #original-flag
