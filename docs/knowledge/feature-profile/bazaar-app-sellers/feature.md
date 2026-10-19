# Sellers (Verkäufer)

**Intent:** Zentrale Stammdaten- und Statusverwaltung für Verkäufer im laufenden Basar-Betrieb — anlegen, bearbeiten, Artikel freigeben, Abrechnungsstatus einsehen und (als Admin) zurücksetzen.
**Coverage:** partial
**Last reviewed:** 2026-10-15

## Capabilities
- User can search sellers by name/city (debounced 300ms) — `pages/sellers-page/sellers-page.ts` (`onQInputChange`)
- User can sort sellers by Name/Angenommener Warenwert/Offener Warenwert/Umsatz — `sellers-page.ts` (`SORT_OPTIONS`)
- User can filter sellers by status (Offen/Im Verkauf/Abgerechnet) — `sellers-page.ts` (`onStatusChange`, no debounce)
- User sees Suche, Sortierung und Status in einer gerahmten Filterleiste (`p-toolbar`), links davon der +-Button „Neuer Verkäufer“ — `sellers-page.html` (`.sellers-page__toolbar`)
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
- User sees beim Scrollen ans Listenende automatisch weitere Verkäufer nachgeladen (kein Paginator mehr) — `pages/sellers-page/sellers-page.html` (`appLoadMoreSentinel` → `onLoadMore`), `components/load-more-sentinel/`
- User sees beim Laden der Liste Platzhalter-Kacheln (Skeleton) statt einer leeren Fläche; ein Screenreader-Status „Verkäufer werden geladen“ ist dauerhaft gerendert — `sellers-page.html` (`showSkeleton`, `skeletonSlots`, `sellers-page__sr-only`), `components/seller-card-skeleton/`
- User sees die Kachelliste in einer PrimeNG-ScrollArea mit eigener Scrollbar; nach einem Wechsel von Suche, Sortierung oder Status beginnt die Liste wieder oben — `sellers-page.html` (`p-scrollarea`), `sellers-page.ts` (`filterKey`, `resetScrollToTop`)
- User (admin only) can import articles for one seller from the Verkäufer-Kachel (Upload-Icon, deaktiviert, sobald der Verkäufer abgerechnet ist) — `components/seller-card/seller-card.html` (`importVisible`, `onImportArticles`), `sellers-page.ts` (`onImportArticles`)
- User can choose die Datei (XLSX, XLS oder CSV) im Import-Dialog per Drag & Drop oder Dateidialog; eine neue Auswahl ersetzt die alte, mehr als eine Datei wird nicht übernommen — `components/article-import-dialog/article-import-dialog.{ts,html}` (`onFilesChosen`), `shared/components/file-dropzone`
- User sees im Import-Dialog „Die Datei ist größer als 2 MB.“ (clientseitig sowie bei 413), einen Fortschrittsspinner während des Imports, ein Häkchen bei Erfolg und die Server-Fehlertexte mit Zeile und Artikelnummer (z. B. „Zeile 4, Artikelnummer 3003: Pflichtfeld …“, „Datei enthält keine Artikel“) — `article-import-dialog.ts`, `ArticleImportErrorMessage`
- User sees nach erfolgreichem Import den Toast „✓ n Artikel importiert“ und die Kachelliste neu geladen — `sellers-page.ts` (`onArticlesImported`)
- User sees im Freigabe-Flow bei Gebühr 0 keinen Bezahlen-Dialog: Schließen des Scan-Dialogs bucht direkt mit Gebühr 0 — `components/release-dialog/release-dialog.ts` (`fee() <= 0` → `book(0)`)
- User sees nach erfolgreichem Bezahlen die Ergebnis-Einblendung `paid` (Dollar-Icon, Ton, Vibration) im Freigabe-Flow — `release-dialog.html` (`app-result-overlay`), `shared/components/result-overlay/`

## Spans
- **Frontend:** `features/sellers/pages/sellers-page/`, `features/sellers/components/{seller-card,seller-card-skeleton,load-more-sentinel,article-import-dialog,verkaeufer-dialog,seller-detail-modal,release-dialog}/`, `features/sellers/{sellers-store.ts, data/sellers-api.ts, data/release-api.ts}`
- **Backend:** `Bazaar.Api/Features/Sellers/SellerEndpoints.cs` (`GET/POST /api/sellers`, `GET /api/sellers/search`, `GET/PUT/DELETE /api/sellers/{id}`, `GET /api/sellers/{id}/articles`, `DELETE /api/sellers/{id}/settlement`), `Bazaar.Api/Features/ArticleImport/ArticleImportEndpoints.cs` (`POST /api/sellers/{id}/articles/import`, multipart `file` + `locale`, admin), `Bazaar.Api/Features/Release/ReleaseEndpoints.cs` (`POST /api/release`)

## Notes
- Backend endpoint handler classes (Application layer) and their business rules (e.g. `seller.conditions_admin_only`, `settlement.locked`) not walked — only the Api-layer endpoint surface and the errorCodes the frontend reacts to.
- `release-dialog` and `seller-detail-modal` pull in shared components (`scan-dialog`, `payment-panel`, `qr-code`, `p-table`) — not re-documented here, they're `shared/components/*`.
- Scan-Dialog im Freigabe-Flow (Stand 2026-10-13): Alle Fehlschläge (Nummer unbekannt/404, Artikel eines anderen Verkäufers, falscher Status) ergeben dasselbe Ergebnis `unknown`; `already-set` gibt es nur bei Doppelerfassung in derselben Sitzung. Bei Netz/5xx gibt es keine Meldung, nur den Fehlerzustand in der Kamera. Aus `scan-dialog.ts/.html` direkt gelesen; dass geschrieben wird erst nach dem Bezahlen, ist abgeleitet (`release-dialog.html`, `release-dialog.ts` nicht gelesen).
- Coverage `partial`: frontend page/component templates walked at signature level; `sellers-store.ts` (state layer) and full backend Application handlers not read line-by-line.
- Artikel-Import (Stand 2026-10-15, aus `ArticleImportEndpoints.cs`/`ImportSellerArticlesHandler.cs` direkt gelesen): alles oder nichts, nur Artikel mit Status „Registriert“ werden angelegt, der Import überschreibt nie — jede bereits vergebene Artikelnummer ist ein Fehler. Grenzen: 2 MB Datei (nginx und Endpoint), 20.000 Datenzeilen, Proxy und Frontend warten 3 Minuten. Die Fehlerprüfung läuft in einer Transaktion; eine parallele Anlage derselben Nummer endet als 500 ohne gespeicherte Zeilen.
- `GET /api/sellers/{id}/articles` liefert seit 2026-10-14 zusätzlich Größe und Farbe je Artikel (Quelle für die Beleg-Artikeltabelle); in der Detail-Ansicht des Verkäufers sind beide nicht sichtbar. Die Ergebnis-Einblendung und der Wegfall des Bezahlen-Dialogs bei Gebühr 0 im Freigabe-Flow sind aus den Commits `43ea5abb`/`53811a14` abgeleitet, `release-dialog.ts` wurde nicht vollständig gelesen.
- `GET /api/sellers/{id}/articles` liefert die Artikel seit 2026-10-18 aufsteigend nach Artikelnummer (`ArticlesBySellerQuery`); die Auswahlliste im Scan-Dialog und die Artikeltabelle der Detail-Ansicht übernehmen die Reihenfolge ohne eigene Sortierung, Abrechnung (`settlement-page.ts`) und Druck (`print-document.model.ts`) sortieren weiter selbst.
