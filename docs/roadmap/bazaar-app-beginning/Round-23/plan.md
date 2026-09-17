---
round: Round-23
status: geplant
---

# Plan: Round 23 — Druckfunktionen: Abgabe-Beleg

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-14/plan.md](../Round-14/plan.md): `shared/components/qr-code/` bereits
  gebaut (`BrowserQRCodeSvgWriter`-Wrapper) — hier wiederverwendet, nicht neu
  implementiert.
- [Round-17/plan.md](../Round-17/plan.md): `core/print/print.service.ts` mit
  `printIntakeReceipt`-Stub, Aufrufer in `intake-session-list` (Round-17) und
  `release-dialog` (Round-18).
- [Round-18/plan.md](../Round-18/plan.md): zweiter Aufrufer desselben Stubs.
- [Round-14/plan.md](../Round-14/plan.md): `sellers-api.ts`s `getArticles`.

## Implementationsplan

### Frontend

#### 1. `shared/components/print-abgabe-beleg/`

`print-abgabe-beleg.ts`: `@Input() seller: SellerSummary`, `@Input() articles:
{number, name, brand, price}[]`, `@Input() feePerItem: number`,
`@Input() feeAmount: number`, `@Input() occurredAt: Date`. Reine Darstellung
(keine HTTP-Aufrufe in der Komponente selbst — alle Daten kommen vorbereitet vom
Service). Template nach ASCII-Skizze: Kopf mit statischem Titel, `qr-code`
(`[value]="seller.id"`), Verkäuferdaten, Tabelle, Fuß mit Berechnung
`articles.length`, `feePerItem * articles.length` (Anzeige-Nachweis — der
gebuchte `feeAmount` ist der maßgebliche, angezeigte Wert; die Multiplikation
dient nur der Nachvollziehbarkeit der Zeile „2 × 0,50 €").

`print-abgabe-beleg.scss`: **kein** eigenes `@media print`-Regelwerk — verlässt
sich auf die in Round-7 gebaute Shell-Print-Regel (`#app-nav, #topbar { display:
none }`), ergänzt nur Inhalts-Layout (Tabellen-Spacing etc.).

#### 2. `printService.printIntakeReceipt` — reale Implementierung

`core/print/print.service.ts`: Methode nimmt `{articleIds, sellerId, feeAmount}`
entgegen (Signatur unverändert aus Round-17), lädt intern `GET
/api/sellers/{id}/articles` (Round-14) und filtert auf die übergebenen
`articleIds` (Feature-Aufrufer geben oft schon die vollen Artikeldaten mit —
Entscheidung: **Service lädt selbst nach**, damit Round-17/18 keine
Artikeldetails zwischenspeichern mussten, die sie sonst nicht bräuchten;
einfacherer Contract für die Aufrufer, ein zusätzlicher Request pro Druck ist bei
diesem Datenvolumen unkritisch), lädt Verkäuferdaten (`GET /api/sellers/{id}`
— **fehlt bisher als Einzel-Endpoint**, s. u.), rendert `print-abgabe-beleg` in
ein dynamisch erzeugtes, `@media print`-sichtbares Container-Element außerhalb
des normalen Routings (Angular `createComponent` via `ViewContainerRef`/
`ApplicationRef`, analog gängigem Angular-Print-Muster), ruft `window.print()`
nach Render, entfernt den Container nach `afterprint`.

**Kleine Backend-Lücke:** `GET /api/sellers/{id}` (Einzel-Ressource) existiert
bisher nicht — `api/sellers.md` listet nur Liste/Suche/Anlegen/Ändern/Löschen,
keinen Einzel-Read. Statt eines neuen Endpoints: **Verkäuferdaten kommen aus dem
bereits geladenen `SellerCardDto`** der aufrufenden Seite (Round-14/17/18 haben
alle den Verkäufer bereits im Speicher, wenn sie den Druck auslösen) —
`printIntakeReceipt`-Signatur um ein optionales `sellerSummary`-Feld erweitert,
das die Aufrufer mitgeben; Service nutzt es, statt selbst nachzuladen. Kein
neuer Endpoint nötig.

### 3. Verifikation

- `ng test` — `print-abgabe-beleg` Component-Test: nur übergebene `articles`
  erscheinen, Fuß-Rechnung stimmt, `qr-code` erhält `seller.id`.
- `ng serve`: Artikelannahme (Round-17) buchen → Druckvorschau öffnet sich
  automatisch (`window.print()`-Dialog des Browsers), Inhalt zeigt nur die
  gerade gebuchten Artikel. Freigabe (Round-18) durchführen → identisches
  Dokument-Layout, andere Artikel/Beträge.
- Browser-Druckvorschau: Sidebar/Topbar ausgeblendet (Shell-Regel greift ohne
  Zusatz-CSS).

## Reihenfolge

1 → 2 sequenziell (Service rendert die Komponente aus Schritt 1). 3
abschließend.
