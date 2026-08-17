---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Artikelannahme

Ein atomarer Vorgang: Artikel eines Verkäufers aufnehmen, freigeben und die Annahmegebühr kassieren. Fachliche Quelle → [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md), insbesondere Abschnitt „Transaktions-Vorgänge" (Transaktions-Vorgänge).

| Endpoint | Auth |
|---|---|
| `POST /api/intake` | `authenticated` |

Der Vorgang nutzt außerdem lesend [`sellers.md`](sellers.md) (`GET /api/sellers/search`, `POST /api/sellers`) und [`articles.md`](articles.md) (`GET /api/articles/by-number/{number}`, `GET /api/articles/next-number`).

---

## `POST /api/intake`

```
POST /api/intake
{
  "sellerId": "a3f9c2d1",
  "feeAmount": 6.00,
  "articles": [
    { "number": 1043, "name": "Winterjacke", "brand": "Nike",
      "category": "Jacken", "price": 12.00,
      "size": "128", "color": "rot", "description": null },
    { "number": 1044, "name": "Gummistiefel", "brand": "Aigle",
      "category": "Schuhe", "price": 8.00,
      "size": "30", "color": null, "description": null }
  ]
}

→ 200 OK
{
  "articleIds": ["e5b2c9a4", "d7f3a1c8"],
  "intakeFeePaid": 6.00
}

→ 409 Conflict
{
  "status": 409, "errorCode": "article.number_taken",
  "detail": "Artikelnummer 1044 ist inzwischen vergeben",
  "takenNumbers": [1044], "nextNumber": 1288
}
```

### Was in der Transaktion passiert

1. Für jeden Eintrag wird ein Artikel angelegt oder — bei vorangemeldeten Artikeln — der bestehende **aktualisiert**
2. An jedem Artikel werden `acceptedAt` **und** `releasedAt` auf den Vorgangszeitpunkt gesetzt
3. `feeAmount` wird auf `intakeFeePaid` des Verkäufers **addiert**
4. Erst nach erfolgreicher Antwort startet das Frontend den Abgabe-Beleg ([Epic_Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md))

**Entweder alles oder nichts.** Kein Endpoint pro Artikel: Bricht eine Schleife aus N Requests in der Mitte ab, sind drei Artikel gebucht und vier nicht, während der Verkäufer bereits bezahlt hat und geht. Dieser Zustand ist nicht reparierbar, weil niemand mehr weiß, welche Artikel in der Kiste lagen.

**`acceptedAt` und `releasedAt` gemeinsam:** Am Tisch aufgenommene Artikel sind sofort im Verkauf. Der Freigabe-Weg über [`release.md`](release.md) betrifft ausschließlich vorangemeldete Artikel, die noch abgegeben werden müssen.

### Nummern-Eindeutigkeit

Die Nummern werden **hier** verbindlich geprüft, nicht beim Tippen. `GET /api/articles/by-number/{number}` liefert dem Frontend eine Vorabprüfung, aber die Entscheidung fällt in der Transaktion — zwei Annahmeplätze können dieselbe freie Nummer gleichzeitig gesehen haben.

Bei Kollision antwortet der Endpoint `409` mit **allen** betroffenen Nummern in `takenNumbers` und einem frischen `nextNumber`, damit das Frontend die Eingaben erhalten und nur die Nummern korrigieren kann. Ein Abbruch mit bloßem „Konflikt" würde die Sitzungsliste unbrauchbar machen.

### Gebühr

`feeAmount` berechnet das Frontend als `Anzahl Artikel × feePerItem` des Verkäufers und schickt den Betrag mit; der Server prüft ihn gegen dieselbe Rechnung und lehnt Abweichungen mit `400` ab.

**Warum überhaupt mitgeschickt:** Der Betrag steht auf dem Beleg, den der Verkäufer erhält, und im Payment-Panel, an dem das Rückgeld berechnet wurde. Würde der Server ihn allein bilden, könnten Anzeige und Buchung auseinanderlaufen, sobald jemand `feePerItem` zwischen Panel und Buchung ändert.

**„Betrag erhalten" und „Rückgeld" werden nicht übertragen** und nicht gespeichert — reine Rechenhilfe am Tisch ([Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) Abschnitt 4).

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #artikelannahme #transaktion #gebuehr #artikelnummer
