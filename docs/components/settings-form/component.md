---
id: C-025
status: draft
updated: 2026-10-30
---

# Component: SettingsForm

**Bibliothek:** PrimeNG — `app-input-group` (Anzahl-Variante, Round-25 Task 6a) · `app-boolean-input` · `p-select` · `p-button` ·
Feldfehler als einfaches bedingtes `<p>`-Element unter dem Feld (kein `p-message`) — dieselbe
Baseline wie `change-password-page` (`src/bazaar-app/frontend/.../change-password-page.html`)
und der Server-Feldfehler-Zweig von `seller-types-page`: kein eigenständiges
PrimeNG-Message-Widget, sondern ein bedingt gerendertes Text-Element, das erscheint, sobald
ein Feldfehler-Signal gesetzt ist.
**Verwendung:** Haupt-App, `/settings` (nur Admin).

## Index

- Überblick — Konzept
- 1. Feld — ScannerPauseMs
- 1a. Feld — ReleaseOnClose
- 1b. Feld — DefaultSellerTypeId
- 2. Verhalten — Laden, Speichern, Fehler
- 3. Abgrenzung zu SettingsService — Lese- vs. Schreibpfad
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Admin-Formular mit drei Feldern (`ScannerPauseMs`, `ReleaseOnClose`, `DefaultSellerTypeId`) zur Pflege der
Basar-weiten Systemparameter aus [Epic_Einstellungen](../../requirements/bazaar-app/epics/Epic_Einstellungen/epic.md)
Abschnitt 1.

**Verwendungszweck:** Einziger Editier-Weg für `scannerPauseMs`, `releaseOnClose` und `defaultSellerTypeId`; die Seite lädt den aktuellen
Wert beim Betreten und schreibt Änderungen per `PUT /api/settings` serverseitig zurück.

---

## Überblick

Das Formular hat drei Felder (`scannerPauseMs`, `releaseOnClose`, `defaultSellerTypeId`) auf der `/settings`-Seite (Admin only, Tab „Basis-Einstellungen"). Es
verwendet die Anzahl-Variante der [InputGroup](../input-group/component.md) (Abschnitt 5a) für
den Systemparameter `scannerPauseMs` (dazu der Schalter `releaseOnClose`, Abschnitt 1a, und die Auswahl `defaultSellerTypeId`, Abschnitt 1b) und persistiert Änderungen ausschließlich
serverseitig — nie im `localStorage` (Epic_Einstellungen AC-1).

---

## 1. Feld — ScannerPauseMs

Erstes der drei Felder des Formulars (das zweite ist der Schalter in Abschnitt 1a, das dritte die Auswahl in Abschnitt 1b).

- `input-group` Anzahl-Variante: `ms`-Addon rechts, `modes=['keyboard','numpad']` (kein
  Kamera-Modus — ein Millisekunden-Pausenwert wird nie gescannt).
- Hilfstext unter dem Feld: „Wie lange das Scan-Ergebnis am Annahmetisch angezeigt wird, bevor
  automatisch weitergescannt werden kann. Gültige Werte: 500–15.000 ms."
- Gültige Spanne: **500–15.000 ms** (serverseitig per FluentValidation erzwungen, `400` bei
  Verstoß).

---

## 1a. Feld — ReleaseOnClose

- `app-boolean-input` (Variante `switch`) mit der Beschriftung „Artikel erst beim Schließen des
  Freigabe-Dialogs freigeben"; Standardstellung **an** (Verhalten wie heute).
- Hilfstext unter dem Schalter: „Gilt nur für Verkäufer ohne Gebühr."
- Wirkung: Aus = das Freigeben-Popup gibt bei Verkäufern mit Gebühr je Stück 0 jeden erfassten Artikel
  sofort frei; bei Gebühr je Stück größer 0 ohne Wirkung. Der Schalter wird erst über „Speichern"
  wirksam (gemeinsam mit der Scan-Pause per `PUT /api/settings`) und gilt auf jedem Gerät ab dem
  nächsten Öffnen des Freigeben-Popups.
- Ungespeicherte Stellung zählt zu `hasUnsavedChanges`; `discardChanges()` stellt die zuletzt
  gespeicherte Stellung wieder her.

---

## 1b. Feld — DefaultSellerTypeId

- `p-select` unter dem Schalter aus Abschnitt 1a, Beschriftung „Standard-Verkäufer-Typ";
  Optionen = alle Verkäufer-Typen (`SellerTypesApi.getAll()`, `optionLabel="name"`,
  `optionValue="id"`), löschbar (`showClear`), Platzhalter „Häufigster Typ (automatisch)".
- Hilfstext unter der Auswahl: „Wird bei „Neuer Verkäufer" und in der Artikelannahme
  vorausgewählt. Leer = am häufigsten zugewiesener Typ."
- Wirkung: Der gewählte Typ wird in `verkaeufer-dialog` (Anlege-Modus) und `intake-wizard`
  (Schritt 1) vorausgewählt, solange er existiert; leer (`null`) = der Typ mit dem höchsten
  `sellerCount` (bei Gleichstand der erste). Beide lesen die Einstellung beim Laden über
  `SettingsService.load()` neu — kein App-Reload nötig.
- Wird erst über „Speichern" wirksam (gemeinsam mit den anderen Feldern per `PUT /api/settings`).
  Eine nicht mehr existierende Id lehnt der Server mit `404 seller_type.not_found` ab; das
  Formular zeigt dann den generischen Fehler-Toast (Abschnitt 2).
- Ungespeicherte Auswahl zählt zu `hasUnsavedChanges`; `discardChanges()` stellt die zuletzt
  gespeicherte Auswahl wieder her.

---

## 2. Verhalten

### Laden

Beim Betreten der Seite lädt das Formular den aktuellen Wert per `GET /api/settings`
(`SettingsApi.get()`) und zeigt ihn im Feld an; parallel lädt es die Verkäufer-Typen
(`GET /api/seller-types`) als Optionen der Auswahl aus Abschnitt 1b.

### Speichern

„Speichern"-Button (`p-button`), `disabled` solange ein Speichervorgang läuft
(`saving`-Signal). Klick löst `PUT /api/settings` (`SettingsApi.update()`) mit dem aktuellen
Feldwert aus.

- **Erfolg:** Toast `severity="success"`, `summary: '✓ Einstellungen gespeichert'`
  (PrimeNG `MessageService`).
- **`400` (Wertebereichsverstoß):** Feldfehler unter dem `input-group`-Feld
  (`errors.scannerPauseMs[0]` aus dem `ValidationProblem`-Body), **kein** Erfolgs-Toast.
- **Sonstiger Fehler** (Netzwerk, `5xx`, …): generischer Fehler-Toast
  (`severity="error"`), mirroring der `seller-types-page`-Fallback-Behandlung.

---

## 3. Abgrenzung zu SettingsService

`core/settings/settings.service.ts` (Round-25 Task 5) ist der **App-weite Lesepfad** für
Konsumenten wie `scan-feedback`/`scan-dialog` — beim App-Start einmal per
`provideAppInitializer` geladen und danach als Signal gecached.

`settings-form` liest und schreibt **unabhängig davon** über eine eigene
`SettingsApi` (`features/settings/data/settings-api.ts`): das Formular braucht einen
Live-Server-Roundtrip für Speichern und Fehlerbehandlung (`400` → Feldfehler), nicht den
gecachten App-weiten Lesewert. Die beiden Pfade werden bewusst nicht zusammengeführt.

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL beim Betreten der Seite den aktuellen `ScannerPauseMs`-Wert per
   `GET /api/settings` laden und im Feld anzeigen.
2. **AC-2** — THE SYSTEM SHALL das Feld als `input-group` Anzahl-Variante mit `ms`-Addon und
   den Modi Tastatur/Numpad darstellen; kein Kamera-Modus.
3. **AC-3** — THE SYSTEM SHALL einen Hilfstext anzeigen, der die Wirkung des Werts und die
   gültige Spanne (500–15.000 ms) nennt.
4. **AC-4** — WHEN „Speichern" geklickt wird UND der Wert im gültigen Bereich liegt, THEN
   SHALL das System `PUT /api/settings` senden und bei Erfolg einen Toast
   „✓ Einstellungen gespeichert" anzeigen.
5. **AC-5** — WHEN der Server auf `PUT /api/settings` mit `400` antwortet
   (Wertebereichsverstoß), THEN SHALL das System einen Feldfehler unter dem Eingabefeld
   anzeigen und KEINEN Erfolgs-Toast.
6. **AC-6** — THE SYSTEM SHALL den Wert ausschließlich serverseitig persistieren; eine
   Ablage im `localStorage` SHALL nicht erfolgen (Epic_Einstellungen AC-1).
7. **AC-7** — THE SYSTEM SHALL den Schalter „Artikel erst beim Schließen des Freigabe-Dialogs
   freigeben" mit dem Hilfetext „Gilt nur für Verkäufer ohne Gebühr." anzeigen, standardmäßig
   eingeschaltet.
8. **AC-8** — WHEN „Speichern" geklickt wird, THEN SHALL das System die Stellung des Schalters
   zusammen mit der Scan-Pause per `PUT /api/settings` senden; eine nicht gespeicherte
   Stellung SHALL beim Neuladen der Seite durch die zuletzt gespeicherte ersetzt werden.
9. **AC-9** — THE SYSTEM SHALL unter dem Schalter die löschbare Auswahl „Standard-Verkäufer-Typ"
   mit allen Verkäufer-Typen, dem Platzhalter „Häufigster Typ (automatisch)" und dem Hilfetext
   „Wird bei „Neuer Verkäufer" und in der Artikelannahme vorausgewählt. Leer = am häufigsten
   zugewiesener Typ." anzeigen.
10. **AC-10** — WHEN „Speichern" geklickt wird, THEN SHALL das System `defaultSellerTypeId`
    (bei leerer Auswahl `null`) zusammen mit den übrigen Feldern per `PUT /api/settings` senden;
    eine ungespeicherte Auswahl SHALL zu `hasUnsavedChanges` zählen und durch
    `discardChanges()` auf den gespeicherten Wert zurückgesetzt werden.

---

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #einstellungen #settings-form #input-group
