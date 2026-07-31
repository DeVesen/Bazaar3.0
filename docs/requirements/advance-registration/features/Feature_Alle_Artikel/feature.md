---
id: F-AR-005
status: draft
updated: 2026-07-31
---

# Feature: Alle Artikel (Admin)

## Index
- Überblick — Konzept
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Artikelliste
- 3. Readonly Modal — Detailansicht
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

| Filter | Vorhanden |
|---|---|
| Marke | ✅ |
| Kategorie | ✅ |
| Freitext (Nummer, Bezeichnung, Kategorie, Marke, Verkäufer Vor-/Nachname) | ✅ |
| Verkäufer-Status | ❌ (nur Haupt-App) |
| Artikelstatus | ❌ (nur Haupt-App) |

---

## 2. Tabelle (`table-admin-artikel`)

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · Verkäufer · Aktionen

**Sortierbare Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · **Verkäufer** (Multi-Sort per Shift+Klick)

**Kein „+ Neu"-Button** — Admin legt eigene Artikel über „Meine Artikel" an.

**Statt Edit-Button:** Pro Zeile ein **Lupe-Button (🔍)** → öffnet readonly Modal.

---

## 3. Readonly Modal (`modal-artikel-view`)

Identische Feldanordnung wie Artikel-Bearbeiten-Modal (Zeilen 1–6 gemäß Feldlayout in [Feature_Meine_Artikel](../Feature_Meine_Artikel/feature.md)).

Zusätzlich oben: **Verkäufer** (Name + Nummer) als schreibgeschütztes Feld.

Das Modal hat ausschließlich einen **Schließen-Button** — kein Speichern, kein Löschen.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN die Alle-Artikel-Seite geöffnet wird, THEN SHALL das System alle Artikel aller Verkäufer paginiert in einer Tabelle anzeigen.
2. **AC-2** — WHEN ein Verkäufer-Filter gesetzt wird, THEN SHALL das System die Tabelle auf Artikel des ausgewählten Verkäufers einschränken.
3. **AC-3** — WHEN ein Suchbegriff eingegeben wird, THEN SHALL das System die Tabelle nach Übereinstimmungen in Bezeichnung oder Artikelnummer filtern.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #alle-artikel #admin #übersicht #artikel #voranmeldung
