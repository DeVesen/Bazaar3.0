---
id: F-AR-005
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Alle Artikel (Admin)

## Index
- Überblick — Konzept
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Artikelliste
- 3. Readonly Modal — Detailansicht
- 4. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Verwaltung → Artikel
**Sichtbar für:** Admin

**Ziel:** Admin sieht alle registrierten Artikel aller Verkäufer.

**User Story:** Als Admin möchte ich alle vorab erfassten Artikel aller Verkäufer einsehen, damit ich den Registrierungsstand überblicken kann.

---

## Überblick

Der Admin sieht die vollständige Artikelliste **aller Verkäufer**. Fremde Artikel können **nicht bearbeitet** werden — eigene Artikel werden ausschließlich über „Meine Artikel" bearbeitet.

---

## 1. Filter-Panel

Details → [`components/custom/filter-panel.md`](../../components/custom/filter-panel.md).

| Filter | Vorhanden |
|---|---|
| Verkäufer (`p-autoComplete`, Type-Ahead über Verkäufer-Liste — **nicht** die Seller-Search-Component, die ist Haupt-App-exklusiv für Artikelannahme/Abrechnung gebaut) | ✅ |
| Marke (`p-select`) | ✅ |
| Kategorie (`p-select`) | ✅ |
| Freitext (`p-iconfield`, Nummer, Bezeichnung, Kategorie, Marke, Verkäufer Vor-/Nachname) | ✅ |
| Verkäufer-Status | ❌ (nur Haupt-App) |
| Artikelstatus | ❌ (nur Haupt-App) |

Suche auslösen: gleiches Muster wie Epic_Meine_Artikel (Enter oder „Suchen"-Button, kein Live-Filter).

---

## 2. Tabelle (`table-admin-artikel`)

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · Verkäufer · Aktionen

**Sortierbare Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · **Verkäufer** (Multi-Sort per Shift+Klick)

**Kein „+ Neu"-Button** — Admin legt eigene Artikel über „Meine Artikel" an.

**Statt Edit-Button:** Pro Zeile ein **Lupe-Button (🔍)** → öffnet readonly Modal.

---

## 3. Readonly Modal (`modal-artikel-view`)

Details → [`components/forms/artikel-readonly-modal.md`](../../components/forms/artikel-readonly-modal.md).

Identische Feldanordnung wie Artikel-Bearbeiten-Modal (Zeilen 1–6 gemäß Feldlayout in [Epic_Meine_Artikel](../Epic_Meine_Artikel/epic.md)).

Zusätzlich oben: **Verkäufer** (Name + Nummer) als schreibgeschütztes Feld.

Das Modal hat ausschließlich einen **Schließen-Button** — kein Speichern, kein Löschen.

---

## 4. Backend & API

API-Details → [`api/articles.md`](../../api/articles.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/articles` | `admin` | Alle Artikel aller Verkäufer. Query-Params `sellerId`, `brand`, `category`, `search`, `sort`, `page`, `pageSize`. Jedes Item trägt den aufgelösten `verkaeufer` (Id, Nummer, Vor-/Nachname). |
| `GET /api/articles/{id}` | `admin` | Readonly-Detail für das Modal (inkl. Verkäufer Name + Nummer). |

**Kein `PUT`/`DELETE` auf fremde Artikel** — die Admin-Sicht ist rein lesend. Eigene Artikel bearbeitet auch ein Admin über die `authenticated`-Endpoints aus Epic_Meine_Artikel.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN die Alle-Artikel-Seite geöffnet wird, THEN SHALL das System alle Artikel aller Verkäufer paginiert in einer Tabelle anzeigen.
2. **AC-2** — WHEN im Verkäufer-Filter ein Verkäufer ausgewählt wird, THEN SHALL das System die Tabelle auf Artikel dieses Verkäufers einschränken.
3. **AC-3** — WHEN ein Suchbegriff eingegeben wird, THEN SHALL das System die Tabelle nach Übereinstimmungen in Artikelnummer, Bezeichnung, Kategorie, Marke oder Verkäufername filtern.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #alle-artikel #admin #übersicht #artikel #voranmeldung
