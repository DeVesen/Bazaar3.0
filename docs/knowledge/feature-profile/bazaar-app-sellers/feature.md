# Sellers (Verkäufer)

**Intent:** Zentrale Stammdaten- und Statusverwaltung für Verkäufer im laufenden Basar-Betrieb — anlegen, bearbeiten, Artikel freigeben, Abrechnungsstatus einsehen und (als Admin) zurücksetzen.
**Coverage:** partial
**Last reviewed:** 2026-09-21

## Capabilities
- User can search sellers by name/city (debounced 300ms) — `pages/sellers-page/sellers-page.ts` (`onQInputChange`)
- User can sort sellers by Name/Angenommener Warenwert/Offener Warenwert/Umsatz — `sellers-page.ts` (`SORT_OPTIONS`)
- User can filter sellers by status (Offen/Im Verkauf/Abgerechnet) — `sellers-page.ts` (`onStatusChange`, no debounce)
- User sees active filters as removable chips — `sellers-page.html` (`p-chip`, `clearQFilter`/`clearStatusFilter`)
- User sees an empty-state hint pointing to Settings→Import or "+ Neu" when there are no sellers at all — `sellers-page.html` (`noSellersAtAll`)
- User sees a distinct empty-state with a "Filter zurücksetzen" action when filters yield no results — `sellers-page.html` (`noResultsForFilter`)
- User can create a new seller via a dialog (Personendaten/Kontakt/Konditionen) — `components/verkaeufer-dialog/verkaeufer-dialog.ts`
- User can edit an existing seller (full detail fetched first via `GET /api/sellers/{id}`) — `sellers-page.ts` (`onEdit`)
- User sees Provision/Gebühr-Felder disabled unless the caller is admin — `verkaeufer-dialog.html` (`conditionsEditable`)
- User can delete a seller (admin only, from within the edit dialog) — `verkaeufer-dialog.html`/`sellers-page.ts` (`onDeleteRequested`)
- User sees a specific error when deleting a seller who still has articles — `sellers-page.ts` (`seller.has_articles`)
- User can open a seller's detail modal (QR code + article table) by clicking its card — `components/seller-detail-modal/seller-detail-modal.ts`
- User can open the "Artikel freigeben" (release) scan flow from a seller's card — `components/release-dialog/release-dialog.ts` (reuses shared `app-scan-dialog` + `app-payment-panel`)
- User can click a seller's status badge to see settlement details (settled date or "not yet settled") — `sellers-page.html` (`statusPopupCard`)
- User can reset a seller's settlement (admin only, with confirm dialog) — `sellers-page.ts` (`onResetSettlement`, `DELETE /api/sellers/{id}/settlement`)
- User is paginated through the seller list — `sellers-page.html` (`p-paginator`)

## Spans
- **Frontend:** `features/sellers/pages/sellers-page/`, `features/sellers/components/{seller-card,verkaeufer-dialog,seller-detail-modal,release-dialog}/`, `features/sellers/{sellers-store.ts, data/sellers-api.ts, data/release-api.ts}`
- **Backend:** `Bazaar.Api/Features/Sellers/SellerEndpoints.cs` (`GET/POST /api/sellers`, `GET /api/sellers/search`, `GET/PUT/DELETE /api/sellers/{id}`, `GET /api/sellers/{id}/articles`, `DELETE /api/sellers/{id}/settlement`), `Bazaar.Api/Features/Release/ReleaseEndpoints.cs` (`POST /api/release`)

## Notes
- Backend endpoint handler classes (Application layer) and their business rules (e.g. `seller.conditions_admin_only`, `settlement.locked`) not walked — only the Api-layer endpoint surface and the errorCodes the frontend reacts to.
- `release-dialog` and `seller-detail-modal` pull in shared components (`scan-dialog`, `payment-panel`, `qr-code`, `p-table`) — not re-documented here, they're `shared/components/*`.
- Coverage `partial`: frontend page/component templates walked at signature level; `sellers-store.ts` (state layer) and full backend Application handlers not read line-by-line.
