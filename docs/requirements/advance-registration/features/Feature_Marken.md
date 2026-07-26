# Feature: Marken

**App:** Voranmelde-App
**Navigation:** Stammdaten → Marken
**Sichtbar für:** Admin

---

## Überblick

Verwaltung der Marken-Stammdaten. Exportierbar und importierbar für Synchronisierung mit der Haupt-App.

---

## 1. Tabelle (`table-marken`)

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
