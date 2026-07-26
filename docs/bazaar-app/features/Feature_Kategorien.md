# Feature: Kategorien

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Kategorien

---

## Überblick

Verwaltung der Kategorien-Stammdaten. Neue Kategorien können über diese Seite oder per AutoComplete-Popup beim Artikel anlegen hinzugefügt werden.

---

## 1. Tabelle

**Spalten:** Nr. · Name · Original · **Artikel** (Gesamtanzahl) · **Verkauft** (Anzahl mit `verkauftAm`) · Aktionen

**Sortierbare Spalten:** **Nr.** · Name · **Original** · Artikel · Verkauft (Multi-Sort per Shift+Klick)

---

## 2. Aktionen

**„+ Neu"-Button** (Seitentitel) → öffnet Popup mit:
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

Zeigt die Anzahl der Artikel, die dieser Kategorie zugeordnet sind.
Beispiel: Kategorie „Jacken" → Artikel-Anzahl = 3.

---

## 5. Synchronisierung

Kategorien können in die Voranmelde-App exportiert und aus ihr importiert werden — für konsistente Stammdaten.
