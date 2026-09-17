# Domain Terms

### Vorlage
- **Maps to:** `GET /api/articles/mine/template` (`src/advance-registration/backend/BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs`) — leere CSV-Ausfüllvorlage, nur Nummern des eigenen Nummernkreises, nie Artikeldaten; `ArticlesImportExportApiService.template()` (`src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/articles-import-export-api.service.ts`) — Frontend-Aufruf. Abzugrenzen von „Export" (`GET /api/articles/mine/export`), das dieselben Zeilen mit vorhandenen Artikeldaten befüllt.
- **Confidence:** user-confirmed
- **First seen:** 2026-09-17
