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

---

## Überblick

Der Scan-Dialog deckt zwei Anwendungsfälle ab, die **strukturell identisch** sind und sich nur durch den zu setzenden Zeitstempel unterscheiden:

| Anwendungsfall | Setzt |
|---|---|
| Artikel freigeben | `freigegebenAm = jetzt` |
| Artikel zurückgeben | `rückgegebenAm = jetzt` |

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
| `targetField` | `'freigegebenAm' \| 'rückgegebenAm'` | `@Input` | Welcher Zeitstempel gesetzt wird |
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
