# Intake (Artikelannahme)

**Intent:** Kassenpersonal nimmt Artikel eines Verkäufers auf — Verkäufer per Suche finden oder neu anlegen, dann Artikel für Artikel erfassen (Nummer per Tastatur/Kamera/Numpad, Bezeichnung, Kategorie, Marke, Preis, optional Größe/Farbe/Beschreibung), Session sammeln und am Ende gegen Gebühr buchen.
**Coverage:** inventoried
**Last reviewed:** 2026-09-21

## Capabilities
- User can search for an existing seller or create a new one from the search text — `pages/intake-page/intake-page.ts` (`onSellerSelected`/`onCreateRequested`), delegiert an `shared/components/seller-search`
- User sees a hint text "ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint" — `intake-page.ts` (`hint`)
- User can fill in seller master data (Vorname*, Nachname*, Anschrift, PLZ, Ort, Telefon, E-Mail*, Verkäufer-Typ*) in Wizard-Schritt 1 — `components/intake-wizard/intake-wizard.html`
- User sees Gebühr-je-Stück/Provision aus dem gewählten Verkäufer-Typ vorbefüllt, aber gesperrt (`[disabled]`, nie editierbar — bewusst anders als im Verkäufer-Bearbeiten-Dialog) — `intake-wizard.ts` (`conditionsEditable` fix `false`, `onTypeChange`)
- User sees E-Mail-Format-Validierung vor dem Anlegen — `intake-wizard.ts` (`EMAIL_PATTERN`, `onNext`)
- User can cancel Schritt 1/2; falls der Verkäufer in dieser Wizard-Session neu angelegt wurde, wird er beim Abbrechen automatisch wieder gelöscht (kein Confirm-Dialog) — `intake-wizard.ts` (`onCancel`)
- User cannot navigate back to Schritt 1, sobald ein Verkäufer für diese Session existiert (Tab gesperrt) — `intake-wizard.ts` (`canGoToStep1`)
- User can enter an Artikelnummer via Tastatur/Kamera/Numpad — `components/intake-article-entry/intake-article-entry.html` (`app-input-group`, `variant="search"`)
- User sees ein Nummernvorschlag (nächste freie Nummer) beim Öffnen von Schritt 2 automatisch vorbefüllt — `intake-article-entry.ts` (`prefillNextNumber`)
- User sees "Artikelnummer bereits vergeben", wenn die Nummer einem anderen Verkäufer gehört oder bereits freigegeben ist — `intake-article-entry.ts` (`handleArticleFound`)
- User sees Bezeichnung/Preis vorbefüllt, wenn die Nummer dem eigenen, noch nicht freigegebenen Verkäufer gehört — `intake-article-entry.ts` (`handleArticleFound`)
- User sees Kamera-Scan-Feedback (Erfolg/bereits vergeben/unbekannt) nur bei Kamera-Ursprung, nicht bei Tastatur/Numpad — `intake-article-entry.ts` (`scanFeedbackResult`), `shared/components/scan-feedback`
- User can create a new Kategorie/Marke inline während der Eingabe — `intake-article-entry.ts` (`onCategoryCreated`/`onBrandCreated`), `shared/components/autocomplete-create`
- User can add an article to the session list ("Übernehmen") — `intake-article-entry.ts` (`onSubmitEntry`), erst client-seitig, kein Server-Call
- User sees die laufende Gebühr (Anzahl × Gebühr/Stück) in der Session-Liste — `components/intake-session-list/intake-session-list.ts` (`fee` computed)
- User can click a session row to edit name/category/brand/price via Popup — `intake-session-list.ts` (`onRowClick`), `components/session-item-popup`
- User can delete a row from the session (rein lokal, kein Confirm) — `intake-session-list.ts` (`onDelete`)
- User can book the whole session ("Speichern" → Zahl-Panel → Buchen) — `intake-session-list.ts` (`openPayment`/`onPaymentConfirmed`), `POST /api/intake`
- User sees betroffene Zeilen markiert und die Artikelnummer mit dem Server-Vorschlag vorbefüllt, wenn beim Buchen eine Nummer inzwischen vergeben ist (409 `article.number_taken`) — `intake-session-list.ts` (`handleBookingError`/`onBookingConflict`)
- User sees einen Beleg-Druck ausgelöst nach erfolgreicher Buchung — `intake-session-list.ts` (`onPaymentConfirmed` → `PrintService.printIntakeReceipt`)

## Spans
- **Frontend:** `features/intake/pages/intake-page/`, `features/intake/components/{intake-wizard,intake-article-entry,intake-session-list,session-item-popup}/`, `features/intake/data/intake-api.ts`; nutzt `shared/components/{seller-search,input-group,scan-feedback,autocomplete-create,payment-panel}`, cross-feature `SellersApi`/`SellerTypesApi`/`ArticlesApi`/`CategoriesApi`/`BrandsApi` (read-only, sanktioniert)
- **Backend:** `POST /api/intake` — `Bazaar.Api/Features/Intake/IntakeEndpoints.cs` → `Bazaar.Application/Intake/IntakeHandler.cs` (`RequireAuthorization()`); Verkäufer-Anlage/-Löschung läuft über die Sellers-Feature-Endpunkte, nicht über eigene Intake-Endpunkte

## Notes
- `conditionsEditable` ist im Intake-Wizard fix `false` — bewusster Unterschied zum Verkäufer-Bearbeiten-Dialog, wo Admins Gebühr/Provision überschreiben können.
- Die Preis-/Nummernfelder (`app-input-group`) haben keinen reaktiven `value`-Input (dokumentierte Lücke) — Vorbefüllung läuft über `viewChild()` + `applyExternalValue()`.
- Backend-Endpunkte/Handler-Details (Fehlercodes im Detail, Transaktionsgrenzen) nicht vollständig gegengelesen — nur der Aufrufpfad verifiziert.
