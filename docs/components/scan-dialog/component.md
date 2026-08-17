---
id: C-003
status: draft
updated: 2026-07-31
---

# Component: Scan-Dialog

**Bibliothek:** Eigener Wrapper — `p-dialog` + Web-Kamera-API (kein externes Package)
**Verwendung:** Bazaar Haupt-App — überall dort, wo Artikel per Nummer oder Kamera-Scan einem Zeitstempel zugeordnet werden.

## Index

- Überblick — Konzept & Modi
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Eingabe-Modus — Tastatureingabe
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

Der Dialog hat zwei Modi, zwischen denen der Nutzer jederzeit wechseln kann:

- **Eingabe-Modus** — Tastatureingabe + AutoComplete-Liste
- **Kamera-Modus** — Inline-Kamerabild mit Feedback-Overlay

---

## 1. ASCII-Darstellung

```
Eingabe-Modus:
┌─────────────────────────────────────────────┐
│  Artikel freigeben                       [✕] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌────────────────────────────────┬──────┐  │
│  │ Artikelnummer eingeben ...     │ [📷] │  │
│  └────────────────────────────────┴──────┘  │
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

Kamera-Modus (nach Klick auf [📷]):
┌─────────────────────────────────────────────┐
│  Artikel freigeben                       [✕] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │         [ Kamerabild ]              │   │
│  │                                     │   │
│  │  ┌───────────────────────────────┐  │   │
│  │  │  ✓  Freigegeben   (grün)      │  │   │  ← Feedback-Overlay
│  │  │  ⚠  Bereits gesetzt (gelb)    │  │   │    (nur eines sichtbar)
│  │  │  ✕  Nicht bekannt  (rot)      │  │   │
│  │  └───────────────────────────────┘  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [← Zurück zur Eingabe]                    │
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
| `pauseMs` | `number` | `@Input` | Anzeigedauer des Scan-Feedbacks in ms (Default: aus App-Einstellungen `scannerPauseMs`) |
| `scanComplete` | `ScanResultEvent` | `@Output` | Emittiert nach erfolgreichem Scan: `{ articleId, result: 'success' \| 'already-set' \| 'unknown' }` |
| `visibleChange` | `boolean` | `@Output` | Two-way-Binding — emittiert `false` wenn Dialog geschlossen wird |

---

## 3. Eingabe-Modus

### Verhalten der AutoComplete-Liste

| Zustand | Anzeige |
|---|---|
| Feld leer | Alle ausstehenden Artikel des Verkäufers |
| Text eingegeben | Gefiltert nach Artikelnummer |
| Genau 1 Treffer + `Enter` | Zeitstempel gesetzt; Feld leert sich; Liste zeigt wieder alle ausstehenden |
| Kein Treffer | Liste ausgeblendet; Text *„Artikel nicht bekannt"* |
| Alle Artikel bereits gesetzt | Nur Text: *„Alle Artikel freigegeben"* / *„Alle Artikel zurückgegeben"* |

### BC-Button

`p-button [icon]="'pi-camera'" severity="secondary" [outlined]="true"` — rechts neben dem Eingabefeld.
Klick → wechselt in **Kamera-Modus**.

---

## 4. Kamera-Modus

Das Kamerabild ersetzt Eingabefeld und AutoComplete-Liste vollständig.

→ Komponente: [Barcode-Scanner](../barcode-scanner/component.md) — `[active]="true"` · `(codeDetected)="onScan($event)"`

### Scan-Feedback-Overlay

Erscheint nach jedem Scan für `pauseMs` Millisekunden, dann wird das Kamerabild wieder aktiv.

| Ergebnis | Farbe | Bedeutung |
|---|---|---|
| Artikel gefunden und Zeitstempel gesetzt | Grün | Erfolg |
| Zeitstempel war bereits gesetzt | Gelb | Bereits verarbeitet |
| Artikel nicht bekannt | Rot | Unbekannte Nummer |

### Feedback-Nebeneffekte

- **Ton:** Web Audio API (kein Audio-File-Dependency)
- **Vibration:** `Navigator.vibrate()` — nur auf mobilen Geräten mit Unterstützung

### Abbrechen-Button

`p-button label="← Zurück zur Eingabe" severity="secondary" [text]="true"` — unterhalb des Kamerabilds.
Klick → zurück in **Eingabe-Modus**.

---

## 5. Dialog-Verhalten

- Größe: Standard (`md`)
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

pInputText         ← Artikelnummer-Eingabefeld
p-button           ← BC-Button (Kamera-Wechsel), Zurück-Button
p-listbox          ← AutoComplete-Liste der ausstehenden Artikel
```

Kameraintegration und Barcode-Dekodierung: [Barcode-Scanner](../barcode-scanner/component.md) — kapselt `@zxing/browser` + `@zxing/library`.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN der Dialog geöffnet wird, THEN SHALL das System den Fokus automatisch auf das Artikelnummer-Eingabefeld setzen.
2. **AC-2** — WHEN eine Artikelnummer eingegeben und bestätigt wird und der Artikel dem Verkäufer gehört und der Zeitstempel noch nicht gesetzt ist, THEN SHALL das System den konfigurierten Zeitstempel (`releasedAt` oder `returnedAt`) auf den aktuellen Zeitpunkt setzen und `scanComplete` mit `result: 'success'` emittieren.
3. **AC-3** — WHEN im Kamera-Modus ein Barcode erkannt wird, dessen Zeitstempel bereits gesetzt ist, THEN SHALL das System das Feedback-Overlay in Gelb für `pauseMs` Millisekunden einblenden und `scanComplete` mit `result: 'already-set'` emittieren.
4. **AC-4** — IF eine eingegebene oder gescannte Nummer keinem ausstehenden Artikel des Verkäufers entspricht, THEN SHALL das System im Eingabe-Modus den Text „Artikel nicht bekannt" unterhalb des Felds anzeigen und im Kamera-Modus das Feedback-Overlay in Rot für `pauseMs` Millisekunden einblenden.
5. **AC-5** — WHEN der Dialog über ✕-Button oder Escape geschlossen wird, THEN SHALL das System die Kamera stoppen, alle MediaStream-Tracks freigeben und `visibleChange: false` emittieren.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #scan-dialog #popup #zeitstempel #barcode #kamera
