# Intake (Artikelannahme)

**Intent:** Kassenpersonal nimmt Artikel eines Verkäufers auf — Verkäufer per Suche finden oder neu anlegen, dann Artikel für Artikel erfassen (Nummer per Tastatur/Kamera/Numpad, Bezeichnung, Kategorie, Marke, Preis, optional Größe/Farbe/Beschreibung), Session sammeln und am Ende gegen Gebühr buchen.
**Coverage:** inventoried
**Last reviewed:** 2026-10-15

## Capabilities
- User can search for an existing seller or create a new one from the search text — `pages/intake-page/intake-page.ts` (`onSellerSelected`/`onCreateRequested`), delegiert an `shared/components/seller-search`
- User sees a hint text "ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint" — `intake-page.ts` (`hint`)
- User can fill in seller master data (Vorname*, Nachname*, Anschrift, PLZ, Ort*, Telefon, E-Mail, Verkäufer-Typ*, Gebühr*, Provision*) in Wizard-Schritt 1; "Weiter" bleibt gesperrt, solange ein Pflichtfeld leer ist, und unter einem verlassenen leeren Pflichtfeld erscheint eine Meldung — `components/intake-wizard/intake-wizard.html`, `intake-wizard.ts` (`canSave`, `requiredErrors`)
- User sees Gebühr-je-Stück/Provision aus dem gewählten Verkäufer-Typ vorbefüllt, aber gesperrt (`[disabled]`, nie editierbar — bewusst anders als im Verkäufer-Bearbeiten-Dialog) — `intake-wizard.ts` (`conditionsEditable` fix `false`, `onTypeChange`)
- User sees E-Mail-Format-Validierung nur bei eingegebener E-Mail; ein ungültiges Format sperrt "Weiter" und zeigt eine Meldung unter dem Feld, eine leere E-Mail ist erlaubt — `intake-wizard.ts` (`EMAIL_PATTERN`, `emailFormatError`)
- User can cancel Schritt 1 über den "Abbrechen"-Button im Footer — `components/intake-wizard/intake-wizard.html`
- User can leave Schritt 2 über ein Zurück-Pfeil-Icon (`pi pi-angle-left`) links neben den Tabs; einen "Abbrechen"-Button gibt es in Schritt 2 nicht — `intake-wizard.html` (`intake-wizard__back-button`)
- User sees einen in dieser Wizard-Session neu angelegten Verkäufer beim Abbrechen/Zurück automatisch wieder gelöscht (kein Confirm-Dialog) — `intake-wizard.ts` (`onCancel`)
- User cannot navigate back to Schritt 1, sobald ein Verkäufer für diese Session existiert (Tab gesperrt) — `intake-wizard.ts` (`canGoToStep1`)
- User can enter an Artikelnummer via Tastatur/Kamera/Numpad — `components/intake-article-entry/intake-article-entry.html` (`app-input-group`, `variant="search"`)
- User sees ein Nummernvorschlag (nächste freie Nummer) beim Öffnen von Schritt 2 automatisch vorbefüllt — `intake-article-entry.ts` (`prefillNextNumber`)
- User sees "Artikelnummer bereits vergeben", wenn die Nummer einem anderen Verkäufer gehört oder bereits freigegeben ist — `intake-article-entry.ts` (`handleArticleFound`)
- User sees keine Vorbefüllung am Hauptfeld, wenn die eingegebene Nummer einem eigenen, noch nicht freigegebenen Artikel gehört — die Nummernprüfung meldet nur "vergeben"/"frei"; Laden eines vorhandenen Artikels geht ausschließlich über das Umnummerieren-Popup — `intake-article-entry.ts` (`handleArticleFound`)
- User can open das Umnummerieren-Popup "Artikel per Nummer laden" über den dritten Mode-Button (`pi pi-sync`) am Nummernfeld — `intake-article-entry.html` (`extraModeButton`, `onOpenRenumberPopup`), `components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.html`
- User can enter die Nummer im Umnummerieren-Popup per Tastatur oder eigenem Numpad; der Numpad übernimmt nur Ziffern (Komma wird ignoriert) — `intake-renumber-lookup-popup.ts` (`onNumpadKey`)
- User sees "Kein offener Artikel mit dieser Nummer für diesen Verkäufer gefunden", wenn die Nummer unbekannt ist, einem anderen Verkäufer gehört oder nicht mehr Status `registered` hat — `intake-renumber-lookup-popup.ts` (`handleResult`/`handleError`)
- User sees nach einem Treffer im Umnummerieren-Popup Bezeichnung, Kategorie, Marke, Preis, Größe, Farbe, Beschreibung und die Artikelnummer selbst befüllt, das Nummernfeld fokussiert und komplett markiert — `intake-article-entry.ts` (`onArticleFoundViaRenumberPopup`)
- User sees die ursprüngliche Nummer eines umnummerierten Artikels als Badge am Umnummerieren-Button — `intake-article-entry.ts` (`extraModeButtonConfig`, `originalNumber`)
- User sees das ganze Formular zurückgesetzt (inkl. neuem Nummernvorschlag), wenn das Nummernfeld nach einem Umnummerieren-Treffer geleert wird — `intake-article-entry.ts` (`onArticleNumberChange` → `resetForm`)
- User sees Kamera-Scan-Feedback (Erfolg/bereits vergeben/unbekannt) nur bei Kamera-Ursprung, nicht bei Tastatur/Numpad — `intake-article-entry.ts` (`scanFeedbackResult`), `shared/components/scan-feedback`
- User can clear Bezeichnung, Preis, Größe und Farbe jeweils per ✕-Addon (nur sichtbar, wenn das Feld nicht leer ist) — `intake-article-entry.ts` (`nameClearAddon`/`priceAddonRight`/`sizeClearAddon`/`colorClearAddon`)
- User sees am Preisfeld ein €-Label und kann dort einen Numpad ein-/ausblenden — `intake-article-entry.ts` (`priceAddonRight`), `intake-article-entry.html` (`app-numpad`)
- User can press Enter auf dem Preis-Numpad, um den Artikel direkt zu übernehmen (Enter gesperrt, solange Pflichtfelder fehlen) — `intake-article-entry.html` (`(submitted)="onSubmitEntry()"`, `[enterDisabled]="!canSave()"`)
- User can create a new Kategorie/Marke inline während der Eingabe — `intake-article-entry.ts` (`onCategoryCreated`/`onBrandCreated`), `shared/components/autocomplete-create`
- User can add an article to the session list ("Übernehmen") — `intake-article-entry.ts` (`onSubmitEntry`), erst client-seitig, kein Server-Call
- User sees die laufende Gebühr (Anzahl × Gebühr/Stück) in der Session-Liste — `components/intake-session-list/intake-session-list.ts` (`fee` computed)
- User can click a session row to edit name/category/brand/price via Popup — `intake-session-list.ts` (`onRowClick`), `components/session-item-popup`
- User can delete a row from the session (rein lokal, kein Confirm) — `intake-session-list.ts` (`onDelete`)
- User can book the whole session ("Speichern" → Zahl-Panel → Buchen) — `intake-session-list.ts` (`openPayment`/`onPaymentConfirmed`), `POST /api/intake`
- User can book einen umnummerierten Artikel: die Zeile trägt die Ursprungsnummer (`originalNumberToDelete`), die als `deleteArticleNumber` an `POST /api/intake` geht; das Backend löscht den alten Artikel vor dem Anlegen unter der neuen Nummer — `intake-session-list.ts` (Mapping auf `IntakeArticleLine`), `Bazaar.Application/Intake/IntakeHandler.cs`
- User sees bei einem Umnummerieren auf eine Nummer, die bereits einem anderen eigenen vorregistrierten Artikel gehört, einen 409 `article.number_taken` statt eines Überschreibens dieses Artikels — `IntakeHandler.cs` (`toUpdate` nur ohne `DeleteArticleNumber`)
- User sees betroffene Zeilen markiert und die Artikelnummer mit dem Server-Vorschlag vorbefüllt, wenn beim Buchen eine Nummer inzwischen vergeben ist (409 `article.number_taken`) — `intake-session-list.ts` (`handleBookingError`/`onBookingConflict`)
- User sees den Abgabe-Beleg (neues A4-Layout, Gruppe „Registriert") als Druckvorschau nach erfolgreicher Buchung — `intake-session-list.ts` (`onPaymentConfirmed` → `PrintService.printIntakeReceipt({ articleIds, sellerId })`)
- User sees bei Gebühr 0 beim Speichern der Sitzung keinen Bezahlen-Dialog: die Annahme wird direkt mit Gebühr 0 gebucht — `components/intake-session-list/intake-session-list.ts` (`openPayment`, `fee() <= 0` → `book(0)`)
- User sees eine Ergebnis-Einblendung (großes Icon mit Ton und Vibration) beim Übernehmen eines Artikels und beim Wechsel zu Schritt 2, nach erfolgreichem Bezahlen die Einblendung `paid` mit Dollar-Icon — `components/intake-wizard/intake-wizard.html` (`app-result-overlay`), `intake-article-entry`, `intake-session-list`, `shared/components/result-overlay/`

## Spans
- **Frontend:** `features/intake/pages/intake-page/`, `features/intake/components/{intake-wizard,intake-article-entry,intake-renumber-lookup-popup,intake-session-list,session-item-popup}/`, `features/intake/data/intake-api.ts`; nutzt `shared/components/{seller-search,input-group,input,numpad,scan-feedback,autocomplete-create,payment-panel}`, cross-feature `SellersApi`/`SellerTypesApi`/`ArticlesApi`/`CategoriesApi`/`BrandsApi` (read-only, sanktioniert)
- **Backend:** `POST /api/intake` — `Bazaar.Api/Features/Intake/IntakeEndpoints.cs` → `Bazaar.Application/Intake/IntakeHandler.cs` (`RequireAuthorization()`); Verkäufer-Anlage/-Löschung läuft über die Sellers-Feature-Endpunkte, nicht über eigene Intake-Endpunkte

## Notes
- `conditionsEditable` ist im Intake-Wizard fix `false` — bewusster Unterschied zum Verkäufer-Bearbeiten-Dialog, wo Admins Gebühr/Provision überschreiben können.
- Nur noch das Nummernfeld ist `app-input-group` ohne reaktiven `value`-Input (dokumentierte Lücke) — Vorbefüllung (Nummernvorschlag, Umnummerieren-Treffer) läuft über `viewChild()` + `applyExternalValue()` (`pendingNumberValue`). Preis, Bezeichnung, Größe, Farbe sind `app-input` mit reaktivem `[value]`.
- Umnummerieren im Backend (`IntakeHandler.cs`, Commit b608ecf): ein Löschkandidat, der nicht mehr existiert, einem anderen Verkäufer gehört oder inzwischen freigegeben ist, wird still übersprungen — der Ziel-Artikel wird trotzdem angelegt. Alles in einer `IUnitOfWork`-Transaktion.
- Auto-Prefill am Hauptfeld wurde mit Commit ca7ff0c entfernt; `handleArticleFound` ist reine Vergeben-Prüfung.
- Backend-Endpunkte/Handler-Details (Fehlercodes im Detail, Transaktionsgrenzen) nicht vollständig gegengelesen — nur der Aufrufpfad verifiziert.
