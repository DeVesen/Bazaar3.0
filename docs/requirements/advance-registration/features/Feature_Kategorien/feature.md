---
id: F-AR-010
status: draft
updated: 2026-07-31
---

# Feature: Kategorien

## Index
- Überblick — Konzept
- 1. Tabelle — Kategorieliste
- 2. Aktionen — CRUD
- 3. `original`-Flag — Herkunftskennzeichen
- 4. Export / Import — Datenschnittstelle
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Stammdaten → Kategorien
**Sichtbar für:** Admin

**Ziel:** Admin verwaltet Kategorien in der Voranmelde-App.

**User Story:** Als Admin möchte ich Kategorien anlegen, bearbeiten und löschen, damit Verkäufer ihre Artikel einer Kategorie zuordnen können.

---

## Überblick

Verwaltung der Kategorien-Stammdaten. Exportierbar und importierbar für Synchronisierung mit der Haupt-App.

---

## 1. Tabelle (`table-kategorien`)

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
Zweck: Erkennen, welche Kategorien während der Voranmeldephase von Verkäufern hinzugefügt wurden.

---

## 4. Export / Import

Kategorien können in der Export-Seite in den JSON-Export eingeschlossen werden.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit einem Namens-Feld öffnen.
2. **AC-2** — WHEN eine neue Kategorie gespeichert wird, THEN SHALL das System sie in der Datenbank anlegen und in der Tabelle anzeigen.
3. **AC-3** — IF eine Kategorie gelöscht werden soll, die noch Artikeln zugewiesen ist, THEN SHALL das System eine Fehlermeldung „Kategorie wird noch verwendet" anzeigen und nicht löschen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #kategorien #stammdaten #crud #voranmeldung
