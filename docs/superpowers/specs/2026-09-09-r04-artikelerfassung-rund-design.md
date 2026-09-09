---
id: DESIGN-R04
status: draft
updated: 2026-09-09
roadmap: docs/requirements/advance-registration/roadmap/R04-artikelerfassung-rund.md
---

# Design R04 — Artikelerfassung rund

## Ausgangslage

R03 (`docs/superpowers/specs/2026-09-09-r03-artikelerfassung-design.md`) ist
geplant, aber noch nicht implementiert. R03s Backend wird **vollständig** nach
API-Vertrag gebaut (bewusste, abgestimmte Abweichung von der
Roadmap-Ausschlussliste, siehe dort „Abweichung von der
Roadmap-Ausschlussliste"): automatische Blockerweiterung, `expectedNumber`/
`409 article.number_taken`, sowie Pagination/Filter/Sort als fester
Query-Vertrag auf `GET /api/articles/mine`. R03s **Frontend** lässt dagegen
Filter-Panel, Pagination-/Sortier-UI, „Speichern + kopieren" und den
Nummernkonflikt-Dialog bewusst aus.

**R04 ist damit reines Frontend** — kein Backend-Vertrag ändert sich. R04
baut die in R03 ausgelassenen Frontend-Teile auf dem bestehenden Vertrag auf.

Voraussetzung: R03 ist implementiert (Artikel-CRUD, `artikel-dialog` in
Grundform, `MyArticlesPage`, `ArticlesApiService`, `autocomplete-create`).

Ebenfalls betroffen, aber **nicht** Teil von R04: `NumberBlocksPage`/
`block-liste` (R02) — `usedCount` aus `GET /api/blocks/mine` speist die
Anzeige „N Nummern · M vergeben" bereits vollständig; sobald R03-Artikel
existieren, zeigt R02s Komponente automatisch korrekte Zahlen. R04 prüft das
nur manuell (Roadmap „Fertig, wenn" Punkt 6), baut nichts Neues dafür.

## Scope

Siehe [Roadmap R04](../../requirements/advance-registration/roadmap/R04-artikelerfassung-rund.md)
„Umfang" / „Nicht in diesem Schritt". Kurz: Filter-Panel, Paginierung/
Sortierung der Artikeltabelle, „Speichern + kopieren", Nummernkonflikt-Dialog
(AC-7), Verifikation der automatischen Blockerweiterung End-to-End (Backend
existiert seit R03, hier erstmals durch echte Artikel-Anlage durchlaufen).

**Keine Backend-Änderung.** `ArticlesApiService` bekommt zusätzliche
Query-Parameter für einen bereits bestehenden Endpoint — kein neuer Endpoint,
kein DTO-Wechsel.

## Frontend — neue Shared-Components

Erste echte Nutzung beider Komponenten in der Voranmelde-App — bisher nur in
`docs/components/` beschrieben, kein Code.

**`shared/table/`** — nach
[`docs/components/table/component.md`](../../../components/table/component.md).
Dumb Component: `columns` (`ColumnConfig[]`), `data`, `totalRecords`,
`loading`, `actionColumn`, Events `sortChange`/`filterChange`/`pageChange`/
`actionClick`/`rowAdd`. `p-table` mit `[lazy]="true"`, `[virtualScroll]="true"`,
`[virtualScrollItemSize]="46"`, `[sortMode]="'multiple'"`, `[stripedRows]="true"`,
`[rowHover]="true"`, Skeleton bei `loading` (5 Zeilen). Für Meine Artikel
bleibt `filterChange` ungenutzt — siehe Abschnitt „Spalten-Filter vs.
Filter-Panel".

**`shared/filter-panel/`** — nach
[`docs/components/filter-panel/component.md`](../../../components/filter-panel/component.md),
Basis-Variante: Marke (`p-select`), Kategorie (`p-select`), Freitext
(`p-iconfield`), „Suchen"-Button. Kein Live-Filter — Request nur bei `Enter`
in einem der Felder oder Klick auf „Suchen". Emittiert ein `search`-Event mit
`{ brand?: string; category?: string; searchText?: string }`.

### Spalten-Filter vs. Filter-Panel

Die generische `table`-Komponente bietet einen eigenen Spalten-Filter
(Trichter-Icon, Live-Overlay). Für Meine Artikel bleibt er **aus** — alle
`ColumnConfig`-Einträge bekommen `filterable: false`. Einzige Filterung läuft
über das Filter-Panel (explizit ausgelöst). Grund: zwei parallele
Filter-Mechanismen mit unterschiedlicher Auslösung (live vs. explizit) auf
derselben Liste wären widersprüchlich und nicht in Epic/Roadmap vorgesehen.

## Frontend — `features/my-articles/`

**`ArticlesApiService.getMine`** — Signatur erweitert um ein Query-Objekt:
`{ page?: number; pageSize?: number; sort?: string; brand?: string;
category?: string; search?: string }` → baut die Query-String-Parameter für
`GET /api/articles/mine` nach [`api/articles.md`](../../requirements/advance-registration/api/articles.md).
Response liefert weiterhin die Artikelliste plus Gesamtanzahl (für
`totalRecords`).

**`MyArticlesPage`** — hält den kombinierten Lade-State (Signals):
`page`, `pageSize`, `sort` (aus `table`s `sortChange`), `brand`/`category`/
`search` (aus `filter-panel`s `search`-Event). Jede Änderung eines dieser
Werte löst einen neuen `getMine`-Aufruf aus; eine Filteränderung setzt `page`
zusätzlich auf `1` zurück (sonst zeigt eine gefilterte Liste ggf. eine leere
Seite 3). Rendert `filter-panel` oberhalb, `table` darunter (Spalten
Nr./Bezeichnung/Kategorie/Marke/Preis, `actionColumn` mit `edit`,
Leerzustand-Text „Noch keine Artikel angemeldet. Mit **+ Neu** den ersten
anlegen." nur ohne aktiven Filter). „+ Neu" und `edit` öffnen `artikel-dialog`
wie in R03. Nach Anlegen/Bearbeiten/Löschen: aktuelle Seite mit denselben
Parametern neu laden.

**`artikel-dialog`** — Erweiterung um zwei in R03 ausgelassene Teile, beide
nach [`components/artikel-dialog.md`](../../requirements/advance-registration/components/artikel-dialog.md):

- **„Speichern + kopieren"** (AC-9/AC-10): zweiter Footer-Button, nur im
  Anlege-Modus. Bei `201` mit `nextNumber`: Dialog bleibt offen, alle Felder
  bleiben stehen, Nummernfeld übernimmt `nextNumber`, Fokus + Volltext-Selektion
  auf „Bezeichnung", Formular wird `pristine` gesetzt, Tabelle lädt sofort neu,
  Toast „✓ Artikel *n* gespeichert — nächste Nummer: *m*". Bei `201` **ohne**
  `nextNumber`: Dialog schließt, Toast „Keine freie Artikelnummer verfügbar —
  bitte Admin kontaktieren". Während des Requests sind alle drei Footer-Buttons
  gesperrt (Doppelklick-Schutz, verbrauchte Nummern sind nicht rückholbar).
- **Nummernkonflikt-Dialog** (AC-7): inline im `artikel-dialog` (kein eigenes
  Shared-Component — Einzelnutzung). `p-dialog`, Footer „Nur Schließen" mit
  „OK". Bei `409 article.number_taken` auf `POST /api/articles` (egal ob über
  „Speichern" oder „Speichern + kopieren" ausgelöst): zeigt `detail` aus der
  Response. Nach „OK": zurück im Anlege-Dialog, alle Eingaben erhalten,
  Nummernfeld übernimmt `nextNumber` aus der Fehler-Response, kein
  automatischer Wiederholungsversuch.

Ersetzt in R03 den generischen Error-Toast bei `409 article.number_taken` im
Anlege-Modus. Im Bearbeiten-Modus unverändert (Nummer ist dort nie strittig).

## Fehlerbehandlung (Ergänzung zu R03)

- `POST /api/articles` `409 article.number_taken` im Anlege-Modus → jetzt
  Nummernkonflikt-Dialog statt generischer Toast (siehe oben). Im
  Bearbeiten-Modus gibt es diesen Fehler nicht (Nummer unveränderlich).
- „Speichern + kopieren", `201` ohne `nextNumber` → Dialog schließt, Toast wie
  AC-8/AC-10 (identischer Text).
- `GET /api/articles/mine` mit Filter/Sort/Page-Parametern: Netzwerkfehler
  verhält sich wie R03s Fehlerbehandlung für Listen-Requests (generischer
  Error-Toast) — keine neue Fehlerkategorie.

## Testing

- **Frontend (Vitest):**
  - `table`: Spalten-Rendering, `sortChange`/`pageChange`/`actionClick`-Emits,
    Skeleton bei `loading`, Leerzustand mit/ohne `emptyText`.
  - `filter-panel`: `search`-Event nur bei Enter/Button-Klick, nicht bei
    reinem Tippen/Auswählen (kein Live-Filter).
  - `artikel-dialog`: „Speichern + kopieren" (Fokus+Selektion auf
    Bezeichnung, `pristine`-Reset, Toast-Text, gesperrte Buttons während
    Request), 201-ohne-`nextNumber`-Pfad (Dialog schließt), Nummernkonflikt-
    Dialog (Anzeige `detail`, Nummernfeld-Update nach „OK", Eingaben bleiben
    erhalten).
  - `MyArticlesPage`: Filter-/Sort-/Page-Änderung löst `getMine` mit korrekten
    Query-Parametern aus, Filteränderung resettet `page` auf 1.
- **Manuell:** die 6 „Fertig, wenn"-Punkte aus dem Roadmap-Dokument,
  insbesondere Punkt 1 (Blockerweiterung nach 10 Artikeln) und Punkt 6
  (Nummernblock-Seite zeigt „10 Nummern · 10 vergeben" — R02-Komponente,
  hier nur verifiziert).

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #artikel #filter-panel #table #nummernkonflikt #design
