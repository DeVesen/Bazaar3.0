# Einstellungen

**Intent:** Admin konfiguriert die Basar-weiten Parameter zentral an einer Stelle — Termine, Nummernkreis, Standard-Verkäufertyp, öffentlicher Info-Text.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Admin can view/edit the registration deadline, drop-off window, bazaar window — `src/advance-registration/frontend/BAR.App/src/app/features/operations/settings/pages/SettingsPage.ts`
- Admin can set the default seller type — `SettingsPage.ts`
- Admin can edit the public info text (Markdown), up to 4000 characters — `SettingsPage.ts`
- User sees a warning as the info text nears the 4000-char limit (from 3800) — `SettingsPage.ts`
- Admin can configure numbering (start number, block size, default block count) — `SettingsPage.ts`
- User sees a save conflict (HTTP 409) distinctly from a generic save failure — `SettingsPage.ts`

## Spans
- **Frontend:** `operations/settings/pages/SettingsPage.ts` + `.html`, `operations/settings/settings-api.service.ts`, `operations/seller-type-options-api.service.ts`
- **Backend:** `BAR.Modules.Operations.Contracts.IOperationsModuleApi` (`GetSettingsAsync`, `UpdateSettingsAsync`)

## Notes
- Der öffentliche Info-Text erscheint sowohl auf der Login-Seite als auch auf Home (Admin und Verkäufer) — siehe jeweilige Feature-Profile.
