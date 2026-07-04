# Feature: Verkauf

**App:** Bazaar Haupt-App
**Navigation:** Tagesgeschäft → Verkauf

---

## Überblick

Kassenvorgang mit Artikelnummer-Eingabe (USB-Barcode-Scanner oder Kamera-Scan), Warenkorb und Bezahlpopup.

---

## 1. Seiten-Layout

```
┌─────────────────────────┬─────────────────────────┐
│  Artikelnummer eingeben │  🛒 Warenkorb            │
│  (50 %)                 │  (50 %)                  │
│                         │                          │
│  [InputGroup]           │  [Artikel-Liste]         │
│  [InfoArea]             │  [Gesamt: XX,XX €]       │
│  [Preis-Button ggf.]    │  [🗑 Leeren] [💳 BUCHEN] │
└─────────────────────────┴─────────────────────────┘
```

- Outer-Grid: `grid-template-columns: 1fr 1fr`, gap 14 px

---

## 2. Artikelnummer-Eingabe

### Eingabemöglichkeiten

1. **USB-Barcode-Scanner** (Tastatur-Emulation) — Scanner tippt Nummer direkt ins Feld und bestätigt mit Enter
2. **Kamera-Scan** — Button neben dem Eingabefeld öffnet Popup-Modus mit Kamerabild; nach Scan wird Wert ins Feld übernommen

### Artikel-Erkennung

Nach Eingabe / Scan wird der Artikel gesucht:

| Ergebnis | Anzeige |
|---|---|
| **Erkannt & im Verkauf** | Grüner InfoArea-Text; Preis-Button wird aktiv |
| **Nicht erkannt / falscher Status** | Roter InfoArea-Text mit Hinweis |

### Preis-Button

Erscheint nach erfolgreicher Erkennung. **Volle Breite** (`width: 100%`), font-size 16 px, `p-button severity="success"`.
Caption: **ausschließlich der Preis** (z. B. `24,00 €`), kein weiterer Text.

Klick → Artikel in den Warenkorb; Eingabefeld leert sich; InfoArea zeigt *„Nächsten Artikel eingeben …"* (grün).

---

## 3. Warenkorb

- Liste aller hinzugefügten Artikel der aktuellen Transaktion
- **Cart-Item:** flex space-between, align-items center, padding 8 px 0, border-bottom 1 px `#f2f4f6`, 13.5 px
- **Warenkorb leer:** Hinweistext „Warenkorb ist leer" (muted, 13 px, text-align center, padding 20 px 0)
- **Gesamt-Zeile:** 700, 18 px, text-align right, padding-top 10 px

**Löschen-Button pro Eintrag:**
- Entfernt den Eintrag aus dem Warenkorb
- Eingabefeld wird geleert
- Eingabefeld erhält den Fokus

**Footer** (nur sichtbar wenn Warenkorb nicht leer):
`display: flex; justify-content: space-between; gap: 8px; margin-top: 12px`
- Links: „🗑 Leeren" (`p-button severity="secondary" [outlined]="true"`)
- Rechts: „💳 BUCHEN" (`p-button severity="primary"`, 15 px)

**„Leeren"-Button:**
- Warenkorb und Eingabefeld werden geleert
- Eingabefeld erhält Fokus

Der Warenkorb wird **nicht** persistent in der DB gespeichert — nur die finale Buchung.

---

## 4. Buchung / Bezahlpopup

Klick auf **„BUCHEN"** → Popup (Größe `sm`) öffnet sich — **ohne** nochmalige Artikelauflistung:

### Popup-Inhalt

1. **Gesamt-Zeile:** flex space-between, 700, 19 px, border-top 2 px `--border`, mt 6 px, pt 10 px
2. **InputGroup** „Betrag erhalten (€)": `p-inputgroup` + `pInputText type="number"` + `p-inputgroupaddon "€"`, mt 16 px
3. **Rückgeld-Box:** 32 px, 800, text-align center, padding 14 px, background `#e8f8f0`, radius 8 px, color `#1a5c38`, margin 12 px 0

### Buchungsablauf

Klick auf **„Bezahlt"**:
1. Alle Warenkorb-Artikel erhalten `verkauftAm = jetzt`
2. Warenkorb leert sich
3. Artikelnummer-Eingabe leert sich
4. InfoArea zeigt: *„Ersten Artikel eingeben bitte …"* (blau)

---

## 5. InfoArea-Zustände (Verkauf-Kontext)

| Zeitpunkt | Typ | Text |
|---|---|---|
| Navigieren zur Verkauf-Seite | `info` | *„Ersten Artikel eingeben …"* |
| Nach Buchen | `info` | *„Ersten Artikel eingeben …"* |
| Nach Leeren des Warenkorbs | `info` | *„Ersten Artikel eingeben …"* |
| Nach erfolgreichem Scan | `success` | Preis des Artikels |
| Unbekannter Artikel / falscher Status | `error` | Fehlerhinweis |

---

## 6. Fokus-Verhalten

- Beim Navigieren zur Verkauf-Seite: Fokus auf Artikelnummer-Eingabefeld (`pAutoFocus`)
- Nach jedem Warenkorb-Vorgang: Fokus zurück auf Eingabefeld
