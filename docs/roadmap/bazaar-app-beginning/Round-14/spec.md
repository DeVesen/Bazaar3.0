---
round: Round-14
status: geklärt
---

# Spec: Round 14 — Verkäufer-Stammdaten

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Verkaeufer, Abschnitte 1–5 und 7 (Filter-Panel,
Status-Definition, Verkäufer-Karte, Bearbeiten, Detail-Modal, Backend/API) — **ohne**
Abschnitt 6 (Artikel-Freigeben-Popup/`POST /api/release`), der laut round.md ein
eigenes, späteres Häppchen ist.

### Bewusst offener Punkt (mit Nutzer abgestimmt, 2026-09-17): Artikel-Kopplung

Deutlich stärker als bei Marken/Kategorien/Verkäufer-Typen (Round-11–13) hängt fast die
gesamte Karten-/Detail-Darstellung an der Artikel-Entität, die erst ab
[Round-15](../Round-15/round.md) existiert: Status-Badge, alle vier Zähler des
Stats-Grids, alle drei Footer-Werte und die Artikelliste im Detail-Modal.

**Entscheidung:** Gleiches Muster wie Round-11–13 — Round-14 baut Frontend und
Backend-Struktur vollständig, die Artikel-abgeleiteten Werte laufen bis Round-15 gegen
Platzhalter-Query-Ports:
- `ISellerCardsQuery` liefert `status: "open"`, alle vier Zähler und alle drei
  Geldsummen `0`.
- `IArticlesBySellerQuery` (Detail-Modal) liefert `[]` — deckt sich zufällig exakt mit
  dem dokumentierten Leerzustand „Noch keine Artikel erfasst." ([seller-detail-modal.md](../../../components/seller-detail-modal.md)),
  also kein sichtbarer Unterschied zum späteren Zustand vor der ersten Artikelannahme.
- `IArticleCountBySellerQuery` (Löschsperre) liefert `0` — Löschsperre bis Round-15
  faktisch wirkungslos, strukturell aber vorhanden.

Round-15 muss alle drei Query-Ports real implementieren. Suche (`GET
/api/sellers/search`), Paginierung/Sortierung/Filterung der Karten-Liste und der
Settlement-Reset-Endpoint sind **davon unabhängig** und in diesem Round bereits
vollständig real (hängen nur an Verkäufer-Stammfeldern).

### Nachtrag: Rückverdrahtung Round-13

[Round-13/spec.md](../Round-13/spec.md) hat `ISellerCountBySellerTypeQuery` als
Platzhalter angelegt (`sellerCount` in `GET /api/seller-types`, Löschsperre
`seller_type.in_use`) mit dem Vermerk, Round-14 müsse die echte Implementierung
nachziehen, da hier erstmals die Seller-Tabelle entsteht. Round-14 implementiert daher
zusätzlich zum eigenen Umfang: `SellerCountBySellerTypeQuery` real gegen die
Seller-Tabelle (`COUNT(*) WHERE SellerTypeId = @id`) — die Platzhalterimplementierung
aus Round-13 wird ersetzt, nicht ergänzt.

### Doku-Hinweis: Debounce-Wert

[`filter-panel/component.md`](../../../components/filter-panel/component.md) nennt für
live/debounced Verwendungsstellen 400 ms; [`api/cross-cutting.md`](../../../requirements/bazaar-app/api/cross-cutting.md)
legt für die Haupt-App explizit **300 ms** als Code-Konstante fest (mit Begründung,
warum der ältere 800-ms-Wert nicht mehr gilt). Round-14 folgt der spezifischeren,
Haupt-App-eigenen Cross-Cutting-Regel (300 ms) — reine Doku-Inkonsistenz, keine
Nutzer-Entscheidung nötig.

### Frontend

**Feature-Ordner** `src/app/features/sellers/`:
- `pages/sellers.page.ts` — orchestriert Filter-Panel, Karten-Grid, Detail-Modal,
  Bearbeiten-Dialog.
- `data/sellers-api.ts` (`GET/POST/PUT/DELETE /api/sellers`, `GET
  /api/sellers/{id}/articles`, `DELETE /api/sellers/{id}/settlement`),
  `sellers-store.ts` (Signals — **kein** In-Memory, alles serverseitig: Suche, Status-
  Filter, Sortierung, Paginierung 60/Seite).

**Filter-Panel** (live, debounced, [filter-panel.md](../../../components/filter-panel/component.md)):
- Zeile 1: Freitext (Name, Ort) + Sortierung-Dropdown (Name Standard, Angenom.
  Warenwert, Offener Warenwert, Umsatz).
- Zeile 2: Status-Dropdown (Alle · Offen · Im Verkauf · Abgerechnet).
- „+ Neu" im Panel rechts. Aktive Filter als `p-chip` unterhalb, mit ×.
- Debounce **300 ms** (s. o.), Status-Filter löst sofort ohne Debounce aus.

**`seller-card`** (`features/sellers/components/seller-card/`, feature-lokal — nur
Haupt-App-weit verwendet, kein Cross-Feature-Bedarf):
- Dumb Component: bekommt einen fertigen Karten-Datensatz als `@Input`, rechnet nichts
  selbst (Kennzahlen 1:1 aus `GET /api/sellers`-Response, [seller-card.md](../../../components/seller-card.md)).
- Kopf (Name + Typ-Badge + Edit-/Scanner-Buttons), Adresse + `#ID`, Status-Badge (eigene
  Zeile), Stats-Grid 2×2, Footer-Grid 3 Spalten — Maße/Stile exakt nach Component-Doc.
- Scanner-Button (Kamera-Icon) öffnet in Round-14 **keinen** funktionsfähigen Dialog —
  der Freigabe-Scan-Dialog ist Abschnitt 6, explizit nicht in diesem Round. Button wird
  gerendert (Layout-Vollständigkeit der Karte), Klick zeigt vorerst nur einen
  Platzhalter-Hinweis „Freigabe folgt in einem späteren Häppchen" (kein Endpoint-Aufruf).
- Grid-Leerzustände: „Noch keine Verkäufer. Über **Einstellungen → Import** die
  Voranmeldedaten einlesen oder mit **+ Neu** einen Verkäufer anlegen." (kein Verkäufer
  vorhanden) bzw. „Keine Verkäufer für die gewählten Filter." + Button „Filter
  zurücksetzen" (aktiver Filter ohne Treffer).
- Status-Badge-Klick → Popup mit Abrechnungs-Zeitstempel (für beide Rollen sichtbar);
  Zurücksetzen-Button nur Admin, mit Bestätigungsdialog „Auszahlung von ‹Betrag› vom
  ‹Zeitstempel› wird verworfen" → `DELETE /api/sellers/{id}/settlement`.
- Kartenklick (außerhalb Buttons/Badge) → Detail-Modal.

**`verkaeufer-dialog`** (`features/sellers/components/verkaeufer-dialog/`, eigene Datei
— **nicht** die Voranmelde-App-Variante, siehe [verkaeufer-dialog.md](../../../components/verkaeufer-dialog.md)):
- Panels Personendaten (Vorname*, Nachname*, Anschrift, PLZ, Ort), Kontakt (Telefon,
  E-Mail*), Konditionen (Verkäufer-Typ*, Gebühr/Stück, Provision).
- Konditionsfelder schreibgeschützt bei Rolle Kassenpersonal.
- Typwechsel → Bestätigungsdialog mit konkreten alten/neuen Werten (Frontend liest die
  Zielwerte des neu gewählten Typs aus dem in Round-13 geladenen Typen-Cache und sendet
  sie im `PUT`-Body mit — der Server übernimmt nur, prüft aber die Admin-Rolle für diese
  beiden Felder).
- Vorbelegung neuer Verkäufer: Typ mit dem höchsten `sellerCount` (aus Round-13, bereits
  real, unabhängig von Artikeln), bleibt änderbar.
- Löschen-Button (danger, links im Footer), nur Admin, Bestätigungsdialog; `409` zeigt
  die Artikel-Anzahl aus `detail` im Dialogtext (in Round-14 nie ausgelöst, s. o.).
- Kein Panel „Sonstiges"/Admin-Rechte-Toggle (Verkäufer sind keine Benutzer dieser App).

**`seller-detail-modal`** (`features/sellers/components/seller-detail-modal/`,
feature-lokal): Kopf (Name/Typ-Badge/Status-Badge), Verkäufernummer im Klartext +
`qr-code` (Shared-Component aus `docs/components/qr-code/`, Inhalt = `id`),
Artikelliste (Nummer/Bezeichnung/Preis/Status, nicht paginiert) über `GET
/api/sellers/{id}/articles` — bis Round-15 immer `[]`. Rein lesend, keine Aktionen.

### Backend

**Domain** (`Bazaar.Domain/Seller/`):
- `Seller`-Aggregate: `Id` (8 Zeichen, `IIdGenerator`), `FirstName`, `LastName`
  (Pflicht), `Address?`, `PostalCode?`, `City?`, `Phone?` (optional), `Email`
  (Pflicht, kein Login), `SellerTypeId` (Pflicht), `SalesCommission`, `FeePerItem`
  (eigene, überschreibbare Felder — nicht vom Typ abgeleitet), `IntakeFeePaid`
  (Default `0`), `SettledAt?`, `PayoutAmount?`.
- Port `ISellerRepository` in `Domain/Ports/` (`Add`, `GetById`, `Update`, `Remove`) —
  kein generisches `IRepository<T>`.

**Application** (`Bazaar.Application/Sellers/`):
- `GetSellerCardsHandler` (`GET /api/sellers`) — Query-Port `ISellerCardsQuery`,
  Parameter `q`/`status`/`sort`/`page`/`pageSize` (60 Default), Response-Hülle
  `{items, totalCount, page, pageSize}` nach [cross-cutting.md §6](../../../requirements/bazaar-app/api/cross-cutting.md).
  Bis Round-15: `status` konstant `"open"`, `articleCount`/`releasedCount`/
  `soldCount`/`returnedCount`/`acceptedValue`/`openValue`/`revenue` konstant `0`.
- `SearchSellersHandler` (`GET /api/sellers/search`) — eigener, **echt
  implementierter** `ISellerSearchQuery`: `ILIKE`, Teilwort, Token-Zerlegung
  (Vorname/Nachname getrennt), leeres `q` liefert alle, nicht paginiert.
- `CreateSellerHandler` — lädt den `SellerType` (Round-13, `ISellerTypeRepository`) zu
  `sellerTypeId` und belegt `SalesCommission`/`FeePerItem` daraus; Request akzeptiert
  diese beiden Felder **nicht**. `intakeFeePaid = 0`, `payoutAmount`/`settledAt` leer.
- `UpdateSellerHandler` — Stammdaten aktualisieren. `SalesCommission`/`FeePerItem` aus
  dem Request wirken **nur** mit Rolle `admin` (sonst `403
  seller.conditions_admin_only` statt stillem Verwerfen). Ist `SettledAt` gesetzt, sind
  **alle** Felder gesperrt (`409 settlement.locked`).
- `DeleteSellerHandler` — `409 seller.has_articles` (mit Artikel-Anzahl in `detail`),
  sobald `IArticleCountBySellerQuery` > 0 (Platzhalter `0` bis Round-15).
- `GetSellerArticlesHandler` (`GET /api/sellers/{id}/articles`) — `IArticlesBySellerQuery`,
  Platzhalter liefert `[]` bis Round-15.
- `ResetSellerSettlementHandler` (`DELETE /api/sellers/{id}/settlement`) — setzt
  `SettledAt`/`PayoutAmount` auf `null`; `404 settlement.not_settled` falls bereits
  `null`. **Vollständig real**, unabhängig von Artikeln.
- FluentValidation: `firstName`/`lastName`/`email`/`sellerTypeId` Pflicht bei
  `CreateSellerCommand`.

**Infrastructure**:
- `SellerRepository : ISellerRepository` (EF Core, `IEntityTypeConfiguration<Seller>`).
- `SellerSearchQuery` — real implementiert (Suchregeln nach [cross-cutting.md §6](../../../requirements/bazaar-app/api/cross-cutting.md)).
- `SellerCardsQuery`, `ArticlesBySellerQuery`, `ArticleCountBySellerQuery` —
  Platzhalterimplementierungen mit Kommentar-Verweis auf Round-15 (Zähler/Werte/Liste
  konstant `0`/`[]`, Suche/Sortierung/Paginierung der Karten-Liste bereits real gegen
  Seller-Stammfelder).

**Api** (`Bazaar.Api/Features/Sellers/`):
- `GET /api/sellers`, `GET /api/sellers/search`, `POST /api/sellers`,
  `PUT/DELETE /api/sellers/{id}`, `GET /api/sellers/{id}/articles` — alle
  `authenticated`; `DELETE /api/sellers/{id}/settlement` — `admin`. DTOs exakt nach
  [`api/sellers.md`](../../../requirements/bazaar-app/api/sellers.md) und
  [`api/settlement.md`](../../../requirements/bazaar-app/api/settlement.md) Abschnitt 4.
- `errorCode`: `seller.has_articles` (409), `seller.conditions_admin_only` (403),
  `settlement.locked` (409), `settlement.not_settled` (404) — bereits katalogisiert.

### Akzeptanzkriterien

Epic_Verkaeufer AC-1 bis AC-10 — mit der oben dokumentierten Einschränkung, dass die
Artikel-abgeleiteten Anteile von AC-5 (Artikelliste im Detail-Modal), AC-7 (Aggregate
aus einer Abfrage — strukturell erfüllt, Werte bis Round-15 konstant) und AC-9
(Löschsperre) bis Round-15 nicht wirksam sind. **AC-11** (Freigeben-Dialog zeigt nur
`releasedAt = null`-Artikel) gehört zu Abschnitt 6 und damit zu einem späteren Round.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Domain-UnitTests: `Seller`-Invarianten (Pflichtfelder, optionale Felder).
- Application-UnitTests: alle sieben Handler mit gemockten Ports (inkl.
  Platzhalter-Query-Ports); `SearchSellersHandler` zusätzlich mit echten
  Such-Testfällen (Token-Zerlegung, Case-Insensitivität).
- Architecture-Tests: Schichten-Regel.
- Frontend: `SellersPage`/`sellers-store`/`seller-card`/`verkaeufer-dialog`/
  `seller-detail-modal` — Vitest, Component- und Store-Tests.

### Bewusst nicht in diesem Round

Artikel-Freigeben-Popup (Scan-Dialog, Sammelscan, `POST /api/release`, Epic_Verkaeufer
Abschnitt 6) — eigenes Häppchen nach der Artikelannahme. Storno einer Abrechnung im
fachlichen Sinn (der Abrechnungsvorgang selbst) — gehört zum Abrechnung-Epic; Round-14
liefert nur den reinen Reset-Endpoint.
