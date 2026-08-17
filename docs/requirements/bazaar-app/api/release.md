---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Freigabe vorangemeldeter Artikel

Ein atomarer Vorgang: Die Artikel, die ein vorangemeldeter Verkäufer am Basar-Morgen bringt, werden freigegeben und die Annahmegebühr kassiert. Fachliche Quelle → [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) Abschnitt 6.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md), insbesondere Abschnitt 6.

| Endpoint | Auth |
|---|---|
| `POST /api/release` | `authenticated` |

Während des Scannens liest der Dialog nur — `GET /api/sellers/{id}/articles` ([`sellers.md`](sellers.md)) für die Liste der noch offenen Artikel und `GET /api/articles/by-number/{number}` ([`articles.md`](articles.md)) für die Erkennung.

---

## `POST /api/release`

```
POST /api/release
{
  "sellerId": "a3f9c2d1",
  "feeAmount": 20.00,
  "articleIds": ["e5b2c9a4", "d7f3a1c8", "…"]
}

→ 200 OK
{ "releasedCount": 40, "intakeFeePaid": 20.00 }

→ 409 Conflict
{ "status": 409, "errorCode": "article.not_releasable",
  "detail": "Artikel 1044 ist bereits freigegeben",
  "articleNumbers": [1044] }
```

### Was in der Transaktion passiert

1. An allen übergebenen Artikeln wird `releasedAt` auf den Vorgangszeitpunkt gesetzt
2. `feeAmount` wird auf `intakeFeePaid` des Verkäufers **addiert**
3. Erst nach erfolgreicher Antwort startet das Frontend den Abgabe-Beleg

**Geschrieben wird am Ende, nicht pro Scan.** Der Scan-Dialog sammelt im Frontend — wie der Warenkorb der Kasse — und schickt einen Request. Würde jeder Scan sofort schreiben, hinterließe ein Abbruch nach 30 Scans 30 freigegebene Artikel **ohne** kassierte Gebühr; die Gebühr wäre dann nur über einen zweiten Endpoint nachzutragen, und es gäbe zwei Wege, sie zu buchen.

Damit ist der Vorgang symmetrisch zu [`intake.md`](intake.md), [`sales.md`](sales.md) und [`settlement.md`](settlement.md): vier fachliche Vorgänge, vier atomare `POST`-Endpoints.

### Prüfung beim Buchen

Der Endpoint prüft **erneut**, dass jeder Artikel dem angegebenen Verkäufer gehört und `releasedAt` noch leer ist. Bei Verstoß wird der **ganze** Vorgang mit `409` abgelehnt und die betroffenen Artikelnummern genannt — zwischen dem ersten Scan und dem Abschluss liegen bei einer großen Kiste Minuten.

### Gebühr

`feeAmount` = `Anzahl freigegebener Artikel × feePerItem` des Verkäufers; der Server prüft die Rechnung nach und lehnt Abweichungen mit `400` ab.

Die Gebühr fällt **auf beiden Abgabewegen** an — hier und in der Artikelannahme. `feePerItem` ist eine Gebühr pro *abgegebenem* Artikel, und abgegeben wird beim Freigeben. Ohne diesen Vorgang wäre ein vorangemeldeter Verkäufer mit 40 Artikeln gebührenfrei, während der Laufkunde mit 12 Artikeln zahlt.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #freigabe #transaktion #gebuehr #scan
