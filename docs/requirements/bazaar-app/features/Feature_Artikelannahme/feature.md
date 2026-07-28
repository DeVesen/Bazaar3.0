# Feature: Artikelannahme

**App:** Bazaar Haupt-App
**Navigation:** Tagesgeschäft → Artikelannahme (= Startseite / Home-Redirect)

---

## Überblick

Entry-Page für den Annahme-Prozess. Verkäufer werden gesucht oder neu angelegt; anschließend werden ihre Artikel aufgenommen. Der Ablauf ist als **2-Schritt-Wizard** umgesetzt.

---

## 1. Artikelannahme-Such-Ansicht

→ Komponente: [Seller-Search](../../../../components/seller-search/component.md) — `showCreateButton="true"`

InputGroup in Card, **max-width 500 px**.
Hinweistext darunter: `ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint` (12.5 px, muted, mt 10 px).

### Suchfeld-Verhalten

| Eingabe | Verhalten |
|---|---|
| (leer) | Alle Verkäufer in der Liste darunter |
| Text eingegeben | Filtert nach: Verkäufer-ID, Vorname, Nachname |
| Genau 1 Treffer + ENTER | Öffnet Wizard → Schritt 2 (Artikelannahme) |
| Mehr als 1 Treffer + ENTER | Keine Aktion |
| Kein Treffer | Liste ausgeblendet; Button „+ Neuen Verkäufer anlegen" erscheint |

### Aktionen

- **Klick auf Verkäufer in der Liste** → Wizard Schritt 2
- **„+ Neuen Verkäufer anlegen"-Button** (oder ENTER wenn sichtbar) → Wizard Schritt 1
  - Aktuelle Sucheingabe wird als Vorname/Nachname vorbelegt: Text **vor erstem Leerzeichen** = Vorname, Text **danach** = Nachname

---

## 2. Verkäufer-Anlage-Wizard

### Wizard-Navigation

```
┌──────────────────────┬───────────────────────────┐
│  Schritt 1 — Verkäufer  │  Schritt 2 — Artikelannahme │
└──────────────────────┴───────────────────────────┘
```

Tabs: flex row, border-bottom 2 px `--border`, mb 20 px.
Tab-Item: padding 10 px 20 px, 600, 13 px, muted; aktiver Tab: primary-Farbe + border-bottom.

---

### Schritt 1 — Verkäuferanlage

Formular mit allen Verkäufer-Feldern (Panels 01–03, siehe Lastenheft Abschnitt 6.5).
Vorname/Nachname-Vorbelegung aus der Sucheingabe.

**„Weiter"-Button** → Verkäufer wird sofort in der DB angelegt → Wechsel zu Schritt 2.

---

### Schritt 2 — Artikelannahme

**Layout:** `7fr 3fr` (70 % Artikel-Eingabe | 30 % Übersicht), gap 14 px.

#### Artikeleingabe (links)

2-Spalten-Grid. Felder und Reihenfolge:

| Zeile | Links | Rechts | Pflicht |
|---|---|---|---|
| 1 | Artikelnummer (InputGroup, kein Addon, Kamera-Popup-Button rechts) | *(leer)* | ✅ |
| 2 | Bezeichnung (volle Breite) | — | ✅ |
| 3 | Kategorie (AutoComplete ▾/+) | Marke (AutoComplete ▾/+) | ✅ |

→ Komponente für Kategorie und Marke: [AutoComplete-Create](../../../../components/autocomplete-create/component.md)
| 4 | Preis (InputGroup, €-Addon rechts) | *(leer)* | ✅ |
| 5 | Größe | Farbe | ❌ |
| 6 | Beschreibung (Textarea, volle Breite) | — | ❌ |

Pflichtfelder mit `*` markiert. **„Übernehmen"-Button** deaktiviert solange Pflichtfelder leer.

**Sonderfall importierter Verkäufer:** Artikelnummer + ENTER → vorhandener Artikel aus Import-Liste wird geladen und Felder vorausgefüllt. Alle Felder bleiben bearbeitbar.

**Sonderfall neue Nummer:** Artikelnummer wird auf **systemweite Eindeutigkeit** geprüft.

Nach Pflichtfelder-Ausfüllung: Klick **„Übernehmen"** → Artikel erscheint in der Übersicht rechts; Felder leeren sich; Fokus zurück auf Artikelnummer.

#### Übersicht (rechts)

1. **Artikelliste** — alle in dieser Sitzung erfassten Artikel (Nr. + Bezeichnung)
   - Klick auf Eintrag → Popup: Bezeichnung, Kategorie, Marke, Preis änderbar
   - Löschen-Button pro Eintrag (keine DB-Auswirkung — Artikel noch nicht gespeichert)
   - Artikel sind noch **nicht in der DB** gespeichert

2. **Gebühr** — `Anzahl Artikel × Verkäufer.gebuehr` (eigenes Feld des Verkäufers)

3. **Speichern-Button** (volle Breite, `p-button severity="success"`) → Popup erscheint:
   → Komponente: [Payment-Panel](../../../../components/payment-panel/component.md) — `totalLabel="Gesamtgebühr"` · `confirmLabel="Buchen"`
   - **Gesamtgebühr**
   - Eingabefeld: „Betrag erhalten (€)" — Dezimalzahl, InputGroup mit €-Addon
   - Anzeige: **Rückgeld** (live berechnet)
   - Klick **„Buchen"**:
     - Alle Artikel aus der Liste werden in der DB gespeichert / aktualisiert
     - Jeder Artikel bekommt `freigegebenAm = jetzt` → sofort im Verkauf
     - **Druckdialog** startet automatisch (Artikelannahme-Liste mit QR-Code)

---

## 3. Artikelnummer-Eindeutigkeit

Die Artikelnummer wird systemweit auf Eindeutigkeit geprüft. Keine zwei Artikel (unabhängig von Verkäufer oder App) dürfen dieselbe Nummer haben.

---

## 4. Visual Specs

**Such-Ansicht:** InputGroup in Standard-Card, max-width 500 px.

**Wizard-Layout (Schritt 2):**
- Outer-Grid: `7fr 3fr`, gap 14 px
- Rechte Seite: Artikelliste-Card + Speichern-Button (full-width, success)

**Preis-InputGroup:**
```
[ Preis                        ][ € ]
```
