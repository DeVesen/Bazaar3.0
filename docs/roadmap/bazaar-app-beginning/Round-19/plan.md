---
round: Round-19
status: geplant
---

# Plan: Round 19 — Verkauf

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-16/plan.md](../Round-16/plan.md): `shared/components/input-group/`,
  `barcode-scanner/`.
- [Round-17/plan.md](../Round-17/plan.md): `shared/components/payment-panel/`
  (dritter Consumer hier), `articles-api.ts`s `getByNumber(number)`.
- [Round-2/plan.md](../Round-2/plan.md)/[Round-17/plan.md](../Round-17/plan.md):
  `DomainException`-`Extensions`-Erweiterung — hier für `article.not_sellable`
  nicht zwingend gebraucht (keine Liste, nur eine Nummer), aber gleiche
  Konstruktion wiederverwendbar.
- [Round-7/plan.md](../Round-7/plan.md): `features/checkout/checkout.routes.ts`
  + Platzhalter-Page, Route `/checkout` bereits registriert.

## Implementationsplan

### Backend

#### 1. `Bazaar.Application/Sales/`

`RecordSaleCommand`(`ArticleIds`)+`Validator`+`RecordSaleHandler` — lädt jeden
Artikel + dessen `Seller.SettledAt`, prüft `Status == Selling` (Computed-Property
aus Round-15) und `!seller.SettledAt.HasValue`, sammelt Verstöße, wirft bei
nicht-leerer Liste `ConflictException("...", "article.not_sellable")` mit der
ersten betroffenen Nummer in `Extensions` (spec.md verlangt nur „die betroffene
Artikelnummer", nicht alle — abweichend vom Intake/Release-Muster mit
Nummern-Array). Bei Erfolg: `article.RecordSale()`-Methode (neu am `Article`-
Aggregate, setzt `SoldAt = now`, `SoldManually` bleibt unberührt).

`UndoSaleCommand`(`ArticleIds`)+`UndoSaleHandler` — lädt Artikel + Seller, prüft
`Seller.SettledAt`, wirft `409 settlement.locked` bei Verstoß, sonst
`article.UndoSale()` (neue Aggregate-Methode, setzt `SoldAt = null`).

#### 2. Api

`SalesEndpoints.cs` (`Bazaar.Api/Features/Sales/`) — zwei Routen.

### Frontend

#### 3. `features/checkout/`

`data/sales-api.ts` (`bookSale`, `undoSale`), `checkout.page.ts` ersetzt
Round-7-Platzhalter: Signal `cartItems`, `lastSaleArticleIds` (für Storno),
`infoState: {type, text}`.

`input-group` mit Sonder-Binding: `[active]` des eingebetteten
`barcode-scanner`-Kamera-Modus wird im Page-Template über einen eigenen
`effect()` nach erstem `codeDetected` zurückgesetzt (statt der Standard-
Dauerscan-Bindung aus Round-17) — dieser Verhaltensunterschied lebt **im
Feature-Template**, nicht in der `input-group`-Komponente selbst.

Artikel-Lookup: `getByNumber(number)` → Status-Verzweigung (6 Fälle wie spec.md)
→ `infoState` setzen, Preis-Button nur bei „Selling".

#### 4. `cart`

`features/checkout/components/cart/cart.ts` — `@Input() items`, Outputs
`removeItem`/`clear`/`checkout`. Reine Darstellung, State lebt in
`checkout.page.ts` (kein eigener Store nötig für einen derart einfachen,
sitzungsgebundenen Zustand — YAGNI gegenüber einem vollen `*-store.ts`-Muster).

#### 5. Bezahlpopup + Storno

`checkout.page.ts`: „BUCHEN" öffnet `payment-panel` (`totalLabel="Gesamtbetrag"`,
`confirmLabel="Bezahlt"`). `confirmed` → `bookSale(articleIds)` →
Erfolg: `lastSaleArticleIds.set(articleIds)`, Warenkorb/Feld leeren, InfoArea
blau. `409` → Warenkorb unverändert, betroffene Zeile markiert (`highlightedNumber`-
Signal, `cart` liest es für rote Zeilenmarkierung).

Storno-Button (`*ngIf="lastSaleArticleIds().length > 0"`, verschwindet bei
nächstem `codeDetected`/Scan) → `undoSale(lastSaleArticleIds())` →
`lastSaleArticleIds.set([])`.

### 6. Verifikation

- `dotnet test` — `RecordSaleHandler` alle sechs Statuskombinationen (indirekt
  über Fixture-Artikel in den jeweiligen Zuständen), Abrechnungs-Absicherung
  (Seller manuell auf `settledAt` gesetzt trotz `Selling`-Artikel — nur über
  direkten Repository-Zugriff im Test simulierbar, da UI das nicht zulässt).
  `UndoSaleHandler` `settlement.locked`-Fall.
- `ng test` — `cart` Doppel-Erkennung, Fokus-Rückkehr (`@ViewChild`-Fokus-Aufruf
  nach jeder Aktion), Leerzustand ohne Footer.
- `ng serve`: Artikel aus Round-17/18 im Verkauf → an der Kasse scannen → Preis-
  Button → Warenkorb → BUCHEN → `soldAt` gesetzt (Nachweis über `/articles`,
  Round-15). Storno → `soldAt` wieder `null`, Artikel **nicht** im Warenkorb.
  Alle sechs InfoArea-Texte durchspielen (unbekannte Nummer, `Registered`-Artikel,
  bereits `Sold`, `Returned` — letztere zwei über das Artikelstatus-Popup,
  Round-15, künstlich herbeiführen).

## Reihenfolge

Backend 1 → 2. Frontend 3 → 4 → 5 sequenziell (Page orchestriert beide
Sub-Komponenten). 6 abschließend.
