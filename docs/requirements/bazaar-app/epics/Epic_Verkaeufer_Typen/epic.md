---
id: F-BA-009
status: draft
updated: 2026-07-31
---

# Epic: Verkäufer-Typen

## Index
- Überblick — Typ-Stammdaten
- 1. Tabelle — Spalten & Sortierung
- 2. Aktionen — Neu & Bearbeiten
- 3. Verhalten beim Zuweisen — Vorbelegung
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Verkäufer-Types

**Ziel:** Admin pflegt Verkäufer-Typen mit Provisions- und Gebührensätzen für die automatische Abrechnungsberechnung.

**User Story:** Als Admin möchte ich Verkäufer-Typen mit Provisions- und Gebührensätzen definieren, damit die Abrechnung je Typ automatisch berechnet werden kann.

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

Wenn einem Verkäufer ein Type zugewiesen wird, werden die Felder `salesCommission` und `feePerItem` des Verkäufers **vorausgefüllt** — können aber individuell überschrieben werden.

Maßgeblich für alle Berechnungen (Annahmegebühr, Auszahlung) sind die **eigenen Felder des Verkäufers**, nicht die aktuellen Werte des Types.

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit Feldern für Name, Provision (%), und Gebühr (€) öffnen.
2. **AC-2** — WHEN einem Verkäufer ein Typ zugewiesen wird, THEN SHALL das System die Felder `salesCommission` und `feePerItem` des Verkäufers mit den Werten des Typs vorausfüllen.
3. **AC-3** — THE SYSTEM SHALL bei der Abrechnung ausschließlich die eigenen Felder `salesCommission` und `feePerItem` des Verkäufers verwenden, nicht die aktuellen Werte des Typs.
4. **AC-4** — WHEN ein Verkäufer-Typ gelöscht werden soll, der noch Verkäufern zugewiesen ist, THEN SHALL das System eine Fehlermeldung anzeigen und nicht löschen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #verkäufer-typen #provision #gebühr #stammdaten #crud #haupt-app
