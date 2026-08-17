---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Querschnitts-Regeln (Voranmelde-App)

Verbindliche Konventionen für **alle** Endpoints der Voranmelde-App. Die
ressourcenspezifischen Dateien in diesem Verzeichnis verweisen hierher statt
diese Regeln zu wiederholen.

**Backend:** .NET 9 Minimal API, **hexagonal** in vier Projekten
(`Bazaar.Domain` / `.Application` / `.Infrastructure` / `.Api`) — Feature-Ordner nur
innerhalb von `Application` und `Api`, ein Handler pro Use Case
(siehe [VPROJ-S02](../epics/Epic_Projektanlage/stories/VPROJ-S02-dotnet-api-anlegen.md)).

**Sprache des Contracts:** Alle Feldnamen in Request und Response sind **englisch**
(`fromNumber`, `sellerTypeId`, `price`) — ebenso die Schlüssel im `errors`-Dictionary.
Die Prosa dieser Doku bleibt deutsch. Damit braucht kein DTO `[JsonPropertyName]`.

---

## 1. Pfad-Konventionen

| Regel | Wert |
|---|---|
| Basis-Präfix | `/api` (Ausnahme: `/health`) |
| Pfad-Parameter | `{id}` — Minimal-API-Routensyntax, **nicht** `:id` |
| Ressourcen-Namen | englisch, Plural, kebab-case (`seller-types`, nicht `sellerTypes`) |
| Eigene Daten des eingeloggten Nutzers | Suffix `/mine` (`/api/articles/mine`, `/api/blocks/mine`) — Ausnahme `/api/profile`, das per Definition immer die eigene Ressource ist |
| Öffentliche Endpoints | Präfix `/api/public/` |

---

## 2. Auth-Stufen

Jede Endpoint-Tabelle in diesem Verzeichnis führt eine Spalte **Auth** mit genau
einem dieser drei Werte:

| Stufe | Bedeutung |
|---|---|
| `public` | Kein Token nötig. Nur `/health`, `/api/auth/*`, `/api/public/*`. |
| `authenticated` | Gültiges Access-Token nötig, Rolle egal (`admin` oder `seller`). |
| `admin` | Gültiges Access-Token **und** `role`-Claim = `admin`. Sonst `403`. |

**Header:** `Authorization: Bearer <accessToken>`

**Token-Details** (Lebensdauer, Claims, Storage-Keys) → [`auth.md`](auth.md).

**Interceptor-Ausnahmen (Frontend):** Für Requests an `/health`, `/api/auth/*`
und `/api/public/*` setzt der JWT-Interceptor **keinen** `Authorization`-Header
(siehe [VSHELL-S04](../epics/Epic_App_Shell/stories/VSHELL-S04-auth-infrastruktur.md) AC-4).

**401-Verhalten (Frontend):** Der Interceptor versucht bei HTTP 401 automatisch
einen `POST /api/auth/refresh` und wiederholt den Original-Request. Schlägt der
Refresh fehl → `logout()` + Navigation nach `/login` (VSHELL-S04 AC-10/AC-11).

---

## 3. Fehler-Responses

Alle Fehler folgen **RFC 9457 `ProblemDetails`** — der .NET-Standardform über
`Results.Problem()` bzw. `Results.ValidationProblem()`. Kein Eigenbau-Format.

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.10",
  "title": "Conflict",
  "status": 409,
  "detail": "Kategorie wird noch verwendet",
  "errorCode": "category.in_use"
}
```

### `errorCode` — Übersetzbarkeit

Jeder fachliche Fehler trägt zusätzlich zu `detail` das Extension-Member
**`errorCode`** (kleingeschrieben, punktgetrennt: `category.in_use`,
`email.already_registered`, `block.overlap`, `registration.not_enabled`).

Grund: Die App ist zweisprachig (DE/EN), `detail` ist deutscher Klartext. Das
Frontend zeigt bevorzugt die über `errorCode` aufgelöste ngx-translate-Meldung und
fällt auf `detail` zurück, wenn kein Key existiert. Der in den Akzeptanzkriterien
festgeschriebene deutsche Text ist damit der Wert des `de.json`-Eintrags.

Lokalisierung im Backend (`Accept-Language`) wäre die Alternative — abgelehnt, weil
sie ein zweites Übersetzungssystem für dieselbe App bedeutet.

**Erzeugt** wird die gesamte Abbildung an genau einem Ort: dem globalen
`IExceptionHandler` in `Bazaar.Api` (VPROJ-S02 AC-2c), der Domain-Exception-Typen auf
Status-Code + `errorCode` abbildet. Handler und Domäne werfen Exceptions, sie bauen
keine HTTP-Antworten.

**Validierungsfehler** zusätzlich mit `errors` (Feldname → Meldungen), Schlüssel =
**englischer DTO-Feldname**. Das Frontend rendert diese direkt als Fehlermeldung
unter dem jeweiligen Feld (Muster: Epic_Verkaeufer AC-4, Epic_Profil AC-3):

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "price": ["Preis muss größer als 0 sein"],
    "email": ["E-Mail-Format ungültig"]
  }
}
```

**Zuständigkeit:** Formatprüfungen (Pflichtfeld, E-Mail-Form, `price > 0`,
Passwortstärke) laufen über FluentValidation im `ValidationFilter<TRequest>` → `400`.
**Invarianten** (Nummernblock-Überschneidung, E-Mail vergeben, Referenz noch in
Benutzung) gehören in Domäne bzw. Handler und werden als Domain-Exception geworfen →
`409`. Kein Handler prüft Feldformate, kein Validator kennt die Datenbank.

**Fachliche Konfliktmeldungen** transportieren ihren Klartext in `detail` — der
Text ist der, den das jeweilige Akzeptanzkriterium vorschreibt.

### Status-Code-Katalog

| Code | Verwendung |
|---|---|
| `200` | Erfolgreiches `GET`, `PUT` |
| `201` | Erfolgreiches `POST` mit neuer Ressource (Body = angelegte Ressource) |
| `204` | Erfolgreiches `DELETE` |
| `400` | Validierungsfehler (mit `errors`) |
| `401` | Kein/ungültiges/abgelaufenes Token |
| `403` | Token gültig, Rolle reicht nicht (`admin`-Endpoint als `seller`) |
| `404` | Ressource existiert nicht **oder** gehört einem anderen Verkäufer (siehe Abschnitt 6) |
| `409` | Fachlicher Konflikt (Referenz noch in Benutzung, Nummernbereich überschneidet sich, E-Mail vergeben) |

---

## 4. Pagination

**Paginiert** sind ausschließlich die potenziell großen Listen:
`GET /api/articles`, `GET /api/articles/mine`, `GET /api/sellers`.

| Query-Parameter | Typ | Default |
|---|---|---|
| `page` | int, 1-basiert | `1` |
| `pageSize` | int | `25` |

Response-Hülle:

```json
{
  "items": [ /* ... */ ],
  "totalCount": 137,
  "page": 1,
  "pageSize": 25
}
```

Passt direkt auf den `lazy`-Modus der PrimeNG-`p-table`
(siehe [Table](../../../components/table/component.md)).

**Bewusst nicht paginiert** (vollständige Liste, dient auch als Dropdown-Quelle,
Datenmenge zweistellig): `GET /api/brands`, `GET /api/categories`,
`GET /api/seller-types`, `GET /api/blocks/mine`.

### Sortierung

Paginierte Listen sortieren **serverseitig** — clientseitiges Sortieren einer
einzelnen Seite wäre falsch. Die Tabellen erlauben Multi-Sort per Shift+Klick,
daher ein Parameter mit Prioritätsreihenfolge:

```
?sort=number:asc,price:desc
```

Erstes Feld = höchste Priorität. Richtung `asc` \| `desc`. Mappt direkt auf
`multiSortMeta` der PrimeNG-`p-table`. Ohne `sort` gilt die im jeweiligen Epic
festgelegte Default-Sortierung.

---

## 5. Löschen

**Hard-Delete durchgehend.** Kein Soft-Delete, kein Gelöscht-Flag — die
Entitäten in [`entities/`](../entities/overview.md) sehen kein solches Feld vor. Die
Voranmelde-App ist Vorstufe; die dauerhafte Datenhaltung passiert nach dem
Export in der Haupt-App.

Konsequenz: Gelöschte Datensätze sind endgültig weg, `email`-Unique-Checks und
Listen-Queries brauchen keine Zusatzfilter.

**Referenzschutz:** Ein Löschen, das eine bestehende Referenz brechen würde,
liefert `409` mit Klartext in `detail` statt zu kaskadieren. Ausnahmen mit
bewusster Kaskade sind einzeln dokumentiert
(`DELETE /api/profile`, `DELETE /api/sellers/{id}` → siehe [`sellers.md`](sellers.md)).

---

### Persistenz-Zugriff

Alle Listen- und Detail-Zugriffe laufen über **Repositories pro Aggregate**
(`ISellerRepository`, `IArticleRepository`, `INumberBlockRepository`,
`IMasterDataRepository`, `ISettingsRepository`) — Interfaces in `Bazaar.Domain/Ports/`,
Implementierung in `Bazaar.Infrastructure`. Kein generisches `IRepository<T>`, kein
`IQueryable` über die Port-Grenze.

**Ausnahme Read-Models:** `GET /api/home/seller`, `GET /api/home/admin` und
`GET /api/export` lesen über eigene Query-Ports (`IHomeQueries`, `IExportQuery`) mit
direktem EF-/SQL-Zugriff im Adapter. Kennzahlen und Export-Sichten laden keine
Aggregate.

## 6. Ownership-Prüfung

Endpoints auf eigenen Daten (`/mine`, `/api/profile`, `PUT`/`DELETE` auf
`/api/articles/{id}`) prüfen die Zugehörigkeit **serverseitig** anhand des
`sub`-Claims — nicht clientseitig gefiltert.

Fremde Ressourcen liefern `404`, nicht `403` — der Aufrufer soll nicht erfahren,
ob die ID existiert.

---

## 7. UI-Feedback bei Schreib-Operationen

Standardmuster für alle `POST`/`PUT` (Epics verlinken hierher statt es zu
wiederholen):

| Fall | Verhalten |
|---|---|
| Erfolg | [Toast](../../../components/toast/component.md) „✓ &lt;Entität&gt; gespeichert" |
| Fehler | Eingegebene Werte bleiben im Formular erhalten; Meldung „&lt;Entität&gt; konnte nicht gespeichert werden" in einer Error-InfoArea |
| Löschen | Vorab-Bestätigung über [Confirmdialog](../../../components/confirmdialog/component.md) (`ConfirmationService`) |

**Bewusste Abweichungen** bleiben im jeweiligen Epic dokumentiert — z. B.
Epic_Export AC-4 (Info-InfoArea mit Bilanz, kein Auto-Dismiss).

---

## 8. Sonstiges

| Thema | Regel |
|---|---|
| Datums-/Zeitformat | ISO 8601 mit Offset, durchgehend in Request und Response |
| IDs | string, 8 Zeichen, backend-generiert (siehe `entities/overview.md`) |
| Geldbeträge | Dezimalzahl mit 2 Nachkommastellen, Punkt als Trennzeichen im JSON (Locale-Formatierung ist reine Frontend-Sache) |
| CORS | Angular Dev `http://localhost:4200`; Production-Origin über `CORS_ALLOWED_ORIGIN` (VPROJ-S02 AC-3) |
| Clickjacking | `frame-ancestors`-Freigabe **ausschließlich** für die Route `/embed/countdown`; alle übrigen Routen `DENY`/`same-origin` (Epic_Countdown_Widget Abschnitt 4) |
| Secrets | Ausschließlich aus Environment-Variablen/User Secrets (VPROJ-S02 AC-7) |

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #cross-cutting #problemdetails #pagination #auth #konvention
