# Bezahlen-Dialog: Breite, Betrag-Feld, globales Numpad-Layout

## Was, wie, wo, warum
- Der "Bezahlen"-Dialog (`p-dialog` um `app-payment-panel`) existiert an drei Stellen: Checkout ("Gesamtbetrag"), Artikelannahme-Speichern und Verkäufer-Freigabe (beide "Gesamtgebühr") — alle drei ohne bisher gesetzte Breite. *(Git)*
- Das "Betrag erhalten"-Feld in `app-payment-panel` ist aktuell ein `p-inputnumber` mit `€`-Addon und Umschalt-Button (Tastatur/Numpad) in einer manuell gebauten `p-inputgroup`. *(Git)*
- Der Numpad (`app-numpad`) wird an 6 Stellen mit unterschiedlichen `showDecimal`/`showEnter`-Kombinationen verwendet (`payment-panel`, drei Varianten in `input-group.ts`, Preis-Feld Artikelannahme, Umnummerierungs-Popup); zwei Stellen (Preis-Feld Artikelannahme, Umnummerierungs-Popup) binden bisher gar kein `submitted`-Event. *(Git)*

## Theoretisches Verhalten nach Umsetzung
- Alle drei Bezahlen-Dialoge sind responsiv breit: ≥1024px → 25%, 768–1023px → 50%, ≤767px → 95% der Viewport-Breite. *(Aussage)*
- "Betrag erhalten" ist ein `app-input`; `€` und der Umschalt-Button liegen als `addonRight`-Einträge (Label bzw. Button) direkt darin — keine zweite umschließende `p-inputgroup` mehr. *(Aussage/Git)*
- Der Betrag wird in `payment-panel.ts` als String geführt; Parsing/Formatierung (de-DE-Komma, max. 2 Nachkommastellen) übernimmt die Komponente selbst statt PrimeNG. *(Aussage)*
- Tastatur-Tippen ins Feld ist ebenso begrenzt wie bisher: nur Ziffern + ein Komma, max. 2 Nachkommastellen — ungültige Zeichen werden nicht übernommen. *(Aussage)*
- Numpad-Tastendruck wird nicht mehr per `KeyboardEvent`-Dispatch auf ein natives Input geschickt, sondern von `payment-panel.ts` direkt in den String-Buffer übernommen und als `app-input`-`value` gesetzt. *(Aussage)*
- Der Numpad zeigt ab sofort **immer** alle Tasten, an **jeder** der 7 Verwendungsstellen — `showDecimal`/`showEnter` als Ein-/Ausblende-Schalter entfallen. Neues Layout (verbindlich): *(Aussage)*
  ```
  7  8  9  ⌫
  4  5  6  C
  1  2  3  ⏎
  0  0  ,  ⏎
  ```
  (⌫ nur noch Zeile 1, C in Zeile 2, ⏎ spannt Zeile 3–4, 0 spannt zwei Spalten in Zeile 4.)
- An den zwei bisher unangebundenen Stellen wird ⏎ funktional ergänzt:
  - Preis-Feld Artikelannahme: ⏎ löst `onSubmitEntry()` aus, deaktiviert wenn `!canSave()`. *(Aussage)*
  - Umnummerierungs-Popup: ⏎ löst dieselbe Aktion wie der "Laden"-Button aus (`onLoad()`), deaktiviert wenn `loading()`. *(Aussage)*

## Soll-Vorgaben
- Breakpoints für die Dialog-Breite folgen der bestehenden Projekt-Konvention aus `kpi-grid.scss` (`max-width: 767px` / `max-width: 1023px`). *(Git)*
- `app-input`'s eigene Doku (`docs/components/app-input/component.md`, Abschnitt "Abgrenzung") schließt Geld-Felder eigentlich aus — die Umstellung erfolgt trotzdem, bewusst gegen diese Doku-Empfehlung. *(Aussage, Ausnahme bewusst gewählt)*
- Die globale Numpad-Umstellung betrifft alle 6 bestehenden Verwendungsstellen einheitlich, auch dort, wo Komma/Enter fachlich bisher nicht gebraucht wurden (z. B. reine Artikelnummer-Suche). *(Aussage)*
- `enterDisabled`-Semantik pro Verwendungsstelle bleibt wie bisher (steuert nur deaktiviert/aktiviert, nicht die Sichtbarkeit).

## Akzeptanzkriterien
- Gegeben ein Bildschirm ≥1024px breit, wenn einer der drei Bezahlen-Dialoge geöffnet wird, dann ist er 25% der Viewport-Breite breit.
- Gegeben ein Bildschirm zwischen 768px und 1023px, wenn einer der drei Bezahlen-Dialoge geöffnet wird, dann ist er 50% der Viewport-Breite breit.
- Gegeben ein Bildschirm ≤767px, wenn einer der drei Bezahlen-Dialoge geöffnet wird, dann ist er 95% der Viewport-Breite breit.
- Gegeben das Betrag-erhalten-Feld im Tastatur-Modus, wenn eine Ziffer oder ein Komma getippt wird, dann erscheint sie im Feld; wenn ein Buchstabe getippt wird, dann wird er nicht übernommen.
- Gegeben ein Betrag mit bereits 2 Nachkommastellen, wenn eine weitere Ziffer nach dem Komma getippt wird, dann wird sie nicht übernommen.
- Gegeben der Numpad-Modus im Bezahlen-Dialog, wenn eine Zifferntaste geklickt wird, dann erscheint die Ziffer im Betrag-erhalten-Feld (ohne dass ein natives KeyboardEvent dispatcht wird).
- Gegeben eine beliebige der 6 Numpad-Verwendungsstellen, wenn der Numpad angezeigt wird, dann sind alle 12 Tasten (0–9, C, ⌫, ,, ⏎) sichtbar — unabhängig von der fachlichen Feldart.
- Gegeben das Preis-Feld in der Artikelannahme, wenn ⏎ geklickt wird und `canSave()` true ist, dann wird `onSubmitEntry()` ausgelöst; ist `canSave()` false, dann ist ⏎ deaktiviert und löst nichts aus.
- Gegeben das Umnummerierungs-Popup, wenn ⏎ geklickt wird und `loading()` false ist, dann wird dieselbe Aktion wie "Laden" ausgelöst; ist `loading()` true, dann ist ⏎ deaktiviert.
- Gegeben das Betrag-erhalten-Feld, wenn `€` und der Umschalt-Button gerendert werden, dann erscheinen beide als `addonRight`-Einträge von `app-input`, ohne zusätzliche umschließende `p-inputgroup`.

## Bereits geklärte Fragen
- **Dialog-Scope** · Aussage — betrifft alle drei Bezahlen-Dialoge.
- **Breiten-Einheit** · Aussage — responsiv 25%/50%/95% je Breakpoint (kein fixes 25vw).
- **Breakpoint-Werte** · Git — übernommen aus `kpi-grid.scss` (767px/1023px).
- **Betrag-Feldtyp** · Aussage — trotz Doku-Abgrenzung auf `app-input`.
- **Betrag-Format** · Aussage — `payment-panel` führt String selbst, eigenes Parsing/Formatierung.
- **Numpad-Dispatch** · Aussage — direktes Value-Setzen statt KeyboardEvent-Dispatch.
- **Numpad-Scope** · Aussage — global, alle 6 Stellen, `showDecimal`/`showEnter` entfallen.
- **Enter-Wirkung an bisher unverdrahteten Stellen** · Aussage — funktional ergänzen.
- **Preis-Enter** · Aussage/Git — `onSubmitEntry()` / `!canSave()`.
- **Addon-Layout** · Aussage/Git — `€`+Umschalt-Button wandern in `addonRight`.
- **Tipp-Validierung** · Aussage — gleich streng wie bisher (Ziffern+Komma, max. 2 Nachkommastellen).
