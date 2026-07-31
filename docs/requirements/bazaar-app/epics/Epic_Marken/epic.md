---
id: F-BA-007
status: draft
updated: 2026-07-31
---

# Epic: Marken

## Index
- Überblick — Marken-Stammdaten
- 1. Tabelle — Spalten & Sortierung
- 2. Aktionen — Neu & Bearbeiten
- 3. original-Flag — Flag-Bedeutung
- 4. Artikel-Anzahl-Spalte — Zuordnung
- 5. Synchronisierung — Export/Import
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Marken

**Ziel:** Admin verwaltet die Marken-Stammdaten der Haupt-App.

**User Story:** Als Admin möchte ich Marken anlegen, bearbeiten und löschen, damit Artikel beim Erfassen einer Marke zugeordnet werden können.

---

## Überblick

Verwaltung der Marken-Stammdaten. Neue Marken können über diese Seite oder per AutoComplete-Popup beim Artikel anlegen hinzugefügt werden.

---

## 1. Tabelle

→ Komponente: [Table](../../../../components/table/component.md)

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

## Akzeptanzkriterien

1. **AC-1** — WHEN die Marken-Seite geöffnet wird, THEN SHALL das System alle vorhandenen Marken alphabetisch sortiert in einer Tabelle anzeigen.
2. **AC-2** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit einem Namens-Feld öffnen.
3. **AC-3** — WHEN eine neue Marke gespeichert wird, THEN SHALL das System sie in der Datenbank anlegen und in der Tabelle anzeigen.
4. **AC-4** — IF eine Marke gelöscht werden soll, die noch Artikeln zugewiesen ist, THEN SHALL das System eine Fehlermeldung „Marke wird noch verwendet" anzeigen und nicht löschen.
5. **AC-5** — WHEN eine Marke bearbeitet wird, THEN SHALL das System den neuen Namen in allen zugeordneten Artikeln übernehmen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #marken #stammdaten #crud #haupt-app
