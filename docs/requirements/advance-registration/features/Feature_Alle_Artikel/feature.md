# Feature: Alle Artikel (Admin)

**App:** Voranmelde-App
**Navigation:** Verwaltung → Artikel
**Sichtbar für:** Admin

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

**Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · Verkäufer · Aktionen

**Sortierbare Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · **Verkäufer** (Multi-Sort per Shift+Klick)

**Kein „+ Neu"-Button** — Admin legt eigene Artikel über „Meine Artikel" an.

**Statt Edit-Button:** Pro Zeile ein **Lupe-Button (🔍)** → öffnet readonly Modal.

---

## 3. Readonly Modal (`modal-artikel-view`)

Identische Feldanordnung wie Artikel-Bearbeiten-Modal (Zeilen 1–6 gemäß Feldlayout in [Feature_Meine_Artikel](../Feature_Meine_Artikel/feature.md)).

Zusätzlich oben: **Verkäufer** (Name + Nummer) als schreibgeschütztes Feld.

Das Modal hat ausschließlich einen **Schließen-Button** — kein Speichern, kein Löschen.
