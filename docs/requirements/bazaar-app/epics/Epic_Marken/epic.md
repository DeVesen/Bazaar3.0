---
id: F-BA-007
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Marken

## Index
- Überblick — Marken-Stammdaten
- 1. Tabelle — Spalten & Sortierung
- 2. Aktionen — Neu & Bearbeiten
- 3. `original`-Flag — Flag-Bedeutung
- 4. Artikel-Anzahl-Spalte — Zuordnung
- 5. Datenfluss — Import aus der Voranmelde-App
- 6. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Marken
**Route:** `/brands`
**Sichtbar für:** Admin (Pflege) · Kassenpersonal (nur lesen)

Entity-Details → [`entities/marke.md`](../../entities/marke.md)
Component-Details → Tabelle: [Table](../../../../components/table/component.md) · Popup: `stammdaten-popup` (Ausprägung Marke)

**Ziel:** Admin pflegt die Marken-Stammdaten der Haupt-App; Kassenpersonal liest sie und legt am Annahmetisch implizit neue an.

**User Story:** Als Admin möchte ich Marken anlegen, bearbeiten und löschen, damit Artikel beim Erfassen einer Marke zugeordnet werden können.

---

## Überblick

Verwaltung der Marken-Stammdaten. Neue Marken entstehen auf zwei Wegen: vom Admin auf dieser Seite, oder am Basar-Tag über das AutoComplete-Popup der Artikelannahme ([`spec.md`](../../spec.md) Abschnitt 9.3).

**Marken und Kategorien sind bewusst getrennte Epics**, obwohl Tabelle, Popup, Flag-Logik und Endpoint-Muster identisch sind: Die Epic-Liste in [`spec.md`](../../spec.md) Abschnitt 5 ist auch der Implementierungsplan, und beide sind eigene Durchstiche, die man getrennt fertigstellt. Die gemeinsame Beschreibung lebt darum **nicht** doppelt hier, sondern in der Komponentenbeschreibung `stammdaten-popup`; epic-spezifisch bleibt nur, was wirklich abweicht (Titel, Route, Feldname).

Ein Sammel-Epic „Stammdaten" wäre der nächste naheliegende Schritt — er scheitert an Verkäufer-Typen: die tragen Provision und Gebühr und sind fachlich etwas völlig anderes. Die Klammer würde sofort undicht.

---

## 1. Tabelle

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** ID · Name · Original (Badge) · **Artikel** (Anzahl) · Aktionen

**Sortierbare Spalten:** ID · Name · Original · Artikel (Multi-Sort per Shift+Klick)

**Default-Sortierung:** Name aufsteigend.

Die Spalte heißt **ID**, nicht „Nr." — die Entity trägt eine 8-stellige alphanumerische `id`, keine laufende Nummer.

Eine Spalte „Verkauft" gibt es hier **nicht**. Verkaufszahlen beantworten auf einer Stammdaten-Pflegeseite keine Frage, die man dort hat; sie gehören zu [Epic_Statistik](../Epic_Statistik/epic.md).

---

## 2. Aktionen

Nur für die Rolle Admin sichtbar. Kassenpersonal sieht die Tabelle ohne Aktionsspalte und ohne „+ Neu".

**„+ Neu"-Button** (Seitentitel, nicht Filter-Toolbar) → öffnet Popup mit:
- Feld „Name"

Kein `original`-Toggle: Was der Admin selbst anlegt, ist per Definition kuratiert. Der Server setzt `original` aus der Rolle des Aufrufers — ein Schalter, der praktisch nie umgestellt wird, ist eine Frage, die niemand beantworten will.

**„Edit"-Button** pro Zeile → öffnet Popup mit „Name" **und** „Original" (`p-toggleswitch`). Damit kann der Admin eine am Basar-Tag entstandene „Neu"-Marke nachträglich zu „Original" befördern oder umgekehrt.

---

## 3. `original`-Flag

| Wert | Bedeutung |
|---|---|
| `true` (`✓ Original`, grün) | Vom Admin als Stammdaten-Eintrag angelegt oder aus der Voranmelde-App importiert |
| `false` (`Neu`, orange) | Am Basar-Tag über das AutoComplete-Popup hinzugefügt |

Zweck: erkennen, welche Marken erst am Annahmetisch entstanden sind — das sind die Kandidaten für die Nachpflege.

---

## 4. Artikel-Anzahl-Spalte

Zeigt die Anzahl der Artikel, die dieser Marke zugeordnet sind. Beispiel: Marke „Nike" → Artikel-Anzahl = 5.

`articleCount` wird **für beide Rollen** ausgeliefert. Eine rollenabhängige Response wäre zusätzlicher Code und ein zweiter Testfall für eine Zahl, die Kassenpersonal auf der Artikel-Seite ohnehin sehen darf. (Die Voranmelde-App macht es anders — dort dürfen Verkäufer die Artikel *anderer* nicht sehen; dieser Grund existiert hier nicht.)

---

## 5. Datenfluss — Import aus der Voranmelde-App

Marken können beim JSON-Import aus der Voranmelde-App mit übernommen werden (optional wählbar, siehe [Epic_Einstellungen](../Epic_Einstellungen/epic.md)).

**Der Datenfluss ist einseitig: die Voranmelde-App exportiert, die Haupt-App importiert.** Ein Rückkanal existiert nicht und ist auch nicht geplant — die Voranmeldung endet, wenn der Basar beginnt; danach hat die Voranmelde-App keinen Bedarf an den Marken, die am Annahmetisch entstanden sind. Ein Rückweg für den *nächsten* Basar wäre ein eigenes Epic und eine eigene Entscheidung.

---

## 6. Backend & API

Endpoint-seitig identisch zu [Epic_Kategorien](../Epic_Kategorien/epic.md) — dieselben vier Operationen, dieselbe Auth-Stufung, nur eine andere Ressource.

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/brands` | `authenticated` | Liste aller Marken inkl. `articleCount` |
| `POST /api/brands` | `authenticated` | Legt Marke an. `original` serverseitig aus der Rolle: Admin → `true`, Kassenpersonal → `false`. `409` bei Duplikat (nach Trim, case-insensitiv) |
| `PUT /api/brands/{id}` | `admin` | Aktualisiert Name und/oder `original`-Flag. Namensänderung wird in alle betroffenen Artikel nachgezogen (der Artikel referenziert die Marke über den Namen, siehe [`entities/marke.md`](../../entities/marke.md)) |
| `DELETE /api/brands/{id}` | `admin` | `409` falls noch Artikeln zugewiesen |

`GET` und `POST` sind bewusst nicht Admin-only: Kassenpersonal braucht die Liste für AutoComplete und Filter in der Artikelannahme und legt dort über den `+`-Modus selbst neue Marken an. `PUT` und `DELETE` bleiben Admin-only — Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN die Marken-Seite geöffnet wird, THEN SHALL das System alle vorhandenen Marken nach Name aufsteigend sortiert in einer Tabelle anzeigen.
2. **AC-2** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit einem Namens-Feld ohne `original`-Toggle öffnen und die Marke mit `original = true` anlegen.
3. **AC-3** — WHEN eine neue Marke gespeichert wird, THEN SHALL das System sie in der Datenbank anlegen und in der Tabelle anzeigen.
4. **AC-4** — IF eine Marke angelegt werden soll, deren Name nach Trim und ohne Berücksichtigung der Groß-/Kleinschreibung bereits existiert, THEN SHALL das System sie mit `409` und der Meldung „Marke existiert bereits" ablehnen — unabhängig davon, ob der Aufruf von dieser Seite oder vom AutoComplete-Popup kommt.
5. **AC-5** — IF eine Marke gelöscht werden soll, die noch Artikeln zugewiesen ist, THEN SHALL das System eine Fehlermeldung „Marke wird noch verwendet" anzeigen und nicht löschen.
6. **AC-6** — WHEN eine Marke umbenannt wird, THEN SHALL das System den neuen Namen in allen zugeordneten Artikeln übernehmen.
7. **AC-7** — WHEN Admin im Edit-Popup das „Original"-Flag umschaltet und speichert, THEN SHALL das System den neuen Wert übernehmen und das Badge in der Tabelle entsprechend aktualisieren.
8. **AC-8** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL das System „+ Neu", „Edit" und „Löschen" nicht rendern; ein dennoch gesendeter `PUT`- oder `DELETE`-Request SHALL mit `403` abgelehnt werden.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #marken #stammdaten #crud #haupt-app #original-flag
