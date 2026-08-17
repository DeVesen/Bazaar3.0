---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Export

Erzeugt die JSON-Datei für den manuellen Import in die Haupt-App am
Basar-Morgen.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epic → [Epic_Export](../epics/Epic_Export/epic.md) ·
Component → [`export-panel.md`](../components/export-panel.md) ·
Schema → [`entities.md`](../../entities.md) Abschnitt „Export-Format"

---

## Endpoint

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/export` | `admin` | Vollständiger Datenexport als JSON-Download |

---

## Query-Parameter

| Parameter | Typ | Default | Bedeutung |
|---|---|---|---|
| `includeBrands` | bool | `false` | Marken-Stammdaten mitexportieren (Checkbox „Marken einschließen") |
| `includeCategories` | bool | `false` | Kategorien-Stammdaten mitexportieren |

Nicht angefordert → das jeweilige Array ist **leer**, nicht weggelassen. Das
Schema bleibt damit über alle Aufrufe stabil.

---

## Response

```
200 OK
Content-Type: application/json
Content-Disposition: attachment; filename="basar-export-2026-08-17.json"
```

**Body:** exakt das Schema aus [`entities.md`](../../entities.md) — dort die
verbindliche Quelle, hier nicht dupliziert.

Den **Dateinamen** setzt das Backend (`basar-export-YYYY-MM-DD.json`, Datum aus
der Serverzeit). Das Frontend triggert nur den Browser-Download aus der
Response und baut die Datei nicht selbst zusammen — sonst müsste es alle
Datensätze ungepaginiert in den Browser laden.

---

## Serverseitige Filterung

| Regel | Herkunft |
|---|---|
| Nur Verkäufer mit **mindestens einem eigenen Artikel** — Verkäufer ohne Artikel werden ausgelassen | Epic_Export Abschnitt 1, AC-2 |
| Admins zählen wie Verkäufer, sofern sie eigene Artikel haben | Epic_Export Abschnitt 1 |
| Jeder Verkäufer trägt seine vollständige Artikelliste als `articles`-Array | Schema |
| `exportedAt` als ISO-8601-Zeitstempel | AC-3 |

**Keine Konditionen pro Verkäufer.** Der Export enthält weder Provision noch
Gebühr, sondern nur `verkaueferType` — die **Bezeichnung** des Typs, nicht die
Id. Die Haupt-App pflegt eigene Verkäufer-Typen und löst die Konditionen über
den Namen auf; eine Voranmelde-App-Id wäre dort bedeutungslos. Konsistent mit
der Entscheidung, in der Voranmelde-App keinen Override zu führen
(siehe [`seller-types.md`](seller-types.md)).

**Nicht exportiert:** `istAdmin`, `inviteToken`, `inviteTokenExpiresAt`,
Nummernblöcke, das `original`-Flag der Stammdaten — allesamt
Voranmelde-App-interne Felder ohne Entsprechung in der Haupt-App.

---

## UI-Feedback

Abweichend vom Standardmuster in
[`cross-cutting.md`](cross-cutting.md) Abschnitt 7: Nach dem Download zeigt die
Seite eine Shared `info-area` vom Typ `info` mit der Anzahl exportierter
Verkäufer und Artikel — **kein** Toast, **kein** Auto-Dismiss (Epic_Export AC-4).

Die beiden Zahlen zählt das Frontend aus dem heruntergeladenen JSON; es braucht
dafür keinen zweiten Endpoint.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #export #json #datenschnittstelle #import-vorbereitung
