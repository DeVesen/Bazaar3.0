---
id: F-AR-004
status: draft
updated: 2026-07-31
---

# Epic: Meine Artikel

## Index
- Überblick — Konzept
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Artikelliste
- 3. Artikelanlage / Artikel bearbeiten — Formular
- 4. Nummernblock-Logik — Nummernvergabe
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Meine Artikel
**Sichtbar für:** Alle (Verkäufer sehen nur eigene Artikel; Admins sehen eigene Artikel — fremde über „Artikel")

**Ziel:** Verkäufer erfasst vorab seine Artikel für den Basar.

**User Story:** Als Verkäufer möchte ich meine Artikel vorab in der Voranmelde-App erfassen, damit ich am Basar-Tag nur noch die physische Übergabe durchführen muss.

---

## Überblick

Übersicht, Anlage und Bearbeitung der eigenen Artikel des eingeloggten Benutzers.

---

## 1. Filter-Panel

| Filter | Vorhanden |
|---|---|
| Marke | ✅ |
| Kategorie | ✅ |
| Freitext (Nummer, Bezeichnung, Kategorie, Marke) | ✅ |
| Verkäufer-Status | ❌ |
| Artikelstatus | ❌ |

---

## 2. Tabelle (`table-meine-artikel`)

→ Komponente: [Table](../../../../components/table/component.md)

**Sortierbare Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis (Multi-Sort per Shift+Klick)

**„+ Neu"-Button** (Seitentitel) → öffnet Artikelanlage-Dialog.

**Edit-Button** pro Zeile → öffnet Artikel-Bearbeiten-Dialog.
- Artikelnummer: oben, read-only
- **Löschen-Button** im Footer (links), neben Abbrechen + Speichern

---

## 3. Artikelanlage / Artikel bearbeiten

#### Feldlayout

| Zeile | Felder | Breite | Pflicht |
|---|---|---|---|
| 1 | Artikelnummer (schreibgeschützt, aus Nummernblock) | 50 % | auto |
| 2 | Bezeichnung | 100 % | ✅ |
| 3 | Kategorie (AutoComplete ▾/+) | 50 % | ✅ |
| 3 | Marke (AutoComplete ▾/+) | 50 % | ✅ |
| 4 | Größe | 50 % | ✅ |
| 4 | Farbe | 50 % | ✅ |
| 5 | Preis (InputGroup mit €-Addon) | 50 % | ✅ |
| 6 | Beschreibung (Textarea) | 100 % | ✅ |

- **Artikelnummer:** immer schreibgeschützt — wird automatisch aus dem nächsten freien Nummernblock vergeben
- **AutoComplete Kategorie/Marke:** identisch mit Haupt-App (▾-Modus / +-Modus)

#### AutoComplete — Detail

→ Komponente: [AutoComplete-Create](../../../../components/autocomplete-create/component.md)

- **▾-Modus:** Dropdown öffnet bei Fokus oder Klick auf Button — zeigt alle oder gefilterte Einträge
- **+-Modus:** Wenn eingetippter Wert keinem bestehenden Eintrag exakt entspricht → Button wechselt zu **+** (grün); Klick/Enter öffnet Modal „Neue Kategorie/Marke anlegen"
- Tastatur: `↓/↑` navigieren · `Enter` bestätigt / öffnet Dialog · `Escape` schließt

---

## 4. Nummernblock-Logik

- Artikelnummer wird automatisch aus dem nächsten freien Nummernblock des Verkäufers vergeben
- Ist der aktuelle Block aufgebraucht → automatisch nächster freier Block zugewiesen
- Verkäufer kann die Nummer nicht selbst wählen

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Formular zum Anlegen eines neuen Artikels öffnen mit den Feldern Bezeichnung, Preis, Kategorie und Marke.
2. **AC-2** — WHILE das Pflichtfeld Bezeichnung oder Preis leer ist, SHALL das System den Speichern-Button deaktiviert halten.
3. **AC-3** — WHEN ein Artikel gespeichert wird, THEN SHALL das System ihn mit Status `registriert` anlegen und in der Artikelliste anzeigen.
4. **AC-4** — WHEN ein Artikel bearbeitet und gespeichert wird, THEN SHALL das System die geänderten Daten in der Datenbank aktualisieren und in der Liste anzeigen.
5. **AC-5** — WHEN ein Artikel gelöscht wird, THEN SHALL das System eine Bestätigungsabfrage anzeigen bevor er aus der Datenbank entfernt wird.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #meine-artikel #verkäufer #artikel-erfassung #voranmeldung
