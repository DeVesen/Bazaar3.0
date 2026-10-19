---
id: C-003
status: draft
updated: 2026-08-18
---

# Component: Scan-Dialog

**Bibliothek:** Eigener Wrapper — `p-dialog` + Web-Kamera-API (kein externes Package)
**Verwendung:** Bazaar Haupt-App — überall dort, wo Artikel per Nummer oder Kamera-Scan einem Zeitstempel zugeordnet werden.

## Index

- Überblick — Konzept & Modi
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Tastatur- und Numpad-Modus — Tastatureingabe
- 4. Kamera-Modus — Scan & Overlay
- 5. Dialog-Verhalten — Öffnen & Schließen
- 6. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Popup-Dialog-Komponente zum Setzen von Artikel-Zeitstempeln per Barcode oder Kamera-Scan.

**Verwendungszweck:** Wird in der Artikelannahme und anderen Epics eingesetzt, wo Zeitstempel per Scan gesetzt werden.

---

## Überblick

Der Scan-Dialog deckt zwei Anwendungsfälle ab, die **strukturell identisch** sind und sich nur durch den zu setzenden Zeitstempel unterscheiden:

| Anwendungsfall | Setzt |
|---|---|
| Artikel freigeben | `releasedAt = jetzt` |
| Artikel zurückgeben | `returnedAt = jetzt` |

Das Artikelnummer-Feld des Dialogs ist ein [Input](../app-input/component.md) (`app-input`) mit
dem Label „Artikelnummer" im Feldrahmen, ohne Lupe. Rechts bündig am Feld sitzen die Buttons
Kamera, Nummernblock, Löschen und Übernehmen — Reihenfolge und Optik wie das Verkauf-Feld.
Kamera und Nummernblock klappen unter dem Feld auf. Zwischen Feld und Artikelliste liegen 24 px.

**Breite:** ≥ 1024 px höchstens 50 %, 768–1023 px höchstens 80 %, ≤ 767 px 100 %, horizontal
zentriert (globale Klasse `dialog-responsive`), max. Höhe 90vh.

| Modus | Besonderheit im Scan-Dialog |
|---|---|
| Tastatur | AutoComplete-Liste der ausstehenden Artikel unter dem Feld |
| Kamera | Kamerabild ersetzt die Liste; Dauerscan mit Ergebnis-Einblendung (Abschnitt 4). Das Feld selbst bleibt stehen |
| Numpad | AutoComplete-Liste bleibt sichtbar; `⏎` bestätigt die getippte Nummer |

---

## 1. ASCII-Darstellung

```
Tastatur-Modus:
┌─────────────────────────────────────────────┐
│  Artikel freigeben                       [✕] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────┬──┬──┬──┐  │
│  │Artikelnummer eingeben ...    │↩ │📷│⊞ │  │
│  └──────────────────────────────┴──┴──┴──┘  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  101 — Jacke blau                   │   │
│  │  102 — Hose grau                    │   │
│  │  103 — Pullover rot                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Alle Artikel freigegeben.  ← wenn leer    │
│                                             │
└─────────────────────────────────────────────┘

Kamera-Modus:
┌─────────────────────────────────────────────┐
│  Artikel freigeben                       [✕] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │         [ Kamerabild ]              │   │
│  │                                     │   │
│  │             ✓ / ✓ / ✕               │   │  ← Ergebnis-Einblendung: nur Icon,
│  │   (grün / gelb / rot), zentriert,   │   │    1,5 s, ohne Schleier
│  │   mit Ton und Vibration             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [⌨ Tastatur]  [⊞ Numpad]                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `visible` | `boolean` | `@Input` | Steuert ob der Dialog offen ist |
| `title` | `string` | `@Input` | Dialog-Überschrift (z. B. „Artikel freigeben") |
| `sellerId` | `string` | `@Input` | ID des Verkäufers — begrenzt die AutoComplete-Liste auf dessen ausstehende Artikel |
| `targetField` | `'releasedAt' \| 'returnedAt'` | `@Input` | Welcher Zeitstempel gesetzt wird |
| `pauseMs` | `number` | `@Input` | Scan-Pause im Kamera-Modus in ms (dasselbe Bild wird währenddessen nicht erneut ausgewertet; Default unverändert: aus App-Einstellungen `scannerPauseMs`) |
| `scanComplete` | `ScanResultEvent` | `@Output` | Emittiert nach erfolgreichem Scan: `{ articleId, result: 'success' \| 'already-set' \| 'unknown' }` |
| `visibleChange` | `boolean` | `@Output` | Two-way-Binding — emittiert `false` wenn Dialog geschlossen wird |
| `writeMode` | `'batch' \| 'immediate'` | `@Input` | `'batch'` (Default): Treffer werden in der Sitzung gesammelt (`sessionArticleIds`), der Elternteil schreibt am Ende. `'immediate'`: jeder Treffer löst sofort `articleConfirmed` aus, die Sitzungsliste bleibt leer (Rückgabe in der Abrechnung; Freigeben-Popup bei ausgeschaltetem Schalter `releaseOnClose` und Gebühr je Stück 0) |
| `articleConfirmed` | `string` | `@Output` | Nur im Modus `'immediate'`: Artikel-ID eines erfolgreichen Treffers; der Elternteil schreibt |
| `reportWriteFailed()` | — | Methode | Der Elternteil meldet im Modus `'immediate'`, dass das Schreiben scheiterte: Liste der ausstehenden Artikel wird neu geladen, die Ergebnis-Einblendung zeigt rot |

---

## 3. Tastatur- und Numpad-Modus

### Verhalten der AutoComplete-Liste

| Zustand | Anzeige |
|---|---|
| Feld leer | Alle ausstehenden Artikel des Verkäufers |
| Text eingegeben | Gefiltert nach Artikelnummer |
| Genau 1 Treffer + `Enter` | Zeitstempel gesetzt; Feld leert sich; Liste zeigt wieder alle ausstehenden |
| Kein Treffer | Liste ausgeblendet; Text *„Artikel nicht bekannt"* |
| Alle Artikel bereits gesetzt | Nur Text: *„Alle Artikel freigegeben"* / *„Alle Artikel zurückgegeben"* |

Die Liste (im Sprachgebrauch „Auswahlliste“) zeigt die Artikel aufsteigend nach Artikelnummer; die Reihenfolge kommt vom Server (`GET /api/sellers/{id}/articles`, siehe `sellers.md` §6) und bleibt beim Filtern und beim Wegfall erfasster Artikel erhalten — der Dialog sortiert nicht selbst.

### Numpad-Modus

Der Numpad zeigt hier wie überall alle Tasten. `⏎` bestätigt die getippte Nummer — identisch zu `Enter` im
Tastatur-Modus (Tabelle oben).

---

## 4. Kamera-Modus

Das Kamerabild ersetzt Eingabefeld und AutoComplete-Liste vollständig.

→ Komponente: [Barcode-Scanner](../barcode-scanner/component.md) — `[active]="true"` · `(codeDetected)="onScan($event)"`

### Ergebnis-Einblendung

Jede Eingabe (Tastatur-Enter, Numpad-Bestätigung, Klick auf einen Listeneintrag, Kamera-Scan) löst die
[Ergebnis-Einblendung](../result-overlay/component.md) über dem Dialog-Inhalt aus — fest 1,5 s, unabhängig von
`pauseMs`. Der Ring-Countdown entfällt. `pauseMs` bleibt als Scan-Pause, die dasselbe Bild im Kamera-Modus nicht
mehrfach auswertet.

| Ergebnis | Einblendung | Bedeutung |
|---|---|---|
| Artikel des Verkäufers erfasst bzw. zurückgegeben (beim Freigeben schon beim Erfassen in der Sitzung) | Grüner Haken | Erfolg |
| Freigeben: bereits freigegeben (auch verkauft/zurückgegeben) oder in der Sitzung schon erfasst; Zurückgeben: bereits zurückgegeben | Gelber Haken | Bereits erledigt |
| Unbekannte Nummer, Artikel eines anderen Verkäufers, Zurückgeben: noch nicht freigegeben oder bereits verkauft, Such-Fehler (Netz/Server) | Roter X | Fehlgeschlagen |

Der Text „Artikel nicht bekannt" im Tastatur-Modus bleibt zusätzlich bestehen. Ton und Vibration kommen aus der
Einblendung.

### Verlassen des Kamera-Modus

Über den Kamera-Button am Feld (erneuter Klick) oder den Nummernblock-Button. Beim Wechsel gibt
das System die Kamera frei ([Barcode-Scanner](../barcode-scanner/component.md)).

---

## 5. Dialog-Verhalten

- Größe: Gestuft (`dialog-responsive`): ≥ 1024 px 50 %, 768–1023 px 80 %, ≤ 767 px 100 %
- Schließen über ✕-Button oder `Escape` emittiert `visibleChange: false`
- Beim Öffnen: Fokus automatisch auf Artikelnummer-Eingabefeld
- Beim Schließen: Kamera wird gestoppt (MediaStream-Tracks werden released)

---

## 6. PrimeNG-Basis

```
p-dialog
  [header]="title"
  [(visible)]="visible"
  [modal]="true"
  [closable]="true"

app-input          ← Artikelnummer-Feld (label im Rahmen) mit Kamera/Numpad/Löschen/Übernehmen-Addons
app-numpad         ← nur im Numpad-Modus
p-listbox          ← AutoComplete-Liste der ausstehenden Artikel
```

Kameraintegration und Barcode-Dekodierung: [Barcode-Scanner](../barcode-scanner/component.md) — kapselt `@zxing/browser` + `@zxing/library`.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN der Dialog geöffnet wird, THEN SHALL das System den Fokus automatisch auf das Artikelnummer-Eingabefeld setzen.
2. **AC-2** — WHEN eine Artikelnummer eingegeben und bestätigt wird und der Artikel dem Verkäufer gehört und der Zeitstempel noch nicht gesetzt ist, THEN SHALL das System den konfigurierten Zeitstempel (`releasedAt` oder `returnedAt`) auf den aktuellen Zeitpunkt setzen und `scanComplete` mit `result: 'success'` emittieren.
3. **AC-3** — WHEN eine Nummer erfasst wird, deren Zeitstempel bereits gesetzt ist (Freigeben: bereits freigegeben oder in der Sitzung schon erfasst; Zurückgeben: bereits zurückgegeben), THEN SHALL das System in jedem Eingabeweg einen gelben Haken einblenden und `scanComplete` mit `result: 'already-set'` emittieren.
4. **AC-4** — IF eine eingegebene oder gescannte Nummer keinem passenden Artikel des Verkäufers entspricht oder die Suche fehlschlägt, THEN SHALL das System in jedem Eingabeweg einen roten X einblenden und im Tastatur-Modus zusätzlich den Text „Artikel nicht bekannt" unterhalb des Felds anzeigen.
5. **AC-5** — WHEN der Dialog über ✕-Button oder Escape geschlossen wird, THEN SHALL das System die Kamera stoppen, alle MediaStream-Tracks freigeben und `visibleChange: false` emittieren.
6. **AC-6** — WHEN der Dialog geöffnet wird, THEN SHALL das System den Tastatur-Modus aktivieren und die drei Modi `keyboard`, `camera`, `numpad` anbieten.
7. **AC-7** — WHEN aus dem Kamera-Modus in einen anderen Modus gewechselt wird, THEN SHALL das System die Kamera stoppen und alle MediaStream-Tracks freigeben.
8. **AC-8** — IF die Kamera nicht verfügbar ist oder der Zugriff verweigert wird, THEN SHALL das System in den Tastatur-Modus zurückkehren und eine rote InfoArea mit dem Text „Kamerazugriff nicht möglich" anzeigen.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #scan-dialog #popup #zeitstempel #barcode #kamera
