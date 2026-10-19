# Sofort-Freigabe im Freigeben-Popup bei Verkäufern ohne Gebühr — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-19-freigabe-sofort-ohne-gebuehr/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Ein zentral gespeicherter Admin-Schalter „Artikel erst beim Schließen des Freigabe-Dialogs freigeben" lässt das Freigeben-Popup bei Verkäufern mit Gebühr je Stück 0 jeden erfassten Artikel sofort freigeben und beim Schließen einmal den Abgabe-Beleg drucken.
**Architektur:** Die Einstellung `ReleaseOnClose` (Standard `true`) wandert durch Domain (`Settings`), Application (`GET`/`PUT /api/settings`) und Persistenz (neue Spalte, Migration) bis in `settings-form` und `SettingsService`. Das `release-dialog` lädt die Einstellungen bei jedem Öffnen neu und schaltet den vorhandenen `writeMode="immediate"` des `scan-dialog` ein, wenn der Schalter aus ist und die Gebühr je Stück 0 beträgt; jeder bestätigte Artikel wird einzeln über das unveränderte `POST /api/release` (Gebühr 0, eine Artikel-ID) gebucht. Schlägt eine Buchung fehl, zeigt der `scan-dialog` über die neue Methode `reportWriteFailed()` die rote Ergebnis-Einblendung.
**Tech-Stack:** .NET 10 / EF Core (Postgres, SQLite in Tests) / xUnit v3 / Moq · Angular 22 (standalone, Signals, OnPush) / Vitest / PrimeNG
**Spec:** docs/forge/2026-10-19-freigabe-sofort-ohne-gebuehr/spec.md
**Basis:** 87553412

## Global Constraints
- Spec: Der Schalter heißt im UI exakt „Artikel erst beim Schließen des Freigabe-Dialogs freigeben", der Hilfetext exakt „Gilt nur für Verkäufer ohne Gebühr."
- Spec: Standardstellung ist „an" (`ReleaseOnClose = true`, Verhalten wie heute). An = Freigabe beim Schließen, aus = sofort.
- Spec: „Ohne Gebühr" heißt Gebühr je Stück gleich 0. Bei Gebühr je Stück größer 0 hat der Schalter keine Wirkung (sammeln, Bezahlen-Dialog, dann freigeben).
- Spec: Der Schalter betrifft nur das Freigeben-Popup, nicht die Artikelannahme.
- Spec: Der Schalter gilt für alle Geräte und wird zentral (serverseitig) gespeichert; wirksam erst über „Speichern" im Formular der Basis-Einstellungen; eine gespeicherte Änderung gilt ab dem nächsten Öffnen des Freigeben-Popups, ohne App-Neuladen.
- Spec: Nur Admins ändern den Schalter, wie alle Einstellungen (Route `/settings` trägt `adminGuard`, `PUT /api/settings` verlangt `admin`).
- Spec: Im Sofort-Modus ist ein erfolgreich erfasster Artikel sofort freigegeben und erscheint nicht mehr in der Auswahlliste; beim Schließen entfällt der Bezahlen-Dialog; der Abgabe-Beleg wird einmal mit allen in der Sitzung freigegebenen Artikeln gedruckt, nur wenn mindestens einer freigegeben wurde.
- Spec: Schlägt die Freigabe eines Artikels im Sofort-Modus fehl, zeigt das Popup die rote Ergebnis-Einblendung; der Artikel gilt nicht als freigegeben und zählt nicht zum Abgabe-Beleg.
- Spec: Begriffe „Freigeben-Popup" und „Annahmegebühr" (nicht „Freigabedialog"/„Abgabegebühr"); im UI-Text des Schalters bleibt „Freigabe-Dialog".
- Projekt-CLAUDE.md: Code, Routen und JSON-Contract englisch, Doku deutsch; Dateien immer mit LF schreiben; Haupt-App-Assembly-Präfix `Bazaar.`; Monolith, CRUD mit eigenen Query-Ports.
- Projekt-CLAUDE.md: Commit-Konvention Conventional Commits `type(scope): Beschreibung`, Text deutsch; Commits immer mit Pfadangabe in einem Schritt (`git commit -m "…" -- <pfade>`), vorher Branch und `git status` prüfen.
- Projekt-CLAUDE.md: Nur PrimeNG, Wrapper für Fehlendes — der Schalter nutzt den vorhandenen `app-boolean-input` (kapselt `p-toggleswitch`), kein neues PrimeNG-Element.
- Projekt-CLAUDE.md: Ändert die Umsetzung Fähigkeit/Begriff/Beschriftung, werden Anforderungs-Doku und Feature-Profile im selben Lauf mitgeführt (Task 8).
- Projekt-CLAUDE.md: Bauen/Testen über die Toolchain (`dv-dotnet-test`, `dv-angular-test`), nie `dotnet test`/`ng test` direkt. Meldet der .NET-Build `MSB3027` (läuft `Bazaar.Api` im Debugger), mit `-- -c Release` bauen; ein Exit-Code 8 des Testlaufs bei `failed: 0` und `succeeded: ≥ 1` bedeutet nur, dass ein Testprojekt keinen Treffer für den Filter hatte.
- dv-dotnet:dotnet-ef-migrations: Migrationen nur mit `dotnet ef migrations add`, nie Dateien von Hand anlegen; Triplet (`.cs`, `.Designer.cs`, `BazaarDbContextModelSnapshot.cs`) wird committet; danach `has-pending-model-changes` prüfen.
- dv-dotnet:dotnet-xunit-conventions: AAA mit Kommentaren `// Arrange`/`// Act`/`// Assert`, Naming `<Method>_<Situation>_<Erwartung>`; Bestand respektieren — die vorhandenen Testprojekte nutzen xUnit-`Assert` und Moq, kein Umstieg auf FluentAssertions.
- dv-craft:craft-unit-testing: Ein Test, eine Behauptung; Act ist eine Zeile; Tests sind unabhängig; TDD (erst fehlschlagender Test).
- dv-craft:craft-design-principles: Keine Verschachtelung (Guard Clauses), kleine Funktionen mit einer Aufgabe, `if`/`switch` nur in Integrationsmethoden, Methoden sind Integration oder Operation, nie beides; kein `bool`-Flag, das Verhalten umschaltet.
- dv-angular:angular (`@src/*/frontend`): Standalone-Komponenten, `ChangeDetectionStrategy.OnPush`, Signals (`signal`/`computed`/`effect`/`viewChild`), `inject()`; Specs mit Vitest (`vi.fn()`, `describe`/`it`), Naming `<methode>_<Situation>_<Erwartung>` für neue `it`, bestehende Namen bleiben; kein Runner-Wechsel, keine Mock-Libs.
- dv-dotnet:dotnet (`@src/*/backend`): EF-Migrations nur über den Skill `dotnet-ef-migrations`; Testprojekte spiegeln das Produktionsprojekt.
- primeng:primeng-component-implementation (`@src/*/frontend`): nicht betroffen — kein neues PrimeNG-Element, der vorhandene `app-boolean-input` wird nur eingebunden.

Dateistruktur (Verantwortung je Datei):

| Datei | Verantwortung |
|---|---|
| `src/bazaar-app/backend/Bazaar.Domain/Settings/Settings.cs` | Aggregat trägt `ReleaseOnClose` (Standard `true`), `Update(int, bool)` |
| `src/bazaar-app/backend/Bazaar.Application/Settings/{UpdateSettingsCommand,UpdateSettingsHandler,GetSettingsHandler}.cs` | `releaseOnClose` im `GET`/`PUT /api/settings`-Vertrag |
| `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs` + Migration | Spalte `ReleaseOnClose`, DB-Default `true`, Wert wird immer mitgeschrieben |
| `src/bazaar-app/frontend/src/app/core/settings/settings.service.ts` | app-weites Signal `releaseOnClose` (Fallback `true`), erneut ladbar über `load()` |
| `src/bazaar-app/frontend/src/app/features/settings/data/settings-api.ts` | `update(settings: Settings)` sendet beide Felder |
| `src/bazaar-app/frontend/src/app/features/settings/components/settings-form/*` | Schalter im Formular, Speichern/Verwerfen |
| `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.ts` | neue Methode `reportWriteFailed()` für den Sofort-Modus |
| `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.{ts,html}` | Sofort-Modus: Einstellungen laden, einzeln buchen, Beleg beim Schließen |
| `docs/…` (Task 8) | Anforderungs-Doku und Feature-Profile |

---

### Task 1: Settings in Domain und Application (`ReleaseOnClose`)

**ACs:** AC-01, AC-02

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Settings/Settings.cs:3-26` · `Settings.Update`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Settings/UpdateSettingsCommand.cs:3-10` · `UpdateSettingsCommand`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Settings/UpdateSettingsHandler.cs:7-12` · `UpdateSettingsHandler.Handle`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Settings/GetSettingsHandler.cs:5-13` · `SettingsResponse`, `GetSettingsHandler.Handle`
- Test: `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/SettingsTests.cs` · `Update_WithScannerPauseMsOutOfRange_Throws`, `Update_WithScannerPauseMsAtBoundary_Succeeds`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/UpdateSettingsHandlerTests.cs` · `UpdateSettingsHandlerTests`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/GetSettingsHandlerTests.cs`

**Interfaces:**
- Consumes: —
- Produces:
  - `bool Settings.ReleaseOnClose { get; }` (Standard `true`), `void Settings.Update(int scannerPauseMs, bool releaseOnClose)` (ersetzt `Update(int)`)
  - `UpdateSettingsCommand.ReleaseOnClose` (`bool`, Standard `true`) — JSON `releaseOnClose` im Body von `PUT /api/settings`
  - `SettingsResponse(int ScannerPauseMs, bool ReleaseOnClose)` — JSON `{ "scannerPauseMs": number, "releaseOnClose": boolean }` von `GET /api/settings`

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**

  In `SettingsTests.cs` die beiden bestehenden Aufrufe an die neue Signatur anpassen (sie rufen `Update` mit zwei Argumenten):

  ```csharp
  [Theory]
  [InlineData(499)]
  [InlineData(15001)]
  public void Update_WithScannerPauseMsOutOfRange_Throws(int scannerPauseMs)
  {
      var settings = SettingsAggregate.Create(3000);

      Assert.Throws<ArgumentOutOfRangeException>(() => settings.Update(scannerPauseMs, true));
  }

  [Theory]
  [InlineData(500)]
  [InlineData(15000)]
  public void Update_WithScannerPauseMsAtBoundary_Succeeds(int scannerPauseMs)
  {
      var settings = SettingsAggregate.Create(3000);

      settings.Update(scannerPauseMs, true);

      Assert.Equal(scannerPauseMs, settings.ScannerPauseMs);
  }
  ```

  Am Ende der Klasse `SettingsTests` (vor der letzten `}`) zwei neue Tests ergänzen:

  ```csharp
      [Fact]
      public void Create_Always_StartsWithReleaseOnCloseEnabled()
      {
          // Arrange & Act
          var settings = SettingsAggregate.Create(3000);

          // Assert
          Assert.True(settings.ReleaseOnClose);
      }

      [Theory]
      [InlineData(true)]
      [InlineData(false)]
      public void Update_ReleaseOnCloseValue_IsStored(bool releaseOnClose)
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);

          // Act
          settings.Update(3000, releaseOnClose);

          // Assert
          Assert.Equal(releaseOnClose, settings.ReleaseOnClose);
      }
  ```

  In `UpdateSettingsHandlerTests.cs` am Ende der Klasse (vor der letzten `}`) ergänzen:

  ```csharp
      [Fact]
      public async Task Handle_ReleaseOnCloseDisabled_StoresFlagOnSettings()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
          var sut = CreateSut();

          // Act
          await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 3000, ReleaseOnClose = false });

          // Assert
          Assert.False(settings.ReleaseOnClose);
      }

      [Fact]
      public async Task Handle_ReleaseOnCloseOmitted_KeepsReleaseOnCloseEnabled()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
          var sut = CreateSut();

          // Act
          await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 3000 });

          // Assert
          Assert.True(settings.ReleaseOnClose);
      }
  ```

  Neue Datei `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/GetSettingsHandlerTests.cs`:

  ```csharp
  using Bazaar.Application.Settings;
  using Bazaar.Domain.Ports;
  using Moq;
  using SettingsAggregate = Bazaar.Domain.Settings.Settings;

  namespace Bazaar.Application.UnitTests.Settings;

  public class GetSettingsHandlerTests
  {
      private readonly Mock<ISettingsRepository> _settingsRepository = new();

      private GetSettingsHandler CreateSut() =>
          new(_settingsRepository.Object);

      [Fact]
      public async Task Handle_FreshSettings_ReturnsReleaseOnCloseEnabled()
      {
          // Arrange
          _settingsRepository.Setup(r => r.Get()).ReturnsAsync(SettingsAggregate.Create(3000));
          var sut = CreateSut();

          // Act
          var result = await sut.Handle();

          // Assert
          Assert.Equal(new SettingsResponse(3000, true), result);
      }

      [Fact]
      public async Task Handle_ReleaseOnCloseDisabled_ReturnsStoredValues()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          settings.Update(4500, false);
          _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
          var sut = CreateSut();

          // Act
          var result = await sut.Handle();

          // Assert
          Assert.Equal(new SettingsResponse(4500, false), result);
      }
  }
  ```

- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx -- -c Release --filter "FullyQualifiedName~Settings"` — erwartet: FAIL (Build-Fehler `CS1501` für `Settings.Update` mit zwei Argumenten und `CS1061` für `ReleaseOnClose` in `SettingsTests`/`UpdateSettingsHandlerTests`/`GetSettingsHandlerTests`)

- [ ] **Schritt 3: Minimal implementieren**

  `Settings.cs` — Eigenschaft und `Update` ersetzen (Eigenschaft nach `VerkaeuferUebersicht`, `Update` ersetzt die bestehende Methode; `Create` bleibt unverändert):

  ```csharp
      public int ScannerPauseMs { get; private set; }
      public PrintTexts AbgabeBeleg { get; private set; } = PrintTexts.CreateEmpty();
      public PrintTexts VerkaeuferUebersicht { get; private set; } = PrintTexts.CreateEmpty();

      /// <summary>
      /// true = das Freigeben-Popup gibt Artikel erst beim Schließen frei (Verhalten wie bisher),
      /// false = bei Verkäufern ohne Gebühr wird jeder erfasste Artikel sofort freigegeben.
      /// </summary>
      public bool ReleaseOnClose { get; private set; } = true;
  ```

  ```csharp
      public void Update(int scannerPauseMs, bool releaseOnClose)
      {
          EnsureValidScannerPauseMs(scannerPauseMs);
          ScannerPauseMs = scannerPauseMs;
          ReleaseOnClose = releaseOnClose;
      }
  ```

  `UpdateSettingsCommand.cs` komplett:

  ```csharp
  namespace Bazaar.Application.Settings;

  /// <summary>
  /// <see cref="ScannerPauseMs"/> and <see cref="ReleaseOnClose"/> are bound directly from the JSON
  /// request body of PUT /api/settings (full replacement). No Id property — settings is a singleton resource.
  /// <see cref="ReleaseOnClose"/> defaults to true so an omitted field keeps today's behaviour.
  /// </summary>
  public sealed class UpdateSettingsCommand
  {
      public int ScannerPauseMs { get; set; }
      public bool ReleaseOnClose { get; set; } = true;
  }
  ```

  `UpdateSettingsHandler.cs` — Zeile `settings.Update(command.ScannerPauseMs);` ersetzen durch:

  ```csharp
          settings.Update(command.ScannerPauseMs, command.ReleaseOnClose);
  ```

  `GetSettingsHandler.cs` komplett:

  ```csharp
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.Settings;

  public sealed record SettingsResponse(int ScannerPauseMs, bool ReleaseOnClose);

  public sealed class GetSettingsHandler(ISettingsRepository settingsRepository)
  {
      public async Task<SettingsResponse> Handle()
      {
          var settings = await settingsRepository.Get();
          return new SettingsResponse(settings.ScannerPauseMs, settings.ReleaseOnClose);
      }
  }
  ```

- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx -- -c Release --filter "FullyQualifiedName~Settings"` — erwartet: PASS (`failed: 0`, u. a. `SettingsTests`, `UpdateSettingsHandlerTests`, `GetSettingsHandlerTests`)

- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Domain/Settings/Settings.cs src/bazaar-app/backend/Bazaar.Application/Settings/UpdateSettingsCommand.cs src/bazaar-app/backend/Bazaar.Application/Settings/UpdateSettingsHandler.cs src/bazaar-app/backend/Bazaar.Application/Settings/GetSettingsHandler.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/SettingsTests.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/UpdateSettingsHandlerTests.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/GetSettingsHandlerTests.cs` · `git commit -m "feat(settings): Einstellung ReleaseOnClose in Domain und API-Vertrag" -- <dieselben Pfade>`

---

### Task 2: Persistenz der Einstellung (Spalte, Migration)

**ACs:** AC-01, AC-02

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs:10-19` · `SettingsConfiguration.Configure`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<Zeitstempel>_AddReleaseOnClose.cs` (von `dotnet ef migrations add` erzeugt)
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<Zeitstempel>_AddReleaseOnClose.Designer.cs` (erzeugt)
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/BazaarDbContextModelSnapshot.cs` · `BuildModel` (von `dotnet ef migrations add` geändert; neue Property `ReleaseOnClose` neben `ScannerPauseMs`)
- Test: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/SettingsRepositoryTests.cs` · `SettingsRepositoryTests`

**Interfaces:**
- Consumes: `Settings.ReleaseOnClose`, `Settings.Update(int, bool)` (Task 1)
- Produces: Tabelle `Settings` mit Spalte `ReleaseOnClose boolean NOT NULL DEFAULT true`; der Wert wird bei jedem Insert/Update mitgeschrieben (kein Sentinel-Verhalten)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**

  In `SettingsRepositoryTests.cs` nach den bestehenden `using`-Zeilen nichts ergänzen; am Ende der Klasse (vor der letzten `}`) zwei Tests anfügen:

  ```csharp
      [Fact]
      public async Task Add_ReleaseOnCloseDisabled_PersistsFalseOnInsert()
      {
          // Arrange
          var cancellationToken = TestContext.Current.CancellationToken;
          await using var connection = new SqliteConnection("DataSource=:memory:");
          await connection.OpenAsync(cancellationToken);
          await using (var seedContext = CreateContext(connection))
          {
              await seedContext.Database.EnsureCreatedAsync(cancellationToken);
              var settings = SettingsAggregate.Create(3000);
              settings.Update(3000, false);
              await seedContext.Settings.AddAsync(settings, cancellationToken);
              await seedContext.SaveChangesAsync(cancellationToken);
          }

          // Act
          var reloaded = await Reload(connection);

          // Assert
          Assert.False(reloaded.ReleaseOnClose);
      }

      [Fact]
      public async Task Schema_ReleaseOnCloseColumn_DefaultsToTrue()
      {
          // Arrange
          var cancellationToken = TestContext.Current.CancellationToken;
          await using var connection = new SqliteConnection("DataSource=:memory:");
          await connection.OpenAsync(cancellationToken);
          await using var context = CreateContext(connection);
          await context.Database.EnsureCreatedAsync(cancellationToken);
          await using var command = connection.CreateCommand();
          command.CommandText = "SELECT dflt_value FROM pragma_table_info('Settings') WHERE name = 'ReleaseOnClose'";

          // Act
          var defaultValue = await command.ExecuteScalarAsync(cancellationToken);

          // Assert
          Assert.Equal("1", Convert.ToString(defaultValue));
      }
  ```

- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx -- -c Release --filter "FullyQualifiedName~SettingsRepositoryTests"` — erwartet: FAIL `Schema_ReleaseOnCloseColumn_DefaultsToTrue` (die Spalte hat noch keinen DB-Default); `Add_ReleaseOnCloseDisabled_PersistsFalseOnInsert` ist grün und sichert die Konfiguration aus Schritt 3 gegen die EF-Falle „`HasDefaultValue(true)` überschreibt `false` beim Insert" ab

- [ ] **Schritt 3: Minimal implementieren**

  `SettingsConfiguration.cs` — in `Configure` nach der Zeile `builder.Property(s => s.ScannerPauseMs).IsRequired();` einfügen:

  ```csharp
          // DB-Default true für bestehende Zeilen; ValueGeneratedNever, damit EF den Wert `false`
          // beim Insert nicht als „nicht gesetzt" behandelt und stillschweigend durch den Default ersetzt.
          builder.Property(s => s.ReleaseOnClose).IsRequired().HasDefaultValue(true).ValueGeneratedNever();
  ```

  Bleibt `Schema_ReleaseOnCloseColumn_DefaultsToTrue` oder `Add_ReleaseOnCloseDisabled_PersistsFalseOnInsert` in Schritt 4 rot, ersetze `.ValueGeneratedNever()` durch `.HasSentinel(true)` (EF Core ab 8) und lass beide Tests erneut laufen.

- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx -- -c Release --filter "FullyQualifiedName~SettingsRepositoryTests"` — erwartet: PASS (`failed: 0`, beide neuen Tests und `Update_PrintTexts_PersistsBothTextSets`)

- [ ] **Schritt 5: Migration erzeugen und prüfen**
  Befehl (Bash, im Ordner `<R>/src/bazaar-app/backend`): `dotnet ef migrations add AddReleaseOnClose --project Bazaar.Infrastructure --startup-project Bazaar.Api --configuration Release` — erwartet: `Done.`; neue Dateien `Migrations/<Zeitstempel>_AddReleaseOnClose.cs` und `.Designer.cs`, `BazaarDbContextModelSnapshot.cs` geändert. `Up()` muss `migrationBuilder.AddColumn<bool>(name: "ReleaseOnClose", table: "Settings", type: "boolean", nullable: false, defaultValue: true)` enthalten (prüfen mit `Grep` auf `defaultValue: true` in der neuen Datei) und `Down()` die Spalte wieder entfernen. Meldet der Befehl `MSB3027`, beende `Bazaar.Api` im Debugger und starte neu.
  Befehl: `dotnet ef migrations has-pending-model-changes --project Bazaar.Infrastructure --startup-project Bazaar.Api --configuration Release` (gleicher Ordner) — erwartet: `No changes have been made to the model since the last migration.`

- [ ] **Schritt 6: Gesamte Backend-Testsuite laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx -- -c Release` — erwartet: PASS (`failed: 0`; `Bazaar.Architecture.Tests` und Integrationstests bleiben grün)

- [ ] **Schritt 7: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs src/bazaar-app/backend/Bazaar.Infrastructure/Migrations src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/SettingsRepositoryTests.cs` · `git commit -m "feat(settings): Spalte ReleaseOnClose mit Migration" -- <dieselben Pfade>`

---

### Task 3: Schalter in den Basis-Einstellungen (SettingsService, SettingsApi, settings-form)

**ACs:** AC-01, AC-02, AC-03, AC-10

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/core/settings/settings.service.ts:5-30` · `Settings`, `SettingsService`
- Modify: `src/bazaar-app/frontend/src/app/features/settings/data/settings-api.ts:24-26` · `SettingsApi.update`
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.ts` · `SettingsForm`
- Modify: `src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.html` · `settings-form__help`
- Test: `src/bazaar-app/frontend/src/app/core/settings/settings.service.spec.ts` · `SettingsService`
- Test: `src/bazaar-app/frontend/src/app/features/settings/data/settings-api.spec.ts` · `SettingsApi`
- Test: `src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.spec.ts` · `SettingsForm`
- Test: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.spec.ts` · `beforeEach`

**Interfaces:**
- Consumes: `GET /api/settings` → `{ scannerPauseMs: number; releaseOnClose: boolean }`, `PUT /api/settings` mit demselben Body (Task 1)
- Produces:
  - `interface Settings { scannerPauseMs: number; releaseOnClose: boolean }` (exportiert aus `core/settings/settings.service.ts`, re-exportiert aus `settings-api.ts`)
  - `SettingsService.releaseOnClose: Signal<boolean>` (Fallback `true`, solange `settings()` `null` ist), `SettingsService.load(): Promise<void>` (unverändert, darf mehrfach aufgerufen werden und aktualisiert `settings()`)
  - `SettingsApi.update(settings: Settings): Observable<void>`
  - `SettingsForm.releaseOnClose: Signal<boolean>`, `SettingsForm.onReleaseOnCloseChange(value: boolean): void`

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**

  `settings.service.spec.ts` — den Test `load() populates settings()/scannerPauseMs() from GET /api/settings` ersetzen und zwei neue Tests anfügen (vor der letzten `});`):

  ```ts
  it('load() populates settings()/scannerPauseMs() from GET /api/settings', async () => {
    const loadPromise = settingsService.load();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('GET');
    req.flush({ scannerPauseMs: 7000, releaseOnClose: false });

    await loadPromise;

    expect(settingsService.settings()).toEqual({ scannerPauseMs: 7000, releaseOnClose: false });
    expect(settingsService.scannerPauseMs()).toBe(7000);
  });

  it('releaseOnClose_beforeLoad_isTrue', () => {
    // Arrange & Act
    const value = settingsService.releaseOnClose();

    // Assert
    expect(value).toBe(true);
  });

  it('releaseOnClose_afterLoadWithFalse_isFalse', async () => {
    // Arrange
    const loadPromise = settingsService.load();
    httpMock.expectOne('/api/settings').flush({ scannerPauseMs: 3000, releaseOnClose: false });

    // Act
    await loadPromise;

    // Assert
    expect(settingsService.releaseOnClose()).toBe(false);
  });

  it('releaseOnClose_secondLoadWithChangedValue_followsTheNewValue', async () => {
    // Arrange
    const first = settingsService.load();
    httpMock.expectOne('/api/settings').flush({ scannerPauseMs: 3000, releaseOnClose: true });
    await first;
    const second = settingsService.load();
    httpMock.expectOne('/api/settings').flush({ scannerPauseMs: 3000, releaseOnClose: false });

    // Act
    await second;

    // Assert
    expect(settingsService.releaseOnClose()).toBe(false);
  });
  ```

  `settings-api.spec.ts` — die beiden Tests `get()` und `update()` ersetzen:

  ```ts
  it('get() hits GET /api/settings', () => {
    settingsApi.get().subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('GET');
    req.flush({ scannerPauseMs: 3000, releaseOnClose: true });
  });

  it('update() hits PUT /api/settings with the scannerPauseMs and releaseOnClose body', () => {
    settingsApi.update({ scannerPauseMs: 5000, releaseOnClose: false }).subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ scannerPauseMs: 5000, releaseOnClose: false });
    req.flush(null);
  });
  ```

  `settings-form.spec.ts` — Importzeilen um `BooleanInput` ergänzen (nach der Zeile `import { InputGroup } …`):

  ```ts
  import { BooleanInput } from '../../../../shared/components/boolean-input/boolean-input';
  ```

  In `beforeEach` die Zeile `get = vi.fn().mockReturnValue(of({ scannerPauseMs: 3000 }));` ersetzen durch:

  ```ts
      get = vi.fn().mockReturnValue(of({ scannerPauseMs: 3000, releaseOnClose: true }));
  ```

  Im Test `loads and displays the current value on init` die Zeile `get.mockReturnValue(of({ scannerPauseMs: 4500 }));` ersetzen durch:

  ```ts
    get.mockReturnValue(of({ scannerPauseMs: 4500, releaseOnClose: true }));
  ```

  Im Test `clicking Speichern with a valid value calls SettingsApi.update and shows the success toast` die Zeile `expect(update).toHaveBeenCalledWith(5000);` ersetzen durch:

  ```ts
    expect(update).toHaveBeenCalledWith({ scannerPauseMs: 5000, releaseOnClose: true });
  ```

  Am Ende des `describe('SettingsForm', …)` (vor der letzten `});`) neue Tests anfügen:

  ```ts
  it('template_loadedEnabled_showsSwitchWithLabelAndHelpText', async () => {
    // Arrange & Act
    const { fixture } = createForm();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const text = (fixture.nativeElement as HTMLElement).textContent;
    const booleanInput = fixture.debugElement.query(By.directive(BooleanInput)).componentInstance as BooleanInput;
    expect(text).toContain('Artikel erst beim Schließen des Freigabe-Dialogs freigeben');
    expect(text).toContain('Gilt nur für Verkäufer ohne Gebühr.');
    expect(booleanInput.value()).toBe(true);
  });

  it('init_savedValueFalse_showsSwitchOff', async () => {
    // Arrange
    get.mockReturnValue(of({ scannerPauseMs: 3000, releaseOnClose: false }));

    // Act
    const { fixture, component } = createForm();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    const booleanInput = fixture.debugElement.query(By.directive(BooleanInput)).componentInstance as BooleanInput;
    expect(component.releaseOnClose()).toBe(false);
    expect(booleanInput.value()).toBe(false);
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('onSave_releaseOnCloseSwitchedOff_sendsBothFields', () => {
    // Arrange
    update.mockReturnValue(of(undefined));
    const { component } = createForm();
    component.onReleaseOnCloseChange(false);

    // Act
    component.onSave();

    // Assert
    expect(update).toHaveBeenCalledWith({ scannerPauseMs: 3000, releaseOnClose: false });
  });

  it('onSave_releaseOnCloseSwitchedOff_leavesNoUnsavedChanges', () => {
    // Arrange
    update.mockReturnValue(of(undefined));
    const { component } = createForm();
    component.onReleaseOnCloseChange(false);

    // Act
    component.onSave();

    // Assert
    expect(component.hasUnsavedChanges()).toBe(false);
  });

  it('hasUnsavedChanges_onlySwitchChanged_isTrue', () => {
    // Arrange
    const { component } = createForm();

    // Act
    component.onReleaseOnCloseChange(false);

    // Assert
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('discardChanges_switchChangedButNotSaved_restoresLastSavedValue', () => {
    // Arrange
    const { component } = createForm();
    component.onReleaseOnCloseChange(false);

    // Act
    component.discardChanges();

    // Assert
    expect(component.releaseOnClose()).toBe(true);
    expect(component.hasUnsavedChanges()).toBe(false);
  });
  ```

  `settings-page.spec.ts` — in `beforeEach` die Zeile mit `{ provide: SettingsApi, useValue: { get: vi.fn().mockReturnValue(of({ scannerPauseMs: 3000 })), update: vi.fn() } },` ersetzen durch:

  ```ts
          { provide: SettingsApi, useValue: { get: vi.fn().mockReturnValue(of({ scannerPauseMs: 3000, releaseOnClose: true })), update: vi.fn() } },
  ```

- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/core/settings/settings.service.spec.ts --include src/app/features/settings/data/settings-api.spec.ts --include src/app/features/settings/components/settings-form/settings-form.spec.ts` — erwartet: FAIL (Typfehler/Fehlschläge u. a. `releaseOnClose_afterLoadWithFalse_isFalse`, `update() hits PUT /api/settings with the scannerPauseMs and releaseOnClose body`, `template_loadedEnabled_showsSwitchWithLabelAndHelpText`)

- [ ] **Schritt 3: Minimal implementieren**

  `settings.service.ts` — Interface und Signal ersetzen (der Rest der Datei bleibt):

  ```ts
  /** Shape of `GET /api/settings` / `PUT /api/settings` (docs/requirements/bazaar-app, Round-25). */
  export interface Settings {
    scannerPauseMs: number;
    /** `true` = Freigeben-Popup gibt Artikel erst beim Schließen frei, `false` = sofort (nur bei Gebühr je Stück 0). */
    releaseOnClose: boolean;
  }
  ```

  und nach der Zeile `readonly scannerPauseMs = computed(() => this._settings()?.scannerPauseMs ?? 3000);` einfügen:

  ```ts

    /**
     * `?? true` is the same deliberate pre-load fallback as above: until `GET /api/settings` has
     * answered, the Freigeben-Popup behaves as it always did (release on close).
     */
    readonly releaseOnClose = computed(() => this._settings()?.releaseOnClose ?? true);
  ```

  `settings-api.ts` — `update` ersetzen:

  ```ts
    update(settings: Settings): Observable<void> {
      return this.http.put<void>('/api/settings', settings);
    }
  ```

  `settings-form.html` komplett:

  ```html
  <div class="settings-form">
    <label for="settings-scanner-pause-ms">Scan-Pause</label>
    <app-input-group
      #scannerPauseInput
      variant="count"
      [modes]="['keyboard', 'numpad']"
      inputId="settings-scanner-pause-ms"
      (valueChange)="onValueChange($event)"
    />
    <p class="settings-form__help">{{ helpText }}</p>

    @if (fieldError()) {
      <p class="settings-form__error">{{ fieldError() }}</p>
    }

    <app-boolean-input
      variant="switch"
      [label]="releaseOnCloseLabel"
      [value]="releaseOnClose()"
      (valueChange)="onReleaseOnCloseChange($event)"
    />
    <p class="settings-form__help">{{ releaseOnCloseHelpText }}</p>

    <p-button label="Speichern" [disabled]="saving()" (onClick)="onSave()" />
  </div>
  ```

  `settings-form.ts` komplett:

  ```ts
  import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
  import { HttpErrorResponse } from '@angular/common/http';
  import { MessageService } from 'primeng/api';
  import { ButtonModule } from 'primeng/button';
  import { BooleanInput } from '../../../../shared/components/boolean-input/boolean-input';
  import { InputGroup } from '../../../../shared/components/input-group/input-group';
  import { SettingsApi } from '../../data/settings-api';

  interface ValidationProblemBody {
    errors?: Record<string, string[]>;
  }

  const MIN_SCANNER_PAUSE_MS = 500;
  const MAX_SCANNER_PAUSE_MS = 15000;

  /**
   * docs/components/settings-form/component.md — Admin-Formular für `ScannerPauseMs` und den Schalter
   * `ReleaseOnClose` (Sofort-Freigabe im Freigeben-Popup bei Verkäufern ohne Gebühr, Spec
   * docs/forge/2026-10-19-freigabe-sofort-ohne-gebuehr/spec.md). Loads via its own `SettingsApi` (not
   * `SettingsService`, Task 5's cached app-wide READ signal — see the doc's Abschnitt 3 for why the
   * two stay separate).
   *
   * Seeding the loaded value (design decision, see task report): `input-group` (Task 6a) exposes
   * no `@Input` to set its current value from a parent — its `rawValue`/`priceValue` signals are
   * internally owned, and the only public write entry point is `applyExternalValue()` (doc-comment:
   * "Öffentlicher Schreibzugriff für eine Verwendungsstelle … setzt den Feldwert und emittiert
   * `valueChange`, wie ein interner Scan-Treffer"). This component therefore calls
   * `applyExternalValue(String(settings.scannerPauseMs))` on the `#scannerPauseInput` view child
   * once the initial `GET /api/settings` response arrives — exactly the pattern the input-group
   * doc documents for Seller-Search's camera-mode consumer (Abschnitt 3). The load is kicked off
   * in `ngAfterViewInit` rather than the constructor specifically so the view child is guaranteed
   * resolved before the subscribe callback can fire, regardless of whether the HTTP response
   * arrives synchronously (tests) or asynchronously (real backend).
   *
   * Der Schalter `releaseOnClose` (`app-boolean-input`) ist ein reiner Signal-Wert: Er wird erst über
   * „Speichern" wirksam und gemeinsam mit der Scan-Pause per `PUT /api/settings` gesendet.
   *
   * Ungespeicherte Änderungen (docs/forge/2026-10-18-einstellungen-tabs/spec.md): `hasUnsavedChanges`
   * vergleicht die Eingaben mit den zuletzt geladenen oder gespeicherten Werten; `discardChanges()`
   * stellt diese Werte wieder her. Die Einstellungsseite fragt damit vor einem Tab-Wechsel nach.
   */
  @Component({
    selector: 'app-settings-form',
    imports: [ButtonModule, BooleanInput, InputGroup],
    templateUrl: './settings-form.html',
    styleUrl: './settings-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class SettingsForm implements AfterViewInit {
    private readonly settingsApi = inject(SettingsApi);
    private readonly messageService = inject(MessageService);

    private readonly inputGroupRef = viewChild<InputGroup>('scannerPauseInput');
    /** Zuletzt geladener oder gespeicherter Wert — Bezug für `hasUnsavedChanges` und `discardChanges()`. */
    private readonly savedScannerPauseMs = signal<number>(0);
    private readonly savedReleaseOnClose = signal<boolean>(true);

    readonly scannerPauseMs = signal<number>(0);
    /** Standardstellung „an" (Verhalten wie heute), bis die Einstellungen geladen sind. */
    readonly releaseOnClose = signal<boolean>(true);
    readonly saving = signal(false);
    readonly fieldError = signal<string | null>(null);
    readonly hasUnsavedChanges = computed(
      () =>
        this.scannerPauseMs() !== this.savedScannerPauseMs() ||
        this.releaseOnClose() !== this.savedReleaseOnClose(),
    );

    readonly helpText = `Wie lange das Scan-Ergebnis am Annahmetisch angezeigt wird, bevor automatisch weitergescannt werden kann. Gültige Werte: ${SettingsForm.formatMs(MIN_SCANNER_PAUSE_MS)}–${SettingsForm.formatMs(MAX_SCANNER_PAUSE_MS)} ms.`;
    readonly releaseOnCloseLabel = 'Artikel erst beim Schließen des Freigabe-Dialogs freigeben';
    readonly releaseOnCloseHelpText = 'Gilt nur für Verkäufer ohne Gebühr.';

    private static formatMs(value: number): string {
      return new Intl.NumberFormat('de-DE').format(value);
    }

    ngAfterViewInit(): void {
      this.settingsApi.get().subscribe((settings) => {
        this.savedScannerPauseMs.set(settings.scannerPauseMs);
        this.savedReleaseOnClose.set(settings.releaseOnClose);
        this.showValue(settings.scannerPauseMs);
        this.releaseOnClose.set(settings.releaseOnClose);
      });
    }

    onValueChange(value: string | number): void {
      this.scannerPauseMs.set(typeof value === 'number' ? value : Number(value));
    }

    onReleaseOnCloseChange(value: boolean): void {
      this.releaseOnClose.set(value);
    }

    onSave(): void {
      const scannerPauseMs = this.scannerPauseMs();
      const releaseOnClose = this.releaseOnClose();
      this.fieldError.set(null);
      this.saving.set(true);

      this.settingsApi.update({ scannerPauseMs, releaseOnClose }).subscribe({
        next: () => {
          this.saving.set(false);
          this.savedScannerPauseMs.set(scannerPauseMs);
          this.savedReleaseOnClose.set(releaseOnClose);
          this.messageService.add({ severity: 'success', summary: '✓ Einstellungen gespeichert' });
        },
        error: (error: unknown) => {
          this.saving.set(false);

          if (error instanceof HttpErrorResponse && error.status === 400) {
            this.fieldError.set(this.fieldErrorOf(error));
            return;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Einstellungen konnten nicht gespeichert werden',
          });
        },
      });
    }

    /**
     * Verwirft die ungespeicherten Eingaben und zeigt wieder die zuletzt gespeicherten Werte.
     * Während eines laufenden Speicherns verwirft sie nichts: Die Antwort macht die gesendeten Werte
     * zum Bezug, Anzeige, Bezug und Server bleiben damit gleich.
     */
    discardChanges(): void {
      if (this.saving()) return;
      this.fieldError.set(null);
      this.showValue(this.savedScannerPauseMs());
      this.releaseOnClose.set(this.savedReleaseOnClose());
    }

    private showValue(value: number): void {
      this.scannerPauseMs.set(value);
      this.inputGroupRef()?.applyExternalValue(String(value));
    }

    private fieldErrorOf(error: HttpErrorResponse): string | null {
      const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
      return errors['scannerPauseMs']?.[0] ?? null;
    }
  }
  ```

- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/core/settings/settings.service.spec.ts --include src/app/features/settings/data/settings-api.spec.ts --include src/app/features/settings/components/settings-form/settings-form.spec.ts --include src/app/features/settings/pages/settings-page/settings-page.spec.ts` — erwartet: PASS (alle vier Spec-Dateien grün)

- [ ] **Schritt 5: Build und Lint prüfen**
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK (kein Typfehler an anderen Aufrufern von `SettingsApi.update` oder `Settings`)
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK

- [ ] **Schritt 6: Commit**
  `git add -- src/bazaar-app/frontend/src/app/core/settings/settings.service.ts src/bazaar-app/frontend/src/app/core/settings/settings.service.spec.ts src/bazaar-app/frontend/src/app/features/settings/data/settings-api.ts src/bazaar-app/frontend/src/app/features/settings/data/settings-api.spec.ts src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.ts src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.html src/bazaar-app/frontend/src/app/features/settings/components/settings-form/settings-form.spec.ts src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.spec.ts` · `git commit -m "feat(settings): Schalter für Sofort-Freigabe in den Basis-Einstellungen" -- <dieselben Pfade>`

---

### Task 4: Scan-Dialog meldet fehlgeschlagene Buchung (`reportWriteFailed`)

**ACs:** AC-04, AC-09

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.ts:292-302` · `ScanDialog.onVisibleChange` (neue Methode direkt danach)
- Test: `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.spec.ts` · `behaves exactly like batch (default) when writeMode is explicitly set to "batch"` (letzter Test im Block `writeMode`, Einfügestelle danach)

**Interfaces:**
- Consumes: `writeMode="immediate"` und `articleConfirmed` des `scan-dialog` (bestehend)
- Produces: `ScanDialog.reportWriteFailed(): void` — lädt die Liste der ausstehenden Artikel neu und zeigt die rote Ergebnis-Einblendung (`ResultKind` `'failed'`)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**

  In `scan-dialog.spec.ts` im Block `describe('writeMode', …)` nach dem Test `behaves exactly like batch (default) when writeMode is explicitly set to "batch"` (vor dem schließenden `});` des Blocks) anfügen:

  ```ts

    it('immediate mode releasedAt: a confirmed article leaves the pending list without a reload', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), {
        writeMode: 'immediate',
      });
      typeInto(fixture, '101');

      // Act
      fixture.componentInstance.onSubmit();

      // Assert
      expect(fixture.componentInstance.pendingList().find((a) => a.id === 'A1')).toBeUndefined();
    });

    it('reportWriteFailed_afterConfirmedArticle_showsFailedResult', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), {
        writeMode: 'immediate',
      });
      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      // Act
      fixture.componentInstance.reportWriteFailed();

      // Assert
      expect(fixture.componentInstance.resultEvent()?.kind).toBe('failed');
    });

    it('reportWriteFailed_afterConfirmedArticle_reloadsThePendingList', async () => {
      // Arrange
      const fixture = await create(httpClientMock({ pending, byNumber: { 101: article } }), {
        writeMode: 'immediate',
      });
      typeInto(fixture, '101');
      fixture.componentInstance.onSubmit();

      // Act
      fixture.componentInstance.reportWriteFailed();

      // Assert
      expect(fixture.componentInstance.pendingList().find((a) => a.id === 'A1')).toBeDefined();
    });
  ```

- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/scan-dialog/scan-dialog.spec.ts` — erwartet: FAIL `reportWriteFailed_afterConfirmedArticle_showsFailedResult` und `reportWriteFailed_afterConfirmedArticle_reloadsThePendingList` (Typfehler: `reportWriteFailed` existiert nicht); `immediate mode releasedAt: a confirmed article leaves the pending list without a reload` ist als Absicherung für AC-04 sofort grün

- [ ] **Schritt 3: Minimal implementieren**

  `scan-dialog.ts` — nach der Methode `onVisibleChange(value: boolean): void { … }` und ihrem Doc-Kommentar (vor dem Kommentarblock `/** AC-1, best-effort only …`) einfügen:

  ```ts
    /**
     * Sofort-Modus (`writeMode === 'immediate'`): Der Elternteil meldet, dass das Schreiben des
     * zuletzt über `articleConfirmed` bestätigten Artikels gescheitert ist. Die Liste der
     * ausstehenden Artikel wird neu geladen (der Artikel war lokal schon entfernt, ist aber
     * womöglich nicht freigegeben) und die rote Ergebnis-Einblendung ersetzt die grüne.
     */
    reportWriteFailed(): void {
      this.loadPendingArticles();
      this.showResult('unknown');
    }

  ```

- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/scan-dialog/scan-dialog.spec.ts` — erwartet: PASS (gesamte Spec-Datei grün)

- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.ts src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.spec.ts` · `git commit -m "feat(scan-dialog): fehlgeschlagene Sofort-Buchung rot melden" -- <dieselben Pfade>`

---

### Task 5: Freigeben-Popup im Sofort-Modus (`release-dialog`)

**ACs:** AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.ts` · `ReleaseDialog`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.html` · `app-scan-dialog`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.spec.ts` · `setup`, `describe('ReleaseDialog')`

**Interfaces:**
- Consumes:
  - `SettingsService.releaseOnClose: Signal<boolean>`, `SettingsService.load(): Promise<void>` (Task 3)
  - `ScanDialog.reportWriteFailed(): void`, Inputs `writeMode: 'batch' | 'immediate'`, Output `articleConfirmed: string` (Task 4 / bestehend)
  - `ReleaseApi.bookRelease(sellerId: string, feeAmount: number, articleIds: readonly string[]): Observable<ReleaseResult>`, `PrintService.printIntakeReceipt({ articleIds: string[]; sellerId: string })` (bestehend)
- Produces:
  - `ReleaseDialog.writeMode: Signal<'batch' | 'immediate'>` — `'immediate'` genau dann, wenn die Gebühr je Stück geladen und 0 ist und der frisch geladene Schalter `releaseOnClose` aus ist
  - `ReleaseDialog.releasedIds: Signal<readonly string[]>` — in dieser Sitzung sofort freigegebene Artikel-IDs
  - `ReleaseDialog.onArticleConfirmed(articleId: string): void` — bucht einen Artikel mit Gebühr 0; bleibt die Antwort `IMMEDIATE_WRITE_TIMEOUT_MS` aus, gilt die Buchung als fehlgeschlagen
  - `ReleaseDialog.scanDialogVisible: Signal<boolean>` — `[visible]` des `scan-dialog`: erst `true`, wenn bei dieser Öffnung Gebühr je Stück und Einstellungen geladen sind; `false`, sobald im Sofort-Modus das Schließen angefordert ist
  - `export const IMMEDIATE_WRITE_TIMEOUT_MS = 10000` (aus `release-dialog.ts`)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**

  In `release-dialog.spec.ts` Importe ergänzen: die erste Zeile durch

  ```ts
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  ```
  unverändert lassen; die rxjs-Zeile `import { of, throwError } from 'rxjs';` ersetzen durch:

  ```ts
  import { Subject, of, throwError } from 'rxjs';
  ```

  nach der Zeile `import { PrintService } from '../../../../core/print/print.service';` einfügen:

  ```ts
  import { SettingsService } from '../../../../core/settings/settings.service';
  ```

  die Zeile `import { ReleaseDialog } from './release-dialog';` ersetzen durch:

  ```ts
  import { IMMEDIATE_WRITE_TIMEOUT_MS, ReleaseDialog } from './release-dialog';
  ```

  nach der Funktion `messageServiceStub()` einfügen:

  ```ts
  /** `ReleaseDialog` und das echte `ScanDialog` darin lesen beide `SettingsService`; `state` erlaubt es,
   * die gespeicherte Stellung zwischen zwei Öffnungen zu ändern (AC-10). */
  function settingsServiceStub(releaseOnClose = true) {
    const state = { releaseOnClose };
    return {
      state,
      load: vi.fn().mockImplementation(() => Promise.resolve()),
      releaseOnClose: () => state.releaseOnClose,
      scannerPauseMs: () => 3000,
    };
  }

  /** Lässt Promise-Callbacks (`SettingsService.load().then(…)`) laufen — `whenStable()` wartet darauf nicht. */
  function flushPromises(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve));
  }

  function scanDialogOf(fixture: ComponentFixture<unknown>): ScanDialog {
    return fixture.debugElement.query((de) => de.componentInstance instanceof ScanDialog)
      .componentInstance as ScanDialog;
  }
  ```

  In `setup(...)` die Options-Typen, Providers und Rückgabe erweitern. Die Funktion `setup` komplett ersetzen durch:

  ```ts
  async function setup(
    options: {
      visible?: boolean;
      sellerId?: string;
      feePerItem?: number;
      releaseOnClose?: boolean;
      releaseApi?: ReturnType<typeof releaseApiStub>;
      sellersApi?: ReturnType<typeof sellersApiStub>;
      printService?: ReturnType<typeof printServiceStub>;
      messageService?: ReturnType<typeof messageServiceStub>;
    } = {},
  ) {
    const releaseApi = options.releaseApi ?? releaseApiStub();
    const sellersApi = options.sellersApi ?? sellersApiStub(options.feePerItem ?? 0.5);
    const printService = options.printService ?? printServiceStub();
    const messageService = options.messageService ?? messageServiceStub();
    const settingsService = settingsServiceStub(options.releaseOnClose ?? true);

    await TestBed.configureTestingModule({
      imports: [ReleaseDialog],
      providers: [
        { provide: ReleaseApi, useValue: releaseApi },
        { provide: SellersApi, useValue: sellersApi },
        { provide: PrintService, useValue: printService },
        { provide: MessageService, useValue: messageService },
        { provide: SettingsService, useValue: settingsService },
        { provide: HttpClient, useValue: httpClientStub() },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ReleaseDialog);
    fixture.componentRef.setInput('visible', options.visible ?? true);
    fixture.componentRef.setInput('sellerId', options.sellerId ?? SELLER_ID);
    await fixture.whenStable();
    await flushPromises();
    fixture.detectChanges();

    return {
      fixture,
      component: fixture.componentInstance,
      releaseApi,
      sellersApi,
      printService,
      messageService,
      settingsService,
    };
  }
  ```

  Am Ende des `describe('ReleaseDialog', …)` (vor der letzten `});`) neue Tests anfügen:

  ```ts

  describe('Sofort-Modus', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('scanDialogVisible_settingsOfThisOpeningNotYetLoaded_keepsScanDialogHidden', async () => {
      // Arrange
      const { fixture, settingsService } = await setup({ feePerItem: 0, releaseOnClose: false });
      settingsService.load.mockImplementation(() => new Promise<void>(() => undefined));
      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();

      // Act
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      await flushPromises();
      fixture.detectChanges();

      // Assert
      expect(scanDialogOf(fixture).visible()).toBe(false);
    });

    it('scanDialogVisible_settingsAndFeeLoaded_showsScanDialog', async () => {
      // Arrange & Act
      const { fixture } = await setup({ feePerItem: 0, releaseOnClose: false });

      // Assert
      expect(scanDialogOf(fixture).visible()).toBe(true);
    });

    it('onScanDialogVisibleChange_bookingStillRunning_hidesScanDialogAgainstFurtherScans', async () => {
      // Arrange
      const releaseApi = releaseApiStub();
      releaseApi.bookRelease.mockReturnValue(new Subject<{ releasedCount: number; intakeFeePaid: number }>());
      const { fixture, component } = await setup({ feePerItem: 0, releaseOnClose: false, releaseApi });
      component.onArticleConfirmed('a1');

      // Act
      component.onScanDialogVisibleChange(false);
      fixture.detectChanges();

      // Assert
      expect(scanDialogOf(fixture).visible()).toBe(false);
    });

    it('onScanDialogVisibleChange_bookingNeverAnswers_closesAfterTimeoutWithoutReceipt', async () => {
      // Arrange
      const releaseApi = releaseApiStub();
      releaseApi.bookRelease.mockReturnValue(new Subject<{ releasedCount: number; intakeFeePaid: number }>());
      const { component, printService } = await setup({ feePerItem: 0, releaseOnClose: false, releaseApi });
      const visibleChangeSpy = vi.fn();
      component.visibleChange.subscribe(visibleChangeSpy);
      vi.useFakeTimers();
      component.onArticleConfirmed('a1');
      component.onScanDialogVisibleChange(false);

      // Act
      vi.advanceTimersByTime(IMMEDIATE_WRITE_TIMEOUT_MS);

      // Assert
      expect(visibleChangeSpy).toHaveBeenCalledWith(false);
      expect(printService.printIntakeReceipt).not.toHaveBeenCalled();
      expect(component.releasedIds()).toEqual([]);
    });

    it('onScanDialogVisibleChange_afterImmediateClose_reopeningShowsScanDialogAgain', async () => {
      // Arrange
      const { fixture, component } = await setup({ feePerItem: 0, releaseOnClose: false });
      component.onArticleConfirmed('a1');
      component.onScanDialogVisibleChange(false);
      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();

      // Act
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      await flushPromises();
      fixture.detectChanges();

      // Assert
      expect(scanDialogOf(fixture).visible()).toBe(true);
    });

    it('writeMode_releaseOnCloseTrueFeeZero_isBatch', async () => {
      // Arrange & Act
      const { fixture, component } = await setup({ feePerItem: 0, releaseOnClose: true });

      // Assert
      expect(component.writeMode()).toBe('batch');
      expect(scanDialogOf(fixture).writeMode()).toBe('batch');
    });

    it('writeMode_releaseOnCloseFalseFeeZero_isImmediate', async () => {
      // Arrange & Act
      const { fixture, component } = await setup({ feePerItem: 0, releaseOnClose: false });

      // Assert
      expect(component.writeMode()).toBe('immediate');
      expect(scanDialogOf(fixture).writeMode()).toBe('immediate');
    });

    it('writeMode_releaseOnCloseFalseFeeGreaterZero_isBatch', async () => {
      // Arrange & Act
      const { component } = await setup({ feePerItem: 0.5, releaseOnClose: false });

      // Assert
      expect(component.writeMode()).toBe('batch');
    });

    it('writeMode_settingsReloadedOnEveryOpen_followsNewlySavedValue', async () => {
      // Arrange
      const { fixture, component, settingsService } = await setup({ feePerItem: 0, releaseOnClose: true });
      settingsService.state.releaseOnClose = false;

      // Act
      fixture.componentRef.setInput('visible', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      await flushPromises();
      fixture.detectChanges();

      // Assert
      expect(settingsService.load).toHaveBeenCalledTimes(2);
      expect(component.writeMode()).toBe('immediate');
      expect(scanDialogOf(fixture).writeMode()).toBe('immediate');
    });

    it('onArticleConfirmed_immediateMode_booksOneArticleWithoutFee', async () => {
      // Arrange
      const { component, releaseApi } = await setup({ feePerItem: 0, releaseOnClose: false });

      // Act
      component.onArticleConfirmed('a1');

      // Assert
      expect(releaseApi.bookRelease).toHaveBeenCalledWith(SELLER_ID, 0, ['a1']);
      expect(component.releasedIds()).toEqual(['a1']);
    });

    it('template_scanDialogConfirmsArticle_booksIt', async () => {
      // Arrange
      const { fixture, releaseApi } = await setup({ feePerItem: 0, releaseOnClose: false });

      // Act
      scanDialogOf(fixture).articleConfirmed.emit('a1');

      // Assert
      expect(releaseApi.bookRelease).toHaveBeenCalledWith(SELLER_ID, 0, ['a1']);
    });

    it('onScanDialogVisibleChange_threeArticlesReleased_printsOneReceiptWithoutPayment', async () => {
      // Arrange
      const { component, releaseApi, printService } = await setup({ feePerItem: 0, releaseOnClose: false });
      const visibleChangeSpy = vi.fn();
      const releasedSpy = vi.fn();
      component.visibleChange.subscribe(visibleChangeSpy);
      component.released.subscribe(releasedSpy);
      component.onArticleConfirmed('a1');
      component.onArticleConfirmed('a2');
      component.onArticleConfirmed('a3');

      // Act
      component.onScanDialogVisibleChange(false);

      // Assert
      expect(printService.printIntakeReceipt).toHaveBeenCalledTimes(1);
      expect(printService.printIntakeReceipt).toHaveBeenCalledWith({
        articleIds: ['a1', 'a2', 'a3'],
        sellerId: SELLER_ID,
      });
      expect(releaseApi.bookRelease).toHaveBeenCalledTimes(3);
      expect(component.paymentPanelVisible()).toBe(false);
      expect(releasedSpy).toHaveBeenCalledTimes(1);
      expect(visibleChangeSpy).toHaveBeenCalledWith(false);
    });

    it('onScanDialogVisibleChange_nothingCaptured_printsNoReceipt', async () => {
      // Arrange
      const { component, releaseApi, printService } = await setup({ feePerItem: 0, releaseOnClose: false });
      const visibleChangeSpy = vi.fn();
      component.visibleChange.subscribe(visibleChangeSpy);

      // Act
      component.onScanDialogVisibleChange(false);

      // Assert
      expect(printService.printIntakeReceipt).not.toHaveBeenCalled();
      expect(releaseApi.bookRelease).not.toHaveBeenCalled();
      expect(visibleChangeSpy).toHaveBeenCalledWith(false);
    });

    it('onArticleConfirmed_bookingFails_reportsFailureToScanDialogAndDoesNotCountArticle', async () => {
      // Arrange
      const releaseApi = releaseApiStub();
      releaseApi.bookRelease.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 409,
              error: { errorCode: 'article.not_releasable', articleNumbers: [1043] },
            }),
        ),
      );
      const { fixture, component } = await setup({ feePerItem: 0, releaseOnClose: false, releaseApi });
      const reportWriteFailed = vi.spyOn(scanDialogOf(fixture), 'reportWriteFailed');

      // Act
      component.onArticleConfirmed('a1');

      // Assert
      expect(reportWriteFailed).toHaveBeenCalledTimes(1);
      expect(component.releasedIds()).toEqual([]);
    });

    it('onScanDialogVisibleChange_onlyFailedBookings_printsNoReceipt', async () => {
      // Arrange
      const releaseApi = releaseApiStub();
      releaseApi.bookRelease.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
      const { component, printService } = await setup({ feePerItem: 0, releaseOnClose: false, releaseApi });
      const visibleChangeSpy = vi.fn();
      component.visibleChange.subscribe(visibleChangeSpy);
      component.onArticleConfirmed('a1');

      // Act
      component.onScanDialogVisibleChange(false);

      // Assert
      expect(printService.printIntakeReceipt).not.toHaveBeenCalled();
      expect(visibleChangeSpy).toHaveBeenCalledWith(false);
    });

    it('onScanDialogVisibleChange_bookingStillRunning_waitsAndPrintsAfterwards', async () => {
      // Arrange
      const response = new Subject<{ releasedCount: number; intakeFeePaid: number }>();
      const releaseApi = releaseApiStub();
      releaseApi.bookRelease.mockReturnValue(response);
      const { component, printService } = await setup({ feePerItem: 0, releaseOnClose: false, releaseApi });
      const visibleChangeSpy = vi.fn();
      component.visibleChange.subscribe(visibleChangeSpy);
      component.onArticleConfirmed('a1');

      // Act
      component.onScanDialogVisibleChange(false);

      // Assert (während die Buchung läuft)
      expect(printService.printIntakeReceipt).not.toHaveBeenCalled();
      expect(visibleChangeSpy).not.toHaveBeenCalled();

      // Act (Buchung kommt zurück)
      response.next({ releasedCount: 1, intakeFeePaid: 0 });

      // Assert (danach)
      expect(printService.printIntakeReceipt).toHaveBeenCalledWith({ articleIds: ['a1'], sellerId: SELLER_ID });
      expect(visibleChangeSpy).toHaveBeenCalledWith(false);
    });

    it('onScanDialogVisibleChange_releaseOnCloseTrueFeeZero_stillBooksOnCloseAsBefore', async () => {
      // Arrange
      const { component, releaseApi } = await setup({ feePerItem: 0, releaseOnClose: true });
      component.onSessionChanged(['a1', 'a2']);

      // Act
      component.onScanDialogVisibleChange(false);

      // Assert
      expect(releaseApi.bookRelease).toHaveBeenCalledTimes(1);
      expect(releaseApi.bookRelease).toHaveBeenCalledWith(SELLER_ID, 0, ['a1', 'a2']);
    });

    it('onScanDialogVisibleChange_releaseOnCloseFalseFeeGreaterZero_collectsAndOpensPaymentAsBefore', async () => {
      // Arrange
      const { component, releaseApi } = await setup({ feePerItem: 0.5, releaseOnClose: false });
      component.onSessionChanged(['a1']);

      // Act
      component.onScanDialogVisibleChange(false);

      // Assert
      expect(component.paymentPanelVisible()).toBe(true);
      expect(releaseApi.bookRelease).not.toHaveBeenCalled();
    });
  });
  ```

- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/release-dialog/release-dialog.spec.ts` — erwartet: FAIL (Typfehler: `writeMode`, `releasedIds`, `onArticleConfirmed` fehlen an `ReleaseDialog`, `IMMEDIATE_WRITE_TIMEOUT_MS` wird nicht exportiert; u. a. `writeMode_releaseOnCloseFalseFeeZero_isImmediate`, `scanDialogVisible_settingsOfThisOpeningNotYetLoaded_keepsScanDialogHidden`, `onScanDialogVisibleChange_bookingNeverAnswers_closesAfterTimeoutWithoutReceipt`)

- [ ] **Schritt 3: Minimal implementieren**

  `release-dialog.html` — den `app-scan-dialog` ersetzen durch:

  ```html
    <app-scan-dialog
      [visible]="scanDialogVisible()"
      title="Artikel freigeben"
      [sellerId]="sellerId()"
      targetField="releasedAt"
      [writeMode]="writeMode()"
      (visibleChange)="onScanDialogVisibleChange($event)"
      (sessionArticleIds)="onSessionChanged($event)"
      (articleConfirmed)="onArticleConfirmed($event)"
    />
  ```

  `release-dialog.ts` — Importzeile und Imports anpassen:

  ```ts
  import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    output,
    signal,
    viewChild,
  } from '@angular/core';
  ```

  nach der Zeile `import { HttpErrorResponse } from '@angular/common/http';` einfügen:

  ```ts
  import { timeout } from 'rxjs';
  ```

  nach der Zeile `import { PrintService } from '../../../../core/print/print.service';` einfügen:

  ```ts
  // Cross-cutting core service: the Sofort-Modus flag (`releaseOnClose`) is an app-wide setting,
  // re-read via `SettingsService.load()` every time the popup opens.
  import { SettingsService } from '../../../../core/settings/settings.service';

  /** Sofort-Modus: Bleibt die Antwort einer Einzelbuchung so lange aus, gilt sie als fehlgeschlagen
   * (rot, zählt nicht zum Abgabe-Beleg) — sonst hinge das Schließen des Popups an einer hängenden Anfrage. */
  export const IMMEDIATE_WRITE_TIMEOUT_MS = 10000;
  ```

  Im Klassen-Doc-Kommentar den Satzteil

  ```ts
   * dialog`'s `[visible]` stays bound directly to this component's own `visible()` input and is
   * NEVER ANDed with anything else — the payment-panel overlay is instead a purely local `[hidden]`
  ```

  ersetzen durch:

  ```ts
   * dialog`'s `[visible]` follows `scanDialogVisible()`, which only ANDs `visible()` with flags that
   * never change while a session is open (`modeReady()` flips only at opening, before anything is
   * captured; `closeRequested()` only once the user has closed) — the payment-panel overlay is instead a purely local `[hidden]`
  ```

  Den Absatz am Ende des Klassen-Doc-Kommentars (direkt vor `*/` der Klasse) um diesen Absatz ergänzen:

  ```ts
   *
   * Sofort-Modus (Spec docs/forge/2026-10-19-freigabe-sofort-ohne-gebuehr/spec.md): Ist der Schalter
   * `releaseOnClose` (frisch bei jedem Öffnen über `SettingsService.load()` gelesen) aus und die
   * Gebühr je Stück 0, schaltet `writeMode()` den `scan-dialog` auf `'immediate'`. Jeder dann über
   * `articleConfirmed` bestätigte Artikel wird sofort einzeln gebucht (`POST /api/release`, Gebühr 0,
   * eine ID); scheitert die Buchung, meldet `ScanDialog.reportWriteFailed()` das rot. Beim Schließen
   * entfällt der Bezahlen-Dialog; der Abgabe-Beleg wird einmal mit allen freigegebenen Artikeln
   * gedruckt (nur wenn mindestens einer freigegeben wurde) — nachdem laufende Buchungen fertig sind
   * oder nach `IMMEDIATE_WRITE_TIMEOUT_MS` als fehlgeschlagen gelten. Der `scan-dialog` erscheint
   * erst, wenn Gebühr je Stück und Einstellungen dieser Öffnung geladen sind (`modeReady()`), damit
   * nie ein Artikel im falschen Modus erfasst wird; nach dem Schließen mit laufender Buchung bleibt
   * er verborgen (`closeRequested()`), damit keine weiteren Scans hinzukommen.
  ```

  (`timeout({ first: … })` misst nur bis zur ersten Antwort; danach läuft kein Zeitgeber mehr, auch wenn die Quelle nicht abschließt.)

  In der Klasse nach `private readonly messageService = inject(MessageService);` einfügen:

  ```ts
    private readonly settingsService = inject(SettingsService);
    private readonly scanDialog = viewChild(ScanDialog);
  ```

  nach `readonly feePerItem = signal(0);` einfügen:

  ```ts
    /** Ladezustand von `feePerItem` für den aktuellen Verkäufer — nur bei `'loaded'` gilt je der Sofort-Modus;
     * `'failed'` lässt das Popup wie bisher im Sammel-Modus arbeiten. */
    private readonly feeState = signal<'loading' | 'loaded' | 'failed'>('loading');
    /** `true`, sobald `SettingsService.load()` für diese Öffnung zurück ist (auch nach einem geschluckten Fehler). */
    private readonly settingsLoaded = signal(false);
    /** Stellung des Schalters, bei jedem Öffnen frisch geladen; bis dahin „an" (Verhalten wie heute). */
    private readonly releaseOnClose = signal(true);
    /** Gebühr je Stück und Einstellungen dieser Öffnung liegen vor — erst dann ist der Modus der Sitzung bekannt. */
    private readonly modeReady = computed(() => this.feeState() !== 'loading' && this.settingsLoaded());

    /** Sofort-Modus nur bei Gebühr je Stück 0 und ausgeschaltetem Schalter, sonst Verhalten wie heute. */
    readonly writeMode = computed<'batch' | 'immediate'>(() =>
      this.feeState() === 'loaded' && this.feePerItem() === 0 && !this.releaseOnClose() ? 'immediate' : 'batch',
    );

    /** Im Sofort-Modus in dieser Sitzung erfolgreich freigegebene Artikel — Grundlage des Abgabe-Belegs. */
    readonly releasedIds = signal<readonly string[]>([]);
    /** Im Sofort-Modus noch ohne Antwort laufende Einzelbuchungen. */
    private readonly pendingWrites = signal(0);
    /** Im Sofort-Modus hat der Nutzer geschlossen; bis zur nächsten Öffnung bleibt der `scan-dialog` verborgen. */
    private readonly closeRequested = signal(false);

    /** `[visible]` des `scan-dialog` — siehe Klassen-Doc-Kommentar, warum dieses UND die Sitzung nicht zurücksetzt. */
    readonly scanDialogVisible = computed(() => this.visible() && this.modeReady() && !this.closeRequested());
  ```

  Im `constructor()` den ersten Effect ersetzen durch:

  ```ts
      effect(() => {
        const id = this.sellerId();
        if (!id) return;
        this.feeState.set('loading');
        this.sellersApi.getById(id).subscribe({
          next: (seller) => {
            this.feePerItem.set(seller.feePerItem);
            this.feeState.set('loaded');
          },
          error: () => this.feeState.set('failed'),
        });
      });
  ```

  und den zweiten Effect (der mit `if (this.visible())`) ersetzen durch:

  ```ts
      effect(() => {
        if (!this.visible()) {
          this.settingsLoaded.set(false);
          this.closeRequested.set(false);
          return;
        }
        this.paymentPanelVisible.set(false);
        this.bookingError.set(null);
        this.releasedIds.set([]);
        this.releaseOnClose.set(true);
        this.refreshReleaseOnClose();
      });
  ```

  `onScanDialogVisibleChange` ersetzen durch (Doc-Kommentar der Methode bleibt, der Rumpf beginnt neu):

  ```ts
    onScanDialogVisibleChange(value: boolean): void {
      if (value) return;

      if (this.hasImmediateWrites()) {
        this.closeImmediateSession();
        return;
      }

      if (this.sessionIds().length === 0) {
        this.visibleChange.emit(false);
        return;
      }

      this.bookingError.set(null);

      // Nothing to collect (fee 0): skip the payment-panel and book straight away.
      if (this.fee() <= 0) {
        this.book(0);
        return;
      }

      this.paymentPanelVisible.set(true);
    }
  ```

  Nach `onPaymentConfirmed(...)` und vor `private book(...)` einfügen:

  ```ts
    /** Sofort-Modus: `scan-dialog` hat einen Artikel bestätigt — sofort einzeln und ohne Gebühr buchen.
     * Bleibt die Antwort `IMMEDIATE_WRITE_TIMEOUT_MS` aus, gilt die Buchung als fehlgeschlagen. */
    onArticleConfirmed(articleId: string): void {
      this.pendingWrites.update((count) => count + 1);
      this.releaseApi
        .bookRelease(this.sellerId(), 0, [articleId])
        .pipe(timeout({ first: IMMEDIATE_WRITE_TIMEOUT_MS }))
        .subscribe({
          next: () => {
            this.releasedIds.update((ids) => [...ids, articleId]);
            this.onWriteSettled();
          },
          error: () => {
            this.scanDialog()?.reportWriteFailed();
            this.onWriteSettled();
          },
        });
    }

    private hasImmediateWrites(): boolean {
      return this.pendingWrites() > 0 || this.releasedIds().length > 0;
    }

    private refreshReleaseOnClose(): void {
      void this.settingsService.load().then(() => {
        this.releaseOnClose.set(this.settingsService.releaseOnClose());
        this.settingsLoaded.set(true);
      });
    }

    private onWriteSettled(): void {
      this.pendingWrites.update((count) => count - 1);
      if (this.closeRequested() && this.pendingWrites() === 0) this.finishImmediateSession();
    }

    private closeImmediateSession(): void {
      this.closeRequested.set(true);
      if (this.pendingWrites() === 0) this.finishImmediateSession();
    }

    /** `closeRequested` bleibt gesetzt, bis der Elternteil `visible` auf `false` legt (zweiter Effect) —
     * sonst würde der `scan-dialog` zwischen Emit und Schließen kurz wieder erscheinen. */
    private finishImmediateSession(): void {
      const articleIds = Array.from(this.releasedIds());
      if (articleIds.length > 0) this.reportReleased(articleIds);
      this.visibleChange.emit(false);
    }

    /** Abgabe-Beleg drucken und das Verkäufer-Raster neu laden lassen — gemeinsam für Sammel- und Sofort-Modus. */
    private reportReleased(articleIds: string[]): void {
      this.printService.printIntakeReceipt({ articleIds, sellerId: this.sellerId() });
      this.released.emit();
    }
  ```

  `private book(...)` ersetzen durch (der Erfolgsfall nutzt `reportReleased`, Druck und `released` stehen nur noch an einer Stelle):

  ```ts
    private book(feeAmount: number): void {
      this.releaseApi.bookRelease(this.sellerId(), feeAmount, this.sessionIds()).subscribe({
        next: () => {
          this.reportReleased(Array.from(this.sessionIds()));
          this.paymentPanelVisible.set(false);
          this.bookingError.set(null);
          if (feeAmount > 0) this.resultEvent.set(createResultEvent('paid'));
          this.visibleChange.emit(false);
        },
        error: (error: unknown) => this.handleBookingError(error),
      });
    }
  ```

- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/release-dialog/release-dialog.spec.ts --include src/app/shared/components/scan-dialog/scan-dialog.spec.ts --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS (alle bestehenden `ReleaseDialog`-Tests und die neuen `Sofort-Modus`-Tests grün)

- [ ] **Schritt 5: Build und Lint prüfen**
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK

- [ ] **Schritt 6: Commit**
  `git add -- src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.ts src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.html src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.spec.ts` · `git commit -m "feat(sellers): Sofort-Freigabe im Freigeben-Popup bei Gebühr 0" -- <dieselben Pfade>`

---

### Task 6: Gesamte Frontend-Testsuite prüfen

**ACs:** AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.spec.ts` · `describe('Sofort-Modus')`

**Interfaces:**
- Consumes: alle Frontend-Änderungen der Tasks 3–5
- Produces: —

- [ ] **Schritt 1: Absicherungstest benennen**
  Bestehende Tests: `release-dialog.spec.ts` · `Sofort-Modus` (AC-04 bis AC-10), `settings-form.spec.ts` (AC-01 bis AC-03), `scan-dialog.spec.ts` · `writeMode` (AC-04/AC-09), `sellers-page.spec.ts` (Aufrufer des `release-dialog`).

- [ ] **Schritt 2: Gesamte Frontend-Suite laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend` — erwartet: PASS (alle Spec-Dateien grün; rot ist ein Befund an einer Stelle, die ein früherer Task geändert hat, kein Grund, hier Code zu ändern)

- [ ] **Schritt 3: Commit** (entfällt, es lief nur ein bestehender Test)

---

### Task 7: Zugriffsschutz der Einstellungen (Absicherung)

**ACs:** AC-11

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/app.routes.spec.ts` · `settingsRoute_always_isGuardedByAdminGuard`
- Test: `src/bazaar-app/frontend/src/app/core/auth/admin.guard.spec.ts` · `redirects to /intake for non-admin role`

**Interfaces:**
- Consumes: `adminGuard` auf der Route `settings` (`app.routes.ts`), `PUT /api/settings` mit `RequireAuthorization("admin")` (`SettingsEndpoints.cs`, unverändert)
- Produces: —

- [ ] **Schritt 1: Absicherungstest benennen**
  Bestehende Tests: `app.routes.spec.ts` · `settingsRoute_always_isGuardedByAdminGuard` (die Route `/settings`, die den Schalter hostet, trägt `adminGuard`) und `admin.guard.spec.ts` · `redirects to /intake for non-admin role` (Kassenpersonal wird abgewiesen). Der neue Schalter liegt im bestehenden `settings-form` auf dieser Route und im bestehenden `PUT /api/settings` (`admin`) — es gibt keinen zweiten Zugang.

- [ ] **Schritt 2: Absicherungstest laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/app.routes.spec.ts --include src/app/core/auth/admin.guard.spec.ts` — erwartet: PASS `settingsRoute_always_isGuardedByAdminGuard` und `redirects to /intake for non-admin role`; rot ist ein Befund, kein Grund, Code zu ändern

- [ ] **Schritt 3: Commit** (entfällt, es lief nur ein bestehender Test)

---

### Task 8: Anforderungs-Doku und Feature-Profile nachführen

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-07, AC-09, AC-10

**Dateien:**
- Modify: `docs/requirements/bazaar-app/api/settings.md` · `## Genau ein Parameter`, `Kein Nachladen pro Scan.`
- Modify: `docs/requirements/bazaar-app/entities/einstellungen.md` · `## Felder`
- Modify: `docs/requirements/bazaar-app/components/settings-form.md` · `## Überblick`
- Modify: `docs/components/settings-form/component.md` · `## 1. Feld — ScannerPauseMs`, `## Akzeptanzkriterien`
- Modify: `docs/components/scan-dialog/component.md` · `## 2. Input / Output Schnittstelle`
- Modify: `docs/knowledge/feature-profile/bazaar-app-settings/feature.md` · `User sees a success toast on save`, `**Last reviewed:** 2026-10-18`
- Modify: `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` · `- User sees im Freigabe-Flow bei Gebühr 0 keinen Bezahlen-Dialog:`

**Interfaces:**
- Consumes: Verhalten aus den Tasks 1–5
- Produces: —

- [ ] **Schritt 1: API-Doku der Einstellungen**
  In `docs/requirements/bazaar-app/api/settings.md`:
  - `{ "scannerPauseMs": 3000 }` (im `GET`-Beispiel unter `→ 200 OK`) ersetzen durch `{ "scannerPauseMs": 3000, "releaseOnClose": true }`.
  - Im `PUT`-Beispiel `{ "scannerPauseMs": 5000 }` (Zeile nach `PUT /api/settings`) ersetzen durch `{ "scannerPauseMs": 5000, "releaseOnClose": false }`.
  - Den Satz `Das Frontend liest die Werte **beim App-Start** und hält sie im Speicher. Kein Nachladen pro Scan.` ersetzen durch `Das Frontend liest die Werte **beim App-Start** und hält sie im Speicher. Kein Nachladen pro Scan. Ausnahme: Das Freigeben-Popup lädt die Einstellungen bei jedem Öffnen neu (`releaseOnClose`), damit eine gespeicherte Änderung ohne App-Neuladen gilt.`
  - Nach dem `GET`-Beispiel-Absatz die Beschreibung ergänzen (neuer Absatz direkt nach dem Satz zum Frontend): `` `releaseOnClose` (bool, Standard `true`): `true` = das Freigeben-Popup gibt Artikel erst beim Schließen frei, `false` = bei Verkäufern mit Gebühr je Stück 0 wird jeder erfasste Artikel sofort freigegeben. Bei Gebühr je Stück größer 0 hat der Wert keine Wirkung. Fehlt das Feld im `PUT`, gilt `true`. ``
  - Die Überschrift `## Genau ein Parameter` ersetzen durch `## Weitere Parameter bewusst nicht enthalten`.

- [ ] **Schritt 2: Entity-Doku**
  In `docs/requirements/bazaar-app/entities/einstellungen.md` unter `## Felder` nach der Tabellenzeile `| `scannerPauseMs` | int | ✅ | Anzeigedauer des Scan-Ergebnisses im Inline-Kamera-Modus, Default `3000` |` eine Zeile einfügen:

  ```markdown
  | `releaseOnClose` | bool | ✅ | `true` = Freigeben-Popup gibt Artikel erst beim Schließen frei, `false` = bei Verkäufern mit Gebühr je Stück 0 sofort; Default `true` |
  ```

- [ ] **Schritt 3: Komponenten-Doku (Anforderung)**
  In `docs/requirements/bazaar-app/components/settings-form.md`: den Satz `Das Formular hat **ein** Feld. Das ist kein Versehen, sondern das Ergebnis des Reviews:` ersetzen durch `Das Formular hat **zwei** Felder: `scannerPauseMs` und den Schalter `releaseOnClose` (Sofort-Freigabe im Freigeben-Popup bei Verkäufern ohne Gebühr, Spec [2026-10-19-freigabe-sofort-ohne-gebuehr](../../../forge/2026-10-19-freigabe-sofort-ohne-gebuehr/spec.md)). Die Beschränkung darauf ist kein Versehen, sondern das Ergebnis des Reviews:` und `**Beschreibung:** Formular für die Systemparameter — derzeit genau einer.` ersetzen durch `**Beschreibung:** Formular für die Systemparameter — derzeit genau zwei.`

- [ ] **Schritt 4: Komponenten-Doku (settings-form)**
  In `docs/components/settings-form/component.md`:
  - `**Beschreibung:** Admin-Formular mit einem Feld (`ScannerPauseMs`) zur Pflege der` ersetzen durch `**Beschreibung:** Admin-Formular mit zwei Feldern (`ScannerPauseMs`, `ReleaseOnClose`) zur Pflege der`.
  - `**Verwendungszweck:** Einziger Editier-Weg für `scannerPauseMs`; die Seite lädt den aktuellen` ersetzen durch `**Verwendungszweck:** Einziger Editier-Weg für `scannerPauseMs` und `releaseOnClose`; die Seite lädt den aktuellen`.
  - `` `settings-form` ist ein einfeldriges Formular auf der `/settings`-Seite (Admin only). Es `` ersetzen durch `` `settings-form` ist ein Formular mit zwei Feldern auf der `/settings`-Seite (Admin only). Es `` und `` den einzigen Systemparameter `scannerPauseMs` und persistiert Änderungen ausschließlich `` ersetzen durch `` den Systemparameter `scannerPauseMs` (dazu der Schalter `releaseOnClose`, Abschnitt 1a) und persistiert Änderungen ausschließlich ``.
  - Vor der Überschrift `## 2. Verhalten` (nach dem `---` unter Abschnitt 1) einen neuen Abschnitt einfügen:

    ```markdown
    ## 1a. Feld — ReleaseOnClose

    - `app-boolean-input` (Variante `switch`) mit der Beschriftung „Artikel erst beim Schließen des
      Freigabe-Dialogs freigeben"; Standardstellung **an** (Verhalten wie heute).
    - Hilfstext unter dem Schalter: „Gilt nur für Verkäufer ohne Gebühr."
    - Wirkung: Aus = das Freigeben-Popup gibt bei Verkäufern mit Gebühr je Stück 0 jeden erfassten Artikel
      sofort frei; bei Gebühr je Stück größer 0 ohne Wirkung. Der Schalter wird erst über „Speichern"
      wirksam (gemeinsam mit der Scan-Pause per `PUT /api/settings`) und gilt auf jedem Gerät ab dem
      nächsten Öffnen des Freigeben-Popups.
    - Ungespeicherte Stellung zählt zu `hasUnsavedChanges`; `discardChanges()` stellt die zuletzt
      gespeicherte Stellung wieder her.

    ---

    ```

  - Am Ende der Akzeptanzkriterien (nach `6. **AC-6** — …(Epic_Einstellungen AC-1).`) anfügen:

    ```markdown
    7. **AC-7** — THE SYSTEM SHALL den Schalter „Artikel erst beim Schließen des Freigabe-Dialogs
       freigeben" mit dem Hilfetext „Gilt nur für Verkäufer ohne Gebühr." anzeigen, standardmäßig
       eingeschaltet.
    8. **AC-8** — WHEN „Speichern" geklickt wird, THEN SHALL das System die Stellung des Schalters
       zusammen mit der Scan-Pause per `PUT /api/settings` senden; eine nicht gespeicherte
       Stellung SHALL beim Neuladen der Seite durch die zuletzt gespeicherte ersetzt werden.
    ```

- [ ] **Schritt 5: Scan-Dialog-Doku**
  In `docs/components/scan-dialog/component.md` unter `## 2. Input / Output Schnittstelle` nach der Tabellenzeile `| `visibleChange` | `boolean` | `@Output` | Two-way-Binding — emittiert `false` wenn Dialog geschlossen wird |` einfügen:

  ```markdown
  | `writeMode` | `'batch' \| 'immediate'` | `@Input` | `'batch'` (Default): Treffer werden in der Sitzung gesammelt (`sessionArticleIds`), der Elternteil schreibt am Ende. `'immediate'`: jeder Treffer löst sofort `articleConfirmed` aus, die Sitzungsliste bleibt leer (Rückgabe in der Abrechnung; Freigeben-Popup bei ausgeschaltetem Schalter `releaseOnClose` und Gebühr je Stück 0) |
  | `articleConfirmed` | `string` | `@Output` | Nur im Modus `'immediate'`: Artikel-ID eines erfolgreichen Treffers; der Elternteil schreibt |
  | `reportWriteFailed()` | — | Methode | Der Elternteil meldet im Modus `'immediate'`, dass das Schreiben scheiterte: Liste der ausstehenden Artikel wird neu geladen, die Ergebnis-Einblendung zeigt rot |
  ```

- [ ] **Schritt 6: Feature-Profile**
  In `docs/knowledge/feature-profile/bazaar-app-settings/feature.md`:
  - `**Last reviewed:** 2026-10-18` ersetzen durch `**Last reviewed:** 2026-10-19`.
  - Unter `` ### Scanner-Einstellungen (`settings-form`) `` nach der Zeile `- User sees a success toast on save — `settings-form.ts` `onSave()`` einfügen:

    ```markdown
    - Admin schaltet „Artikel erst beim Schließen des Freigabe-Dialogs freigeben" (Standard an, Hilfetext „Gilt nur für Verkäufer ohne Gebühr.") und speichert es zusammen mit der Scan-Pause; aus = das Freigeben-Popup gibt bei Verkäufern mit Gebühr je Stück 0 sofort frei — `settings-form.{ts,html}` (`releaseOnClose`, `app-boolean-input`), `Bazaar.Domain/Settings/Settings.cs` (`ReleaseOnClose`)
    ```

  In `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` nach der Zeile, die mit `- User sees im Freigabe-Flow bei Gebühr 0 keinen Bezahlen-Dialog:` beginnt, einfügen:

  ```markdown
  - User sees im Freigabe-Flow bei Gebühr je Stück 0 und ausgeschaltetem Einstellungs-Schalter „Artikel erst beim Schließen des Freigabe-Dialogs freigeben" jeden erfassten Artikel sofort freigegeben (Auswahlliste ohne ihn); beim Schließen wird einmal ein Abgabe-Beleg mit allen freigegebenen Artikeln gedruckt, sofern mindestens einer freigegeben wurde; scheitert eine Buchung, zeigt der Dialog die rote Ergebnis-Einblendung und der Artikel zählt nicht zum Beleg — `components/release-dialog/release-dialog.ts` (`writeMode`, `onArticleConfirmed`, `releasedIds`), `shared/components/scan-dialog/scan-dialog.ts` (`reportWriteFailed`)
  ```

- [ ] **Schritt 7: Nachführung prüfen**
  Tool-Aufrufe (`Grep`, `output_mode: "count"`, je Datei relativ zu `<R>`) — erwartet jeweils die genannte Mindestzahl an Trefferzeilen:
  - `Grep` Muster `releaseOnClose` in `docs/requirements/bazaar-app/api/settings.md` — erwartet: ≥ 4 (GET-Beispiel, PUT-Beispiel, Ausnahme-Satz, Feldbeschreibung)
  - `Grep` Muster `## Weitere Parameter bewusst nicht enthalten` in `docs/requirements/bazaar-app/api/settings.md` — erwartet: 1
  - `Grep` Muster `releaseOnClose` in `docs/requirements/bazaar-app/entities/einstellungen.md` — erwartet: ≥ 1
  - `Grep` Muster `releaseOnClose` in `docs/requirements/bazaar-app/components/settings-form.md` — erwartet: ≥ 1
  - `Grep` Muster `## 1a. Feld — ReleaseOnClose` in `docs/components/settings-form/component.md` — erwartet: 1; Muster `AC-8` in derselben Datei — erwartet: ≥ 1
  - `Grep` Muster `reportWriteFailed` in `docs/components/scan-dialog/component.md` — erwartet: ≥ 1
  - `Grep` Muster `Artikel erst beim Schließen des Freigabe-Dialogs freigeben` in `docs/knowledge/feature-profile/bazaar-app-settings/feature.md` — erwartet: ≥ 1; Muster `Last reviewed:\*\* 2026-10-19` in derselben Datei — erwartet: 1
  - `Grep` Muster `reportWriteFailed` in `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` — erwartet: ≥ 1
  - `Grep` Muster `ohne Gebühr` in `docs/knowledge/feature-profile/bazaar-app-settings/feature.md` — erwartet: ≥ 1
  - `Grep` Muster `sofort freigegeben` in `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` — erwartet: ≥ 1
  Fehlt ein Treffer, hat die betreffende Ersetzung aus Schritt 1–6 ihren Anker nicht getroffen; Schritt nachholen und erneut prüfen.

- [ ] **Schritt 8: Commit**
  `git add -- docs/requirements/bazaar-app/api/settings.md docs/requirements/bazaar-app/entities/einstellungen.md docs/requirements/bazaar-app/components/settings-form.md docs/components/settings-form/component.md docs/components/scan-dialog/component.md docs/knowledge/feature-profile/bazaar-app-settings/feature.md docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` · `git commit -m "docs(settings): Schalter Sofort-Freigabe in Anforderungen und Profilen nachgeführt" -- <dieselben Pfade>`

---

## Entscheidungen
- **W · AC-09 Rot (Frage Planung)** · Aussage — Die rote Ergebnis-Einblendung erscheint nur bei fehlgeschlagener Sofort-Buchung (z. B. 409 `article.not_releasable`, Netzfehler). Die Nummernprüfung vorab bleibt wie heute: ein bereits freigegebener Artikel ergibt gelb („bereits gesetzt"), wird nie gebucht und zählt nicht zum Abgabe-Beleg.
- **E · Sofort-Modus über vorhandenen `writeMode='immediate'`** · Planer — Der `scan-dialog` kennt den Modus bereits (Abrechnung), entfernt bestätigte Artikel lokal aus der Liste und meldet `articleConfirmed`; so entsteht keine zweite Erfassungslogik. Neu ist nur `reportWriteFailed()`, weil der Dialog den Schreibfehler des Elternteils sonst nicht kennt (die grüne Einblendung läuft vor der Buchung und wird durch die rote ersetzt).
- **E · Einzelbuchung über bestehendes `POST /api/release`** · Planer — Jeder bestätigte Artikel wird mit Gebühr 0 und genau einer ID gebucht; der Handler prüft die Gebühr als `Anzahl × Gebühr je Stück` (= 0) und die Freigebbarkeit. Kein neuer Endpoint, keine Backend-Änderung außer der Einstellung.
- **E · Einstellung bei jedem Öffnen frisch laden** · Planer — `SettingsService.load()` wird beim Öffnen erneut aufgerufen (AC-10); der Wert gilt als Momentaufnahme dieser Öffnung. Bis die Antwort da ist, gilt „an" (Verhalten wie heute); der Sofort-Modus setzt außerdem voraus, dass die Gebühr je Stück geladen ist (`feeLoaded`), damit ein Verkäufer mit Gebühr nie kurzzeitig im Sofort-Modus landet. `load()` schluckt Fehler: schlägt der Abruf fehl, bleibt der zuletzt bekannte Wert bzw. „an".
- **E · Beleg und `released` erst beim Schließen, nach laufenden Buchungen** · Planer — Der Abgabe-Beleg und das Neuladen des Verkäufer-Rasters (`released`) kommen einmal beim Schließen; läuft dann noch eine Buchung, wartet das Schließen auf deren Ende, damit der Beleg keinen Artikel verliert. Ohne freigegebenen Artikel wird weder gedruckt noch `released` emittiert.
- **E · Polarität der Eigenschaft** · Planer — `ReleaseOnClose = true` bedeutet „erst beim Schließen" und entspricht dem Schalter im UI (an = Verhalten wie heute); so ist der Standard `true` und die Migration setzt bestehende Zeilen auf `true`.
- **E · EF-Konfiguration `HasDefaultValue(true).ValueGeneratedNever()`** · Planer — Der DB-Default füllt bestehende Zeilen in der Migration; `ValueGeneratedNever` verhindert, dass EF ein `false` beim Insert wie „nicht gesetzt" behandelt. Zwei Tests in `SettingsRepositoryTests` sichern beides ab; als Rückfall nennt Task 2 `HasSentinel(true)`.
- **E · `SettingsApi.update(settings: Settings)`** · Planer — Statt einer wachsenden Parameterliste nimmt `update` das Objekt des Vertrags; das `PUT` bleibt eine Vollersetzung.
- **E · Glossar unverändert** · Planer — „Freigeben-Popup" und „Annahmegebühr" sind in `CONTEXT.md` geführt; es entsteht kein neuer Code-Begriff, der einen Glossar-Eintrag mit „Maps to" bräuchte.
- **R1 · Task 2** — geändert — Die Modify-Zeile für `BazaarDbContextModelSnapshot.cs` nennt jetzt den Anker `BuildModel` (Methode im Snapshot, enthält die Property `ScannerPauseMs`, neben der `ReleaseOnClose` erscheint).
- **R1 · Task 4** — geändert — Die Test-Zeile für `scan-dialog.spec.ts` ankert jetzt am bestehenden Testnamen `behaves exactly like batch (default) when writeMode is explicitly set to "batch"` (letzter Test im Block `writeMode`, Einfügestelle danach) statt an `describe('writeMode')`, das so nicht wörtlich in der Datei steht.
- **R1 · Task 5** — geändert — Festlegungen: (1) Der `scan-dialog` erhält `[visible]="scanDialogVisible()"` = `visible() && modeReady() && !closeRequested()`; `modeReady` verlangt, dass Gebühr je Stück (Ladezustand `feeState`, bei Fehler `'failed'` = Sammel-Modus wie bisher) und Einstellungen dieser Öffnung geladen sind. So wird nie ein Artikel im falschen Modus erfasst, der Mischfall Sammel-/Sofort-Sitzung entfällt. Das UND setzt die Sitzung nicht zurück, weil sich beide Bedingungen nur beim Öffnen bzw. nach dem Schließen ändern; der Klassen-Doc-Kommentar („NEVER ANDed") wird entsprechend angepasst. Diese Festlegung ersetzt für die Wartezeit den Satz „Bis die Antwort da ist, gilt ‚an'" aus **E · Einstellung bei jedem Öffnen frisch laden**: Das Popup erscheint erst nach der Antwort. (2) `pendingWrites` und `closeRequested` sind Signale; `closeRequested` verbirgt den `scan-dialog` bis zum nächsten Öffnen und sperrt so weitere Scans. (3) Jede Einzelbuchung hat `timeout({ first: IMMEDIATE_WRITE_TIMEOUT_MS })` (10 s); ein Timeout gilt als Fehlschlag (rot, nicht im Beleg), damit das Schließen nie an einer hängenden Anfrage hängt. Restrisiko: Bucht der Server nach dem Timeout doch, fehlt der Artikel auf dem Beleg, ist aber freigegeben. (4) `book()` nutzt im Erfolgsfall `reportReleased()`, Druck und `released` stehen an einer Stelle. Neue Tests: Popup verborgen bis Einstellungen geladen, sichtbar wenn geladen, verborgen nach Schließen mit laufender Buchung, Timeout ohne Beleg, Wiederöffnen nach Sofort-Schließen. Eine eigene Hilfsklasse für die Sofort-Sitzung wurde verworfen (neue Datei samt Spec, größerer Umbau; die Methoden bleiben klein).
- **R1 · Task 7** — geändert — Die Test-Zeilen ankern jetzt an wörtlich vorhandenen Testnamen: `settingsRoute_always_isGuardedByAdminGuard` in `app.routes.spec.ts` und `redirects to /intake for non-admin role` in `admin.guard.spec.ts`; Schritt 1 und 2 nennen denselben Test.
- **R1 · Task 8** — geändert — Anker korrigiert auf die wörtlichen Überschriften `` ## 1. `GET /api/settings` ``, `` ## 2. `PUT /api/settings` ``, `` ### Scanner-Einstellungen (`settings-form`) `` und für das Verkäufer-Profil die Zeile `- User sees im Freigabe-Flow bei Gebühr 0 keinen Bezahlen-Dialog:`. Neuer Schritt 7 prüft je Datei per `Grep` mit erwarteter Trefferzahl, dass jede Ersetzung angekommen ist; der Commit ist jetzt Schritt 8.
- **F · Task 8** — geändert — Vorschlag 1: Die Anker standen schon wörtlich in den Dateien (`settings.md` Zeile 28/41/57, Settings-Profil Zeile 14), die Anker-Prüfung erkannte aber die Doppel-Backtick-Anker mit eingebetteten Backticks nicht. Die Modify-Zeilen für `docs/requirements/bazaar-app/api/settings.md` und `docs/knowledge/feature-profile/bazaar-app-settings/feature.md` nennen jetzt eindeutige Zeichenfolgen ohne eingebettete Backticks (`## Genau ein Parameter`, `Kein Nachladen pro Scan.` bzw. `User sees a success toast on save`, `**Last reviewed:** 2026-10-18`); der Verkäufer-Profil-Anker bleibt. Schritt 7 prüft zusätzlich `ohne Gebühr` im Settings-Profil und `sofort freigegeben` im Verkäufer-Profil.
