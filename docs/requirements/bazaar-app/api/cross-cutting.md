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
- 5. Datentypen im Contract — Zeitstempel, Geld, IDs
- 6. Pagination, Suche und Sortierung — Listen
- 7. Transaktions-Vorgänge — atomare Endpoints
- 8. Sperrregeln — soldAt und settledAt
- 9. Persistenz-Zugriff — Repositories und Query-Ports
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

Die Regel erklärt sich aus der Wirkung, nicht aus dem Geschmack: **Was man zweimal senden kann, ohne Schaden anzurichten, ist `PUT`.** Ein Vorgang, der Geld bewegt oder mehrere Datensätze zugleich ändert, ist `POST` und läuft in einer Transaktion (Abschnitt „Transaktions-Vorgänge").

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

### Katalog aller `errorCode`-Werte

Vollständig und abschließend. Die Epics behalten ihre Akzeptanzkriterien, verweisen für den **Wortlaut** aber hierher — zwei Quellen für dieselbe Meldung driften garantiert.

Beim Hinzufügen eines Fehlers zuerst hier nachsehen: Ein Code, den es schon gibt, wird wiederverwendet, nicht variiert.

| `errorCode` | Status | `detail` (deutsch) | Ausgelöst von |
|---|---|---|---|
| `auth.invalid_credentials` | 401 | Ungültige Anmeldedaten | [`auth.md`](auth.md) — Login, Passwortwechsel |
| `article.number_unknown` | 404 | Artikelnummer nicht bekannt | [`articles.md`](articles.md) — `by-number` |
| `article.number_taken` | 409 | Artikelnummer *n* ist inzwischen vergeben | [`intake.md`](intake.md) |
| `article.sold` | 409 | Artikel ist verkauft — Verkauf zuerst stornieren | [`articles.md`](articles.md) (Preis, Löschen), [`settlement.md`](settlement.md) (Rückgabe) |
| `article.sold_and_returned` | 409 | Artikel kann nicht gleichzeitig verkauft und zurückgegeben sein | [`articles.md`](articles.md) — Zeitstempel |
| `article.not_sellable` | 409 | Artikel *n* ist nicht mehr im Verkauf | [`sales.md`](sales.md) |
| `article.not_releasable` | 409 | Artikel *n* ist bereits freigegeben | [`release.md`](release.md) |
| `brand.name_taken` | 409 | Marke existiert bereits | [`master-data.md`](master-data.md) |
| `brand.in_use` | 409 | Marke wird noch verwendet | [`master-data.md`](master-data.md) |
| `category.name_taken` | 409 | Kategorie existiert bereits | [`master-data.md`](master-data.md) |
| `category.in_use` | 409 | Kategorie wird noch verwendet | [`master-data.md`](master-data.md) |
| `seller.has_articles` | 409 | Verkäufer hat noch *n* Artikel | [`sellers.md`](sellers.md) — Löschen |
| `seller.conditions_admin_only` | 403 | Konditionen dürfen nur von einem Admin geändert werden | [`sellers.md`](sellers.md) |
| `seller_type.name_taken` | 409 | Verkäufer-Typ existiert bereits | [`seller-types.md`](seller-types.md) |
| `seller_type.in_use` | 409 | Typ ist noch *n* Verkäufern zugewiesen | [`seller-types.md`](seller-types.md) |
| `settlement.locked` | 409 | Verkäufer ist abgerechnet — Abrechnung zuerst stornieren | [`articles.md`](articles.md), [`sales.md`](sales.md), [`sellers.md`](sellers.md), [`settlement.md`](settlement.md) |
| `settlement.articles_open` | 409 | *n* Artikel sind noch im Verkauf | [`settlement.md`](settlement.md) |
| `settlement.already_settled` | 409 | Verkäufer ist bereits abgerechnet | [`settlement.md`](settlement.md) |
| `settlement.not_settled` | 404 | Verkäufer ist nicht abgerechnet | [`settlement.md`](settlement.md) — Storno |
| `user.username_taken` | 409 | Benutzername ist bereits vergeben | [`users.md`](users.md) |
| `user.last_admin` | 409 | Das letzte Admin-Konto kann nicht entfernt werden | [`users.md`](users.md) — Löschen, Rollenwechsel |
| `import.invalid_format` | 400 | Datei entspricht nicht dem erwarteten Schema | [`import.md`](import.md) |
| `import.unmapped_seller_type` | 409 | Verkäufer-Typ „*x*" ist nicht zugeordnet | [`import.md`](import.md) |

**`*n*` und `*x*`** stehen für Werte, die der Server einsetzt — Anzahl bzw. Name. Sie gehören in `detail`, damit die Meldung ohne zweiten Request handlungsleitend ist; das Frontend übernimmt sie in seine Dialoge.

**Wiederverwendung ist gewollt:** `article.sold` und `settlement.locked` treten an mehreren Endpoints auf, weil es dieselbe Situation ist. Ein eigener Code je Aufrufstelle würde das Frontend zwingen, dieselbe Reaktion mehrfach zu verdrahten.

**Namensregel — gilt in beiden Apps der Suite:**

| Fall | Muster | Beispiele |
|---|---|---|
| Wert schon von einem anderen Datensatz belegt | `<resource>.<feld>_taken` | `user.username_taken`, `brand.name_taken`, `article.number_taken` |
| Löschen scheitert an bestehenden Referenzen | `<resource>.in_use` | `brand.in_use`, `seller_type.in_use` |
| Alles Übrige — Zustand oder verbotene Aktion | `<resource>.<zustand>` bzw. `<resource>.<aktion>_<grund>` | `article.sold`, `settlement.locked`, `user.last_admin` |

`<resource>` ist die API-Ressourcen-Familie in snake_case, nicht der Entitätsname.

**Ein Verb für Eindeutigkeitskonflikte, nicht drei.** Bis zur Einführung der Regel hießen die Duplikat-Codes hier `brand.already_exists`, `category.already_exists` und `seller_type.already_exists`, in der Voranmelde-App zusätzlich `email.already_registered` — drei Schreibweisen für dieselbe Situation, obwohl `article.number_taken` und `user.username_taken` schon `_taken` verwendeten. `_taken` hat gewonnen, weil es in beiden Apps die Mehrheit stellte; die drei `already_exists`-Codes wurden umbenannt.

Die Regel ist bewusst in **beiden** App-Katalogen ausgeschrieben statt in einer gemeinsamen Datei: Ein App-Verzeichnis muss vollständig für sich stehen ([`advance-registration/api/cross-cutting.md`](../../advance-registration/api/cross-cutting.md) Abschnitt „Fehler-Responses"). Die Codes selbst überqueren die App-Grenze nirgends — der Import liest den Export-JSON, und der enthält keine Fehlercodes —, deshalb bleiben die Kataloge je App abschließend, und ein Code darf in nur einer App existieren.

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

## 5. Datentypen im Contract

| Typ | Format im JSON | Regel |
|---|---|---|
| Zeitstempel | ISO 8601 mit `Z` — `"2026-08-17T14:22:07Z"` | Der Server liefert und erwartet **UTC**. Umrechnung in lokale Zeit passiert ausschließlich im Frontend |
| Geldbeträge | Zahl mit zwei Dezimalstellen — `12.00` | Punkt als Dezimaltrennzeichen (JSON), Komma erst in der Anzeige |
| Prozentsätze | Zahl mit bis zu zwei Dezimalstellen — `12.5` | Wertebereich 0–100 |
| IDs | String, 8 Zeichen, alphanumerisch, **case-sensitive** | siehe [`entities/overview.md`](../entities/overview.md) |

Speicherung, Präzision und Feldlängen stehen verbindlich in
[`entities/overview.md`](../entities/overview.md) — hier steht nur, wie sie über die Leitung gehen.

**Feldlängen werden serverseitig geprüft** und ergeben `400` mit `errors`-Dictionary, nicht `409`: Eine zu lange Eingabe ist ein Formatfehler, kein fachlicher Konflikt.

---

## 6. Pagination, Suche und Sortierung

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

### Suchverhalten

Gilt für **jede** Freitextsuche der App — `GET /api/sellers`, `GET /api/sellers/search`, `GET /api/articles`.

| Regel | Festlegung |
|---|---|
| Groß-/Kleinschreibung | **ignoriert** (`ILIKE`) |
| Umlaut-Toleranz | **keine** — „mueller" findet „Müller" nicht |
| Treffer | **Teilwort an beliebiger Stelle** (`%begriff%`), nicht nur Präfix |
| Mehrere Wörter | Eingabe an Leerzeichen zerlegt; **jedes** Token muss in **irgendeinem** der Suchfelder vorkommen |
| Mindestlänge | **keine** — leer zeigt alles, ein Zeichen filtert |
| Trimmen | ja; nur Leerzeichen gilt als leer |
| Debounce im Frontend | **300 ms** |

**Case-insensitiv ist zwingend:** PostgreSQL vergleicht mit `LIKE` case-sensitiv, und am Tablet tippt niemand Großbuchstaben.

**Keine Umlaut-Toleranz** ist eine bewusste Grenze, kein Versäumnis: Sie bräuchte die `unaccent`-Extension plus Ausdrucks-Index und würde den häufigsten Fall trotzdem nicht abdecken — `unaccent` macht aus `ü` ein `u`, nicht aus `ue` ein `ü`. Wer „Müller" nicht tippen kann, sucht „ller" oder den Vornamen; dafür genügt die Teilwortsuche.

**Teilwort statt Präfix**, weil der Index hier nichts kostet: Ein Basar hat Hunderte Verkäufer und einige Tausend Artikel — ein sequenzieller Scan ist auf dieser Menge nicht messbar. Präfixsuche wäre die Optimierung für ein Problem, das nicht existiert, und würde „ler" für „Müller" ausschließen.

**Token-Zerlegung** ist nötig, weil Vor- und Nachname getrennte Spalten sind: „anna meier" als ein Suchstring findet nichts. Mit Zerlegung finden „anna meier" und „meier anna" beide dieselbe Person.

**Keine Mindestlänge**, weil die Ergebnismenge ohnehin paginiert ist: Ein Zeichen liefert eine lange Liste, und das ist die ehrliche Antwort auf eine einbuchstabige Suche. Eine Mindestlänge von 2 würde die Liste beim ersten Tastendruck **verschwinden** und beim zweiten wiederkommen lassen — das wirkt wie ein Fehler. Zudem zeigt [`seller-search`](../../../components/seller-search/component.md) bei leerer Eingabe absichtlich alle Verkäufer; eine Mindestlänge erzeugte einen dritten Zustand zwischen „alles" und „nichts".

**300 ms Debounce**, nicht die früher in den Einstellungen stehenden 800 ms: Der alte Wert war für ein Cloud-Formular gedacht, in dem jemand in Ruhe tippt. Am Annahmetisch tippt Kassenpersonal drei Buchstaben und erwartet die Liste sofort; im LAN liegt der Roundtrip unter 20 ms. Der Wert ist eine **Code-Konstante**, kein Einstellungsparameter ([`settings.md`](settings.md)) — dokumentiert ist er hier, damit nicht jedes Suchfeld einen anderen bekommt.

**AutoComplete für Marke und Kategorie filtert clientseitig** — ohne Request und ohne Debounce. Beide Listen sind bewusst nicht paginiert, das Frontend hält sie vollständig und lädt sie einmal beim Betreten der Artikelannahme. Am Annahmetisch ist der Unterschied spürbar: Vorschläge erscheinen ohne Verzögerung, auch wenn das WLAN kurz hängt. Es gelten dieselben Regeln (case-insensitiv, Teilwort, getrimmt), nur lokal. Die **Duplikatprüfung beim Anlegen bleibt serverseitig** (`409`), weil der lokale Stand veraltet sein kann.

### Sortierung

Paginierte Listen sortieren **serverseitig** — clientseitiges Sortieren einer einzelnen Seite wäre falsch. Multi-Sort per Shift+Klick, daher ein Parameter mit Prioritätsreihenfolge:

```
?sort=number:asc,price:desc
```

Erstes Feld = höchste Priorität, Richtung `asc` oder `desc`. Ohne `sort` gilt die im jeweiligen Epic festgelegte Default-Sortierung.

Auch **Suche und Filter** laufen serverseitig, aus demselben Grund: Ein Filter über eine einzelne Seite filtert die falsche Menge.

---

## 7. Transaktions-Vorgänge

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

## 8. Sperrregeln

Eine Regel, fünf Endpoints. Verbindliche Beschreibung → [Epic_Artikel](../epics/Epic_Artikel/epic.md) Abschnitt 4.

| Zustand | Gesperrt | `errorCode` |
|---|---|---|
| `soldAt` gesetzt | `price` am Artikel; Löschen des Artikels | `article.sold` |
| Verkäufer abgerechnet (`settledAt` gesetzt) | **alle** Felder und Zeitstempel seiner Artikel | `settlement.locked` |

Betroffen sind `PUT /api/articles/{id}`, `PUT /api/articles/{id}/timestamps`, `PUT /api/articles/{id}/return`, `DELETE /api/articles/{id}` und `POST /api/sales`.

Gelöst wird eine Sperre ausschließlich durch Stornieren — des Verkaufs über das Artikelstatus-Popup, der Abrechnung über [`DELETE /api/sellers/{id}/settlement`](settlement.md). Damit bleibt eine ausgezahlte Summe nachvollziehbar.

---

## 9. Persistenz-Zugriff

Aus [`spec.md`](../spec.md) Abschnitt 7.0.1, hier nur als Erinnerung für den Vertrag:

- **Ein Repository pro Aggregate**, Interfaces in `Domain/Ports/` — kein generisches `IRepository<T>`
- **Kein `IQueryable`** über die Portgrenze
- **Aggregierte Sichten** laufen über eigene **Query-Ports** mit eigenem Read-Model, nicht über erweiterte Repositories. Das betrifft `GET /api/sellers` (Karten-Aggregate), `GET /api/sellers/{id}/settlement`, `GET /api/statistics`

Ein Read-Model ist **keine** Entität: Es wird nur gelesen, hat keine Invarianten und darf Felder aus mehreren Aggregaten zusammenfassen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #querschnitt #problemdetails #pagination #transaktion #auth
