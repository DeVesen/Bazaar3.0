---
id: SPEC-IMPORT-EXPORT-ARTIKEL
status: draft
updated: 2026-09-17
---

# Design: Import/Export für "Meine Artikel"

## Index
- Kontext
- Scope
- 1. UI: SplitButton in der Toolbar
- 2. Backend: Export
- 3. Backend: Vorlage
- 4. Backend: Import
- 5. Frontend: Import/Export/Vorlage-Service + Import-Ergebnis-Dialog
- Ausdrücklich nicht Teil dieses Plans
- Testing
- Tags & Piles

---

## Kontext

Ausgangspunkt: Nutzerwunsch, in [Meine Artikel](../../knowledge/feature-profile/meine-artikel/feature.md)
eine Import/Export-Funktion für die eigenen Artikel zu ergänzen. Kein Roadmap-Item, direkt
beauftragt.

Bestandsaufnahme:

| Bereich | Ist-Zustand |
|---|---|
| `MyArticlesPage` Toolbar | `app-filter-panel` mit `#end`-Slot, aktuell ein einzelner `pButton` ("+Neu") über `canAdd`/`createLabel`/`create`-Output — siehe [`filter-panel.ts`](../../../src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts) |
| Artikelnummer-Vergabe | Backend-gesteuert über `ArticleNumberAllocator`/`NumberBlockAllocator`, Verkäufer wählt nie selbst — siehe [`api/articles.md`](../../requirements/advance-registration/api/articles.md) |
| Bestehendes Export-Feature (`/api/export`) | Admin-only, exportiert **alle** Verkäufer/Artikel als JSON — anderer Zweck, andere Zielgruppe, kein Vorbild für Format hier (siehe [R12-Spec](2026-09-10-r12-export-und-auslieferung-design.md)) |
| CSV/XLSX-Verarbeitung | Existiert nirgends im Repo — neu, Backend-seitig (bestätigt: kein Client-seitiges Parsing, Wiederverwendung der Domain-Logik hat Priorität) |
| Brand/Category | Denormalisierte Strings am Artikel, eigenständiges Modul `BAR.Modules.MasterData` mit `IMasterDataModuleApi` (`CreateBrandAsync` wirft `ConflictException` bei Namenskollision, keine Get-or-Create-Methode) |

---

## Scope

Reihenfolge: **Backend Export/Vorlage → Backend Import → Frontend SplitButton + Services →
Frontend Import-Ergebnis-Dialog**. Export/Vorlage sind unabhängig von Import und können zuerst
fertig und nutzbar sein.

---

## 1. UI: SplitButton in der Toolbar

Der bestehende `+Neu`-Button in `FilterPanel` (`#end`-Slot) wird zu einem PrimeNG
`p-splitButton`:

- Hauptaktion (Klick auf den Button selbst) bleibt exakt das bisherige Verhalten: emittiert
  `create` mit `createLabel()` als Beschriftung.
- Dropdown-Pfeil öffnet ein Menü mit den Einträgen **Import**, Trennlinie, **Export**,
  Trennlinie, **Vorlage** (in genau dieser Reihenfolge).

`FilterPanel` bleibt eine dumme Shared-Komponente — sie kennt keine Import/Export-Fachlogik
(gleiches Prinzip wie `sellerSearchFn`, das die Fachlogik dem Aufrufer überlässt):

- Neuer optionaler Input `splitButtonItems: input<MenuItem[]>()`. Ist er gesetzt, rendert
  `p-splitButton` (Haupt-Label `createLabel()`, Haupt-Klick → `create.emit()`, `model` =
  `splitButtonItems()`) statt des einfachen `pButton`. Ist er nicht gesetzt (z. B. auf der
  Sellers-Seite), bleibt der bisherige einfache Button unverändert.
- `MyArticlesPage` übergibt die drei `MenuItem`s mit ihren jeweiligen `command`-Callbacks
  (Import öffnet Datei-Auswahl, Export/Vorlage lösen den jeweiligen Blob-Download aus).

Nur PrimeNG-Komponenten (`p-splitButton`, `MenuItem` aus `primeng/api`), keine eigene
Dropdown-Implementierung.

---

## 2. Backend: Export

Neuer Endpoint `GET /api/articles/mine/export`, `authenticated`, folgt strukturell dem
bestehenden Query-Port-Muster (`IExportQuery`/`ExportQuery`, siehe R12-Spec), aber
seller-scoped statt admin-scoped:

- **Domain-Port** `IArticleExportQuery` in `BAR.Modules.Registration.Domain.Ports.Queries` —
  `Task<IReadOnlyList<ArticleExportRow>> ExecuteAsync(string sellerId, CancellationToken ct)`.
  `ArticleExportRow(int Number, string? Name, string? Category, string? Brand, string? Size,
  decimal? Price)` — alle Felder außer `Number` optional, weil leere Nummernkreis-Plätze
  keine Artikeldaten haben.
- **EF-Core-Adapter** `ArticleExportQuery`: liest `INumberBlockRepository.GetForSellerAsync`
  für die eigenen Blöcke, baut daraus die vollständige Nummernfolge (jede Nummer von
  `FromNumber` bis `ToNumber` jedes eigenen Blocks, blockübergreifend aufsteigend sortiert —
  Blöcke überlappen laut bestehender Exclusion-Constraint nie), joint pro Nummer den
  passenden Artikel (falls vorhanden) aus `IArticleRepository`.
- **Application-Handler** `GetArticleExportQueryHandler` mappt auf die CSV-Zeilen; die
  eigentliche CSV-Serialisierung (Spalten `Nummer,Bezeichnung,Kategorie,Marke,Größe,Preis`,
  UTF-8 mit BOM für Excel-Kompatibilität, `;` als Trennzeichen wegen deutscher
  Dezimalkomma-Konvention, `Preis` mit Komma als Dezimaltrennzeichen) übernimmt eine neue
  gemeinsame Hilfsklasse `ArticleCsvWriter` in `BAR.Application/Articles/ImportExport/`, die
  auch der Vorlage-Endpoint (Abschnitt 3) nutzt.
- **Endpoint** `BAR.Host/Features/Articles/ArticleExportEndpoints.cs`:
  `GET /api/articles/mine/export`, `RequireAuthorization()` (jeder eingeloggte Verkäufer, kein
  `admin`), `sellerId` aus dem `sub`-Claim. Antwort `Content-Disposition: attachment;
  filename="meine-artikel-YYYY-MM-DD.csv"`, `Content-Type: text/csv; charset=utf-8`.

---

## 3. Backend: Vorlage

`GET /api/articles/mine/template`, gleicher Endpoint-Ordner, gleiche Auth. Nutzt denselben
`ArticleCsvWriter`, aber die Zeilen kommen aus einer reinen Nummern-Aufzählung ohne
Artikel-Join (`ArticleExportRow` mit allen Feldern außer `Number` = `null`) — unabhängig
davon, ob und welche Artikel bereits existieren. Dateiname
`meine-artikel-vorlage-YYYY-MM-DD.csv`.

---

## 4. Backend: Import

`POST /api/articles/mine/import`, `authenticated`, `multipart/form-data` mit einer Datei
(`.csv` oder `.xlsx`, erkannt an der Dateiendung; falsche/fehlende Endung → sofortiger
`400`, kein Zeilen-Fehler).

### Ablauf (rein lesend, dann alles-oder-nichts schreiben)

1. **Parsen**: CSV über einfachen manuellen Parser (Trennzeichen `;`, wie beim Export/Vorlage
   geschrieben); `.xlsx` über **ClosedXML** (MIT-lizenziert). Beide Parser liefern dieselbe
   Zwischenform `IReadOnlyList<ImportRow>` (`RowNumber` = Zeile in der Datei für
   Fehlermeldungen, plus die 6 Rohwerte als Strings). Kaputte/nicht lesbare Datei → `400`
   (kein Zeilen-Fehler, es gibt noch keine Zeilen).
2. **Validieren** (pro Zeile, komplett bevor irgendetwas geschrieben wird):
   - `Nummer` fehlt oder keine Ganzzahl → Row-Fehler `import.invalid_number`.
   - `Nummer` liegt in keinem der eigenen `NumberBlock`s (`GetForSellerAsync`) →
     Row-Fehler `import.number_not_in_own_range`.
   - Zeile "befüllt" (mind. eines von Bezeichnung/Kategorie/Marke/Größe/Preis gesetzt) →
     Pflichtfelder wie bei `POST /api/articles` prüfen (`Bezeichnung`/`Kategorie`/`Marke`
     nicht leer, `Preis` parsebar und `> 0`) → sonst Row-Fehler `import.invalid_price` /
     `import.missing_field`.
   - Doppelte `Nummer` innerhalb derselben Datei → Row-Fehler `import.duplicate_number`
     (beide Zeilen werden gemeldet).
   - Ergibt sich aus Nummer + vorhandenem Artikel + Zeileninhalt eine der drei Aktionen
     **Create** (Nummer frei, Zeile befüllt) / **Update** (Nummer belegt, Zeile befüllt) /
     **Delete** (Nummer belegt, Zeile komplett leer) / **NoOp** (Nummer frei, Zeile leer).
3. **Bei mindestens einem Row-Fehler**: `422` mit
   `{ "errors": [ { "row": 4, "errorCode": "import.number_not_in_own_range", "detail": "…" } ] }`,
   **nichts** wird gespeichert (bestätigte Anforderung: alles-oder-nichts, aber mit
   Zeilen-Fehlerliste für die Korrektur).
4. **Keine Fehler**: alle Aktionen in einer DB-Transaktion ausführen:
   - **Create**: `Article.Create(sellerId, number, …)` mit der Nummer **aus der Zeile**
     (bewusste Ausnahme vom `ArticleNumberAllocator` — die Nummer ist bereits als „im eigenen
     Nummernkreis, frei" validiert, daher keine Kollisionsgefahr; `IArticleRepository
     .CreateAsync(article, newBlock: null, ct)`, da kein neuer Block nötig ist).
   - **Update**: bestehenden Artikel per `Number`+`SellerId` laden, alle 5 Felder **plus**
     `Size`/`Color`/`Description` aus der Zeile setzen — Farbe/Beschreibung werden auf `null`
     gesetzt, weil die Importdatei keine Spalten dafür hat und der Import als vollständige
     Eingabe gilt (bestätigte Anforderung).
   - **Delete**: `IArticleRepository.DeleteAsync`.
   - **Marke/Kategorie unbekannt**: vor dem Schreiben der Artikel, für alle in der Datei
     vorkommenden Marken/Kategorien einmalig `IMasterDataModuleApi.GetAllBrandNamesAsync`/
     `GetAllCategoryNamesAsync` abgleichen (case-insensitiv) und für jede unbekannte per
     `CreateBrandAsync`/`CreateCategoryAsync` anlegen (`IsAdmin` = ob der importierende
     Verkäufer Admin ist, gleiche Regel wie beim inline-Anlegen im Artikel-Dialog).
5. **Response `200`**: `{ "created": 3, "updated": 1, "deleted": 2 }`.

### Neue Bausteine

- `BAR.Application/Articles/ImportExport/ArticleCsvWriter.cs` (Export/Vorlage, Abschnitt 2/3)
- `BAR.Application/Articles/ImportExport/ArticleImportFileParser.cs` (CSV, `.xlsx` via
  ClosedXML) → `IReadOnlyList<ImportRow>`
- `BAR.Application/Articles/ImportExport/ArticleImportValidator.cs` → reine Funktion
  `IReadOnlyList<ImportRow> → (IReadOnlyList<ImportAction>, IReadOnlyList<ImportRowError>)`,
  unit-testbar ohne DB
- `BAR.Application/Articles/ImportExport/ImportArticlesCommandHandler.cs` orchestriert
  Parsen → Validieren → (bei Erfolg) Schreiben
- `BAR.Host/Features/Articles/ArticleImportEndpoints.cs`: `POST /api/articles/mine/import`

---

## 5. Frontend: Import/Export/Vorlage-Service + Import-Ergebnis-Dialog

- Neuer `ArticlesImportExportApiService`
  (`features/registration/my-articles/articles-import-export-api.service.ts`):
  - `export(): Observable<{ blob: Blob; fileName: string }>` und `template(): Observable<{
    blob: Blob; fileName: string }>` — identisches Blob-Download-Muster wie das bestehende
    `ExportApiService` (Task 5, R12-Spec): `responseType: 'blob'`, Dateiname aus
    `Content-Disposition`.
  - `import(file: File): Observable<ImportSummary>` — `FormData`-Upload, `POST
    /api/articles/mine/import`. Bei `422` wird der `HttpErrorResponse`-Body (Zeilen-Fehler-
    Array) durchgereicht, nicht als generischer Fehler behandelt.
- `MyArticlesPage`: Export/Vorlage-Klick triggert sofort Download + Browser-Save (wie
  `ExportPage`, kein Zwischendialog). Import-Klick öffnet einen nativen
  Datei-Auswahldialog (`<input type="file" accept=".csv,.xlsx">`, unsichtbar, per Klick
  ausgelöst); nach Dateiauswahl direkter Upload.
- Neue Komponente `ImportResultDialog`
  (`features/registration/my-articles/components/import-result-dialog.ts`), PrimeNG
  `p-dialog`:
  - Erfolg (`200`): Zusammenfassungstext „X angelegt, Y aktualisiert, Z gelöscht"
    (i18n-Key `myArticles.import.success`), Tabellen-Reload in `MyArticlesPage`.
  - Fehler (`422`): Tabelle Zeile/Fehlermeldung (`p-table`, Spalten `row`/übersetzter
    `errorCode`-Text), kein Reload.
  - Sonstiger Fehler (`400`, Netzwerk): einzeiliger Fehlertext.

---

## Ausdrücklich nicht Teil dieses Plans

- Kein Undo/Vorschau vor dem eigentlichen Import (kein "Trockenlauf"-Modus) — Anforderung
  verlangt alles-oder-nichts mit Fehlerliste, keine Zwischenbestätigung einzelner Zeilen.
- Keine Änderung am bestehenden Admin-Export (`/api/export`) — anderer Endpoint, anderer
  Zweck, bleibt unangetastet.
- Kein Undo für importierte Löschungen (Abschnitt 4, Delete-Aktion) — Hard-Delete wie beim
  bestehenden `DELETE /api/articles/{id}`, kein Soft-Delete/Papierkorb im Datenmodell
  vorhanden.
- Kein Bulk-Import über Verkäufer-Grenzen hinweg (z. B. Admin importiert für fremde
  Verkäufer) — ausschließlich `authenticated`, eigene Artikel, wie der Rest der
  Meine-Artikel-API.

---

## Testing

Backend TDD (xUnit v3 + Moq für Unit-Tests, Postgres-Testcontainer für Integration, gleiches
Muster wie R12/bestehende Article-Tests):

- `ArticleImportValidatorTests` (Unit, keine DB): jede Fehlerklasse (ungültige Nummer,
  Nummer außerhalb eigener Blöcke, doppelte Nummer, fehlendes Pflichtfeld, ungültiger Preis)
  einzeln, plus die vier Aktionsklassen Create/Update/Delete/NoOp.
- `ArticleImportFileParserTests` (Unit): CSV- und `.xlsx`-Parsing, inkl. kaputter Datei.
- `ArticleExportQueryTests` / `ArticleExportEndpointsTests` (Integration): Nummernkreis mit
  Lücken korrekt als leere Zeilen, mehrere Blöcke aufsteigend sortiert, fremde Artikel nicht
  sichtbar.
- `ArticleImportEndpointsTests` (Integration): Roundtrip Export → unverändert re-importieren
  → keine Änderungen; Create/Update/Delete je ein Szenario; ein Fehler in einer Zeile →
  gesamte Datei abgelehnt, keine Teilspeicherung (per direkter DB-Abfrage verifiziert);
  unbekannte Marke wird angelegt.

Frontend Vitest:

- `articles-import-export-api.service.spec.ts`: Blob-Download-Parsing (wie
  `export-api.service.spec.ts`), `FormData`-Upload, `422`-Fehlerkörper wird durchgereicht.
- `import-result-dialog.spec.ts`: Erfolgs- und Fehler-Darstellung.
- `filter-panel.spec.ts` (Ergänzung): `splitButtonItems` gesetzt → `p-splitButton` gerendert;
  nicht gesetzt → weiterhin einfacher Button (Regressionsschutz für Sellers-Seite).

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #import #export #meine-artikel #csv #xlsx #nummernkreis #splitbutton
