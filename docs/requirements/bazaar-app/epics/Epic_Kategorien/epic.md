---
id: F-BA-008
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Kategorien

## Index
- Überblick — Kategorie-Stammdaten
- 1. Tabelle — Spalten & Sortierung
- 2. Aktionen — Neu & Bearbeiten
- 3. `original`-Flag — Flag-Bedeutung
- 4. Artikel-Anzahl-Spalte — Zuordnung
- 5. Datenfluss — Import aus der Voranmelde-App
- 6. Backend & API — Endpoints
- 7. Out-of-Scope — bewusst verschobene Themen
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Kategorien
**Route:** `/categories`
**Sichtbar für:** Admin (Pflege) · Kassenpersonal (nur lesen)

Entity-Details → [`entities/kategorie.md`](../../entities/kategorie.md)
Component-Details → Tabelle: [Table](../../../../components/table/component.md) · Popup: `stammdaten-popup` (Ausprägung Kategorie)

**Ziel:** Admin pflegt die Kategorie-Stammdaten der Haupt-App; Kassenpersonal liest sie und legt am Annahmetisch implizit neue an.

**User Story:** Als Admin möchte ich Kategorien anlegen, bearbeiten und löschen, damit Artikel beim Erfassen einer Kategorie zugeordnet werden können.

---

## Überblick

Verwaltung der Kategorie-Stammdaten. Neue Kategorien entstehen auf zwei Wegen: vom Admin auf dieser Seite, oder am Basar-Tag über das AutoComplete-Popup der Artikelannahme ([`spec.md`](../../spec.md) Abschnitt 9.3).

**Aufbau, Verhalten und Endpoint-Muster sind identisch zu [Epic_Marken](../Epic_Marken/epic.md)** — dieselbe Tabelle, dasselbe Popup, dieselbe Flag-Logik, dieselbe Löschsperre, dieselbe Auth-Stufung. Damit die Beschreibung nicht doppelt lebt und beim nächsten Detail auseinanderläuft, steht das Gemeinsame in der Komponentenbeschreibung `stammdaten-popup`; hier steht nur, was kategoriespezifisch ist.

---

## 1. Tabelle

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** ID · Name · Original (Badge) · **Artikel** (Anzahl) · Aktionen

**Sortierbare Spalten:** ID · Name · Original · Artikel (Multi-Sort per Shift+Klick)

**Default-Sortierung:** Name aufsteigend.

Die Spalte heißt **ID**, nicht „Nr." — die Entity trägt eine 8-stellige alphanumerische `id`, keine laufende Nummer.

Eine Spalte „Verkauft" gibt es hier **nicht**; Verkaufszahlen gehören zu [Epic_Statistik](../Epic_Statistik/epic.md).

---

## 2. Aktionen

Nur für die Rolle Admin sichtbar. Kassenpersonal sieht die Tabelle ohne Aktionsspalte und ohne „+ Neu".

**„+ Neu"-Button** (Seitentitel) → öffnet Popup mit:
- Feld „Name"

Kein `original`-Toggle: Was der Admin selbst anlegt, ist per Definition kuratiert; der Server setzt das Flag aus der Rolle des Aufrufers.

**„Edit"-Button** pro Zeile → öffnet Popup mit „Name" **und** „Original" (`p-toggleswitch`), damit der Admin eine am Basar-Tag entstandene „Neu"-Kategorie nachträglich befördern kann.

---

## 3. `original`-Flag

| Wert | Bedeutung |
|---|---|
| `true` (`✓ Original`, grün) | Vom Admin als Stammdaten-Eintrag angelegt oder aus der Voranmelde-App importiert |
| `false` (`Neu`, orange) | Am Basar-Tag über das AutoComplete-Popup hinzugefügt |

---

## 4. Artikel-Anzahl-Spalte

Zeigt die Anzahl der Artikel, die dieser Kategorie zugeordnet sind. Beispiel: Kategorie „Jacken" → Artikel-Anzahl = 3.

`articleCount` wird **für beide Rollen** ausgeliefert — Kassenpersonal darf Artikel ohnehin lesen, eine rollenabhängige Response wäre zusätzlicher Code ohne Schutzwirkung.

---

## 5. Datenfluss — Import aus der Voranmelde-App

Kategorien können beim JSON-Import aus der Voranmelde-App mit übernommen werden (optional wählbar, siehe [Epic_Einstellungen](../Epic_Einstellungen/epic.md)).

**Der Datenfluss ist einseitig:** Die Voranmelde-App exportiert, die Haupt-App importiert. Einen Rückkanal gibt es nicht — die Voranmeldung endet, wenn der Basar beginnt.

---

## 6. Backend & API

API-Details → [`api/master-data.md`](../../api/master-data.md) (gemeinsam mit Marken — endpoint-seitig identisch)

Endpoint-seitig identisch zu [Epic_Marken](../Epic_Marken/epic.md) — dieselben vier Operationen, dieselbe Auth-Stufung, nur eine andere Ressource.

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/categories` | `authenticated` | Liste aller Kategorien inkl. `articleCount` |
| `POST /api/categories` | `authenticated` | Legt Kategorie an. `original` serverseitig aus der Rolle: Admin → `true`, Kassenpersonal → `false`. `409` bei Duplikat (nach Trim, case-insensitiv) |
| `PUT /api/categories/{id}` | `admin` | Aktualisiert Name und/oder `original`-Flag. Namensänderung wird in alle betroffenen Artikel nachgezogen (der Artikel referenziert die Kategorie über den Namen, siehe [`entities/kategorie.md`](../../entities/kategorie.md)) |
| `DELETE /api/categories/{id}` | `admin` | `409` falls noch Artikeln zugewiesen |

`GET` und `POST` sind bewusst nicht Admin-only: Kassenpersonal braucht die Liste für AutoComplete und Filter in der Artikelannahme und legt dort über den `+`-Modus selbst neue Kategorien an. Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1.

---

## 7. Out-of-Scope

**Kategorie-Hierarchie** (Ober- und Unterkategorien, etwa „Damen → Oberteile"). Bewusst nicht enthalten, nicht vergessen:

Die Entity kennt kein Eltern-Feld, keine Sortierreihenfolge, kein Icon und keine Farbe — Kategorien sind eine **flache Liste**. Am Annahmetisch wird unter Zeitdruck getippt; ein zweistufiges Auswählen kostet dort genau den Klick, den niemand hat. Eine flache Liste mit sprechenden Namen („Damen Oberteile") leistet dasselbe ohne zusätzliches Schema.

Nachrüsten wäre teuer, weil es AutoComplete, Filter, Import-Schema und Statistik-Gruppierung gleichzeitig betrifft — darum wäre das ein eigenes Epic mit Migration und eine bewusste Entscheidung, kein vorsorglicher Einbau.

Ebenfalls nicht enthalten: Icons oder Farben je Kategorie, feste Sortierreihenfolge abweichend von der Alphabetischen.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN die Kategorien-Seite geöffnet wird, THEN SHALL das System alle vorhandenen Kategorien nach Name aufsteigend sortiert in einer Tabelle anzeigen.
2. **AC-2** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit einem Namens-Feld ohne `original`-Toggle öffnen und die Kategorie mit `original = true` anlegen.
3. **AC-3** — WHEN eine neue Kategorie gespeichert wird, THEN SHALL das System sie in der Datenbank anlegen und in der Tabelle anzeigen.
4. **AC-4** — IF eine Kategorie angelegt werden soll, deren Name nach Trim und ohne Berücksichtigung der Groß-/Kleinschreibung bereits existiert, THEN SHALL das System sie mit `409` und der Meldung „Kategorie existiert bereits" ablehnen — unabhängig davon, ob der Aufruf von dieser Seite oder vom AutoComplete-Popup kommt.
5. **AC-5** — IF eine Kategorie gelöscht werden soll, die noch Artikeln zugewiesen ist, THEN SHALL das System eine Fehlermeldung „Kategorie wird noch verwendet" anzeigen und nicht löschen.
6. **AC-6** — WHEN eine Kategorie umbenannt wird, THEN SHALL das System den neuen Namen in allen zugeordneten Artikeln übernehmen.
7. **AC-7** — WHEN Admin im Edit-Popup das „Original"-Flag umschaltet und speichert, THEN SHALL das System den neuen Wert übernehmen und das Badge in der Tabelle entsprechend aktualisieren.
8. **AC-8** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL das System „+ Neu", „Edit" und „Löschen" nicht rendern; ein dennoch gesendeter `PUT`- oder `DELETE`-Request SHALL mit `403` abgelehnt werden.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #kategorien #stammdaten #crud #haupt-app #original-flag
