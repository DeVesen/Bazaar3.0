# Settlement (Abrechnung)

**Intent:** Verwaltung rechnet einen Verkäufer ab — Übersicht über offene/verkaufte Artikel und Umsatz, Rücknahme nicht verkaufter Artikel per Scan, abschließende Auszahlungsbuchung mit Provisionsabzug.
**Coverage:** inventoried
**Last reviewed:** 2026-10-13

## Capabilities
- User can search for a seller (kein "Neu anlegen" in diesem Kontext) — `pages/settlement-page/settlement-page.ts` (`onSellerSelected`), `shared/components/seller-search` mit `showCreateButton=false`
- User sees Verkäufer-Stammdaten, KPI-Kacheln (Offene Artikel/Verkaufte Artikel/Umsatz) und eine Artikeltabelle (Nummer/Bezeichnung/Preis/Status, fix nach Nummer sortiert) — `settlement-page.html`
- User sees a "Abgerechnet am … · <Betrag>"-Tag, sobald der Verkäufer abgerechnet ist — `settlement-page.html` (`isSettled`)
- User can print a Zwischen- bzw. Endabrechnung — `settlement-page.ts` (`onPrint`, `PrintService.printSellerSummary`, `phase: 'preliminary'|'final'`)
- User can return not-sold articles via Scan-Dialog ("↩ Zurückgeben"), nur wenn offene Artikel vorhanden und der Verkäufer noch nicht abgerechnet ist — `settlement-page.ts` (`canReturn`, `onReturnClick`), `shared/components/scan-dialog` mit `writeMode="immediate"`, `PUT /api/articles/{id}/return`
- User sees beim Zurückgeben, dass jede gültige Eingabe sofort geschrieben wird (Parent reagiert auf `articleConfirmed`) und der Artikel aus der Liste der noch zurückzugebenden Artikel verschwindet — `shared/components/scan-dialog/scan-dialog.ts` (`writeMode="immediate"`), `settlement-page.html`
- User sees beim Zurückgeben im Kamera-Modus nach jedem Scan einen Ring-Countdown mit Ton und Vibration (Erfolgs- bzw. Fehlermuster) für `scannerPauseMs`; weitere Scans sind währenddessen gesperrt — `scan-dialog.ts` (`onScanDetected`, `scanLocked`), `shared/components/scan-feedback`
- User sees beim Zurückgeben in Tastatur- und Numpad-Modus nur den Text "Artikel nicht bekannt", wenn die Eingabe keinen ausstehenden Artikel trifft; bei Erfolg leert sich das Feld — `scan-dialog.html` (`showUnknownMessage`)
- User can open the settlement confirmation panel ("✓ Abrechnen"), nur wenn der Server `canSettle=true` liefert und noch nicht abgerechnet ist — `settlement-page.ts` (`canSettleClick`, `onSettleClick`)
- User sees Umsatz/Provision/Auszahlung im Bestätigungs-Dialog — `components/settlement-panel/settlement-panel.html`
- User sees einen Hinweis auf nicht abgegebene Artikel, die beim Abrechnen entfernt werden; per Checkbox (Default gesetzt) abwählbar, dann bleiben sie bestehen — `settlement-panel.html` (`notDeliveredCount`, `removeNotDelivered`)
- User can confirm the settlement booking ("Buchen") — `settlement-panel.ts` (`onConfirm`) → `settlement-page.ts` (`onSettleConfirmed`), `POST /api/sellers/{id}/settlement`
- User sees eine Info-Meldung statt Fehler, wenn der Verkäufer zwischenzeitlich bereits (von anderer Stelle) abgerechnet wurde (409 `settlement.already_settled`) — `settlement-page.ts` (`onSettleConfirmed`)
- User sees die Server-Fehlermeldung im Panel bei 409 `settlement.articles_open` / 400 `settlement.payout_mismatch`, Panel bleibt offen — `settlement-page.ts` (`onSettleConfirmed`)

## Spans
- **Frontend:** `features/settlement/pages/settlement-page/`, `features/settlement/components/settlement-panel/`, `features/settlement/data/settlement-api.ts`; nutzt `shared/components/{seller-search,scan-dialog,kpi-tile}`, cross-feature `SellersApi.{search,getArticles}` (read-only, sanktioniert)
- **Backend:** `GET /api/sellers/{id}/settlement`, `PUT /api/articles/{id}/return`, `POST /api/sellers/{id}/settlement` — `Bazaar.Api/Features/Settlement/SettlementEndpoints.cs` → `Bazaar.Application/Settlement/{GetSellerSettlementHandler,ReturnArticleHandler,SettleSellerHandler}.cs`

## Notes
- Kein optimistisches lokales Update nach Rückgabe/Abrechnung — Settlement und Artikelliste werden nach jeder Aktion komplett neu vom Server geladen (bewusste Design-Entscheidung, "bei diesem Datenvolumen unkritisch").
- `intakeFeePaid` wird im Bestätigungs-Panel bewusst NICHT angezeigt (würde einen bereits bei Annahme kassierten Betrag doppelt zählen).
- Scan-Dialog beim Zurückgeben (Stand 2026-10-13): Er prüft nur auf den Status "im Verkauf". Unbekannte Nummer, Artikel eines anderen Verkäufers und jeder andere Status (auch ein bereits zurückgegebener Artikel) ergeben dasselbe Ergebnis `unknown`. Bei Netz/5xx gibt es keine Meldung, nur den Fehlerzustand in der Kamera. Aus `scan-dialog.ts/.html` und `settlement-page.html` direkt gelesen.
- Backend-Handler-Details (Transaktionsgrenzen, exakte Payout-Berechnung) nicht vollständig gegengelesen — nur Aufrufpfad/Response-Shape verifiziert.
