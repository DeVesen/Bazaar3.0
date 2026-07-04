# Feature: Marken

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Marken

---

## Überblick

Verwaltung der Marken-Stammdaten. Neue Marken können über diese Seite oder per AutoComplete-Popup beim Artikel anlegen hinzugefügt werden.

---

## 1. Tabelle

**Spalten:** Nr. · Name · Original · **Artikel** (Gesamtanzahl) · **Verkauft** (Anzahl mit `verkauftAm`) · Aktionen

**Sortierbare Spalten:** **Nr.** · Name · **Original** · Artikel · Verkauft (Multi-Sort per Shift+Klick)

---

## 2. Aktionen

**„+ Neu"-Button** (Seitentitel, nicht Filter-Toolbar) → öffnet Popup mit:
- Feld „Name"
- „Original" (Toggle-Switch)

**„Edit"-Button** pro Zeile → öffnet Popup mit denselben Feldern vorausgefüllt.

---

## 3. `original`-Flag

| Wert | Bedeutung |
|---|---|
| `true` (`✓ Original`, grün) | Vom Admin als Stammdaten-Eintrag angelegt |
| `false` (`Neu`, orange) | Nachträglich über AutoComplete-Popup hinzugefügt |

---

## 4. Artikel-Anzahl-Spalte

Zeigt die Anzahl der Artikel, die dieser Marke zugeordnet sind.
Beispiel: Marke „Nike" → Artikel-Anzahl = 5.

---

## 5. Synchronisierung

Marken können in die Voranmelde-App exportiert und aus ihr importiert werden — für konsistente Stammdaten in beiden Systemen.
