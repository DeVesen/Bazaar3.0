# Feature: Verkäufer-Typen

**App:** Voranmelde-App
**Navigation:** Stammdaten → Verkäufer-Types
**Sichtbar für:** Admin

---

## Überblick

Verwaltung der Verkäufer-Typen. Der `defaultTypeId` wird in den Einstellungen festgelegt und auf der Login-Seite für die Konditions-Anzeige verwendet.

---

## 1. Tabelle (`table-types`)

**Spalten:** Bezeichnung · Provision % · Gebühr € · Aktionen

**Sortierbare Spalten:** Bezeichnung · Provision % · Gebühr € (Multi-Sort per Shift+Klick)

---

## 2. Aktionen

**„+ Neu"-Button** (Seitentitel) → öffnet Popup mit:
- „Name"
- „Provision (%)"
- „Gebühr (€)"

**„Edit"-Button** pro Zeile → öffnet Popup mit denselben Feldern vorausgefüllt.

---

## 3. Default-Type

In den Einstellungen (`defaultTypeId`) wird ein Type als Standard für Selbstregistrierung festgelegt.
Dieser Type wird auf der Login-Seite in der Info-Area als „Default-Konditionen" angezeigt.

---

## 4. Verhalten beim Zuweisen

Wenn einem Verkäufer ein Type zugewiesen wird → `provision` und `gebuehr` des Verkäufers werden vorausgefüllt (überschreibbar).
Admin kann individuelle Konditionen pro Verkäufer nachjustieren.
