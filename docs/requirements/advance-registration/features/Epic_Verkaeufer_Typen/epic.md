---
id: F-AR-007
status: draft
updated: 2026-07-31
---

# Epic: Verkäufer-Typen

## Index
- Überblick — Konzept
- 1. Tabelle — Typen-Liste
- 2. Aktionen — CRUD
- 3. Default-Type — Standardtyp
- 4. Verhalten beim Zuweisen — Konditionsübernahme
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Stammdaten → Verkäufer-Types
**Sichtbar für:** Admin

**Ziel:** Admin verwaltet Verkäufer-Typen in der Voranmelde-App.

**User Story:** Als Admin möchte ich Verkäufer-Typen definieren, damit Verkäufer beim Registrieren den passenden Typ wählen können.

---

## Überblick

Verwaltung der Verkäufer-Typen. Der `defaultTypeId` wird in den Einstellungen festgelegt und auf der Login-Seite für die Konditions-Anzeige verwendet.

---

## 1. Tabelle (`table-types`)

→ Komponente: [Table](../../../../components/table/component.md)

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

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit Feldern für Name, Provision (%) und Gebühr (€) öffnen.
2. **AC-2** — WHEN ein neuer Typ gespeichert wird, THEN SHALL das System ihn in der Datenbank anlegen und in der Tabelle anzeigen.
3. **AC-3** — IF ein Verkäufer-Typ gelöscht werden soll, der noch Verkäufern zugewiesen ist, THEN SHALL das System eine Fehlermeldung anzeigen und nicht löschen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #verkäufer-typen #admin #stammdaten #voranmeldung #crud
