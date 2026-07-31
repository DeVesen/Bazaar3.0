---
id: F-BA-008
status: draft
updated: 2026-07-31
---

# Feature: Kategorien

## Index
- Überblick — Kategorie-Stammdaten
- 1. Tabelle — Spalten & Sortierung
- 2. Aktionen — Neu & Bearbeiten
- 3. original-Flag — Flag-Bedeutung
- 4. Artikel-Anzahl-Spalte — Zuordnung
- 5. Synchronisierung — Export/Import
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Kategorien

**Ziel:** Admin verwaltet die Kategorie-Stammdaten der Haupt-App.

**User Story:** Als Admin möchte ich Kategorien anlegen, bearbeiten und löschen, damit Artikel beim Erfassen einer Kategorie zugeordnet werden können.

---

## Überblick

Verwaltung der Kategorien-Stammdaten. Neue Kategorien können über diese Seite oder per AutoComplete-Popup beim Artikel anlegen hinzugefügt werden.

---

## 1. Tabelle

→ Komponente: [Table](../../../../components/table/component.md)

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

## Akzeptanzkriterien

1. **AC-1** — WHEN die Kategorien-Seite geöffnet wird, THEN SHALL das System alle vorhandenen Kategorien alphabetisch sortiert in einer Tabelle anzeigen.
2. **AC-2** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit einem Namens-Feld öffnen.
3. **AC-3** — WHEN eine neue Kategorie gespeichert wird, THEN SHALL das System sie in der Datenbank anlegen und in der Tabelle anzeigen.
4. **AC-4** — IF eine Kategorie gelöscht werden soll, die noch Artikeln zugewiesen ist, THEN SHALL das System eine Fehlermeldung „Kategorie wird noch verwendet" anzeigen und nicht löschen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #kategorien #stammdaten #crud #haupt-app
