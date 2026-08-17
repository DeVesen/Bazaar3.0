---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Import

Übernahme der JSON-Datei aus der Voranmelde-App. Fachliche Quelle → [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 2, Schema → [`entities/import-format.md`](../entities/import-format.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md), insbesondere Abschnitt „Transaktions-Vorgänge".

| Endpoint | Auth |
|---|---|
| `POST /api/import/preview` | `admin` |
| `POST /api/import` | `admin` |

---

## Zwei Schritte, zwei Requests

Der Ablauf braucht zwischen Vorschau und Ausführung eine Entscheidung des Admins (Typ-Zuordnung, Stammdaten-Auswahl). Die Datei wird deshalb **zweimal übertragen** statt serverseitig zwischengelagert: Ein Zwischenspeicher bräuchte Lebensdauer, Aufräumjob und eine Kennung — bei wenigen hundert Kilobyte ist der zweite Upload billiger als dieser Apparat.

**`POST /api/import/preview` schreibt nichts.** Kein Datensatz wird angelegt, geändert oder gelöscht; der Endpoint liest die Datei, vergleicht mit dem Bestand und antwortet.

---

## 1. `POST /api/import/preview`

`multipart/form-data` mit dem Feld `file`.

```
→ 200 OK
{
  "sellerCount": 84,
  "articleCount": 612,
  "newSellers": 71,
  "replacedSellers": 11,
  "skippedSellers": [
    { "id": "a3f9c2d1", "name": "Anna Meier",
      "reason": "has_sold_articles", "soldCount": 7 }
  ],
  "unknownSellerTypes": [
    { "name": "Verein", "affectedSellers": 3 }
  ],
  "newBrands": 23,
  "newCategories": 5
}

→ 400 Bad Request   errorCode: import.invalid_format
                    detail: "Datei entspricht nicht dem erwarteten Schema"
```

**`unknownSellerTypes` blockiert den Import**, bis der Admin jeden Namen einem existierenden Typ zugeordnet hat. Kein automatisches Anlegen: Ein Typ trägt Provision und Gebühr, die der Import nicht erfinden kann — ein Typ mit 0 % Provision wäre ein stiller Geldverlust. Marken und Kategorien werden dagegen angelegt, weil sie keine Zahlen tragen ([`master-data.md`](master-data.md)).

**`skippedSellers`** sind Verkäufer, die **nicht** ersetzt werden: solche mit verkauften Artikeln (`soldAt`) oder abgerechnetem Stand (`settledAt`). Sonst würde ein zweiter Import am Basar-Tag Kassenumsätze löschen.

---

## 2. `POST /api/import`

`multipart/form-data` mit `file` plus einem JSON-Feld `options`:

```json
{
  "sellerTypeMapping": { "Verein": "b7c1e4f2" },
  "importBrands": true,
  "importCategories": true
}

→ 200 OK
{ "importedSellers": 82, "importedArticles": 598,
  "skippedSellers": 2, "importedBrands": 23, "importedCategories": 5 }

→ 409 Conflict   errorCode: import.unmapped_seller_type
                 detail: "Verkäufer-Typ \"Verein\" ist nicht zugeordnet"
```

### Was in der Transaktion passiert

1. Für jeden Verkäufer der Datei: existiert er (anhand der **1:1 übernommenen ID**), wird er **samt allen seinen Artikeln gelöscht** und neu angelegt; sonst neu angelegt
2. Verkäufer mit verkauften oder abgerechneten Artikeln werden **übersprungen**
3. `sellerType` wird über den **Namen** aufgelöst — direkt oder über `sellerTypeMapping` — und belegt `salesCommission` und `feePerItem` des Verkäufers
4. Gewählte Stammdaten werden angelegt, sofern der Name noch nicht existiert, mit `original = true`
5. Importierte Artikel starten **ohne Status-Zeitstempel** — sie gelten als „Registriert" und werden am Basar-Morgen über [`release.md`](release.md) freigegeben

**Entweder alles oder nichts.** Ein halb durchgelaufener Import wäre am Basar-Morgen der schlechteste denkbare Zustand: halbe Verkäufer, halbe Artikel und kein sauberer Ausgangspunkt für einen zweiten Versuch.

### Warum der Import löschen darf, das Handeln aber nicht

`DELETE /api/sellers/{id}` bricht bei vorhandenen Artikeln mit `409` ab ([`sellers.md`](sellers.md)), der Import ersetzt dagegen Verkäufer samt Artikeln. Der Unterschied ist beabsichtigt: Der Import setzt **denselben** Verkäufer in neuerem Stand ein — gleiche ID aus der Voranmelde-App —, es verschwindet nichts, was nicht sofort wieder entsteht. Manuelles Löschen entfernt ihn dauerhaft.

Artikel, die **manuell** in dieser App angelegt wurden, tragen keine Import-Herkunft und bleiben unberührt.

### Kein Rückkanal

Der Datenfluss ist **einseitig**: Die Voranmelde-App exportiert, die Haupt-App importiert. Einen Export zurück gibt es nicht und er ist in keinem Epic hinterlegt — die Voranmeldung endet, wenn der Basar beginnt.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #import #json #transaktion #upsert
