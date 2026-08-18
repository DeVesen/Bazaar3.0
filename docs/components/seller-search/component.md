---
id: C-006
status: draft
updated: 2026-08-18
---

# Component: Seller-Search

## Index

- Überblick — Konzept & Varianten
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter & Events
- 3. Filterlogik — Suchverhalten
- 4. Tastaturverhalten — Shortcuts
- 5. „+ Neu anlegen"-Button — Anlegen-Option
- 6. Kamera-Modus — QR/Barcode-Erkennung
- 7. Layout — Aufbau
- 8. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Bibliothek:** PrimeNG-Komposition — [InputGroup](../input-group/component.md) + `p-card` + `p-listbox`
**Verwendung:** Bazaar Haupt-App — überall dort, wo ein Verkäufer per Suche ausgewählt werden muss, bevor ein weiterer Schritt möglich ist.

---

## Überblick

Das Seller-Search-Panel ist die einheitliche Einstiegs-Ansicht für Prozesse, die einen einzelnen Verkäufer erfordern. Es besteht aus einem Suchfeld in einer Card sowie einer Trefferliste darunter.

Das Suchfeld ist eine [InputGroup](../input-group/component.md); Umschaltmechanik,
Button-Reihenfolge und Startmodus stehen dort in Abschnitt 3.

| Modus | Besonderheit in der Verkäufersuche |
|---|---|
| Tastatur | Manuelle Eingabe von Name oder Nummer |
| Kamera | QR-/Barcode-Erkennung; Kamerabild ersetzt die Trefferliste. Nur verfügbar, wenn `showScanButton` gesetzt ist |
| Numpad | Für die Suche nach reiner Verkäufernummer; `showDecimal="false"`, `showEnter="true"`, `⏎` löst dieselbe Aktion aus wie `Enter` (Abschnitt 4) |

Epic_Abrechnung beschreibt es explizit als „identische Suchfeld-Ansicht wie Artikelannahme". Einzige Unterschiede zwischen den Verwendungsstellen sind über Parameter steuerbar:

| Parameter | Artikelannahme | Abrechnung |
|---|---|---|
| Hinweistext | „ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint" | „ENTER bei 1 Treffer oder direkt klicken" |
| Anlegen-Button | ✅ (erscheint bei 0 Treffern) | ❌ |
| Scan-Button | ✅ | ❌ |

---

## 1. ASCII-Darstellung

```
Tastatur-Modus (showScanButton=false):
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌──────────────────────────────┬────────┬─────┐  │
│   │ 🔍  Name, Vorname oder Nr... │ Suchen │  ⊞  │  │
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
│   [+ Neuen Verkäufer anlegen]  ← nur wenn          │
│                                   showCreateButton  │
│                                   und 0 Treffer     │
└─────────────────────────────────────────────────────┘

Tastatur-Modus (showScanButton=true):
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌────────────────────────┬────────┬─────┬─────┐  │
│   │ 🔍  Name, Vorname... │ Suchen │ 📷  │  ⊞  │  │
│   └────────────────────────┴────────┴─────┴─────┘  │
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

Kamera-Modus (nach Klick auf 📷 — Kamera ersetzt Trefferliste):
┌─────────────────────────────────────────────────────┐
│                                                     │
│   ┌────────────────────────┬────────┬─────┬─────┐  │
│   │ 🔍  042               │ Suchen │  ⌨  │  ⊞  │  │
│   └────────────────────────┴────────┴─────┴─────┘  │
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

Bei nicht gesetztem `showScanButton` sind nur zwei Modi konfiguriert (Tastatur, Numpad); da stets nur die nicht aktiven Modi als Buttons erscheinen, zeigt das Suchfeld in diesem Fall genau einen Modus-Button.

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `sellers` | `SellerSummary[]` | `@Input` | Vollständige Verkäufer-Liste (Filterung erfolgt in der Komponente) |
| `hint` | `string` | `@Input` | Hinweistext unterhalb des Suchfelds |
| `showCreateButton` | `boolean` | `@Input` | Zeigt den „+ Neu anlegen"-Button wenn `true` und 0 Treffer vorhanden (Default: `false`) |
| `showScanButton` | `boolean` | `@Input` | Steuert, ob der Kamera-Modus im Suchfeld verfügbar ist — siehe [InputGroup](../input-group/component.md) Abschnitt 3 (Default: `false`) |
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
| `Escape` (Tastatur-Modus) | Suchfeld leert sich, Liste zeigt alle |
| `Escape` (Kamera-Modus) | Kamera stoppt, zurück in den zuvor aktiven Modus |

---

## 5. „+ Neu anlegen"-Button

Erscheint **ausschließlich** wenn:
1. `showCreateButton === true`
2. Aktuelle Trefferliste leer (0 Treffer)

`p-button label="+ Neuen Verkäufer anlegen" severity="secondary" [outlined]="true"`

Übergibt beim Klick den aktuellen Suchtext via `createRequested` — das Parent kann Vorname/Nachname daraus vorbelegen (Text vor erstem Leerzeichen = Vorname, danach = Nachname).

---

## 6. Kamera-Modus

Der Kamera-Modus ist ein **alternativer Eingabe-Kanal** — er schreibt in dasselbe Suchfeld wie die Tastatureingabe und löst dieselbe Filterlogik aus. Kein eigener Workflow, kein separates Feedback-Overlay.

### Aktivierung

Der 📷-Button erscheint **nur wenn** `showScanButton === true`.

Wechsel in den Kamera-Modus → Videostream **ersetzt die Trefferliste** im Kartenbereich.
Wechsel in einen anderen Modus (oder `Escape`) → Kamera stoppt, Trefferliste erscheint
wieder und alle MediaStream-Tracks werden freigegeben.

### Scan-Ablauf

1. Kamera erkennt einen QR-Code oder Barcode — dieser enthält die **Verkäufer-ID**.
2. Erkannter Wert **ersetzt** den gesamten Feldinhalt (kein Anhängen).
3. `searchChanged` wird emittiert → Filterlogik läuft durch.
4. Ergebnis entscheidet den nächsten Schritt:

| Treffer nach Scan | Verhalten |
|---|---|
| **Genau 1** | Auto-ENTER: `sellerSelected` emittiert, Kamera stoppt |
| **Mehrere** | Kamera stoppt, Rückkehr in den zuvor aktiven Modus, Trefferliste erscheint |
| **0** | Wert bleibt im Feld sichtbar (implizites Feedback), Kamera bleibt aktiv |

### Scan-Technik

→ Komponente: [Barcode-Scanner](../barcode-scanner/component.md) — `[active]="scanModeActive"` · `(codeDetected)="onScan($event)"`

Kapselt `@zxing/browser` + `@zxing/library`; MediaStream-Tracks werden beim Deaktivieren automatisch released.

---

## 7. Layout

- Äußere Card: `max-width: 500px`, zentriert auf der Seite
- Suchfeld: [InputGroup](../input-group/component.md) (volle Breite)
- Hinweistext: 12.5 px, muted, margin-top 10 px
- Trefferliste: `p-listbox` ohne Border, direkt unterhalb — kein eigener Card-Rahmen
- Kamera-View: [Barcode-Scanner](../barcode-scanner/component.md), volle Breite, ersetzt `p-listbox` im Kamera-Modus
- Numpad: erscheint unterhalb des Suchfelds im Numpad-Modus (siehe [Numpad](../numpad/component.md))
- Anlegen-Button: margin-top 12 px, volle Breite

---

## 8. PrimeNG-Basis

```
p-card              ← Außenrahmen (max-width 500 px)

app-input-group     ← Suchfeld inkl. Eingabemodi
                    ← → siehe: docs/components/input-group/component.md
  [modes]="showScanButton ? ['keyboard','camera','numpad'] : ['keyboard','numpad']"

p-listbox           ← Trefferliste (ausgeblendet im Kamera-Modus)
  [options]="filteredSellers"
  (onChange)="onSelect($event)"

p-button            ← „+ Neu anlegen" (conditional)
```

Kameraintegration: `navigator.mediaDevices.getUserMedia()` — keine externe Bibliothek.
Barcode-Dekodierung: `BarcodeDetector`-API (Chromium) oder `@zxing/browser` als Fallback.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN das Suchfeld leer ist, THEN SHALL das System alle übergebenen Verkäufer in der Trefferliste anzeigen.
2. **AC-2** — WHEN der Nutzer Text eingibt, THEN SHALL das System die Trefferliste auf Einträge filtern, deren `id`, `firstName` oder `lastName` den Suchbegriff als Substring enthält (case-insensitive).
3. **AC-3** — WHEN genau ein Treffer vorhanden ist und Enter gedrückt wird, THEN SHALL das System das `sellerSelected`-Event mit dem gefundenen Verkäufer emittieren.
4. **AC-4** — WHEN die Trefferliste leer ist und `showCreateButton === true`, THEN SHALL das System den Button „+ Neuen Verkäufer anlegen" einblenden und bei Klick das `createRequested`-Event mit dem aktuellen Suchtext emittieren.
5. **AC-5** — WHERE `showScanButton === true`, SHALL das System einen Kamera-Modus-Button neben dem Suchfeld anzeigen; Klick darauf stoppt die Trefferliste und zeigt den live Videostream.
6. **AC-6** — WHEN im Kamera-Modus ein QR-Code oder Barcode erkannt wird und genau ein Treffer gefunden wird, THEN SHALL das System `sellerSelected` emittieren und die Kamera stoppen.
7. **AC-7** — WHEN Escape im Kamera-Modus gedrückt wird, THEN SHALL das System die Kamera stoppen, in den zuvor aktiven Modus zurückkehren und die Trefferliste wieder anzeigen.
8. **AC-8** — WHILE der Numpad-Modus aktiv ist, SHALL das System bei Klick auf `⏎` dieselbe Aktion auslösen wie `Enter` im Tastatur-Modus (Abschnitt 4).
9. **AC-9** — IF die Kamera nicht verfügbar ist oder der Zugriff verweigert wird, THEN SHALL das System in den Tastatur-Modus zurückkehren und eine rote InfoArea mit dem Text „Kamerazugriff nicht möglich" anzeigen.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #seller-search #verkäufer-suche #kamera-modus #trefferliste #artikelannahme #primeng
