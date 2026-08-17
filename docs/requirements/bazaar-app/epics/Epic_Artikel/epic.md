---
id: F-BA-006
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Artikel

## Index
- Überblick — Artikel-Tabelle
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Spalten & Aktionen
- 3. Artikelstatus-Popup — Zeitstempel korrigieren
- 4. Änderbarkeit — Was wann gesperrt ist
- 5. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Artikel
**Route:** `/articles`
**Sichtbar für:** Admin (alles) · Kassenpersonal (lesen und bearbeiten, kein Löschen, kein Status-Popup)

Entity-Details → [`entities/artikel.md`](../../entities/artikel.md)

**Ziel:** Admin sieht und verwaltet alle Artikel des laufenden Basars.

**User Story:** Als Admin möchte ich alle Artikel mit ihrem Status einsehen und verwalten, damit ich einen Überblick über den gesamten Artikelbestand habe.

---

## Überblick

Übersicht aller Artikel aller Verkäufer. Kein „+ Neu"-Button — Artikel entstehen ausschließlich über die [Artikelannahme](../Epic_Artikelannahme/epic.md) oder den JSON-Import.

Diese Seite ist die **Korrekturstelle** des Basar-Tags: Hier werden Tippfehler behoben und, in Ausnahmefällen, Zeitstempel von Hand richtiggestellt. Deshalb ist sie in Abschnitt 4 mit Sperren versehen — je näher ein Feld am Geld liegt, desto strenger.

---

## 1. Filter-Panel

2-zeiliges Panel:

| Zeile | Elemente |
|---|---|
| 1 | Freitext-Suche — volle Breite |
| 2 | Marken-Dropdown · Kategorien-Dropdown · Artikelstatus-Dropdown |

**Freitext** sucht über **Nummer, Bezeichnung, Marke, Kategorie und Verkäufername** (Vor- und Nachname). Am Tisch sucht man nach dem, was man gerade weiß — die Nummer auf dem Etikett oder den Namen der Person, die davorsteht.

Zeile 2: 3-Spalten-Grid, bricht bei schmalen Viewports auf 1 Spalte um. Gap 10 px.

**Aktive Filter** als `p-chip`-Tags unterhalb des Panels (mit × zum Entfernen).

Ein vierter Filter „Verkauf-Status" bzw. „Verkäufer-Status" ist bewusst **nicht** enthalten: Der Verkaufszustand ist ein Wert des Artikelstatus, und nach dem Status eines *Verkäufers* zu filtern beantwortet auf einer Artikelliste keine Frage — das leistet die [Verkäufer-Seite](../Epic_Verkaeufer/epic.md).

**Suche, Filter, Sortierung und Paginierung laufen serverseitig**, 50 Zeilen pro Seite.

---

## 2. Tabelle

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · Status · Verkäufer · Aktionen

**Sortierbare Spalten:** Nr. · Bezeichnung · Kategorie · Marke · Preis · Status · Verkäufer (Multi-Sort per Shift+Klick)

Die Spalte **Nr.** heißt hier zu Recht so — `number` ist eine echte Zahl und Grundlage des Barcodes (anders als bei Marken und Kategorien, wo die `id` alphanumerisch ist).

Manuell als verkauft markierte Artikel tragen ein kleines Badge **„manuell"** neben dem Status (siehe Abschnitt 3).

**Kein „+ Neu"-Button.**

**Edit-Button** pro Zeile → öffnet Artikel-Bearbeiten-Dialog:
- Artikelnummer oben, read-only
- **Löschen-Button** im Footer (links, `danger`) — **nur für Admins** und nur solange `soldAt` leer ist

---

## 3. Artikelstatus-Popup

**Nur für Admins.** Klick auf den Artikelstatus-Badge öffnet ein Popup mit Zeitstempeln und Aktions-Buttons:

| Feld | Wert vorhanden | Wert NULL |
|---|---|---|
| Erstellt Am | Zeitstempel (read-only) | — |
| Freigegeben Am | Zeitstempel + **Löschen-Icon-Button** | **Setzen-Icon-Button** |
| Verkauft Am | Zeitstempel + **Löschen-Icon-Button** | **Setzen-Icon-Button** |
| Rückgegeben Am | Zeitstempel + **Löschen-Icon-Button** | **Setzen-Icon-Button** |
| Abgerechnet Am | Zeitstempel (read-only) | — |

**Button-Stil:** `p-button [text]="true" [rounded]="true"` — kein Hintergrund, Icon + optionaler Label.

### „Verkauft Am" von Hand setzen

Möglich, aber ausdrücklich eine **Korrektur**, keine zweite Verkaufsroute. Der Dialog warnt vorher: *„Dieser Verkauf entsteht ohne Kassenvorgang und fehlt in der Kassenabstimmung."*

Der Fall existiert real — der Artikel ist verkauft, das Geld liegt in der Schublade, aber die Kasse ist abgestürzt. Ohne Korrekturmöglichkeit bliebe der Verkäufer unbezahlt.

Damit ein so entstandener Verkauf hinterher **auffindbar** bleibt, setzt das System dabei das Feld `soldManually` am Artikel. Ohne dieses Bit wäre die Frage „warum sind in der Schublade 40 € weniger als im System?" nicht beantwortbar. Der Kassenvorgang in [Epic_Verkauf](../Epic_Verkauf/epic.md) setzt es **nicht**, der Import nie.

### Kaskadierungs-Regel beim Löschen

Wird ein früherer Zeitstempel gelöscht, werden alle nachfolgenden NULL — Löschen von „Freigegeben Am" entfernt also auch „Verkauft Am" und „Rückgegeben Am".

**Das Popup zeigt vorher, was es mitnimmt** („Verkauft am … und Zurückgegeben am … werden ebenfalls entfernt") und verlangt Bestätigung. Ein einzelner Klick auf ein Icon darf keinen Verkauf stillschweigend vernichten.

### Gegenseitige Sperre

Ein Artikel kann nicht gleichzeitig „Verkauft" und „Rückgegeben" sein: Ist `soldAt` gesetzt, ist der Setzen-Button bei `returnedAt` deaktiviert — und umgekehrt.

---

## 4. Änderbarkeit

Je näher ein Feld am Geld liegt, desto strenger die Sperre.

| Zustand | Was noch geht |
|---|---|
| Artikel im Verkauf | alles: Stammfelder, Preis, Zeitstempel (Popup nur Admin) |
| `soldAt` gesetzt | Bezeichnung, Beschreibung, Größe, Farbe, Marke, Kategorie. **`price` gesperrt** (`409`, „Verkauf zuerst stornieren") |
| Verkäufer abgerechnet (`settledAt` gesetzt) | **nichts** — alle Felder und Zeitstempel gesperrt (`409`, „Abrechnung zuerst stornieren") |

`price` ist ab dem Verkauf gesperrt, weil der Preis **der Umsatz ist** — ihn nachträglich zu ändern hieße, die Abrechnung von dem zu entkoppeln, was der Kunde bezahlt hat. Bezeichnung, Beschreibung, Größe und Farbe bleiben frei: Sie beschreiben den Vorgang, sie verändern seinen Betrag nicht. Marke und Kategorie beeinflussen nur Filter und Statistik-Gruppierung.

Nach der Abrechnung gibt es genau einen Weg zurück: die Abrechnung stornieren ([Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 3, Admin-only und bestätigungspflichtig). Damit bleibt eine ausgezahlte Summe nachvollziehbar.

---

## 5. Backend & API

API-Details → [`api/articles.md`](../../api/articles.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/articles` | `authenticated` | Seite der Artikelliste; Parameter für Freitext, Marke, Kategorie, Status, Sortierung, Seite |
| `PUT /api/articles/{id}` | `authenticated` | Stammfelder. Sperren nach Abschnitt 4 gelten serverseitig |
| `DELETE /api/articles/{id}` | `admin` | `409` falls `soldAt` gesetzt |
| `PUT /api/articles/{id}/timestamps` | `admin` | Setzt oder löscht Zeitstempel inkl. Kaskade; setzt `soldManually` beim manuellen Verkauf |

Bearbeiten dürfen **beide Rollen** — ein Tippfehler beim Preis muss korrigierbar sein, solange der Verkäufer noch am Tisch steht, und der Weg über den Admin würde die Schlange aufhalten. Löschen und Zeitstempel bleiben dem Admin vorbehalten (Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1).

---

## Akzeptanzkriterien

1. **AC-1** — WHEN die Artikel-Seite geöffnet wird, THEN SHALL das System die erste Seite der Artikel anzeigen; Freitext, Filter, Sortierung und Paginierung SHALL serverseitig aufgelöst werden, höchstens 50 Zeilen je Seite.
2. **AC-2** — WHEN ein Status-Filter gesetzt wird, THEN SHALL das System die Tabelle auf Artikel mit diesem Status einschränken.
3. **AC-3** — WHEN „Edit" bei einem Artikel geklickt wird, THEN SHALL das System ein Popup mit den vorausgefüllten Artikelfeldern öffnen.
4. **AC-4** — IF ein Pflichtfeld (Bezeichnung, Preis, Kategorie, Marke) beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung anzeigen und nicht speichern.
5. **AC-5** — WHEN ein Artikel gespeichert wird, THEN SHALL das System die Tabelle mit den aktualisierten Daten neu laden.
6. **AC-6** — IF `soldAt` gesetzt ist, THEN SHALL das System eine Änderung an `price` mit `409` und dem Hinweis „Verkauf zuerst stornieren" ablehnen.
7. **AC-7** — IF der Verkäufer des Artikels abgerechnet ist (`settledAt` gesetzt), THEN SHALL das System jede Änderung an Feldern und Zeitstempeln dieses Artikels mit `409` und dem Hinweis „Abrechnung zuerst stornieren" ablehnen.
8. **AC-8** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL das System das Artikelstatus-Popup und den Löschen-Button nicht rendern; entsprechende Requests SHALL mit `403` abgelehnt werden.
9. **AC-9** — IF ein Artikel gelöscht werden soll, dessen `soldAt` gesetzt ist, THEN SHALL das System die Löschung mit `409` ablehnen.
10. **AC-10** — WHEN „Verkauft Am" im Status-Popup von Hand gesetzt wird, THEN SHALL das System vorher den Hinweis „Dieser Verkauf entsteht ohne Kassenvorgang und fehlt in der Kassenabstimmung" anzeigen und nach Bestätigung `soldManually` am Artikel setzen.
11. **AC-11** — WHEN ein Zeitstempel gelöscht wird, dessen Kaskade weitere Zeitstempel entfernt, THEN SHALL das System die betroffenen Zeitstempel im Bestätigungsdialog namentlich nennen und erst nach Bestätigung löschen.
12. **AC-12** — WHEN ein Artikel mit gesetztem `soldManually` in der Tabelle erscheint, THEN SHALL das System neben dem Status ein Badge „manuell" anzeigen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #artikel #status #übersicht #crud #korrektur #haupt-app
