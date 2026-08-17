---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Querschnitts-Regeln (Haupt-App)

Regeln, die für **alle** Endpoints gelten. Steht eine Regel hier, wird sie in den
Ressourcen-Dateien nicht wiederholt — nur dort, wo eine Ressource bewusst abweicht.

Index aller Endpoints → [`overview.md`](overview.md)

## Index
- 1. Pfad-Konventionen — Präfix, Benennung
- 2. Verb-Muster — PUT gegen POST
- 3. Auth-Stufen — public, authenticated, admin
- 4. Fehler-Responses — ProblemDetails, errorCode
- 5. Pagination und Sortierung — Listen
- 6. Transaktions-Vorgänge — atomare Endpoints
- 7. Sperrregeln — soldAt und settledAt
- 8. Persistenz-Zugriff — Repositories und Query-Ports
- Tags & Piles — Ablage

---

## 1. Pfad-Konventionen

**Basis-Präfix `/api`** — einzige Ausnahme ist `GET /health` (BPROJ-S02).

Pfade, Ressourcennamen und Feldnamen sind **englisch**, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1). Ressourcen stehen im **Plural** (`/api/sellers`, `/api/articles`), fachliche Vorgänge im **Singular** (`/api/intake`, `/api/release`).

Die Dateiaufteilung dieses Verzeichnisses folgt dem **Thema**, nicht dem Pfad: Die Settlement-Endpoints liegen unter `/api/sellers/{id}/settlement`, sind aber in [`settlement.md`](settlement.md) beschrieben, weil sie eigene Regeln zu Rundung, Sperre und Storno tragen.

---

## 2. Verb-Muster

| Fall | Muster | Beispiele |
|---|---|---|
| Zustandswechsel an **einer** Ressource | `PUT /api/<resource>/{id}/<zustand>` | `PUT /api/articles/{id}/return`, `PUT /api/articles/{id}/timestamps` |
| Fachlicher **Vorgang über mehrere Ressourcen** | `POST /api/<vorgang>` | `POST /api/intake`, `POST /api/release`, `POST /api/sales`, `POST /api/import` |
| Klassisches CRUD | `GET` / `POST` / `PUT` / `DELETE /api/<resource>[/{id}]` | `/api/brands`, `/api/sellers` |

Die Regel erklärt sich aus der Wirkung, nicht aus dem Geschmack: **Was man zweimal senden kann, ohne Schaden anzurichten, ist `PUT`.** Ein Vorgang, der Geld bewegt oder mehrere Datensätze zugleich ändert, ist `POST` und läuft in einer Transaktion (Abschnitt 6).

---

## 3. Auth-Stufen

| Stufe | Bedeutung |
|---|---|
| `public` | Kein Token nötig — nur `POST /api/auth/login` und `GET /health` |
| `authenticated` | Gültiges Access-Token, Rolle egal |
| `admin` | Access-Token mit `role`-Claim `admin`, sonst `403` |

Verbindliche Zuordnung fachlicher Bereiche → Rechte-Matrix in [`spec.md`](../spec.md) Abschnitt 4.1. Token-Aufbau und Lebensdauer → [`auth.md`](auth.md).

**Das Frontend ist die Bequemlichkeit, das Backend die Regel.** `adminGuard` verbirgt eine Route, aber jeder Endpoint prüft die Rolle selbst — ein `403` muss auch dann kommen, wenn der Request per Werkzeug abgesetzt wurde.

**Feldbezogene Rollenprüfung** gibt es an genau einer Stelle: `PUT /api/sellers/{id}` nimmt `salesCommission` und `feePerItem` nur von einem Admin an ([`sellers.md`](sellers.md)). Die übrigen Endpoints sind als Ganzes offen oder als Ganzes Admin-only.

---

## 4. Fehler-Responses

Alle Fehler folgen **RFC 9457 `ProblemDetails`** — der .NET-Standardform über `Results.Problem()` bzw. `Results.ValidationProblem()`. Kein Eigenbau-Format.

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.10",
  "title": "Conflict",
  "status": 409,
  "detail": "Marke wird noch verwendet",
  "errorCode": "brand.in_use"
}
```

### `errorCode` — für Programmlogik, nicht für Übersetzung

Jeder fachliche Fehler trägt zusätzlich zu `detail` das Extension-Member **`errorCode`** (kleingeschrieben, punktgetrennt: `brand.in_use`, `article.number_taken`, `seller.has_articles`, `settlement.locked`).

Die Haupt-App ist **einsprachig deutsch** — anders als die Voranmelde-App braucht sie `errorCode` also nicht zur Übersetzung. Der Grund hier ist ein anderer: Das Frontend muss auf bestimmte Fehler **unterschiedlich reagieren**, nicht nur eine Meldung zeigen. Beispiele:

| `errorCode` | Reaktion im Frontend |
|---|---|
| `article.number_taken` | Dialog mit neuem Nummernvorschlag, Eingaben bleiben erhalten |
| `article.not_sellable` | Betroffene Artikelnummer im Warenkorb markieren |
| `settlement.locked` | Hinweis „Abrechnung zuerst stornieren" mit Verweis auf die Verkäufer-Seite |
| `seller.has_articles` | Anzahl der Artikel aus `detail` in den Bestätigungsdialog übernehmen |

Auf `detail`-Text zu prüfen wäre die Alternative — abgelehnt, weil dann jede Textänderung die Frontend-Logik bricht.

**Erzeugt** wird die Abbildung an genau einem Ort: dem globalen `IExceptionHandler` in `Bazaar.Api` (BPROJ-S02 AC-4). Handler und Domäne werfen Exceptions, sie bauen keine HTTP-Antworten.

**Validierungsfehler** zusätzlich mit `errors` (Feldname → Meldungen), Schlüssel = **englischer DTO-Feldname**; das Frontend rendert sie unter dem jeweiligen Feld.

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "price": ["Preis muss größer als 0 sein"],
    "commissionRate": ["Provision muss zwischen 0 und 100 liegen"]
  }
}
```

**Zuständigkeit:** Formatprüfungen (Pflichtfeld, Wertebereich) laufen über FluentValidation im Endpoint-Filter und ergeben `400`. Fachliche Invarianten (Duplikat, Löschsperre, Statuskonflikt) wirft die Domäne und ergeben `409`.

### Status-Code-Katalog

| Code | Wann |
|---|---|
| `200` | Erfolg mit Antwortkörper |
| `201` | Ressource angelegt, `Location`-Header gesetzt |
| `204` | Erfolg ohne Antwortkörper (Zustandswechsel, Löschen) |
| `400` | Formatfehler, Wertebereich — mit `errors` |
| `401` | Kein oder abgelaufenes Token |
| `403` | Token gültig, Rolle reicht nicht |
| `404` | Ressource existiert nicht |
| `409` | Fachlicher Konflikt: Duplikat, Löschsperre, Statuskonflikt, Sperre nach Verkauf oder Abrechnung |

---

## 5. Pagination und Sortierung

**Paginiert** sind ausschließlich die potenziell großen Listen: `GET /api/articles` (50 je Seite) und `GET /api/sellers` (60 je Seite — Karten-Grid, siehe [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md)).

| Query-Parameter | Typ | Default |
|---|---|---|
| `page` | int, 1-basiert | `1` |
| `pageSize` | int | epic-spezifisch (50 bzw. 60) |

Response-Hülle:

```json
{
  "items": [ /* ... */ ],
  "totalCount": 137,
  "page": 1,
  "pageSize": 50
}
```

**Bewusst nicht paginiert** — vollständige Liste, dient auch als Dropdown-Quelle, Datenmenge zweistellig: `GET /api/brands`, `GET /api/categories`, `GET /api/seller-types`, `GET /api/users`, `GET /api/sellers/search`, `GET /api/sellers/{id}/articles`.

### Sortierung

Paginierte Listen sortieren **serverseitig** — clientseitiges Sortieren einer einzelnen Seite wäre falsch. Multi-Sort per Shift+Klick, daher ein Parameter mit Prioritätsreihenfolge:

```
?sort=number:asc,price:desc
```

Erstes Feld = höchste Priorität, Richtung `asc` oder `desc`. Ohne `sort` gilt die im jeweiligen Epic festgelegte Default-Sortierung.

Auch **Suche und Filter** laufen serverseitig, aus demselben Grund: Ein Filter über eine einzelne Seite filtert die falsche Menge.

---

## 6. Transaktions-Vorgänge

Vier Endpoints ändern mehrere Datensätze zugleich und laufen jeweils in **einer** Transaktion — entweder alles oder nichts:

| Endpoint | Umfang | Warum atomar |
|---|---|---|
| [`POST /api/intake`](intake.md) | Artikel anlegen, Zeitstempel setzen, `intakeFeePaid` erhöhen | Der Verkäufer hat bezahlt und geht — halb gebucht ist nicht reparierbar |
| [`POST /api/release`](release.md) | `releasedAt` an N Artikeln, `intakeFeePaid` erhöhen | Abbruch nach 30 Scans hinterließe freigegebene Artikel ohne kassierte Gebühr |
| [`POST /api/sales`](sales.md) | `soldAt` an N Artikeln | Halb gebuchter Kassenvorgang bei bereits gegangenem Kunden |
| [`POST /api/sellers/{id}/settlement`](settlement.md) | `settledAt`, `payoutAmount`, nicht abgegebene Artikel entfernen | Ausgezahltes Geld ohne vollständigen Abschluss |
| [`POST /api/import`](import.md) | Verkäufer, Artikel, Stammdaten | Halber Import am Basar-Morgen lässt keinen sauberen Neustart zu |

**Kein Endpoint pro Einzelsatz** in diesen Fällen: Eine Schleife aus N Requests bricht in der Mitte ab und hinterlässt genau den Zustand, den die Transaktion verhindert.

Alle diese Endpoints **prüfen ihre Vorbedingungen erneut**, bevor sie schreiben. Zwischen dem Lesen im Frontend und dem Absenden liegen bei einem großen Warenkorb Minuten.

---

## 7. Sperrregeln

Eine Regel, fünf Endpoints. Verbindliche Beschreibung → [Epic_Artikel](../epics/Epic_Artikel/epic.md) Abschnitt 4.

| Zustand | Gesperrt | `errorCode` |
|---|---|---|
| `soldAt` gesetzt | `price` am Artikel; Löschen des Artikels | `article.sold` |
| Verkäufer abgerechnet (`settledAt` gesetzt) | **alle** Felder und Zeitstempel seiner Artikel | `settlement.locked` |

Betroffen sind `PUT /api/articles/{id}`, `PUT /api/articles/{id}/timestamps`, `PUT /api/articles/{id}/return`, `DELETE /api/articles/{id}` und `POST /api/sales`.

Gelöst wird eine Sperre ausschließlich durch Stornieren — des Verkaufs über das Artikelstatus-Popup, der Abrechnung über [`DELETE /api/sellers/{id}/settlement`](settlement.md). Damit bleibt eine ausgezahlte Summe nachvollziehbar.

---

## 8. Persistenz-Zugriff

Aus [`spec.md`](../spec.md) Abschnitt 7.0.1, hier nur als Erinnerung für den Vertrag:

- **Ein Repository pro Aggregate**, Interfaces in `Domain/Ports/` — kein generisches `IRepository<T>`
- **Kein `IQueryable`** über die Portgrenze
- **Aggregierte Sichten** laufen über eigene **Query-Ports** mit eigenem Read-Model, nicht über erweiterte Repositories. Das betrifft `GET /api/sellers` (Karten-Aggregate), `GET /api/sellers/{id}/settlement`, `GET /api/statistics`

Ein Read-Model ist **keine** Entität: Es wird nur gelesen, hat keine Invarianten und darf Felder aus mehreren Aggregaten zusammenfassen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #querschnitt #problemdetails #pagination #transaktion #auth
