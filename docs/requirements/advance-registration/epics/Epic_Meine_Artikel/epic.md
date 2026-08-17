---
id: F-AR-004
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-14
---

# Epic: Meine Artikel

## Index
- Überblick — Konzept
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Artikelliste
- 3. Artikelanlage / Artikel bearbeiten — Formular
- 4. Nummernblock-Logik — Nummernvergabe
- 5. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Meine Artikel
**Sichtbar für:** Alle (Verkäufer sehen nur eigene Artikel; Admins sehen eigene Artikel — fremde über „Alle Artikel")

**Ziel:** Verkäufer erfasst vorab seine Artikel für den Basar.

Entity-Details → [`entities/artikel.md`](../../entities/artikel.md)

**User Story:** Als Verkäufer möchte ich meine Artikel vorab in der Voranmelde-App erfassen, damit ich am Basar-Tag nur noch die physische Übergabe durchführen muss.

---

## Überblick

Übersicht, Anlage und Bearbeitung der eigenen Artikel des eingeloggten Benutzers.

---

## 1. Filter-Panel

Details → [`components/custom/filter-panel.md`](../../components/custom/filter-panel.md).

| Filter | Vorhanden |
|---|---|
| Marke | ✅ (`p-select`) |
| Kategorie | ✅ (`p-select`) |
| Freitext (Nummer, Bezeichnung, Kategorie, Marke) | ✅ (`p-iconfield` mit Such-Icon) |
| Verkäufer-Status | ❌ |
| Artikelstatus | ❌ |

**Suche auslösen:** explizites Absenden, kein Live-Filter beim Tippen — Enter im Freitext- oder Select-Feld, oder Klick auf den „Suchen"-Button (`p-button` mit `pi-search` links + Text „Suchen") ganz rechts im Filter-Panel.

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

Details → [`components/forms/artikel-dialog.md`](../../components/forms/artikel-dialog.md). Löschen (AC-5) fragt vorher über `p-confirmdialog` (`ConfirmationService`) nach.

#### Feldlayout

| Zeile | Felder | Breite | Pflicht |
|---|---|---|---|
| 1 | Artikelnummer (schreibgeschützt, aus Nummernblock) | 50 % | auto |
| 2 | Bezeichnung | 100 % | ✅ |
| 3 | Kategorie (AutoComplete ▾/+) | 50 % | ✅ |
| 3 | Marke (AutoComplete ▾/+) | 50 % | ✅ |
| 4 | Größe | 50 % | ❌ |
| 4 | Farbe | 50 % | ❌ |
| 5 | Preis (InputGroup mit €-Addon, > 0, 2 Nachkommastellen) | 50 % | ✅ |
| 6 | Beschreibung (Textarea) | 100 % | ❌ |

**Pflichtfeld-Korrektur:** Größe, Farbe und Beschreibung standen hier ursprünglich als Pflicht, sind in [`entities.md`](../../../entities.md) und [`entities/artikel.md`](../../entities/artikel.md) aber als optional geführt. Die kanonische Quelle gewinnt — bei Kinderbasar-Artikeln wäre eine Pflicht-Beschreibung reine Erfassungsschikane, und die Haupt-App braucht die Felder ebenfalls nicht. Pflicht bleiben: Bezeichnung, Kategorie, Marke, Preis.

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
- Verkäufer kann die Nummer nicht selbst wählen
- Regel zur automatischen Block-Erweiterung bei aufgebrauchtem Block → siehe [Epic_Nummernbloecke](../Epic_Nummernbloecke/epic.md) Abschnitt 2 (kanonische Quelle)

---

## 5. Backend & API

API-Details → [`api/articles.md`](../../api/articles.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/articles/mine` | `authenticated` | Liste der eigenen Artikel, paginiert; Filter `brand`, `category`, `search`. |
| `POST /api/articles` | `authenticated` | Legt Artikel an, Artikelnummer serverseitig aus Nummernblock vergeben. |
| `PUT /api/articles/{id}` | `authenticated` | Aktualisiert Artikel — serverseitig geprüft, dass `{id}` dem eingeloggten Verkäufer gehört. |
| `DELETE /api/articles/{id}` | `authenticated` | Löscht Artikel — serverseitig geprüft, dass `{id}` dem eingeloggten Verkäufer gehört. |

Alle Endpoints beschränken sich serverseitig hart auf die Artikel des eingeloggten Verkäufers (nicht nur clientseitig gefiltert), geprüft über `verkaeuferId` gegen den `sub`-Claim. Fremde Artikel liefern `404`, nicht `403`.

**Offene Abhängigkeit — geklärt:** In der Voranmelde-App gibt es **kein** Artikel-Status-Feld. Das Statusmodell in [`entities.md`](../../../entities.md) leitet sich aus den vier Haupt-App-Zeitstempeln ab, die hier nicht existieren; jeder Artikel ist implizit „registriert".

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Formular zum Anlegen eines neuen Artikels öffnen mit allen Feldern aus Abschnitt 3 (Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis, Beschreibung).
2. **AC-2** — WHILE eines der Pflichtfelder aus Abschnitt 3 (Bezeichnung, Kategorie, Marke, Preis) leer ist, SHALL das System den Speichern-Button deaktiviert halten. Größe, Farbe und Beschreibung sind optional und blockieren das Speichern nicht.
3. **AC-3** — WHEN ein Artikel gespeichert wird, THEN SHALL das System ihn anlegen und in der Artikelliste anzeigen.
4. **AC-4** — WHEN ein Artikel bearbeitet und gespeichert wird, THEN SHALL das System die geänderten Daten in der Datenbank aktualisieren und in der Liste anzeigen.
5. **AC-5** — WHEN ein Artikel gelöscht wird, THEN SHALL das System eine `p-confirmdialog`-Bestätigungsabfrage anzeigen bevor er aus der Datenbank entfernt wird.
6. **AC-6** — IF der eingegebene Preis ≤ 0 ist, THEN SHALL das System eine Fehlermeldung unter dem Feld anzeigen und nicht speichern.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #meine-artikel #verkäufer #artikel-erfassung #voranmeldung
