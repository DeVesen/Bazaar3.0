# Einstellungen (Bazaar-App)

**Intent:** Zentrale Admin-Oberfläche für alles, was den Basar-Betrieb konfiguriert, aber nicht ins Tagesgeschäft (Intake/Checkout/Abrechnung) gehört: Scanner-Verhalten, Stammdaten-Import, Benutzerverwaltung, Freitexte der Belege, und (nur lokal/Dev) ein kompletter DB-Reset.
**Coverage:** inventoried
**Last reviewed:** 2026-10-19

## Capabilities

### Tab-Leiste (`settings-page`)
- Admin sees four tabs „Basis-Einstellungen" (`pi-cog`), „User" (`pi-users`), „Beleg Druck" (`pi-print`), „Sonstiges" (`pi-ellipsis-h`); start tab is „Basis-Einstellungen" — `features/settings/pages/settings-page/settings-page.{ts,html}`, `settings-tabs.ts`
- Active tab lives in query parameter `tab` (`general`/`users`/`print`/`misc`); unknown value falls back to `general`; tab switches use `replaceUrl` — `settings-page.ts` `activeTab`, `navigateTo()`
- Switching away from unsaved changes (Scan-Pause, Freitexte) or an open import preview asks „Ungespeicherte Änderungen" with „Bleiben"/„Verwerfen" — `settings-page.ts` `onTabChange()`; areas expose `hasUnsavedChanges`/`discardChanges()`

### Scanner-Einstellungen (`settings-form`)
- User sees/edits `ScannerPauseMs` (wie lange ein Scan-Ergebnis am Annahmetisch stehen bleibt, bevor automatisch weiterscannt wird) über eine geteilte `input-group`-Komponente — `features/settings/components/settings-form/settings-form.{ts,html}`
- User sees a field-level validation error from a 400 response (Wertebereich 500–15000ms) — `settings-form.ts` `fieldErrorOf()`
- User sees a success toast on save — `settings-form.ts` `onSave()`
- Admin schaltet „Artikel erst beim Schließen des Freigabe-Dialogs freigeben" (Standard an, Hilfetext „Gilt nur für Verkäufer ohne Gebühr.") und speichert es zusammen mit der Scan-Pause; aus = das Freigeben-Popup gibt bei Verkäufern mit Gebühr je Stück 0 sofort frei — `settings-form.{ts,html}` (`releaseOnClose`, `app-boolean-input`), `Bazaar.Domain/Settings/Settings.cs` (`ReleaseOnClose`)

### Freitexte der Belege (`print-texts-form`)
- Fields are laid out like the receipt: Freitext 1|2 side by side, Freitext 3 full width, Freitext 4|5 side by side; one „Freitexte speichern" button saves both templates — `print-texts-form.html` `.print-texts-form__grid`
- Admin edits five Markdown free texts per template (Abgabe-Beleg, Verkäufer-Übersicht) — `features/settings/components/print-texts-form/print-texts-form.{ts,html}`, `data/print-texts-api.ts`
- Free texts apply from the next print; links, images and HTML are not rendered — `shared/components/print-document/print-document.markdown.ts`

### Stammdaten-Import (`import-panel`)
- User uploads a JSON-Export der Voranmelde-App and sees a preview (Verkäufer-/Artikelanzahl, neu/ersetzt/übersprungen) before committing — `features/settings/components/import-panel/import-panel.{ts,html}`
- User sees übersprungene Verkäufer mit Grund (verkaufte Artikel / bereits abgerechnet) — `import-panel.ts` `reasonText()`
- User maps unbekannte Verkäufer-Typen aus der Import-Datei auf bestehende Typen, bevor der Import bestätigt werden kann — `import-panel.ts` `confirmDisabled`
- User can opt in/out of Marken-/Kategorien-Übernahme per Checkbox — `import-panel.ts` `importBrands`/`importCategories`
- User sees a distinct error für ein falsches Datei-Schema (400 `import.invalid_format`) vs. andere Fehler — `import-panel.ts` `onFileSelect()`

### Benutzerverwaltung (`user-management` + `user-dialog`)
- User sees eine Tabelle aller Benutzer (Benutzername, Rolle, "Wechsel offen"-Status) — `features/settings/components/user-management/user-management.{ts,html}`
- User creates einen neuen Benutzer mit Benutzername/Rolle/Initialpasswort — `user-management.ts` `onRowAdd()` → `user-dialog.ts`
- User edits die Rolle eines bestehenden Benutzers, optional mit neuem Passwort — `user-dialog.ts` (Edit-Modus, kein Benutzername-Feld)
- User sees den Hinweis "Wird beim ersten Login zum Ändern verlangt" wenn gerade ein Passwort gesetzt wird — `user-dialog.ts` `showForcedChangeHint`
- User sees "Rollenwechsel wirkt erst beim nächsten Login" nur im Edit-Modus — `user-dialog.html`
- User deletes einen Benutzer nach Bestätigungsdialog — `user-management.ts` `confirmDelete()`/`deleteUser()`
- User sees a specific error wenn der Benutzername schon vergeben ist (create) — `user-management.ts` `user.username_taken`
- User sees a specific error wenn dem letzten Admin die Rolle entzogen oder er gelöscht werden soll — `user-management.ts` `user.last_admin`

### Datenbank zurücksetzen (`dev-tools-panel`, Tab „Sonstiges")
- User sees den "Datenbank zurücksetzen"-Bereich nur, wenn das Backend im Development-Modus läuft — `features/settings/components/dev-tools-panel/dev-tools-panel.ts` (`DevToolsApi.isDevelopment()`, 404 in Production → unsichtbar)
- User must type "RESET" before the reset button enables — `dev-tools-panel.ts` `canReset`
- User triggers einen kompletten DB-Drop+Neuaufbau (alle Daten inkl. eigenes Admin-Konto weg), danach Logout+Reload zurück zum Setup-Wizard — `dev-tools-panel.ts` `resetDatabase()`

## Spans
- **Frontend:** `features/settings/pages/settings-page/settings-page.{ts,html}` + `settings-tabs.ts` (Tab-Leiste, hostet alle Bereiche), `features/settings/components/{settings-form,print-texts-form,import-panel,user-management,user-dialog,dev-tools-panel}/`, `features/settings/data/{settings-api,import-api,users-api,dev-tools-api}.ts`
- **Backend:** `Bazaar.Api/Features/Settings/SettingsEndpoints.cs` (`GET/PUT /api/settings`, `GET/PUT /api/settings/print-texts`), `Bazaar.Api/Features/Import/ImportEndpoints.cs` (`POST /api/import/preview`, `POST /api/import`), `Bazaar.Api/Features/Users/UserEndpoints.cs` (`GET/POST/PUT/DELETE /api/users`), `Bazaar.Api/Features/Admin/DevToolsEndpoints.cs` (`GET /api/admin/dev-tools/status`, `POST /api/admin/dev-tools/reset-database`, nur gemappt wenn `Environment.IsDevelopment()`)

## Notes
- Ganze `/settings`-Route trägt `adminGuard` (`app.routes.ts`) — keine der vier Komponenten prüft die Rolle nochmal selbst, bewusste Konvention.
- `SettingsForm` lädt über einen eigenen `SettingsApi` (Live-Roundtrip), nicht über den app-weiten gecachten `SettingsService` (den z. B. `scan-feedback` nutzt) — bewusst getrennt.
- Dev-Tools-Endpoints existieren serverseitig nur in Development — das Frontend zeigt den Button nicht per Rollen-/Config-Flag, sondern weil der Status-Call in Production schlicht 404 liefert.
- `DatabaseResetService.ResetAsync()` setzt zusätzlich das In-Memory-Singleton `AdminBootstrapState` zurück (`Initialize(false)`) — sonst bliebe `bootstrap-status` nach einem Reset fälschlich bei `hasAdmin:true` hängen.
