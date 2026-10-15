# Checkout (Kasse/Verkauf)

**Intent:** Kassenpersonal verkauft Artikel an Kunden — Artikel per Nummer suchen, in den Warenkorb legen, bezahlen und buchen; unterstützt sofortiges Stornieren des letzten Vorgangs.
**Coverage:** inventoried
**Last reviewed:** 2026-10-15

## Capabilities
- User sees die Seitenüberschrift "Verkauf" — `pages/checkout-page/checkout-page.html` (`<app-page title="Verkauf">`, shared `Page`)
- User can enter an Artikelnummer per Tastatur in ein `app-input` mit Addons Kamera/Numpad/Clear/Enter — `checkout-page.html`, `checkout-page.ts` (`inputAddons`)
- User can toggle Kamera-Scanner bzw. Numpad als Panel unterhalb des Feldes (jeweils nur eins aktiv); der Numpad übernimmt nur Ziffern — `checkout-page.ts` (`onAddonClick`, `activeMode`, `onNumpadKey`)
- User sees im "Artikel gefunden"-Zustand nur noch die Addons Clear und Enter — `checkout-page.ts` (`inputAddons`)
- User can start the lookup nur per Enter (Tastatur, Enter-Addon, Numpad-⏎) — kein Auto-Lookup beim Tippen oder Scannen — `checkout-page.ts` (`onEnterPressed`, `onTyped`, `onCodeDetected`)
- User sees Enter während einer laufenden Suche wirkungslos (Enter-Addon ausgegraut, Numpad-⏎ gesperrt) — `checkout-page.ts` (`onEnterPressed`: `if (this.searching()) return`)
- User sees eine InfoArea mit Icon+Text für jeden möglichen Such-Zustand (Erfolg/schon im Warenkorb/noch nicht freigegeben/bereits verkauft/zurückgegeben/unbekannt/Fehler) — `checkout-page.ts` (`infoState`, `handleArticleFound`/`handleArticleLookupError`)
- User sees eine gelbe Info "Bitte Artikelnummer eingeben" initial sowie nach Warenkorb-Leeren und nach erfolgreicher Buchung — `checkout-page.ts` (`INITIAL_INFO_STATE`, `onCartClear`, `onPaymentConfirmed`)
- User sees bei einem verkaufbaren Treffer "Artikel gültig – x € – Enter zum Übernehmen" — `checkout-page.ts` (`handleArticleFound`)
- User can add the found article to the cart per zweitem Enter auf dieselbe Nummer (kein Preis-Button mehr) — `checkout-page.ts` (`onEnterPressed` → `addToCart`)
- User sees a warning wenn die Nummer bereits im Warenkorb liegt (lokale Prüfung, kein Server-Call) — `checkout-page.ts` (`checkArticleNumber`)
- User sees ab 769px Breite ein zweispaltiges Layout (Eingabe 1fr / Warenkorb 2fr, max. 75vw zentriert), darunter einspaltig — `checkout-page.scss`
- User sees den Warenkorb ab 769px höhenbegrenzt (`calc(100vh - 96px)`), die Zeilenliste scrollt intern — `checkout-page.scss` (`&__column--right`), `components/cart/cart.scss` (`&__items`)
- User sees den Warenkorb mit Zeilen, Einzelpreisen, Gesamtsumme — `components/cart/cart.html`
- User can remove a single cart row — `cart.ts` (`onRemove`)
- User can clear the whole cart — `cart.ts` (`onClear`)
- User can open the payment panel ("BUCHEN") — `cart.ts` (`onCheckout`)
- User sees den Bezahlen-Dialog responsiv breit (25 % / unter 1024px 50 % / unter 768px 95 %) — `checkout-page.scss` (`.payment-dialog`)
- User can enter den erhaltenen Betrag im Bezahlen-Dialog in ein `app-input`-Feld — `shared/components/payment-panel/payment-panel.html`
- User can confirm payment and book the sale — `checkout-page.ts` (`onPaymentConfirmed`), `POST /api/sales`
- User sees eine betroffene Warenkorb-Zeile markiert, wenn beim Buchen ein Artikel nicht mehr verkaufbar ist (409 `article.not_sellable`) — `checkout-page.ts` (`handleBookingError`)
- User can undo ("Letzten Vorgang stornieren") den zuletzt gebuchten Verkauf, solange der nächste Artikel noch nicht gescannt wurde — `checkout-page.ts` (`onUndoSale`, `lastSaleArticleIds`), `POST /api/sales/undo`
- User sees eine Meldung, wenn Storno wegen bereits erfolgter Abrechnung des Verkäufers nicht mehr möglich ist (409 `settlement.locked`) — `checkout-page.ts` (`handleUndoError`)
- User sees das Artikelnummer-Feld nach jeder Aktion (Init, Hinzufügen, Entfernen, Leeren, Buchen) automatisch neu fokussiert — `checkout-page.ts` (`focusArticleNumberField`)
- User sees nach einem Verkaufsschritt eine Ergebnis-Einblendung (u. a. Warenkorb-Icon, `paid` nach erfolgreichem Bezahlen) mit Ton und Vibration; sie blockiert keine Eingabe — `pages/checkout-page/checkout-page.html` (`app-result-overlay`), `shared/components/result-overlay/result-event.ts` (`ResultKind`: failed, success, already, cart, paid)

## Spans
- **Frontend:** `features/checkout/pages/checkout-page/`, `features/checkout/components/cart/`, `features/checkout/data/sales-api.ts`; nutzt `shared/components/{page,input,numpad,barcode-scanner,payment-panel}`, cross-feature `ArticlesApi.getByNumber()` (read-only, sanktioniert)
- **Backend:** `POST /api/sales`, `POST /api/sales/undo` — `Bazaar.Api/Features/Sales/SalesEndpoints.cs` → `Bazaar.Application/Sales/{RecordSaleHandler,UndoSaleHandler}.cs`

## Notes
- Storno-Button verschwindet automatisch, sobald der nächste Artikel gescannt wird (`lastSaleArticleIds` wird bei jedem Such-Trigger geleert) — kein explizites "Storno nicht mehr möglich"-UI dafür.
- `Cart` ist eine reine Präsentationskomponente ohne eigenen State/API-Call — Duplikat-Prüfung und Fokus-Handling liegen bewusst in `checkout-page.ts`.
- Backend-Handler-Details (Transaktionsgrenzen, genaue Fehlercode-Liste) nicht vollständig gegengelesen — nur Aufrufpfad/Response-Shape verifiziert.
