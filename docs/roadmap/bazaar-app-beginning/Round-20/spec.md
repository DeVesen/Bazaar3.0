---
round: Round-20
status: geklärt
---

# Spec: Round 20 — Abrechnung: Verkäufer-Auswahl, Ansicht & Rückgabe

## Fein-Spezifikation

### Ziel

Erster Teil des Abrechnungs-Wizards: Verkäufer wählen, Read-Model-Ansicht mit
KPI-Kacheln und Artikelliste, Rückgabe nicht verkaufter Artikel. Der eigentliche
Abrechnen-Vorgang (Berechnung, `settledAt`, Auszahlung) folgt in
[Round-21](../Round-21/round.md).

### Frontend

**Feature-Ordner** `src/app/features/settlement/`, Route `/settlement`, als Wizard:
Selektion ausblenden → Abrechnungs-Ansicht einblenden, „← Zurück" kehrt zur Selektion
zurück. Beim Navigieren auf die Seite immer zuerst die Selektion, kein
Vorselektieren (AC-1).

**Schritt 1 — Selektion**: [`seller-search`](../../../components/seller-search/component.md)
(Round-16, wiederverwendet), `showCreateButton="false"` — **Unterschied zur
Artikelannahme:** kein Anlegen-Button, exakt ein Verkäufer muss gewählt werden.
Hinweistext „ENTER bei 1 Treffer oder direkt klicken".

**Schritt 2 — Abrechnungs-Ansicht**:
- Kopfzeile: Name + Adresse links, Buttons rechts in fester Reihenfolge „← Zurück" /
  „🖨️ Drucken" / „↩ Zurückgeben" / „✓ Abrechnen".
  - „Drucken": immer aktiv, ruft in diesem Round einen **Print-Trigger-Stub** auf
    (`printService.printSellerSummary({sellerId, phase: 'preliminary'|'final'})`) —
    reale Umsetzung erst [Round-24](../Round-24/round.md), Aufrufstelle bleibt dort
    unverändert.
  - „Zurückgeben": aktiv wenn mindestens ein Artikel „freigegeben, noch im Verkauf"
    ist (aus `canSettle`-nahen Feldern des Read-Models ableitbar: `openCount > 0`).
  - „Abrechnen": Enabled-State bereits **korrekt** aus `canSettle` im Read-Model
    berechnet (AC-3) — das Read-Model liefert dieses Flag bereits vollständig in
    diesem Round. **Klick öffnet in diesem Round aber noch keinen Abrechnen-Dialog**
    (Popup-Inhalt/Berechnung ist [Round-21](../Round-21/round.md)) — zeigt
    stattdessen einen Platzhalter-Hinweis „Abrechnen folgt in einem späteren
    Häppchen". Kein Backend-Aufruf.
  - Bereits abgerechneter Verkäufer: zusätzliches Badge „Abgerechnet am ‹Zeitstempel›
    · ‹payoutAmount› €" im Kopf, „Zurückgeben"/„Abrechnen" deaktiviert, „Drucken"
    aktiv (liefert dann den endgültigen Beleg, sobald Round-24 existiert).
- **KPI-Kacheln** (3×, [`kpi-tile`](../../../components/kpi-tile/component.md), Grid
  `c3`): Offene Artikel (warning), Verkaufte Artikel (success), Umsatz — alle direkt
  aus dem Read-Model.
- **Artikelliste**: alle Artikel des Verkäufers, Nummer/Bezeichnung/Preis/Status,
  sortiert nach Artikelnummer aufsteigend. Rein lesend — kein Edit-Button, kein
  Artikelstatus-Popup (Korrektur läuft ausschließlich über die Artikel-Übersicht,
  Round-15).

**Zurückgeben-Popup**: [`scan-dialog`](../../../components/scan-dialog/component.md)
(Round-18, wiederverwendet, `targetField="returnedAt"`) — identischer Aufbau zum
Artikel-Freigeben-Popup. **Einziger Unterschied zum Freigabe-Fall:** hier schreibt der
Dialog **pro Artikel sofort** (`PUT /api/articles/{id}/return`, idempotent, kein
Sammeln + Abschluss-Request wie bei Freigabe/Verkauf) — kein Geld hängt am Abschluss
der Sitzung, der Vorgang ist beliebig oft fortsetzbar (api/settlement.md Abschnitt 2).
Nach jedem erfolgreichen Scan aktualisiert das Frontend die Artikelliste/KPI-Kacheln
(erneuter `GET /api/sellers/{id}/settlement` oder optimistisches Update).

### Backend

**Application** (`Bazaar.Application/Settlement/`):
- `GetSellerSettlementHandler` (`GET /api/sellers/{id}/settlement`) — Query-Port
  `ISellerSettlementQuery` (Read-Model, analog zur Karten-Aggregation aus Round-14/15):
  `openCount`, `soldCount`, `returnedCount`, `revenue`, `commissionRate` (=
  `Seller.SalesCommission`), `commission` (gerundet, s. u.), `payout`,
  `intakeFeePaid`, `notDeliveredCount`, `settledAt`, `payoutAmount`, `canSettle`.
  `canSettle` = mindestens ein Artikel freigegeben **und** kein Artikel mehr offen im
  Verkauf — serverseitig einmal berechnet, nicht im Frontend dupliziert.
  **Rundung bereits hier korrekt** (kaufmännisch, 2 Dezimalstellen, Reihenfolge
  Umsatz→Provision→Auszahlung), obwohl der Buchungs-Endpoint erst Round-21 kommt —
  die Anzeige muss schon jetzt mit dem späteren Buchungsbetrag übereinstimmen.
- `ReturnArticleHandler` (`PUT /api/articles/{id}/return`) — setzt `ReturnedAt = now`.
  `409 article.sold` falls `SoldAt` gesetzt (gegenseitige Sperre), `409
  settlement.locked` falls Seller bereits abgerechnet. Idempotent, kein Body.

**Infrastructure**:
- `SellerSettlementQuery` — real implementiert gegen Article-/Seller-Tabellen (beide
  seit Round-14/15 vorhanden).

**Api** (`Bazaar.Api/Features/Settlement/`):
- `GET /api/sellers/{id}/settlement`, `PUT /api/articles/{id}/return` (beide
  `authenticated`) — DTOs exakt nach
  [`api/settlement.md`](../../../requirements/bazaar-app/api/settlement.md)
  Abschnitte 1–2.
- **Nicht** in diesem Round: `POST /api/sellers/{id}/settlement` — → Round-21.
  `DELETE /api/sellers/{id}/settlement` bereits aus Round-14 vorhanden.
- `errorCode`: `article.sold` (409), `settlement.locked` (409) — bereits
  katalogisiert.

### Akzeptanzkriterien

Epic_Abrechnung AC-1, AC-2 (Abzugs-Ausschluss der Gebühr, s. Read-Model), AC-3, AC-10,
AC-12, AC-13, AC-14. AC-4 bis AC-9, AC-11 (Abrechnen-Buchung, Rundung im
Buchungs-Endpoint, Druckinhalt) gehören zu Round-21/24.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Application-UnitTests: `GetSellerSettlementHandler` (Rundungslogik, `canSettle`-
  Ableitung), `ReturnArticleHandler` (Sperrfälle).
- Frontend: Selektion-Wizard, Abrechnungs-Ansicht, `scan-dialog`-Integration
  (Rückgabe, sofortiges Schreiben pro Scan) — Vitest.
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Der eigentliche Abrechnen-Vorgang (Berechnung im Popup, `POST
/api/sellers/{id}/settlement`, `settledAt`, Entfernen nicht abgegebener Artikel) —
→ Round-21. Storno einer Abrechnung — bereits Round-14. Druckinhalt — → Round-24.
