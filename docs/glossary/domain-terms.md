# Domain Terms

### Vorlage
- **Maps to:** `GET /api/articles/mine/template` (`src/advance-registration/backend/BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs`) — leere CSV-Ausfüllvorlage, nur Nummern des eigenen Nummernkreises, nie Artikeldaten; `ArticlesImportExportApiService.template()` (`src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/articles-import-export-api.service.ts`) — Frontend-Aufruf. Abzugrenzen von „Export" (`GET /api/articles/mine/export`), das dieselben Zeilen mit vorhandenen Artikeldaten befüllt.
- **Confidence:** user-confirmed
- **First seen:** 2026-09-17

### Umnummerieren
- **Maps to:** `IntakeRenumberLookupPopup` (`src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.ts`) — Popup „Artikel per Nummer laden" in der Artikelannahme (Haupt-App): lädt einen vorregistrierten Artikel desselben Verkäufers, der unter neuer Nummer gebucht wird; `originalNumberToDelete` (`src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.ts`) — gemerkte Ursprungsnummer; `IntakeArticleLine.DeleteArticleNumber` (`src/bazaar-app/backend/Bazaar.Application/Intake/IntakeCommand.cs`) + Lösch-Vorstufe in `IntakeHandler` (`src/bazaar-app/backend/Bazaar.Application/Intake/IntakeHandler.cs`) — löscht beim Buchen den alten Artikel.
- **Aliases:** Renumber
- **Confidence:** user-confirmed
- **First seen:** 2026-09-23

### Stammdaten-Import
- **Maps to:** `ImportPanel` (`src/bazaar-app/frontend/src/app/features/settings/components/import-panel/import-panel.ts`) — Bereich „JSON-Import" in den Einstellungen der Haupt-App: Vorschau, dann Übernahme der JSON-Datei der Voranmelde-App (Verkäufer, Artikel, optional Marken und Kategorien); `ImportEndpoints` (`src/bazaar-app/backend/Bazaar.Api/Features/Import/ImportEndpoints.cs`) — `POST /api/import/preview` und `POST /api/import`. Abzugrenzen vom „Artikel-Import" (Datei mit Artikeln eines Verkäufers an dessen Verkäufer-Kachel, siehe `CONTEXT.md`).
- **Aliases:** JSON-Import
- **Confidence:** inferred
- **First seen:** 2026-10-13
