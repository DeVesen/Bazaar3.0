---
id: C-025
status: draft
updated: 2026-09-20
---

# Component: SettingsForm

**Bibliothek:** PrimeNG — `app-input-group` (Anzahl-Variante, Round-25 Task 6a) · `p-button` ·
Feldfehler als einfaches bedingtes `<p>`-Element unter dem Feld (kein `p-message`) — dieselbe
Baseline wie `change-password-page` (`src/bazaar-app/frontend/.../change-password-page.html`)
und der Server-Feldfehler-Zweig von `seller-types-page`: kein eigenständiges
PrimeNG-Message-Widget, sondern ein bedingt gerendertes Text-Element, das erscheint, sobald
ein Feldfehler-Signal gesetzt ist.
**Verwendung:** Haupt-App, `/settings` (nur Admin).

## Index

- Überblick — Konzept
- 1. Feld — ScannerPauseMs
- 2. Verhalten — Laden, Speichern, Fehler
- 3. Abgrenzung zu SettingsService — Lese- vs. Schreibpfad
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Admin-Formular mit einem Feld (`ScannerPauseMs`) zur Pflege der
Basar-weiten Systemparameter aus [Epic_Einstellungen](../../requirements/bazaar-app/epics/Epic_Einstellungen/epic.md)
Abschnitt 1.

**Verwendungszweck:** Einziger Editier-Weg für `scannerPauseMs`; die Seite lädt den aktuellen
Wert beim Betreten und schreibt Änderungen per `PUT /api/settings` serverseitig zurück.

---

## Überblick

`settings-form` ist ein einfeldriges Formular auf der `/settings`-Seite (Admin only). Es
verwendet die Anzahl-Variante der [InputGroup](../input-group/component.md) (Abschnitt 5a) für
den einzigen Systemparameter `scannerPauseMs` und persistiert Änderungen ausschließlich
serverseitig — nie im `localStorage` (Epic_Einstellungen AC-1).

---

## 1. Feld — ScannerPauseMs

- `input-group` Anzahl-Variante: `ms`-Addon rechts, `modes=['keyboard','numpad']` (kein
  Kamera-Modus — ein Millisekunden-Pausenwert wird nie gescannt), Numpad `showDecimal="false"`.
- Hilfstext unter dem Feld: „Wie lange das Scan-Ergebnis am Annahmetisch angezeigt wird, bevor
  automatisch weitergescannt werden kann. Gültige Werte: 500–15.000 ms."
- Gültige Spanne: **500–15.000 ms** (serverseitig per FluentValidation erzwungen, `400` bei
  Verstoß).

---

## 2. Verhalten

### Laden

Beim Betreten der Seite lädt das Formular den aktuellen Wert per `GET /api/settings`
(`SettingsApi.get()`) und zeigt ihn im Feld an.

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

---

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #einstellungen #settings-form #input-group
