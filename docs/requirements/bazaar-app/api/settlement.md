---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Abrechnung

Rückgabe, Auszahlung und Storno. Fachliche Quelle → [Epic_Abrechnung](../epics/Epic_Abrechnung/epic.md); das Stornieren wird über die Verkäufer-Karte ausgelöst ([Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) Abschnitt 3).

Die Pfade liegen unter `/api/sellers/{id}/...`, stehen aber in dieser Datei, weil sie eigene Regeln zu Rundung, Sperre und Storno tragen — die Dateiaufteilung folgt dem Thema, nicht dem Pfad ([`cross-cutting.md`](cross-cutting.md) Abschnitt „Pfad-Konventionen").

| Endpoint | Auth |
|---|---|
| `GET /api/sellers/{id}/settlement` | `authenticated` |
| `PUT /api/articles/{id}/return` | `authenticated` |
| `POST /api/sellers/{id}/settlement` | `authenticated` |
| `DELETE /api/sellers/{id}/settlement` | `admin` |

---

## 1. `GET /api/sellers/{id}/settlement` — Read-Model

```
GET /api/sellers/a3f9c2d1/settlement

→ 200 OK
{
  "seller": { "id": "a3f9c2d1", "firstName": "Anna", "lastName": "Meier",
              "address": "…", "postalCode": "…", "city": "…" },
  "openCount": 0, "soldCount": 31, "returnedCount": 9,
  "revenue": 380.50,
  "commissionRate": 12.5,
  "commission": 47.56,
  "payout": 332.94,
  "intakeFeePaid": 20.00,
  "notDeliveredCount": 10,
  "settledAt": null, "payoutAmount": null,
  "canSettle": true
}
```

Kommt aus einem **Query-Port** als fertiges Read-Model, nicht aus dem Repository ([`cross-cutting.md`](cross-cutting.md) Abschnitt „Persistenz-Zugriff").

`canSettle` bündelt die Button-Regel: mindestens ein Artikel freigegeben **und** kein Artikel mehr offen im Verkauf. Die Bedingung im Frontend zu bilden würde bedeuten, sie zweimal zu pflegen.

`intakeFeePaid` erscheint als **Hinweiswert**, nicht als Abzugsposten (Abschnitt 3).

`notDeliveredCount` sind die vorangemeldeten Artikel mit leerem `releasedAt` — die Zahl, die der Abrechnen-Dialog vorher nennt.

---

## 2. `PUT /api/articles/{id}/return` — Rückgabe

```
PUT /api/articles/{id}/return

→ 204 No Content
→ 409 Conflict   errorCode: article.sold            (soldAt gesetzt)
→ 409 Conflict   errorCode: settlement.locked
```

Setzt `returnedAt` auf jetzt. **`PUT` und ohne Body**, weil der Vorgang idempotent ist: Zweimal denselben Artikel zurückgeben ändert nichts (Verb-Muster → [`cross-cutting.md`](cross-cutting.md) Abschnitt „Verb-Muster").

Anders als Freigabe und Verkauf schreibt der Rückgabe-Scan **pro Artikel sofort** — hier hängt kein Geld am Abschluss der Sitzung, und der Vorgang ist beliebig oft fortsetzbar. Die Auszahlung wird erst mit Abschnitt 3 fällig.

Ein verkaufter Artikel kann nicht zurückgegeben werden (`409`) — die gegenseitige Sperre gilt an jedem Endpoint, nicht nur im Status-Popup.

---

## 3. `POST /api/sellers/{id}/settlement` — Abrechnen

```
POST /api/sellers/a3f9c2d1/settlement
{ "payoutAmount": 332.94 }

→ 200 OK
{ "settledAt": "2026-08-17T16:40:11Z",
  "payoutAmount": 332.94,
  "removedArticleCount": 10 }

→ 409 Conflict   errorCode: settlement.articles_open
                 detail: "3 Artikel sind noch im Verkauf"
→ 409 Conflict   errorCode: settlement.already_settled
→ 400 Bad Request  errors: { "payoutAmount": ["Betrag weicht von der Berechnung ab"] }
```

### Was in der Transaktion passiert

1. `settledAt` und `payoutAmount` werden am Verkäufer gesetzt
2. Alle Artikel mit leerem `releasedAt` — die nie abgegebenen — werden **entfernt**
3. Ab jetzt sind alle Felder und Zeitstempel seiner Artikel gesperrt

**Warum `payoutAmount` im Request steht:** Es ist der Betrag, der auf dem Beleg gedruckt und in bar ausgezahlt wurde. Der Server prüft ihn gegen die eigene Rechnung und lehnt Abweichungen ab — würde er ihn allein bilden, könnten Anzeige und Buchung auseinanderlaufen.

### Rundung

Verbindliche Reihenfolge, **genau eine** Rundung:

1. Umsatz aufsummieren — bereits centgenau
2. Provision berechnen und **kaufmännisch auf 2 Dezimalstellen** runden
3. Auszahlung = Umsatz − gerundete Provision

Bei 380,50 € und 12,5 % ergibt die Provision 47,5625 € → 47,56 €, Auszahlung 332,94 €. Weil die Auszahlung die Differenz zweier centgenauer Beträge ist, geht sie immer glatt auf. Am Ende zu runden würde Anzeige und Ausdruck um einen Cent auseinanderlaufen lassen.

Maßgeblich ist `salesCommission` **des Verkäufers**, nicht der aktuelle Wert seines Typs.

### Keine Gebühr im Abzug

Die Annahmegebühr wurde am Annahmetisch in bar bezahlt und steht als `intakeFeePaid` am Verkäufer. Sie hier abzuziehen würde bedeuten, dass der Verkäufer sie zweimal zahlt — einmal bei der Abgabe und einmal als Abzug von der Auszahlung. Darum hat die Aufstellung genau drei Zeilen: Umsatz, Provision, Auszahlung.

---

## 4. `DELETE /api/sellers/{id}/settlement` — Storno

```
DELETE /api/sellers/a3f9c2d1/settlement

→ 204 No Content
→ 404 Not Found   errorCode: settlement.not_settled
```

**Admin-only.** Setzt `settledAt` **und** `payoutAmount` auf `null` und löst damit die Sperre über alle Artikel des Verkäufers.

Die entfernten, nie abgegebenen Artikel kommen **nicht** zurück — sie sind gelöscht, nicht markiert. Das ist beabsichtigt: Sie haben den Basar nie erreicht, es wurde keine Gebühr für sie kassiert, und der Datensatz existiert weiterhin in der Voranmelde-App.

Der Storno ist der **einzige** Weg, eine Abrechnung zu öffnen. Damit bleibt eine ausgezahlte Summe nachvollziehbar, statt nachträglich still zu wandern — und weil `payoutAmount` beim Stornieren geleert wird, ist an der Zahl ablesbar, ob aktuell eine Auszahlung gilt.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #abrechnung #rundung #auszahlung #storno #transaktion
