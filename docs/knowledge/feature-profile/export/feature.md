# Export

**Intent:** Admin exportiert alle Verkäufer mit ihren Artikeln als Datei für die Haupt-App am Basar-Morgen. Einzige Brücke zwischen Voranmelde-App und Haupt-App.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Admin can trigger an export, downloaded as a file — `src/advance-registration/frontend/BAR.App/src/app/features/export/export/pages/ExportPage.ts`
- Admin can optionally include brand name list in the export — `ExportPage.ts`
- Admin can optionally include category name list in the export — `ExportPage.ts`
- User sees a summary (seller count, article count) after a successful export — `ExportPage.ts`

## Spans
- **Frontend:** `export/export/pages/ExportPage.ts`, `export/export/export-api.service.ts`
- **Backend:** `BAR.Modules.Export.Application.GetExportQueryHandler` — reine Read-Komposition über SellerManagement/Registration/MasterData, kein eigenes Schema

## Notes
- Fachregel §11.7 (siehe `bar-modules-export`): nur Verkäufer mit mindestens einem Artikel werden exportiert; Konditionswerte (Provision/Gebühr) werden bewusst nicht mit exportiert, nur der Verkäufertyp-Name — die Haupt-App löst die Werte selbst auf.
