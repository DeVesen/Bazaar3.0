---
round: Round-25
status: geplant
---

# Plan: Round 25 — Einstellungen: Systemparameter

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-16/plan.md](../Round-16/plan.md): `shared/components/input-group/`
  (Anzahl-Variante hier erstmals genutzt), `scan-feedback.ts` mit
  `pauseMs`-Default-Konstante `3000` (wird hier durch Service-Wert ersetzt).
- [Round-9/plan.md](../Round-9/plan.md): `AuthService`-Muster
  (`signal`+`computed`, `providedIn: 'root'`, `provideAppInitializer`) — Vorlage
  für `SettingsService`.
- [Round-7/plan.md](../Round-7/plan.md): `features/settings/settings.routes.ts`
  + Platzhalter-Page, Route `/settings` bereits mit `[authGuard, adminGuard]`.

## Implementationsplan

### Backend

#### 1. `Bazaar.Domain/Settings/`

`Settings.cs`: `Id` (fest `1`, kein Generator), `ScannerPauseMs` — Invariante im
Konstruktor/`Update`-Methode (`500–15000`, wirft `ArgumentOutOfRangeException`
bei Verstoß, analog `SellerType`-Muster aus Round-13). `ISettingsRepository.cs`
(`Get(): Task<Settings>`, `Update(Settings): Task`).

#### 2. Infrastructure

`SettingsConfiguration.cs`, `SettingsRepository.cs`. Seed: Migration mit
`migrationBuilder.InsertData(table: "Settings", columns: ["Id",
"ScannerPauseMs"], values: [1, 3000])` — läuft immer (nicht bedingt wie
Seed-Admin), da die Zeile unabhängig vom Benutzerbestand existieren muss.

#### 3. Application

`Bazaar.Application/Settings/GetSettingsHandler.cs`,
`UpdateSettingsCommand`+`Validator`(`InclusiveBetween(500, 15000)`)+
`UpdateSettingsHandler.cs`.

#### 4. Api

`SettingsEndpoints.cs` (`Bazaar.Api/Features/Settings/`) — `GET`
`authenticated`, `PUT` `RequireAuthorization("admin")`.

### Frontend

#### 5. `SettingsService`

`core/settings/settings.service.ts`: `signal<Settings | null>(null)`,
`scannerPauseMs = computed(() => this.settings()?.scannerPauseMs ?? 3000)`
(Fallback bleibt die alte Konstante, falls der initiale Load noch nicht
abgeschlossen ist — verhindert `undefined`-Fehler in `scan-feedback` beim
allerersten Tick). Laden via `provideAppInitializer` in `app.config.ts`
(analog `AuthService`, Round-9) — `GET /api/settings` vor erster Navigation.

`shared/components/scan-feedback/scan-feedback.ts` (Round-16): `pauseMs`-Input
entfernt zugunsten `private readonly settingsService = inject(SettingsService)`
+ `pauseMs = this.settingsService.scannerPauseMs` intern — **oder**,
weniger invasiv: `@Input() pauseMs = this.settingsService.scannerPauseMs()`
bleibt als Default-Parameter bestehen, Konsumenten (Round-17/18) binden ihn
nicht mehr explizit auf `3000`, sondern lassen den Default greifen.
Entscheidung: **zweite Variante** — kleinere Diff, keine Breaking-Change an der
`@Input`-Schnittstelle selbst, nur der Default-Wert wechselt von
Literal-Konstante zu Service-Computed.

#### 6. `features/settings/`

`data/settings-api.ts` (`get`, `update`), `settings.page.ts` ersetzt
Round-7-Platzhalter, hostet `settings-form`. `settings-form.ts`: `input-group`
(Anzahl-Variante, `ms`-Addon, `modes=['keyboard','numpad']`), Hilfstext,
„Speichern" → `update()` → Erfolg Toast, `400` → Feldfehler unter dem Feld.

### 7. Verifikation

- `dotnet test` — `Settings`-Invariante (Grenzwerte 499/500/15000/15001),
  `UpdateSettingsHandler` `400`-Mapping.
- `ng serve`: `/settings` als Kassenpersonal → `adminGuard` blockiert (Redirect).
  Als Admin: Wert ändern auf z. B. `5000`, speichern, Seite neu laden (neuer
  App-Start) → Artikelannahme-Kamera-Countdown dauert jetzt 5s statt 3s
  (Nachweis der Service-Anbindung, sichtbar in Round-17s Scan-Feedback).
- Wert `400`/`16000` eingeben → Feldfehler, kein Speichern.

## Reihenfolge

Backend 1 → 2 → 3 → 4 sequenziell. Frontend 5 unabhängig (Service + kleine
Änderung in `scan-feedback`), 6 nach 4 und 5, 7 abschließend.
