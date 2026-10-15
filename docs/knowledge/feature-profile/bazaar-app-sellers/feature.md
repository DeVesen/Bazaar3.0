# Sellers (Verkäufer)

**Intent:** Zentrale Stammdaten- und Statusverwaltung für Verkäufer im laufenden Basar-Betrieb — anlegen, bearbeiten, Artikel freigeben, Abrechnungsstatus einsehen und (als Admin) zurücksetzen.
**Coverage:** partial
**Last reviewed:** 2026-10-14

## Capabilities
- User can search sellers by name/city (debounced 300ms) — `pages/sellers-page/sellers-page.ts` (`onQInputChange`)
- User can sort sellers by Name/Angenommener Warenwert/Offener Warenwert/Umsatz — `sellers-page.ts` (`SORT_OPTIONS`)
- User can filter sellers by status (Offen/Im Verkauf/Abgerechnet) — `sellers-page.ts` (`onStatusChange`, no debounce)
- User sees active filters as removable chips — `sellers-page.html` (`p-chip`, `clearQFilter`/`clearStatusFilter`)
- User sees an empty-state hint pointing to Settings→Import or "+ Neu" when there are no sellers at all — `sellers-page.html` (`noSellersAtAll`)
- User sees a distinct empty-state with a "Filter zurücksetzen" action when filters yield no results — `sellers-page.html` (`noResultsForFilter`)
- User can create a new seller via a dialog (Personendaten/Kontakt/Konditionen) — `components/verkaeufer-dialog/verkaeufer-dialog.ts`
- User sees Vorname*, Nachname*, Ort*, Verkäufer-Typ*, Gebühr* und Provision* als Pflichtfelder im Dialog (E-Mail optional); "Speichern" bleibt gesperrt, solange eines leer ist, und unter einem verlassenen leeren Pflichtfeld erscheint eine Meldung — `verkaeufer-dialog.ts` (`canSave`, `requiredErrors`), `verkaeufer-dialog.html`
- User can edit an existing seller (full detail fetched first via `GET /api/sellers/{id}`) — `sellers-page.ts` (`onEdit`)
- User sees Provision/Gebühr-Felder disabled unless the caller is admin — `verkaeufer-dialog.html` (`conditionsEditable`)
- User can delete a seller (admin only, from within the edit dialog) — `verkaeufer-dialog.html`/`sellers-page.ts` (`onDeleteRequested`)
- User sees the article count in the delete confirmation and deletes the seller together with all their articles (admin only; non-admin gets `seller.has_articles` 409 when articles exist) — `verkaeufer-dialog.ts` (`articleCount`), `DeleteSellerHandler`
- User can open a seller's detail modal (QR code + article table) by clicking its card — `components/seller-detail-modal/seller-detail-modal.ts`
- User can open the "Artikel freigeben" (release) scan flow from a seller's card — `components/release-dialog/release-dialog.ts` (reuses shared `app-scan-dialog` + `app-payment-panel`)
- User can im Freigabe-Flow eine Artikelnummer per Tastatur-Enter, Numpad-⏎, Kamera-Scan oder Klick auf einen Listeneintrag der noch nicht freigegebenen Artikel des Verkäufers erfassen; Erfassen sammelt nur in der Sitzung, geschrieben wird erst nach dem Bezahlen der Gesamtgebühr — `shared/components/scan-dialog/scan-dialog.ts` (`sessionArticleIds`, `writeMode` Default `batch`), `components/release-dialog/release-dialog.html`
- User sees im Freigabe-Flow im Kamera-Modus nach jedem Scan einen Ring-Countdown mit Ton und Vibration (Erfolgs- bzw. Fehlermuster) für `scannerPauseMs`; weitere Scans sind währenddessen gesperrt — `scan-dialog.ts` (`onScanDetected`, `scanLocked`), `shared/components/scan-feedback`
- User sees im Freigabe-Flow in Tastatur- und Numpad-Modus nur den Text "Artikel nicht bekannt", wenn die Eingabe keinen ausstehenden Artikel trifft; bei Erfolg leert sich das Feld — `scan-dialog.html` (`showUnknownMessage`)
- User sees den Bezahlen-Dialog im Freigabe-Flow responsiv breit (25 % / unter 1024px 50 % / unter 768px 95 %) — `components/release-dialog/release-dialog.scss` (`.payment-dialog`)
- User can click a seller's status badge to see settlement details (settled date or "not yet settled") — `sellers-page.html` (`statusPopupCard`)
- User can reset a seller's settlement (admin only, with confirm dialog) — `sellers-page.ts` (`onResetSettlement`, `DELETE /api/sellers/{id}/settlement`)
- User can print the Abgabe-Beleg of a seller from the Verkäufer-Kachel (Drucker-Icon, last action, visible for all roles, active even without articles; error toast if data cannot be loaded) — `components/seller-card/seller-card.{ts,html}` (`printReceipt`), `pages/sellers-page/sellers-page.ts` (`onPrintReceipt` → `PrintService.printSellerReceipt`)
- User is paginated through the seller list — `sellers-page.html` (`p-paginator`)

## Spans
- **Frontend:** `features/sellers/pages/sellers-page/`, `features/sellers/components/{seller-card,verkaeufer-dialog,seller-detail-modal,release-dialog}/`, `features/sellers/{sellers-store.ts, data/sellers-api.ts, data/release-api.ts}`
- **Backend:** `Bazaar.Api/Features/Sellers/SellerEndpoints.cs` (`GET/POST /api/sellers`, `GET /api/sellers/search`, `GET/PUT/DELETE /api/sellers/{id}`, `GET /api/sellers/{id}/articles`, `DELETE /api/sellers/{id}/settlement`), `Bazaar.Api/Features/Release/ReleaseEndpoints.cs` (`POST /api/release`)

## Notes
- Backend endpoint handler classes (Application layer) and their business rules (e.g. `seller.conditions_admin_only`, `settlement.locked`) not walked — only the Api-layer endpoint surface and the errorCodes the frontend reacts to.
- `release-dialog` and `seller-detail-modal` pull in shared components (`scan-dialog`, `payment-panel`, `qr-code`, `p-table`) — not re-documented here, they're `shared/components/*`.
- Scan-Dialog im Freigabe-Flow (Stand 2026-10-13): Alle Fehlschläge (Nummer unbekannt/404, Artikel eines anderen Verkäufers, falscher Status) ergeben dasselbe Ergebnis `unknown`; `already-set` gibt es nur bei Doppelerfassung in derselben Sitzung. Bei Netz/5xx gibt es keine Meldung, nur den Fehlerzustand in der Kamera. Aus `scan-dialog.ts/.html` direkt gelesen; dass geschrieben wird erst nach dem Bezahlen, ist abgeleitet (`release-dialog.html`, `release-dialog.ts` nicht gelesen).
- Coverage `partial`: frontend page/component templates walked at signature level; `sellers-store.ts` (state layer) and full backend Application handlers not read line-by-line.
