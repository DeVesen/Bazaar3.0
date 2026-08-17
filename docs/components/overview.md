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
- PrimeNG-Komponenten-Mapping — Forms, Buttons, Tabellen
- Globale Layout-Abstände — Content-Padding, Page-Header, Sidebar
- PrimeNG MISC-Komponenten — Direktiven und Widgets
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
| **QR-Code** | Erzeugt aus einem Rohstring einen scanbaren QR-Code als Inline-SVG (`@zxing/library`, clientseitig); Gegenstück zum Barcode-Scanner | [qr-code/](qr-code/component.md) |
| **Scan-Dialog** | Barcode-/Kamera-Scanner-Popup zum Setzen von Artikel-Zeitstempeln (Freigeben / Zurückgeben) | [scan-dialog/](scan-dialog/component.md) |
| **KPI-Tile** | Einzelne Kennzahl-Kachel mit Label, Wert und optionalem Severity-Akzent; wird im KPI-Grid (`c3`–`c6`) eingesetzt | [kpi-tile/](kpi-tile/component.md) |
| **AutoComplete-Create** | Erweitertes AutoComplete mit ▾-Auswahl-Modus und +-Anlegen-Modus (inkl. Anlegen-Modal) | [autocomplete-create/](autocomplete-create/component.md) |
| **Seller-Search** | Verkäufer-Suchfeld-Panel (InputGroup in Card mit Trefferliste und optionalem Anlegen-Button) | [seller-search/](seller-search/component.md) |
| **Payment-Panel** | Kassier-Panel: Gesamtbetrag + „Betrag erhalten"-Eingabe + live Rückgeld-Berechnung | [payment-panel/](payment-panel/component.md) |
| **Numpad** | Zustandsloser In-App-Ziffernblock für touch-freundliche Zahleneingabe ohne native Tastatur | [numpad/](numpad/component.md) |
| **Countdown** | Live-Countdown (Tage + HH:MM:SS) bis zu einem Zieldatum; Varianten für KPI-Tile und Info-Box | [countdown/](countdown/component.md) |
| **Activity-Heatmap** | 12-Wochen-Aktivitäts-Grid (GitHub-Style) mit Farb-Levels und Hover-Tooltip | [activity-heatmap/](activity-heatmap/component.md) |
| **InputGroup** | Kombiniertes Eingabefeld mit Prefix-/Suffix-Add-on (`p-inputgroup` + `p-inputgroupaddon`) | [input-group/](input-group/component.md) |
| **Info-Area** | Kontextbezogene Hinweis- und Statusfläche (Info-Box) für Seiten und Panels | [info-area/](info-area/component.md) |
| **Badge** | Status-Badge für Artikel- und Verkäufer-Zustände (success/danger/warn/info/sec/original/neu) | [badge/](badge/component.md) |
| **Modal** | Modaler Dialog auf Basis von `p-dialog [modal]="true"` (via `DialogService`) | [modal/](modal/component.md) |
| **Card** | Standard-Card und Panel-Block-Container für Formular- und Listeninhalte | [card/](card/component.md) |
| **Sidebar** | App-weite Navigations-Sidebar auf Basis der `p-sidebar`-Compound-Familie; Gruppen, Trennlinien, Active-Highlight, Footer-Slot | [sidebar/](sidebar/component.md) |
| **Sidebar-Footer** | Footer-Bereich der Sidebar mit Avatar, Rollenangabe, optionalem Role-Toggle und Abmelden-Button | [sidebar-footer/](sidebar-footer/component.md) |
| **Filter-Panel** | Mehrzeiliges Filter-Panel über Listen: Freitextsuche, Dropdowns, aktive Filter als Chips | [filter-panel/](filter-panel/component.md) |
| **Stammdaten-Popup** | Anlege-/Bearbeiten-Popup für einfache Stammdaten (Name + optionales Original-Flag) | [stammdaten-popup/](stammdaten-popup/component.md) |
| **Typ-Popup** | Anlege-/Bearbeiten-Popup für Verkäufer-Typen (Name, Provision, Gebühr) | [typ-popup/](typ-popup/component.md) |

### Atomare Bausteine

Einzelne Formular- und Feedback-Elemente. Sie beschreiben PrimeNG-Verhalten **plus** Projektkonventionen (Label-Stil, Pflichtfeld-Markierung, Fehlerdarstellung) — daran ist nichts app-spezifisch, darum liegen sie suite-weit. Zusammengesetzte Formulare verlinken sie statt sie erneut zu beschreiben.

**Bewusst ohne eigene Datei:** `p-chip`, `p-paginator`, `p-progressbar`, `p-fileupload` und `p-metergroup`. Sie werden je nur an einer oder zwei Stellen eingesetzt und tragen keine Projektkonvention über die PrimeNG-Standardnutzung hinaus — sie stehen dort beschrieben, wo sie vorkommen (Filter-Panel, Table, Import-Panel, Statistik). Eine eigene Datei je Einzelnutzung wäre Verwaltung ohne Ertrag.

| Komponente | Beschreibung | Verzeichnis |
|---|---|---|
| **Input** | Textfeld (`pInputText`) inkl. Label-, Pflichtfeld- und Fehlerkonvention | [input/](input/component.md) |
| **Select** | Auswahlfeld (`p-select`) | [select/](select/component.md) |
| **InputNumber** | Zahleneingabe mit deutscher Locale und festen Dezimalstellen je Variante (Geld, Prozent, Anzahl) | [inputnumber/](inputnumber/component.md) |
| **Boolean-Input** | Schalter und Checkbox (`p-toggleswitch`, `p-checkbox`) | [boolean-input/](boolean-input/component.md) |
| **Button** | Schaltflächen-Varianten und Severity-Konventionen | [button/](button/component.md) |
| **Datepicker** | Datums- und Zeitauswahl (`p-datepicker`) | [datepicker/](datepicker/component.md) |
| **Confirmdialog** | Bestätigungsdialog für zerstörende Aktionen | [confirmdialog/](confirmdialog/component.md) |
| **Toast** | Kurzbestätigung ohne eigene Ergebnisseite | [toast/](toast/component.md) |

---

## PrimeNG-Komponenten-Mapping

Konsolidiertes Mapping aus beiden Apps (Haupt-App § 11.1, Voranmelde-App § 13.1). App-spezifische Abweichungen sind in der Spalte „Hinweis" vermerkt.

### Form & Eingaben

| UI-Element | PrimeNG-Komponente | Hinweis |
|---|---|---|
| Text-Eingabe | `pInputText` (Direktive auf `<input>`) | — |
| Passwort | `p-password` | Nur Voranmelde-App |
| Zahl (Preis, Provision, Gebühr …) | `p-inputnumber` | Locale DE; `minFractionDigits="2"` für Preise |
| Textarea | `pTextarea` (Direktive auf `<textarea>`) | — |
| Dropdown / Select | `p-select` | PrimeNG 18+ |
| AutoComplete (Marke/Kategorie) | `p-autocomplete [dropdown]="true" [forceSelection]="false"` | Neuer Wert → `p-dialog` via `DialogService` |
| InputGroup | `p-inputgroup` + `p-inputgroupaddon` + `pInputText` | — |
| Datum / Uhrzeit | `p-datepicker` | Nur Voranmelde-App (Einstellungen) |
| Checkbox | `p-checkbox` | Nur Voranmelde-App (Export-Optionen) |
| Datei-Upload | `p-fileupload mode="basic"` | Nur Haupt-App (Import JSON) |
| Toggle-Schalter | `p-toggleswitch` | „Original"-Flag, Admin-Rechte |

### Buttons

| Typ | PrimeNG | Einsatz |
|---|---|---|
| Primär | `p-button severity="primary"` | Hauptaktion |
| Erfolg | `p-button severity="success"` | Buchen, Abrechnen, Speichern |
| Gefahr | `p-button severity="danger"` | Löschen |
| Sekundär / Outline | `p-button severity="secondary" [outlined]="true"` | Abbrechen, Zurück, Drucken |
| Klein | `p-button size="small"` | Karten-Aktionen |
| Icon-Button (Text-Stil) | `p-button [text]="true" [rounded]="true"` | Status Löschen/Setzen |

### Tabellen & Feedback

| UI-Element | PrimeNG-Komponente |
|---|---|
| Tabelle | `p-table [sortMode]="'multiple'"` |
| Dialog / Modal | `p-dialog [modal]="true"` (via `DialogService`) |
| Toast | `p-toast` + `MessageService` |

---

## Globale Layout-Abstände

Gilt app-übergreifend; App-spezifische Abweichungen sind in Klammern vermerkt (Haupt-App § 11.2, Voranmelde-App § 13.2).

### Content-Bereich

| Eigenschaft | Desktop | Mobile (≤ 768 px) |
|---|---|---|
| Content-Padding oben/unten | 26 px | 14 px |
| Content-Padding links/rechts | 22 px | 12 px |
| Content-Hintergrund | `#f0f2f5` (Haupt-App) / `#f0f4f7` (Voranmelde-App) | — |

### Page-Header-Format

```css
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 20px;
```

| Element | Stil |
|---|---|
| Titel | 20 px, 800, `#0f1f30` (Haupt-App) / `#0d1f2a` (Voranmelde-App) |
| Actions (rechts) | `display: flex; gap: 8px` |

### Sidebar

| Element | Haupt-App | Voranmelde-App |
|---|---|---|
| Breite | 228 px | 240 px |
| Logo-Block Padding | 20 px 18 px 16 px | — |
| Logo Font | 17 px, 800, weiß | — |
| Logo Border-Bottom | 1 px solid rgba(255,255,255,0.1) | — |
| Section-Label | 10 px, 700, uppercase, 1.2 px letter-spacing | — |
| Trennlinie | 1 px solid rgba(255,255,255,0.07), mx 14 px | — |
| Nav-Item Padding | 9 px 18 px | — |
| Nav-Item Font | 13.5 px | — |
| Nav-Icon | 16 px, Breite 18 px | — |

---

## PrimeNG MISC-Komponenten

Konsolidierte Liste aller MISC-Direktiven und -Widgets aus beiden Apps (Haupt-App § 11.7, Voranmelde-App § 13.8).

| Komponente | Einsatz | App |
|---|---|---|
| `pAutoFocus` | Suchfeld (Annahme, Abrechnung), Artikelnummer (Verkauf, Wizard Schritt 2), erstes Feld in Dialogen | Beide |
| `pFocusTrap` | Fokus bleibt in offenem `p-dialog` | Beide |
| `pAnimateOnScroll` | KPI-Kacheln und Karten-Grids beim Scrollen in Viewport | Beide |
| `p-avatar` | Sidebar-Footer: Initial-Buchstabe, Farbe `#3ecf8e` | Voranmelde-App |
| `p-badge` | Offene Artikel-Anzahl im Sidebar-Menüpunkt | Beide |
| `p-chip` | Aktive Filter-Tags im Filter-Panel (mit × zum Entfernen) | Beide |
| `p-progressbar` | Import-Fortschritt (Einstellungen) | Haupt-App |
| `p-metergroup` | Statistik: Anteil Verkauft / Im Verkauf / Retour als Balken | Haupt-App |
| `p-progressspinner` | Ladeindikator bei Such-Debounce (ersetzt Clear-Button) | Beide |
| `p-skeleton` | Tabellen-Lade-Skelett (5 Zeilen, nur beim ersten Laden) | Beide |
| `p-scrolltop` | Scroll-nach-oben ab 400 px Scrolltiefe, `smooth` | Beide |

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #components #primeng #overview #dumb-components #ui-konventionen
