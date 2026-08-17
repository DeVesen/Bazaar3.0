---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Verkauf

Kassenvorgang und Storno des letzten Vorgangs. Fachliche Quelle → [Epic_Verkauf](../epics/Epic_Verkauf/epic.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md), insbesondere Abschnitt „Transaktions-Vorgänge".

| Endpoint | Auth |
|---|---|
| `POST /api/sales` | `authenticated` |
| `POST /api/sales/undo` | `authenticated` |

Die Artikel-Erkennung beim Scannen läuft über `GET /api/articles/by-number/{number}` ([`articles.md`](articles.md)).

---

## 1. `POST /api/sales`

```
POST /api/sales
{ "articleIds": ["e5b2c9a4", "d7f3a1c8", "b1c9e2f5"] }

→ 200 OK
{ "soldCount": 3, "total": 32.00, "soldAt": "2026-08-17T14:22:07Z" }

→ 409 Conflict
{ "status": 409, "errorCode": "article.not_sellable",
  "detail": "Artikel 1044 ist nicht mehr im Verkauf",
  "articleNumbers": [1044] }
```

### Was in der Transaktion passiert

An allen übergebenen Artikeln wird `soldAt` auf den Vorgangszeitpunkt gesetzt. `soldManually` bleibt `false` — es kennzeichnet ausschließlich Verkäufe **ohne** Kassenvorgang ([`articles.md`](articles.md) Abschnitt 5).

**Entweder alle oder keiner.** Ein halb gebuchter Kassenvorgang ist nicht mehr zu reparieren, wenn der Kunde bereits gegangen ist.

### Erneute Statusprüfung

Der Endpoint prüft für jeden Artikel, dass er verkäuflich ist (`releasedAt` gesetzt, `soldAt` und `returnedAt` leer) und dass sein Verkäufer nicht abgerechnet ist.

**Die Abrechnungsprüfung ist eine Absicherung, kein regulärer Pfad:** Sie kann normalerweise nicht auslösen, weil Abrechnen gesperrt ist, solange ein Artikel im Verkauf steht — ein verkäuflicher Artikel eines abgerechneten Verkäufers ist damit ausgeschlossen. Erreichbar wird der Fall nur, wenn ein Admin über das Artikelstatus-Popup Zeitstempel von Hand verdreht hat ([`articles.md`](articles.md)). Sie bleibt trotzdem im Vertrag: Genau solche Handkorrekturen sind der Grund, warum vor dem Buchen erneut geprüft wird. Ist einer davon nicht mehr verkäuflich, wird der **ganze** Vorgang abgelehnt und die betroffene Nummer genannt — damit die Kasse weiß, welchen Artikel sie aus dem Korb nehmen muss.

Der Grund für die zweite Prüfung: Der Scan liegt bei einem großen Warenkorb Minuten vor dem Buchen.

### Was nicht übertragen wird

„Betrag erhalten" und „Rückgeld" sind **nicht** Teil des Requests und werden nicht gespeichert. Der Umsatz steht ohnehin fest — er ist die Summe der Preise der Artikel mit `soldAt`. `total` in der Antwort dient nur der Anzeige und wird nicht persistiert.

**Es gibt keine Kassenvorgang-Entität.** Eine Vorgangs-Tabelle wäre eine zweite Wahrheit über denselben Umsatz und läuft auseinander, sobald ein Admin einen Zeitstempel korrigiert. Begründung → [Epic_Verkauf](../epics/Epic_Verkauf/epic.md) Abschnitt 3.

---

## 2. `POST /api/sales/undo`

```
POST /api/sales/undo
{ "articleIds": ["e5b2c9a4", "d7f3a1c8", "b1c9e2f5"] }

→ 204 No Content
→ 409 Conflict   errorCode: settlement.locked
```

Setzt `soldAt` der übergebenen Artikel zurück. **Auch für Kassenpersonal**, weil es der eigene Vorgang der letzten Sekunden ist — der häufigste Fall an einer Basar-Kasse: Der Kunde legt doch etwas zurück, oder ein Artikel wurde zu viel gescannt.

**Sitzungsgebunden im Frontend:** Der Storno-Button erscheint direkt nach einer Buchung und verschwindet beim nächsten Scan; die Artikel-IDs hält das Frontend im Speicher. Nach einem Reload ist Korrigieren wieder Admin-Sache über `PUT /api/articles/{id}/timestamps`.

Der Endpoint selbst prüft nur die Sperren: Ist der Verkäufer abgerechnet, wird abgelehnt (`409`). Eine serverseitige „letzter Vorgang"-Logik gibt es nicht — sie bräuchte genau die Vorgangs-Entität, die bewusst nicht existiert.

**Die Artikel gehen nicht in den Warenkorb zurück.** Die Kasse scannt neu, was tatsächlich mitgeht; sonst wird aus „einen Artikel zurücklegen" ein Korb, den niemand mehr geprüft hat.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #verkauf #kasse #transaktion #storno
