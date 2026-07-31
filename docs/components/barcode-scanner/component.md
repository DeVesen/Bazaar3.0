---
id: C-002
status: draft
updated: 2026-07-31
---

# Component: Barcode-Scanner

**Bibliothek:** Eigener Wrapper — `@zxing/browser` + `@zxing/library`
**Verwendung:** Bazaar Haupt-App — überall dort, wo ein Barcode oder QR-Code per Kamera erkannt werden soll.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Kamera-Lifecycle — Start & Stop
- 4. Scan-Verhalten — Dekodierung & Emission
- 5. Verwendungsstellen
- 6. Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Kamera-Barcode-Scanner-Komponente, die per Kamerabild Barcodes erkennt und den gescannten Wert zurückgibt.

**Verwendungszweck:** Wird in Feature Verkauf eingesetzt, wenn ein Artikel per Kamera-Scan statt USB-Scanner erfasst wird.

---

## Überblick

Der Barcode-Scanner ist eine schlanke Standalone-Komponente, die ausschließlich Folgendes tut:
- Live-Kamerabild anzeigen
- Kontinuierlich Barcodes und QR-Codes dekodieren
- Jeden erkannten Rohwert als Event emittieren

Die Komponente hat **keine Domain-Kenntnis** und **kein eigenes Feedback-UI**. Sie weiß nicht, was der erkannte Wert bedeutet. Feedback (Farben, Ton, Overlay, Auswertung) ist ausschließlich Aufgabe des einbettenden Eltern-Elements.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────────┐
│                                             │
│           [ live Videostream ]              │
│                                             │
└─────────────────────────────────────────────┘
```

Die Komponente rendert ausschließlich ein `<video>`-Element — kein Header, kein Button, kein Overlay.
Breite: 100 % des Eltern-Elements. Höhe: `auto` (Kamera-Seitenverhältnis).

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Default | Beschreibung |
|---|---|---|---|---|
| `active` | `boolean` | `@Input` | `false` | `true` → Kamera startet, Scan-Loop läuft; `false` → Kamera und Loop stoppen |
| `formats` | `BarcodeFormat[]` | `@Input` | alle | Optionale Einschränkung auf bestimmte Formate (z. B. `[BarcodeFormat.QR_CODE]`) |
| `codeDetected` | `string` | `@Output` | — | Emittiert den dekodieren Rohwert bei jedem erkannten Code |

`BarcodeFormat` stammt aus `@zxing/library`.

**Hinweis zur Deduplizierung:** Die Komponente emittiert jeden erkannten Code sofort — auch denselben Code mehrfach hintereinander (kontinuierlicher Scan-Loop). Der Parent entscheidet, ob und wie er Duplikate behandelt.

---

## 3. Kamera-Lifecycle

| Zustand | Auslöser | Verhalten |
|---|---|---|
| **Inaktiv** | `active=false` (Default) | Kein Kamerazugriff, kein Videostream |
| **Startet** | `active` wechselt auf `true` | `getUserMedia({ video: { facingMode: 'environment' } })` → Stream an `<video>` gebunden → Scan-Loop startet |
| **Aktiv** | Kamera läuft | Kontinuierliche Frame-Dekodierung per `@zxing/browser` |
| **Stoppt** | `active` wechselt auf `false` oder Komponente wird zerstört | Alle MediaStream-Tracks werden released (`track.stop()`) |

**Kamera-Präferenz:** `facingMode: 'environment'` (Rückkamera auf Mobilgeräten); Fallback auf verfügbare Kamera.

---

## 4. Scan-Verhalten

### Dekodierung

`@zxing/browser` übernimmt den gesamten Scan-Loop und die Cross-Browser-Strategie:
- Liest kontinuierlich Frames aus dem `<video>`-Stream
- Dekodiert via `@zxing/library` (ZXing-Kern, Port der Java-Bibliothek)
- Kein separater `BarcodeDetector`-Pfad notwendig — `@zxing/browser` ist einheitlicher und zuverlässiger

### Emission

- Jeder erkannte Code → `codeDetected` wird sofort emittiert
- Kein internes Debouncing, kein Deduplication-Timeout
- Der einbettende Kontext bestimmt die Reaktion (verarbeiten, pausieren, ignorieren)

---

## 5. Verwendungsstellen

| Verwendung | Kontext | Scan-Zweck |
|---|---|---|
| Kamera-Modus | [Scan-Dialog](../scan-dialog/component.md) | Artikelnummer scannen |
| Scan-Modus | [Seller-Search](../seller-search/component.md) | Verkäufer-ID scannen |
| Kamera-Popup-Button | [Epic: Artikelannahme](../../requirements/bazaar-app/epics/Epic_Artikelannahme/epic.md) | Artikelnummer scannen |
| Kamera-Scan | [Epic: Verkauf](../../requirements/bazaar-app/epics/Epic_Verkauf/epic.md) | Artikelnummer scannen |

---

## 6. Technische Basis

```
<video autoplay playsinline>      ← Kamerabild (100 % Breite, kein eigener Rahmen)

@zxing/browser
  BrowserMultiFormatReader        ← Kamera-Zugriff + kontinuierlicher Scan-Loop

@zxing/library
  BarcodeFormat                   ← Format-Enum für @Input formats
  Result                          ← Dekodierungsergebnis (getText() → string)
```

Kein PrimeNG-Anteil — die Komponente ist ein reiner Kamera-Wrapper ohne UI-Framework-Abhängigkeit.
Einbettende Komponenten (Scan-Dialog, Seller-Search u. a.) rahmen den Scanner mit eigenen PrimeNG-Elementen ein.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN `active` auf `true` gesetzt wird, THEN SHALL das System `getUserMedia({ video: { facingMode: 'environment' } })` aufrufen und das Live-Kamerabild im `<video>`-Element anzeigen.
2. **AC-2** — WHEN ein gültiger Barcode oder QR-Code im Kamerabild erkannt wird, THEN SHALL das System den dekodierten Rohwert über das Event `codeDetected` emittieren.
3. **AC-3** — WHEN `active` auf `false` gesetzt wird, THEN SHALL das System alle MediaStream-Tracks über `track.stop()` freigeben und den Videostream beenden.
4. **AC-4** — WHEN die Komponente zerstört wird, THEN SHALL das System alle noch laufenden MediaStream-Tracks freigeben und den Scan-Loop beenden.
5. **AC-5** — IF die Kamerafreigabe durch den Browser verweigert wird, THEN SHALL das System keinen Videostream starten und keine `codeDetected`-Events emittieren.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #barcode-scanner #kamera #scan #primeng #popup
