---
round: Round-16
status: geklärt
---

# Spec: Round 16 — Artikelannahme: Verkäufer-Suche & Scan-Infrastruktur

## Fein-Spezifikation

### Ziel

Erster Teil des Artikelannahme-Wizards (Verkäufer finden oder neu anlegen) plus die
geteilten Eingabe-/Scan-Komponenten, die spätere Häppchen (Round-17 Artikeleingabe,
Verkauf, Freigabe, Abrechnung) wiederverwenden.

### Nachtrag: Fix Round-15 (mit Nutzer abgestimmt, 2026-09-17)

Beim Klären dieses Rounds fiel auf, dass [Round-15/spec.md](../Round-15/spec.md)
(Artikel-Dialog) bereits `autocomplete-create` und `input-group` voraussetzte — beide
Komponenten werden aber erst **hier** gebaut. Round-15/spec.md wurde entsprechend
korrigiert: Marke/Kategorie dort vorläufig über `p-select`, Preis über `p-inputNumber`,
mit Vermerk, dass Round-16 den Artikel-Dialog auf die geteilten Komponenten umrüstet.
**Diese Umrüstung ist Teil des Nachfolge-Rounds, der den Artikel-Dialog inhaltlich
anfasst** (nicht zwingend dieser Round, da Round-16 selbst keine Artikel-Dialog-Änderung
vornimmt) — nachzuziehen, sobald ein Round den Artikel-Dialog wieder berührt.

### Frontend

**Feature-Ordner** `src/app/features/intake/`, Route `/intake` (Startseite/Home-Redirect).

**Such-Ansicht** (Einstiegs-Zustand von `intake.page.ts`): [`seller-search`](../../../components/seller-search/component.md)
in `p-card`, max-width 500px, `showCreateButton="true"`. **`showScanButton` nicht
gesetzt** — weder Epic_Artikelannahme Abschnitt 1 noch round.md verlangen Kamera-Scan
in der Such-Ansicht. Hinweistext „ENTER bei 1 Treffer öffnet Wizard · Kein Treffer:
Anlegen-Button erscheint". Abgerechnete Verkäufer bleiben in der Trefferliste sichtbar
(Badge „Abgerechnet"), Auswahl blockiert mit dem Hinweis, dass ein Admin die Abrechnung
stornieren muss — kein Wizard-Öffnen (Epic AC-12).

**Wizard-Shell** (`features/intake/components/intake-wizard/`): Zwei-Tab-Navigation
(„Schritt 1 — Verkäufer" / „Schritt 2 — Artikelannahme"), Tab-Stil nach
Epic_Artikelannahme Abschnitt 2.

- **Schritt 1** (Weg: „+ Neuen Verkäufer anlegen"): Formular nach
  [ANNAHME-S02](../../../requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md)
  — Panels 01 Personendaten, 02 Kontakt, 03 Konditionen. Vorname/Nachname aus der
  Sucheingabe vorbelegt (Text vor erstem Leerzeichen = Vorname, danach = Nachname).
  Verkäufer-Typ vorbelegt mit dem häufigsten Typ (`sellerCount`, Round-13), frei
  wählbar auch von Kassenpersonal; Typ-Wechsel befüllt `feePerItem`/`salesCommission`
  aus dem Typ. **Konditionsfelder schreibgeschützt bei Kassenpersonal** — Epic_Artikelannahme
  Abschnitt 2 ist hier die maßgebliche Quelle, ANNAHME-S02 zeigt diese Einschränkung in
  seiner Feldtabelle nicht (Doku-Lücke der Story, keine Nutzer-Entscheidung nötig, Epic
  ist verbindlich). Pflicht: Vorname, Nachname, E-Mail, Typ. „Weiter" deaktiviert bis
  alle Pflichtfelder gefüllt.
  - „Weiter" → `POST /api/sellers` (Round-14, real) → bei Erfolg Wechsel zu Schritt 2
    mit der neuen `sellerId`. Schlägt das Anlegen fehl, bleiben Eingaben erhalten,
    Fehlermeldung, Verbleib auf Schritt 1 (ANNAHME-S02 AC-9).
  - **Abbrechen im Wizard** → `DELETE /api/sellers/{id}` (Round-14, real, greift nur
    ohne Artikel) — **einzige Ausnahme** vom „Löschen ist Admin-Sache": gilt
    ausschließlich für den in dieser Sitzung selbst angelegten Verkäufer, auch für
    Kassenpersonal (Epic AC-11).
- **Schritt 2** (Weg: bestehender Verkäufer per Suche, oder direkt nach „Weiter" aus
  Schritt 1): **Platzhalter** in diesem Round — zeigt „Artikeleingabe folgt in einem
  späteren Häppchen", hält die aufgelöste `sellerId` aber bereits vor (Tab ist
  erreichbar und funktional verdrahtet, Inhalt kommt in einem Folge-Round). Kein
  `POST /api/intake` in diesem Round.

### Geteilte Komponenten (`src/app/shared/components/`)

Echte Cross-Feature-Bausteine — verwendet ab Round-17 (Artikeleingabe) und später in
Verkauf/Freigabe/Abrechnung, nicht nur von diesem Feature:

- **`barcode-scanner`** — dumme Standalone-Komponente exakt nach
  [barcode-scanner.md](../../../components/barcode-scanner/component.md): reiner
  `@zxing/browser`-Wrapper, `[active]`/`[formats]` als Input, `codeDetected` als
  Output, kein Feedback-UI, keine Domain-Kenntnis. `facingMode: 'environment'`,
  MediaStream-Release bei `active=false` oder Destroy.
- **`input-group`** — alle drei Modi (Tastatur/Kamera/Numpad) nach
  [input-group.md](../../../components/input-group/component.md): `modes`-Input,
  feste Button-Reihenfolge Tastatur→Kamera→Numpad, Startmodus immer Tastatur (kein
  `localStorage`), Debounce 300ms fest im Code (keine `suchDebounceMs`-Einstellung).
  Preis-Variante (`p-inputnumber`, €-Rechts-Addon, optionaler Numpad-Modus-Button).
  Kamera-Slot bettet `barcode-scanner` ein.
- **`autocomplete-create`** — nach
  [autocomplete-create.md](../../../components/autocomplete-create/component.md):
  ▾/+-Modus-Wechsel anhand exaktem Textabgleich gegen `options`, Anlegen-Modal
  (`entityLabel`-parametrisiert), `entryCreated`-Output mit dem neuen Namen. Kennt
  keine API — das Parent legt den Eintrag serverseitig an und aktualisiert `options`.
- **`scan-feedback`** — Ton (Web Audio API, Ping 880→1320 Hz Erfolg / Zonk 180→120 Hz
  Fehler) + Vibration (`Navigator.vibrate()`) + SVG-Countdown-Ring über
  `scannerPauseMs` (ANNAHME-S01 AC-2 bis AC-4). **`scannerPauseMs` als Code-Konstante
  `3000`** in diesem Round — round.md weicht hier bewusst von ANNAHME-S01 AC-9 ab
  (dort: aus den Einstellungen lesen), weil Einstellungen/Systemparameter erst in
  [Round-25](../Round-25/round.md) entstehen; Round-25 muss die echte Anbindung
  nachziehen. **Kein Consumer in Round-16 selbst** — weder die Verkäufer-Suche (kein
  `showScanButton`) noch der Schritt-2-Platzhalter nutzen sie live. Sie wird
  eigenständig gebaut und komponententestbar isoliert, erster echter Einsatz ab
  Round-17 (Artikelnummer-Feld) bzw. später im Scan-Dialog.

### Backend

Einziges neues Stück in diesem Round — alle übrigen in round.md gelisteten Endpoints
(`GET /api/sellers/search`, `POST /api/sellers`, `DELETE /api/sellers/{id}`) sind
bereits aus [Round-14](../Round-14/spec.md) real vorhanden, keine Änderung nötig:

- `GET /api/articles/next-number` (`authenticated`) —
  `Bazaar.Application/Articles/GetNextArticleNumberHandler`, liest über
  `IArticleRepository.GetMaxNumber()` (neue Methode am Port aus
  [Round-15](../Round-15/spec.md)) die höchste vergebene Nummer, Response
  `{nextNumber: max+1}` (`1` falls keine Artikel existieren). Reserviert nichts —
  Eindeutigkeit entscheidet erst `POST /api/intake` (späterer Round).

### Akzeptanzkriterien

Epic_Artikelannahme AC-1 bis AC-4, AC-10 bis AC-12 (Such-Ansicht, Wizard-Schritt-1,
Abbrechen, blockierte abgerechnete Verkäufer). AC-5 bis AC-9 (Artikeleingabe, Buchen)
gehören zu Schritt 2 und damit zu einem Folge-Round. ANNAHME-S01 (Inline-Kamera mit
Countdown) und ANNAHME-S02 (Formular Schritt 1) vollständig, mit der oben genannten
Ausnahme bei ANNAHME-S02 (Konditions-Schreibschutz folgt der Epic-Fassung).

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Component-Tests (Vitest) für alle vier geteilten Komponenten — insbesondere
  `input-group` Modus-Wechsel-Logik und `barcode-scanner` Kamera-Lifecycle
  (MediaStream-Mock).
- Application-UnitTest für `GetNextArticleNumberHandler`.
- Frontend: Such-Ansicht, `intake-wizard`, Schritt-1-Formular — Vitest.

### Bewusst nicht in diesem Round

Schritt 2 des Wizards (Artikeleingabe, Sitzungsliste, Buchen), `POST /api/intake` —
folgen direkt danach. Echte Anbindung von `scannerPauseMs` an Einstellungen (→
Round-25). Umrüstung des Artikel-Dialogs (Round-15) auf `autocomplete-create`/
`input-group` (→ nächster Round, der den Artikel-Dialog anfasst).
