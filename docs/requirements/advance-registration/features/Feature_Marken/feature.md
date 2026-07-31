---
id: F-AR-009
status: draft
updated: 2026-07-31
---

# Feature: Marken

## Index
- Überblick — Konzept
- 1. Tabelle — Markenliste
- 2. Aktionen — CRUD
- 3. `original`-Flag — Herkunftskennzeichen
- 4. Export / Import — Datenschnittstelle
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Stammdaten → Marken
**Sichtbar für:** Admin

**Ziel:** Admin verwaltet Marken in der Voranmelde-App.

**User Story:** Als Admin möchte ich Marken anlegen, bearbeiten und löschen, damit Verkäufer ihre Artikel einer Marke zuordnen können.

---

## Überblick

Verwaltung der Marken-Stammdaten. Exportierbar und importierbar für Synchronisierung mit der Haupt-App.

---

## 1. Tabelle (`table-marken`)

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** **ID** · Name · **Original** (Badge) · Artikel (Anzahl) · Aktionen

**Sortierbare Spalten:** **ID** · Name · **Original** · Artikel (Multi-Sort per Shift+Klick)

---

## 2. Aktionen

**„+ Neu"-Button** (Seitentitel) → öffnet Popup mit:
- „Name"
- „Original" (Toggle-Switch `p-toggleswitch`)

**„Edit"-Button** pro Zeile → öffnet Popup mit denselben Feldern vorausgefüllt.

---

## 3. `original`-Flag

| Wert | Badge |
|---|---|
| `true` | `✓ Original` (grün) |
| `false` | `Neu` (orange) |

Neue Einträge via AutoComplete-Popup → automatisch `original = false`.
Zweck: Erkennen, welche Marken während der Voranmeldephase von Verkäufern hinzugefügt wurden.

---

## 4. Export / Import

Marken können in der Export-Seite in den JSON-Export eingeschlossen und in die Haupt-App importiert werden (und umgekehrt).

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit einem Namens-Feld öffnen.
2. **AC-2** — WHEN eine neue Marke gespeichert wird, THEN SHALL das System sie in der Datenbank anlegen und in der Tabelle anzeigen.
3. **AC-3** — IF eine Marke gelöscht werden soll, die noch Artikeln zugewiesen ist, THEN SHALL das System eine Fehlermeldung „Marke wird noch verwendet" anzeigen und nicht löschen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #marken #stammdaten #crud #voranmeldung
