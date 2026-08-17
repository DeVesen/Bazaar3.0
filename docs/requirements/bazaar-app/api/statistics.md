---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Statistik

Ein Read-Model für die ganze Statistik-Seite. Fachliche Quelle → [Epic_Statistik](../epics/Epic_Statistik/epic.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/statistics` | `authenticated` |

---

## `GET /api/statistics`

```
GET /api/statistics?sellerTypeId=b7c1e4f2

→ 200 OK
{
  "articles": {
    "total": 812, "accepted": 780, "selling": 96,
    "sold": 640, "returned": 44, "sellRate": 82.05
  },
  "values": {
    "acceptedValue": 9860.00, "returnedValue": 512.00, "openValue": 1180.00
  },
  "finance": {
    "grossIncome": 8168.00, "grossIncomeManual": 40.00,
    "commission": 1102.68, "fees": 390.00, "earningsTotal": 1492.68,
    "payoutExpected": 6675.32, "payoutSettled": 4210.15
  },
  "leaderboard": [
    { "rank": 1, "sellerId": "a3f9c2d1", "sellerName": "Anna Meier",
      "sellerType": "Privat", "accepted": 42, "sold": 31,
      "revenue": 380.50, "payout": 332.94, "settled": true }
  ]
}
```

**Ein Endpoint für die ganze Seite**, keine Kennzahl-Endpoints. Die Alternative — Berechnung im Browser — hätte bedeutet, alle Artikel und alle Verkäufer zu laden, um 14 Zahlen zu bilden; bei 2 000 Artikeln auf einem Tablet die langsamste Seite der App. Und dieselben Summen existieren serverseitig schon für Verkäufer-Karten und Abrechnung.

Kommt aus einem **Query-Port** ([`cross-cutting.md`](cross-cutting.md) Abschnitt „Persistenz-Zugriff"). **Kein Caching** — jeder Seitenaufruf fragt neu; das ist eine Aussage über Frische, nicht über den Ort.

### Parameter

| Parameter | Wirkung |
|---|---|
| `sellerTypeId` | filtert **nur das Leaderboard** auf einen Verkäufer-Typ; die KPI-Zeilen bleiben unverändert |

Der Filter läuft serverseitig, damit die Tabelle nicht über eine vollständige Liste im Browser gefiltert wird.

### Besonderheiten der Kennzahlen

**`sellRate`** = `sold / accepted × 100`. Ist `accepted` gleich null, liefert der Endpoint `null` und die Kachel zeigt „–" — keine Division durch null, und keine `0`, die einen echten Wert vortäuscht.

**`grossIncomeManual`** ist der Teil von `grossIncome`, der auf Artikeln mit `soldManually = true` beruht — Verkäufe ohne Kassenvorgang. Es ist die Zahl, die bei der Kassenabstimmung am Abend fehlt und sonst nicht auffindbar wäre.

**`fees`** ist die Summe von `intakeFeePaid` über alle Verkäufer — **tatsächlich kassiert**, nicht hochgerechnet. Eine Formel über verkaufte Artikel wäre doppelt falsch: Artikel, die abgegeben aber nicht verkauft wurden, haben Gebühr gebracht und würden fehlen.

**`payoutExpected` gegen `payoutSettled`:** Das Erste ist eine Rechnung über **alle** Verkäufer, das Zweite die Summe der gespeicherten `payoutAmount` der **abgerechneten**. Die Differenz ist das, was am Ende des Tages noch aus der Schublade rausgeht.

**`payout` im Leaderboard** ist immer der **erwartete** Betrag, `settled` sagt zusätzlich, ob schon ausgezahlt wurde. Eine Spalte, die je Zeile etwas anderes bedeutet, wäre in einer sortierbaren Tabelle unbrauchbar.

Maßgeblich für Provision ist `salesCommission` **des Verkäufers**, nicht der Wert seines Typs.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #statistik #query-port #read-model #kennzahlen
