# Component: Seller-Search

**Bibliothek:** PrimeNG-Komposition — `p-inputgroup` + `p-card` + `p-listbox`
**Verwendung:** Bazaar Haupt-App — überall dort, wo ein Verkäufer per Suche ausgewählt werden muss, bevor ein weiterer Schritt möglich ist.

## Index

- Überblick — Konzept & Varianten
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Filterlogik — Suchverhalten
- 4. Tastaturverhalten — Shortcuts
- 5. „+ Neu anlegen"-Button — Anlegen-Option
- 6. Scan-Modus — QR/Barcode-Erkennung
- 7. Layout — Aufbau
- 8. PrimeNG-Basis — Technische Basis

---

## Überblick

Das Seller-Search-Panel ist die einheitliche Einstiegs-Ansicht für Prozesse, die einen einzelnen Verkäufer erfordern. Es besteht aus einem Suchfeld in einer Card sowie einer Trefferliste darunter.

Die Komponente unterstützt zwei Eingabe-Modi:
- **Text-Modus** — manuelle Eingabe von Name oder Nummer
- **Scan-Modus** — QR-/Barcode-Erkennung per Kamera (optional, via `showScanButton`)

Feature_Abrechnung beschreibt es explizit als „identische Suchfeld-Ansicht wie Artikelannahme". Einzige Unterschiede zwischen den Verwendungsstellen sind über Parameter steuerbar:

| Parameter | Artikelannahme | Abrechnung |
|---|---|---|
| Hinweistext | „ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint" | „ENTER bei 1 Treffer oder direkt klicken" |
| Anlegen-Button | ✅ (erscheint bei 0 Treffern) | ❌ |
| Scan-Button | ✅ | ❌ |

---

## 1. ASCII-Darstellung

```
Text-Modus (showScanButton=false):
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌────────────────────────────────────┬────────┐  │
│   │ 🔍  Name, Vorname oder Nummer ...  │ Suchen │  │
│   └────────────────────────────────────┴────────┘  │
│                                                     │
│   ENTER bei 1 Treffer öffnet Wizard …  ← Hinweis   │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │  Müller, Hans        #42  ·  Köln           │  │
│   │  Schmidt, Anna       #17  ·  Berlin         │  │
│   │  Weber, Klaus        #85  ·  Hamburg        │  │
│   └─────────────────────────────────────────────┘  │
│                                                     │
│   [+ Neuen Verkäufer anlegen]  ← nur wenn          │
│                                   showCreateButton  │
│                                   und 0 Treffer     │
└─────────────────────────────────────────────────────┘

Text-Modus (showScanButton=true):
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌──────────────────────────────┬────────┬─────┐  │
│   │ 🔍  Name, Vorname oder Nr... │ Suchen │ 📷  │  │
│   └──────────────────────────────┴────────┴─────┘  │
│                                                     │
│   ENTER bei 1 Treffer öffnet Wizard …  ← Hinweis   │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │  Müller, Hans        #42  ·  Köln           │  │
│   │  Schmidt, Anna       #17  ·  Berlin         │  │
│   │  Weber, Klaus        #85  ·  Hamburg        │  │
│   └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

Scan-Modus (nach Klick auf 📷 — Kamera ersetzt Trefferliste):
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌──────────────────────────────┬────────┬─────┐  │
│   │ 🔍  042                      │ Suchen │ 📷  │  │
│   └──────────────────────────────┴────────┴─────┘  │
│                                                     │
│   ENTER bei 1 Treffer öffnet Wizard …  ← Hinweis   │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │                                             │  │
│   │           [ live Videostream ]              │  │
│   │                                             │  │
│   └─────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

Zustandsübersicht Suchfeld:
┌──────────────────────────────────────────────────────┐
│ (leer)     → Alle Verkäufer in der Liste             │
│ Text       → Filtert nach ID, Vorname, Nachname      │
│ 1 Treffer  → ENTER → sellerSelected emittiert        │
│ > 1 Treffer→ ENTER → keine Aktion                   │
│ 0 Treffer  → Liste ausgeblendet                      │
│             → Anlegen-Button sichtbar (wenn aktiv)   │
└──────────────────────────────────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `sellers` | `SellerSummary[]` | `@Input` | Vollständige Verkäufer-Liste (Filterung erfolgt in der Komponente) |
| `hint` | `string` | `@Input` | Hinweistext unterhalb des Suchfelds |
| `showCreateButton` | `boolean` | `@Input` | Zeigt den „+ Neu anlegen"-Button wenn `true` und 0 Treffer vorhanden (Default: `false`) |
| `showScanButton` | `boolean` | `@Input` | Zeigt den 📷-Toggle-Button neben dem Suchfeld (Default: `false`) |
| `sellerSelected` | `SellerSummary` | `@Output` | Emittiert wenn ein Verkäufer angeklickt, per ENTER bestätigt oder per Scan erkannt wird |
| `createRequested` | `string` | `@Output` | Emittiert wenn „+ Neu anlegen" geklickt wird; übergibt den aktuellen Suchtext |
| `searchChanged` | `string` | `@Output` | Emittiert bei jeder Texteingabe (debounced, für optionales Parent-Tracking) |

### SellerSummary-Typ

```
{
  id:        string   // Verkäufer-ID
  firstName: string
  lastName:  string
  zip:       string
  city:      string
}
```

---

## 3. Filterlogik

Die Filterung erfolgt **in der Komponente** (In-Memory) auf Basis der übergebenen `sellers`-Liste.

**Felder:** `id`, `firstName`, `lastName` — case-insensitive, Substring-Match.

Der Hinweistext unter dem Feld (Slot für `hint`) erscheint immer, unabhängig vom Zustand.

---

## 4. Tastaturverhalten

| Taste | Verhalten |
|---|---|
| `Enter` (genau 1 Treffer) | `sellerSelected` emittiert |
| `Enter` (> 1 Treffer) | Keine Aktion |
| `Enter` (0 Treffer + `showCreateButton`) | `createRequested` emittiert |
| `↓` / `↑` | Navigation in der Trefferliste |
| `Escape` (Text-Modus) | Suchfeld leert sich, Liste zeigt alle |
| `Escape` (Scan-Modus) | Kamera stoppt, zurück zu Text-Modus |

---

## 5. „+ Neu anlegen"-Button

Erscheint **ausschließlich** wenn:
1. `showCreateButton === true`
2. Aktuelle Trefferliste leer (0 Treffer)

`p-button label="+ Neuen Verkäufer anlegen" severity="secondary" [outlined]="true"`

Übergibt beim Klick den aktuellen Suchtext via `createRequested` — das Parent kann Vorname/Nachname daraus vorbelegen (Text vor erstem Leerzeichen = Vorname, danach = Nachname).

---

## 6. Scan-Modus

Der Scan-Modus ist ein **alternativer Eingabe-Kanal** — er schreibt in dasselbe Suchfeld wie die Tastatureingabe und löst dieselbe Filterlogik aus. Kein eigener Workflow, kein separates Feedback-Overlay.

### Aktivierung

Der 📷-Button erscheint **nur wenn** `showScanButton === true`.

Klick auf 📷 → Kamera startet, Videostream **ersetzt die Trefferliste** im Kartenbereich.
Klick erneut auf 📷 (oder `Escape`) → Kamera stoppt, Trefferliste erscheint wieder.

### Scan-Ablauf

1. Kamera erkennt einen QR-Code oder Barcode — dieser enthält die **Verkäufer-ID**.
2. Erkannter Wert **ersetzt** den gesamten Feldinhalt (kein Anhängen).
3. `searchChanged` wird emittiert → Filterlogik läuft durch.
4. Ergebnis entscheidet den nächsten Schritt:

| Treffer nach Scan | Verhalten |
|---|---|
| **Genau 1** | Auto-ENTER: `sellerSelected` emittiert, Kamera stoppt |
| **Mehrere** | Kamera stoppt, Scan-Modus verlassen, Trefferliste erscheint |
| **0** | Wert bleibt im Feld sichtbar (implizites Feedback), Kamera bleibt aktiv |

### Scan-Technik

Identisch zum Scan-Dialog:
- `BarcodeDetector`-API (Chromium-native)
- `@zxing/browser` als Fallback für nicht-Chromium-Browser
- `navigator.mediaDevices.getUserMedia()` für Kamerazugriff
- Beim Verlassen des Scan-Modus: MediaStream-Tracks werden released

---

## 7. Layout

- Äußere Card: `max-width: 500px`, zentriert auf der Seite
- Suchfeld: `p-inputgroup` (volle Breite)
- Hinweistext: 12.5 px, muted, margin-top 10 px
- Trefferliste: `p-listbox` ohne Border, direkt unterhalb — kein eigener Card-Rahmen
- Kamera-View: `<video>`-Element, volle Breite, ersetzt `p-listbox` im Scan-Modus
- Anlegen-Button: margin-top 12 px, volle Breite

---

## 8. PrimeNG-Basis

```
p-card              ← Außenrahmen (max-width 500 px)

p-inputgroup
  pInputText        ← Suchfeld
  p-button          ← optionaler Such-Button (kein sichtbarer Nutzen nötig — Enter reicht)
  p-button          ← 📷 Scan-Toggle (conditional, showScanButton=true)

p-listbox           ← Trefferliste (ausgeblendet im Scan-Modus)
  [options]="filteredSellers"
  (onChange)="onSelect($event)"

<video>             ← Kamera-Videostream (sichtbar nur im Scan-Modus)

p-button            ← „+ Neu anlegen" (conditional)
```

Kameraintegration: `navigator.mediaDevices.getUserMedia()` — keine externe Bibliothek.
Barcode-Dekodierung: `BarcodeDetector`-API (Chromium) oder `@zxing/browser` als Fallback.
