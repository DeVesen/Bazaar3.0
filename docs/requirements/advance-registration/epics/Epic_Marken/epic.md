---
id: F-AR-009
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-14
---

# Epic: Marken

## Index
- Überblick — Konzept
- 1. Tabelle — Markenliste
- 2. Aktionen — CRUD
- 3. `original`-Flag — Herkunftskennzeichen
- 4. Export / Import — Datenschnittstelle
- 5. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Stammdaten → Marken
**Sichtbar für:** Admin

Component-Details → [`components/forms/stammdaten-popup.md`](../../components/forms/stammdaten-popup.md) (Ausprägung Marke)
Entity-Details → [`entities/marke.md`](../../entities/marke.md)

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

Admin-erstellte Marke ist per Definition kuratiert → `original` wird automatisch auf `true` gesetzt, kein Toggle im Create-Popup.

**„Edit"-Button** pro Zeile → öffnet Popup mit „Name" **und** „Original" (Toggle-Switch `p-toggleswitch`) — ermöglicht Admin, eine von einem Verkäufer angelegte „Neu"-Marke nachträglich zu „Original" zu befördern (oder umgekehrt).

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

## 5. Backend & API

API-Details → [`api/master-data.md`](../../api/master-data.md) (gemeinsam mit Kategorien — endpoint-seitig identisch)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/brands` | `authenticated` | Liste aller Marken. `articleCount` nur für die Admin-Rolle enthalten. |
| `POST /api/brands` | `authenticated` | Legt Marke an. `original` serverseitig aus der Rolle: Admin → `true`, Verkäufer → `false`. `409` bei Duplikat (case-insensitiv nach Trim). |
| `PUT /api/brands/{id}` | `admin` | Aktualisiert Name und/oder `original`-Flag. Namensänderung wird in alle betroffenen Artikel nachgezogen. |
| `DELETE /api/brands/{id}` | `admin` | `409` falls noch Artikeln zugewiesen. |

**Auth-Korrektur:** `GET` und `POST` standen hier ursprünglich als „Auth + Admin". Nicht haltbar — der Verkäufer braucht die Liste für AutoComplete und Filter im Artikel-Dialog und legt über den `+`-Modus selbst neue Marken an (Abschnitt 3, Epic_Meine_Artikel Abschnitt 3). `PUT`/`DELETE` bleiben Admin-only.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit einem Namens-Feld öffnen (ohne Original-Toggle) und die Marke mit `original = true` anlegen.
2. **AC-2** — WHEN eine neue Marke gespeichert wird, THEN SHALL das System sie in der Datenbank anlegen und in der Tabelle anzeigen.
3. **AC-3** — IF eine Marke gelöscht werden soll, die noch Artikeln zugewiesen ist, THEN SHALL das System eine Fehlermeldung „Marke wird noch verwendet" anzeigen und nicht löschen.
4. **AC-4** — WHEN Admin im Edit-Popup das „Original"-Flag umschaltet und speichert, THEN SHALL das System den neuen Wert übernehmen und das Badge in der Tabelle entsprechend aktualisieren.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #marken #stammdaten #crud #voranmeldung
