# Domain Terms

### Vorlage
- **Maps to:** `GET /api/articles/mine/template` (`src/advance-registration/backend/BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs`) — leere CSV-Ausfüllvorlage, nur Nummern des eigenen Nummernkreises, nie Artikeldaten; `ArticlesImportExportApiService.template()` (`src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/articles-import-export-api.service.ts`) — Frontend-Aufruf. Abzugrenzen von „Export" (`GET /api/articles/mine/export`), das dieselben Zeilen mit vorhandenen Artikeldaten befüllt.
- **Confidence:** user-confirmed
- **First seen:** 2026-09-17

### Umnummerieren
- **Maps to:** `IntakeArticleEntry.loadPreRegisteredArticle` (`src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.ts`) — Artikelwandlung in der Artikelannahme (Haupt-App): ein eigener vorregistrierter Artikel (Status „Registriert") wird über den Dialog „Aus Voranmeldung übernehmen" (`PreRegisteredArticlesDialog`, `src/bazaar-app/frontend/src/app/features/intake/components/pre-registered-articles-dialog/pre-registered-articles-dialog.ts`) geladen und unter neuer Nummer gebucht; `originalNumberToDelete` (`src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.ts`) — gemerkte Ursprungsnummer; `IntakeArticleLine.DeleteArticleNumber` (`src/bazaar-app/backend/Bazaar.Application/Intake/IntakeCommand.cs`) + Lösch-Vorstufe in `IntakeHandler` (`src/bazaar-app/backend/Bazaar.Application/Intake/IntakeHandler.cs`) — löscht beim Buchen den alten Artikel.
- **Aliases:** Renumber
- **Confidence:** user-confirmed
- **First seen:** 2026-09-23

### Stammdaten-Import
- **Maps to:** `ImportPanel` (`src/bazaar-app/frontend/src/app/features/settings/components/import-panel/import-panel.ts`) — Bereich „JSON-Import" in den Einstellungen der Haupt-App: Vorschau, dann Übernahme der JSON-Datei der Voranmelde-App (Verkäufer, Artikel, optional Marken und Kategorien); `ImportEndpoints` (`src/bazaar-app/backend/Bazaar.Api/Features/Import/ImportEndpoints.cs`) — `POST /api/import/preview` und `POST /api/import`. Abzugrenzen vom „Artikel-Import" (Datei mit Artikeln eines Verkäufers an dessen Verkäufer-Kachel, siehe `CONTEXT.md`).
- **Aliases:** JSON-Import
- **Confidence:** inferred
- **First seen:** 2026-10-13

### Artikel-Import
- **Maps to:** `ArticleImportDialog` (`src/bazaar-app/frontend/src/app/features/sellers/components/article-import-dialog/article-import-dialog.ts`) — Dialog an der Verkäufer-Kachel (Upload-Icon, nur Admin): Datei (XLSX, XLS oder CSV, höchstens 2 MB) per Drag & Drop wählen, alle Zeilen werden als Artikel „Registriert“ für diesen einen Verkäufer angelegt, alles oder nichts; `ArticleImportEndpoints` (`src/bazaar-app/backend/Bazaar.Api/Features/ArticleImport/ArticleImportEndpoints.cs`) — `POST /api/sellers/{id}/articles/import`; `ImportSellerArticlesHandler` (`Bazaar.Application/ArticleImport/`). Nicht zu verwechseln mit „Stammdaten-Import“ (JSON der Voranmelde-App in den Einstellungen, mehrere Verkäufer auf einmal).
- **Confidence:** inferred
- **First seen:** 2026-10-13

### Standard-Verkäufer-Typ
- **Maps to:** `Settings.DefaultSellerTypeId` (`src/bazaar-app/backend/Bazaar.Domain/Settings/Settings.cs`) — optionale Einstellung der Haupt-App, `defaultSellerTypeId` in `GET/PUT /api/settings`; Auswahl „Standard-Verkäufer-Typ" im Tab „Basis-Einstellungen" (`src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.html`); `pickDefaultSellerType` (`src/bazaar-app/frontend/src/app/shared/seller-form/default-seller-type.ts`) — Vorbelegung des Typs bei „Neuer Verkäufer" und in der Artikelannahme: konfigurierter Typ, solange er existiert, sonst der am häufigsten zugewiesene. Löschen des Typs setzt die Einstellung auf leer zurück (`DeleteSellerTypeHandler`). Nicht zu verwechseln mit `defaultTypeId` der Voranmelde-App, der das Löschen sperrt.
- **Aliases:** Standard-Typ, Default-Verkäufer-Typ
- **Confidence:** user-confirmed
- **First seen:** 2026-10-30
