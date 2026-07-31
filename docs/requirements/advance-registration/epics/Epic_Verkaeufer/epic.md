---
id: F-AR-006
code: VERK-VA
status: draft
updated: 2026-07-31
---

# Epic: Verkäufer (Admin)

## Index
- Überblick — Konzept
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Verkäuferliste
- 3. Dialog: Neuen Verkäufer anlegen — Anlage
- 4. Dialog: Verkäufer bearbeiten — Bearbeitung
- 5. Dialog-Größe — Layout
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Verwaltung → Verkäufer
**Sichtbar für:** Admin

**Ziel:** Admin verwaltet Verkäufer-Registrierungen in der Voranmelde-App.

**User Story:** Als Admin möchte ich Verkäufer-Registrierungen verwalten und Nummernblöcke zuweisen, damit jeder Verkäufer eindeutige Artikelnummern hat.

---

## Überblick

Admin-Übersicht aller Verkäufer mit Anlage-, Bearbeitungs- und Einladungs-Funktionen.

---

## 1. Filter-Panel

**„+ Neu"-Button** befindet sich ausschließlich im Seitentitel (Page-Header) — nicht in der Filter-Toolbar.

Filterbereich:
- Freitext-Suche (Name, Ort, E-Mail)

---

## 2. Tabelle (`table-admin-verkaeufer`)

→ Komponente: [Table](../../../../components/table/component.md)

**Sortierbare Spalten:** Nr. · Vorname · Nachname · PLZ · Ort · Typ · Provision · Gebühr · Artikel (Multi-Sort per Shift+Klick)

**„+ Neu"-Button** (Seitentitel) → öffnet Dialog „Neuen Verkäufer anlegen".
**Edit-Button** pro Zeile → öffnet Dialog „Verkäufer bearbeiten".

---

## 3. Dialog: Neuen Verkäufer anlegen

Enthält Panel 01–03 (Personendaten, Kontakt, Konditionen) sowie **Nummernblock-Initialfeld**:

| Feld | Beschreibung |
|---|---|
| **Startnummer** | Erste Artikelnummer (Standard: nächste freie Nummer) |
| **Anzahl initialer Blöcke** | Anzahl zusammenhängender Blöcke beim Anlegen (Standard: `defaultBlockCount`) |

Nach dem Anlegen: Admin kann optional sofort den **Einladungs-Link** kopieren.

---

## 4. Dialog: Verkäufer bearbeiten

Enthält Panel 01–03 + zwei zusätzliche Panels:

### Panel 04 — Nummernblöcke (nur beim Bearbeiten)

**Bestehende Blöcke:**
Für jeden Block: Bereich (Nr. X–Y) · Anzahl Nummern · Anzahl bereits vergebener Nummern.

| Element | Stil |
|---|---|
| Bereich (z. B. „101 – 110") | 700, 14 px, grün |
| Zähler | 12 px, muted |
| Löschen-Button | Nur wenn 0 Nummern vergeben; `secondary outlined small`, Icon 🗑 |
| Badge „Voll — nicht löschbar" | warn; wenn ≥ 1 Nummer vergeben |

**Neue Blöcke reservieren** (unterhalb der Block-Liste):
- Trennlinie (border-top 1 px), pt 12 px, mt 14 px
- Label (12 px, muted): „Zusätzliche Blöcke reservieren:"
- 2-Spalten-Grid: `p-inputnumber` „Anzahl Blöcke" + `p-inputnumber` „Startnummer (Vorschlag)"
- **Vorschlag-Berechnung:** System schlägt automatisch nächste freie Startnummer vor — die ab der `Anzahl Blöcke × BlockSize` Nummern lückenlos frei sind.
  - Beispiel: BlockSize=10, Anzahl=2 → benötigt 20 freie Nummern; 1–10 und 21–30 belegt → Vorschlag: 31
- Hinweistext (12 px, muted): Berechnungsregel
- **„✓ Reservieren"-Button** (`p-button severity="primary" size="small"`): Prüft vor dem Speichern ob Nummern frei sind — bei Konflikt: Fehlermeldung; bei Erfolg: Block reserviert

### Panel 05 — Sonstiges

```
[ p-checkbox ]  Dieser Verkäufer hat Admin-Rechte
```
`p-checkbox` + `<label>` nebeneinander, gap 10 px, 14 px.

```
[ 📋 Einladungs-Link generieren ]  ← p-button secondary outlined small
```
Klick → Link in Zwischenablage + Toast „✓ Einladungs-Link kopiert!".

**Toggle-Schalter „Admin-Rechte":** Gibt nach Login die vollständige Admin-Ansicht frei. Nur für Admins sichtbar.

---

## 5. Dialog-Größe

Admin-Seller-Dialog: Größe `lg` (max 940 px).

---

## Stories

- [VERK-VA-S01 — Admin-Dialog-Formular (Verkäufer anlegen / bearbeiten)](stories/VERK-VA-S01-admin-seller-dialog-form.md)

## Akzeptanzkriterien

1. **AC-1** — WHEN die Verkäufer-Seite geöffnet wird, THEN SHALL das System alle registrierten Verkäufer in einer Tabelle anzeigen.
2. **AC-2** — WHEN einem Verkäufer ein Nummernblock zugewiesen wird, THEN SHALL das System sicherstellen, dass dieser Block keinem anderen Verkäufer gleichzeitig zugewiesen ist.
3. **AC-3** — WHEN ein Verkäufer-Datensatz bearbeitet wird, THEN SHALL das System die Änderungen in der Datenbank speichern und die Tabelle aktualisieren.
4. **AC-4** — IF ein Pflichtfeld beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung unter dem Feld anzeigen und nicht speichern.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #verkäufer #admin #registrierung #nummernblock #voranmeldung
