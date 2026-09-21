# Checkout (Kasse/Verkauf)

**Intent:** Kassenpersonal verkauft Artikel an Kunden — Artikel per Nummer suchen, in den Warenkorb legen, bezahlen und buchen; unterstützt sofortiges Stornieren des letzten Vorgangs.
**Coverage:** inventoried
**Last reviewed:** 2026-09-21

## Capabilities
- User can enter an Artikelnummer via Tastatur/Kamera/Numpad — `pages/checkout-page/checkout-page.html` (`app-input-group`)
- User sees eine InfoArea mit Icon+Text für jeden möglichen Such-Zustand (Erfolg/schon im Warenkorb/noch nicht freigegeben/bereits verkauft/zurückgegeben/unbekannt/Fehler) — `checkout-page.ts` (`infoState`, `handleArticleFound`/`handleArticleLookupError`)
- User can add the found article to the cart via Preis-Button (nur sichtbar wenn verkaufbar) — `checkout-page.ts` (`onAddToCart`)
- User sees a warning wenn die Nummer bereits im Warenkorb liegt (lokale Prüfung, kein Server-Call) — `checkout-page.ts` (`checkArticleNumber`)
- User sees den Warenkorb mit Zeilen, Einzelpreisen, Gesamtsumme — `components/cart/cart.html`
- User can remove a single cart row — `cart.ts` (`onRemove`)
- User can clear the whole cart — `cart.ts` (`onClear`)
- User can open the payment panel ("BUCHEN") — `cart.ts` (`onCheckout`)
- User can confirm payment and book the sale — `checkout-page.ts` (`onPaymentConfirmed`), `POST /api/sales`
- User sees eine betroffene Warenkorb-Zeile markiert, wenn beim Buchen ein Artikel nicht mehr verkaufbar ist (409 `article.not_sellable`) — `checkout-page.ts` (`handleBookingError`)
- User can undo ("Letzten Vorgang stornieren") den zuletzt gebuchten Verkauf, solange der nächste Artikel noch nicht gescannt wurde — `checkout-page.ts` (`onUndoSale`, `lastSaleArticleIds`), `POST /api/sales/undo`
- User sees eine Meldung, wenn Storno wegen bereits erfolgter Abrechnung des Verkäufers nicht mehr möglich ist (409 `settlement.locked`) — `checkout-page.ts` (`handleUndoError`)
- User sees das Artikelnummer-Feld nach jeder Aktion (Init, Hinzufügen, Entfernen, Leeren, Buchen) automatisch neu fokussiert — `checkout-page.ts` (`focusArticleNumberField`)

## Spans
- **Frontend:** `features/checkout/pages/checkout-page/`, `features/checkout/components/cart/`, `features/checkout/data/sales-api.ts`; nutzt `shared/components/{input-group,payment-panel}`, cross-feature `ArticlesApi.getByNumber()` (read-only, sanktioniert)
- **Backend:** `POST /api/sales`, `POST /api/sales/undo` — `Bazaar.Api/Features/Sales/SalesEndpoints.cs` → `Bazaar.Application/Sales/{RecordSaleHandler,UndoSaleHandler}.cs`

## Notes
- Storno-Button verschwindet automatisch, sobald der nächste Artikel gescannt wird (`lastSaleArticleIds` wird bei jedem Such-Trigger geleert) — kein explizites "Storno nicht mehr möglich"-UI dafür.
- `Cart` ist eine reine Präsentationskomponente ohne eigenen State/API-Call — Duplikat-Prüfung und Fokus-Handling liegen bewusst in `checkout-page.ts`.
- Backend-Handler-Details (Transaktionsgrenzen, genaue Fehlercode-Liste) nicht vollständig gegengelesen — nur Aufrufpfad/Response-Shape verifiziert.
