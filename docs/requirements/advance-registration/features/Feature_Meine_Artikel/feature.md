# Feature: Meine Artikel

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Meine Artikel
**Sichtbar für:** Alle (Verkäufer sehen nur eigene Artikel; Admins sehen eigene Artikel — fremde über „Artikel")

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

- **▾-Modus:** Dropdown öffnet bei Fokus oder Klick auf Button — zeigt alle oder gefilterte Einträge
- **+-Modus:** Wenn eingetippter Wert keinem bestehenden Eintrag exakt entspricht → Button wechselt zu **+** (grün); Klick/Enter öffnet Modal „Neue Kategorie/Marke anlegen"
- Tastatur: `↓/↑` navigieren · `Enter` bestätigt / öffnet Dialog · `Escape` schließt

---

## 4. Nummernblock-Logik

- Artikelnummer wird automatisch aus dem nächsten freien Nummernblock des Verkäufers vergeben
- Ist der aktuelle Block aufgebraucht → automatisch nächster freier Block zugewiesen
- Verkäufer kann die Nummer nicht selbst wählen
