---
id: DOC-003
status: draft
updated: 2026-07-31
---

# Komponenten — Übersicht

## Index
- Grundregel: Dumb Component — Architekturprinzip
- Grundregel: PrimeNG — UI-Bibliothek
- Komponenten-Index — Komponentenliste
- Tags & Piles — Ablage

Hier sind alle UI-Komponenten der Bazaar Suite beschrieben: Aussehen, Verhalten und Funktionen,
unabhängig vom Epic-Kontext. Jede Komponente hat ein eigenes Verzeichnis.

**Struktur pro Komponente:**

```
docs/components/<name>/
├── component.md      ← Hauptbeschreibung
└── reference/        ← optional: Referenz-Anhänge (Tabellen, Grafiken, Beispiele)
```

Epic-spezifische Ausprägungen (z. B. welche Spalten eine Tabelle zeigt)
bleiben im jeweiligen Epic-Dokument.

---

## Grundregel: Dumb Component

Jede Komponente ist gedanklich eine **Dumb Component** — sie enthält keine eigene Logik zur Datenbeschaffung und trifft keine fachlichen Entscheidungen.

- Alle Eingabedaten kommen über `@Input()`-Parameter herein
- Alle Ausgaben verlassen die Komponente ausschließlich über `@Output()`-Events
- Kein direkter API-Aufruf, kein HTTP-Request, keine Business-Logik innerhalb der Komponente
- Das **Parent** (Seite / Feature-Komponente) entscheidet: lokal in Memory verarbeiten oder an das Backend weiterleiten

---

## Grundregel: PrimeNG

Die Bazaar Suite verwendet ausschließlich **PrimeNG** als UI-Bibliothek.

- Kein natives HTML für UI-Elemente (keine `<button>`, `<select>`, `<input>` ohne PrimeNG-Direktive)
- Keine anderen UI-Bibliotheken (kein Angular Material, kein Bootstrap, kein Tailwind UI)
- Kein Mischmasch verschiedener Quellen
- **Gibt es keine passende PrimeNG-Komponente**, wird ein eigener Wrapper erstellt —
  der intern PrimeNG-Komponenten verwendet und das fehlende Verhalten ergänzt.

---

## Komponenten-Index

| Komponente | Beschreibung | Verzeichnis |
|---|---|---|
| **Table** | Listenansicht für Datensätze mit Sortierung, Paginierung, Aktionsspalte und Toolbar | [table/](table/component.md) |
| **Barcode-Scanner** | Schlanker Kamera-Wrapper: Live-Videostream + kontinuierliche Barcode-/QR-Dekodierung via `@zxing/browser`; kein eigenes UI, kein Feedback | [barcode-scanner/](barcode-scanner/component.md) |
| **Scan-Dialog** | Barcode-/Kamera-Scanner-Popup zum Setzen von Artikel-Zeitstempeln (Freigeben / Zurückgeben) | [scan-dialog/](scan-dialog/component.md) |
| **KPI-Tile** | Einzelne Kennzahl-Kachel mit Label, Wert und optionalem Severity-Akzent; wird im KPI-Grid (`c3`–`c6`) eingesetzt | [kpi-tile/](kpi-tile/component.md) |
| **AutoComplete-Create** | Erweitertes AutoComplete mit ▾-Auswahl-Modus und +-Anlegen-Modus (inkl. Anlegen-Modal) | [autocomplete-create/](autocomplete-create/component.md) |
| **Seller-Search** | Verkäufer-Suchfeld-Panel (InputGroup in Card mit Trefferliste und optionalem Anlegen-Button) | [seller-search/](seller-search/component.md) |
| **Payment-Panel** | Kassier-Panel: Gesamtbetrag + „Betrag erhalten"-Eingabe + live Rückgeld-Berechnung | [payment-panel/](payment-panel/component.md) |
| **Numpad** | Zustandsloser In-App-Ziffernblock für touch-freundliche Zahleneingabe ohne native Tastatur | [numpad/](numpad/component.md) |
| **Countdown** | Live-Countdown (Tage + HH:MM:SS) bis zu einem Zieldatum; Varianten für KPI-Tile und Info-Box | [countdown/](countdown/component.md) |
| **Activity-Heatmap** | 12-Wochen-Aktivitäts-Grid (GitHub-Style) mit Farb-Levels und Hover-Tooltip | [activity-heatmap/](activity-heatmap/component.md) |

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #components #primeng #overview #dumb-components #ui-konventionen
