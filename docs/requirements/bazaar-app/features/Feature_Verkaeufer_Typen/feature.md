# Feature: Verkäufer-Typen

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Verkäufer-Types

---

## Überblick

Verwaltung der Verkäufer-Typen (z. B. „Privat", „Händler"). Typen dienen als Templates für Provision und Gebühr — die Werte können pro Verkäufer individuell überschrieben werden.

---

## 1. Tabelle

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** Nr. · Name · Provision % · Gebühr € · **Anzahl VK** (Anzahl Verkäufer mit diesem Typ) · Aktionen

**Sortierbare Spalten:** **Nr.** · Name · Provision % · Gebühr € · Anzahl VK (Multi-Sort per Shift+Klick)

---

## 2. Aktionen

**„+ Neu"-Button** (Seitentitel) → öffnet Popup mit:
- „Name"
- „Provision (%)"
- „Gebühr (€)"

**„Edit"-Button** pro Zeile → öffnet Popup mit denselben Feldern vorausgefüllt.

---

## 3. Verhalten beim Zuweisen zu Verkäufer

Wenn einem Verkäufer ein Type zugewiesen wird, werden die Felder `provision` und `gebuehr` des Verkäufers **vorausgefüllt** — können aber individuell überschrieben werden.

Maßgeblich für alle Berechnungen (Annahmegebühr, Auszahlung) sind die **eigenen Felder des Verkäufers**, nicht die aktuellen Werte des Types.
