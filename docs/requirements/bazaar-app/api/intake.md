---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-09-22
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
      "size": "30", "color": null, "description": null },
    { "number": 6, "name": "Winterjacke", "brand": "Nike",
      "category": "Jacken", "price": 12.00,
      "size": "128", "color": "rot", "description": null,
      "deleteArticleNumber": 1 }
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

0. Für jeden Eintrag mit gesetztem `deleteArticleNumber` wird **zuerst** der alte Artikel unter dieser Nummer gelöscht — vorausgesetzt er gehört noch demselben Verkäufer und ist noch nicht freigegeben. Passt der Zustand nicht mehr (Artikel inzwischen freigegeben, anderem Verkäufer zugeordnet oder gar nicht mehr vorhanden — Race zwischen Übernehmen im Umnummerierungs-Popup und dem finalen Buchen), wird das Löschen **still übersprungen**; der Ziel-Eintrag wird trotzdem ganz normal weiterverarbeitet, der Vorgang bricht dafür nicht ab
1. Für jeden Eintrag wird ein Artikel angelegt oder — bei vorangemeldeten Artikeln — der bestehende **aktualisiert**
2. An jedem Artikel werden `acceptedAt` **und** `releasedAt` auf den Vorgangszeitpunkt gesetzt
3. `feeAmount` wird auf `intakeFeePaid` des Verkäufers **addiert**
4. Erst nach erfolgreicher Antwort startet das Frontend den Abgabe-Beleg ([Epic_Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md))

**Entweder alles oder nichts.** Kein Endpoint pro Artikel: Bricht eine Schleife aus N Requests in der Mitte ab, sind drei Artikel gebucht und vier nicht, während der Verkäufer bereits bezahlt hat und geht. Dieser Zustand ist nicht reparierbar, weil niemand mehr weiß, welche Artikel in der Kiste lagen.

**`acceptedAt` und `releasedAt` gemeinsam:** Am Tisch aufgenommene Artikel sind sofort im Verkauf. Der Freigabe-Weg über [`release.md`](release.md) betrifft ausschließlich vorangemeldete Artikel, die noch abgegeben werden müssen.

### Nummern-Eindeutigkeit

Die Nummern werden **hier** verbindlich geprüft, nicht beim Tippen. `GET /api/articles/by-number/{number}` liefert dem Frontend eine Vorabprüfung, aber die Entscheidung fällt in der Transaktion — zwei Annahmeplätze können dieselbe freie Nummer gleichzeitig gesehen haben.

Bei Kollision antwortet der Endpoint `409` mit **allen** betroffenen Nummern in `takenNumbers` und einem frischen `nextNumber`, damit das Frontend die Eingaben erhalten und nur die Nummern korrigieren kann. Ein Abbruch mit bloßem „Konflikt" würde die Sitzungsliste unbrauchbar machen.

### Umnummerierung vorangemeldeter Artikel (`deleteArticleNumber`)

Ein Eintrag kann optional `deleteArticleNumber` mitschicken: die Nummer des ursprünglich vorangemeldeten Artikels, den das Umnummerierungs-Popup der Artikelannahme geladen hat, bevor die Verkäuferin/der Verkäufer eine andere, freie Nummer vergeben hat (`number` trägt bereits die **neue** Zielnummer). Der alte Artikel wird dazu wie oben beschrieben vor dem eigentlichen Anlegen/Aktualisieren gelöscht.

**Kollision am Ziel ist bei Umnummerierung immer ein Konflikt, nie ein Nachbuchen.** Trägt ein Eintrag `deleteArticleNumber`, zählt ein bereits existierender Artikel unter der Zielnummer `number` **immer** als vergeben (`409 article.number_taken`) — auch dann, wenn dieser Artikel selbst demselben Verkäufer gehört und noch nicht freigegeben ist und damit für einen gewöhnlichen Eintrag (ohne `deleteArticleNumber`) den normalen Nachbuchen-Fall („Sonderfall importierter Verkäufer", siehe oben) auslösen würde. Grund: dieser Artikel ist ein eigenständiger, vorangemeldeter Artikel eines anderen Vorgangs — nicht derselbe, der gerade umnummeriert wird — und darf beim Umnummerieren nicht mit dessen Daten überschrieben/freigegeben werden.

### Gebühr

`feeAmount` berechnet das Frontend als `Anzahl Artikel × feePerItem` des Verkäufers und schickt den Betrag mit; der Server prüft ihn gegen dieselbe Rechnung und lehnt Abweichungen mit `400` ab.

**Warum überhaupt mitgeschickt:** Der Betrag steht auf dem Beleg, den der Verkäufer erhält, und im Payment-Panel, an dem das Rückgeld berechnet wurde. Würde der Server ihn allein bilden, könnten Anzeige und Buchung auseinanderlaufen, sobald jemand `feePerItem` zwischen Panel und Buchung ändert.

**„Betrag erhalten" und „Rückgeld" werden nicht übertragen** und nicht gespeichert — reine Rechenhilfe am Tisch ([Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) Abschnitt 4).

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #artikelannahme #transaktion #gebuehr #artikelnummer
