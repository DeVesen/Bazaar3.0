# Abgabe-Beleg und Verkäufer-Übersicht drucken — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-14-beleg-druck-vorlagen/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** „Speichern" in der Artikelannahme, die Freigabe, der neue Druckbutton der Verkäufer-Kachel und der Druck in der Abrechnung öffnen eine A4-Druckvorschau, die nur das Dokument zeigt (Abgabe-Beleg bzw. Verkäufer-Übersicht) mit Kopfzeile, Kennzahl-Kacheln, Freitexten, nach Status gruppierter Artikeltabelle und „Seite x von y".
**Architektur:** Ein gemeinsames, rein darstellendes Druckdokument (`PrintDocument`, `shared/components/print-document/`) rendert ein fertiges `PrintDocumentModel`; zwei reine Builder-Funktionen erzeugen das Modell für Abgabe-Beleg und Verkäufer-Übersicht. Der `PrintService` (core) lädt die Daten, baut das Modell, hängt das Dokument als einziges sichtbares Body-Kind in die Seite (Isolations-CSS, `@page` A4) und druckt über den Druckdialog des Geräts. Die zehn Freitexte liegen im `Settings`-Singleton des Backends und werden über eigene Endpoints `GET/PUT /api/settings/print-texts` gelesen (alle angemeldeten Nutzer) bzw. gepflegt (nur Admin).
**Tech-Stack:** .NET 10 / EF Core 10 (Npgsql), xUnit v3, Angular 22 (Standalone, Signals, OnPush), PrimeNG 22, Vitest, `marked` 18.1.1 (neu, Markdown).
**Spec:** docs/forge/2026-10-14-beleg-druck-vorlagen/spec.md
**Basis:** b3519d35

## Global Constraints
- Format ist DIN A4 hochkant; es gilt der Druckdialog des Geräts, auch unter Android und iOS; „Als PDF speichern" genügt; der Druck soll auf Desktop, Tablet und Smartphone funktionieren. (Spec · Soll-Vorgaben)
- „Kennzahl-Kachel" ist der Begriff für einen Infoblock auf dem Beleg (Titel links oben, darunter größerer, dickerer Wert, linksbündig); „Kachel" allein bleibt die Verkäufer-Kachel. (Spec · Soll-Vorgaben)
- Freitext 1 bis 5 gibt es je Vorlage (Abgabe-Beleg, Verkäufer-Übersicht) als eigenes Eingabefeld, zusammen zehn Felder; Markdown mit Überschriften, Fett, Kursiv, Absätzen, Listen und Tabellen; Links, Bilder und HTML sind ausgeschlossen; nur ein Admin pflegt sie; Änderungen gelten ab dem nächsten Druck. (Spec)
- Ausrichtung: Freitext 1 und 4 linksbündig, Freitext 2 und 5 zentriert, Datum/Uhrzeit und „Seite x von y" rechtsbündig; Datum/Uhrzeit ist der Zeitpunkt des Drucks im Format `dd.MM.yyyy, HH:mm`. (Spec)
- Status-Gruppen in der Reihenfolge „Im Verkauf", „Verkauft", „Zurückgegeben" (bei „Speichern" steht „Registriert" allein); Artikelnummer innerhalb jeder Gruppe aufsteigend; „Anzahl abgegebener Artikel" ist die Zahl der Artikel im Dokument. Die Verkäufer-Übersicht folgt denselben Status-Gruppen und derselben Sortierung wie der Beleg für den Druckbutton; der Unterschied zwischen vorläufig und endgültig entfällt. (Spec · Soll-Vorgaben)
- Druckbutton an der Verkäufer-Kachel: sichtbar für alle Rollen, die die Kachel sehen (nicht an eine Rolle und nicht an `importVisible` gekoppelt); hat der Verkäufer keine Artikel, bleibt er aktiv und die Artikelliste ist leer. (Spec · Soll-Vorgaben, W · Druckbutton Kachel)
- Artikelmenge je Auslöser: Druckbutton = alle Artikel des Verkäufers außer „Registriert"; „Speichern" in der Artikelannahme = die gerade gebuchten Artikel, alle „Registriert", die Gruppe „Registriert" erscheint; Freigabe = die freigegebenen Artikel; Druck in der Abrechnung (Verkäufer-Übersicht) = wie Druckbutton, alle außer „Registriert". (Spec · Soll-Vorgaben, W · Auslöser und Artikelmenge)
- Verkäufer-Block: Vorname, Nachname, Straße sowie Postleitzahl und Ort in einer Zeile; Telefon und E-Mail entfallen. Links die Anschrift, rechts der QR-Code der Verkäufer-ID, darunter die Verkäufer-ID als Text. (Spec · Soll-Vorgaben)
- Kennzahl-Kacheln Abgabe-Beleg: Zeile A = Verkäufer-ID als Text und Anzahl abgegebener Artikel; Zeile B ist halb so hoch wie Zeile A und enthält Gebühr und Provision. Gebühr-Kachel: Titel „Gebühr Y € / Artikel", Wert „Anzahl abgegebener Artikel × Y" — der berechnete, nicht der tatsächlich bezahlte Betrag (nie `intakeFeePaid` oder `feeAmount`). Provision-Kachel: Titel „Provision", Wert der Provisionssatz „X %". (Spec · Soll-Vorgaben)
- Kennzahl-Kacheln Verkäufer-Übersicht: Zeile A = Verkäufer-ID, Anzahl abgegebener Artikel, Anzahl offener Artikel (= „Im Verkauf"), Anzahl verkaufter Artikel, Einnahmen (= Umsatz des Verkäufers); Zeile B = Gebühr, Provision, Verdienst. Provision-Kachel: Titel „Provision X %", Wert „Umsatz × X / 100"; Verdienst = „Umsatz − Provision" und ersetzt die bisherige Auszahlung (Beschriftung „Verdienst", nie „Auszahlung"); die Gebühr-Kachel rechnet wie im Abgabe-Beleg. (Spec · Soll-Vorgaben)
- Artikelliste: Tabelle (keine Kachel pro Artikel) mit genau den Spalten Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis; sie füllt die Seitenhöhe bis zur Fußzeile. (Spec · Soll-Vorgaben)
- Leere Freitexte: ein leerer Freitext 3 nimmt keinen Platz ein, die Artikelliste beginnt direkt unter den Kennzahl-Kacheln; leere Freitexte in Kopf- und Fußzeile bleiben leer, ihr Platz bleibt. (Spec · Soll-Vorgaben)
- Ab Seite 2: Kopfzeile, darunter eine Zeile mit Verkäufer-ID und Anschrift in voller Breite, darunter die Fortsetzung der Artikelliste mit wiederholtem Tabellenkopf, unten die Fußzeile; Kennzahl-Kacheln, QR-Code und Freitext 3 stehen nur auf Seite 1. (Spec · Soll-Vorgaben)
- Der Inhalt der Verkäufer-Übersicht ändert sich nur wie in diesen Vorgaben beschrieben; darüber hinaus entfällt oder ändert sich nichts. (Spec · Soll-Vorgaben)
- Code, Routen und JSON-Contract englisch, UI-Texte und Doku deutsch. (CLAUDE.md · Architektur)
- Haupt-App-Assembly-Präfix `Bazaar.`; Monolith, Data-Flow CRUD mit eigenen Query-Ports für Read-Models. (CLAUDE.md · Architektur)
- Zeilenenden: Dateien immer mit LF schreiben. (CLAUDE.md)
- Doku-Nachführung: Ändert die Umsetzung Fähigkeit/Begriff/Beschriftung, werden Anforderungs-Doku, Profile und Glossar im selben Lauf mitgeführt. (CLAUDE.md · Task 12)
- Commits: Conventional Commits `type(scope): Beschreibung`, Text deutsch; immer mit Pfadangabe in einem Schritt (`git commit -m "…" -- <pfade>`); neue Dateien vorher mit `git add -N <datei>` bekanntmachen (kein Stagen des Inhalts); vorher Branch und `git status` prüfen. (CLAUDE.md)
- Bauen/Testen/Linten nur über die Toolchain-Befehle `dv-dotnet-build|test|lint --path …` und `dv-angular-build|test|lint --root …` (Bash-Tool), nie `dotnet test`, `ng test` oder `npm test` in der Shell. (dv-dotnet:toolchain, dv-angular:toolchain)
- Meldet der .NET-Build `MSB3027` (DLL gesperrt, meist läuft `Bazaar.Api` im Debugger), den Menschen informieren oder mit `-c Release` bauen. (CLAUDE.md)
- EF-Migrationen nur über `dotnet ef migrations add …`, nie von Hand; Pflicht-Triplet `.cs` + `.Designer.cs` + aktualisierter `BazaarDbContextModelSnapshot.cs`; danach `dotnet ef migrations has-pending-model-changes` ohne Befund; beide `dotnet ef`-Befehle mit vorangestelltem `ConnectionStrings__DefaultConnection="Host=localhost;Database=design_time"` (ohne ihn bricht der Design-Time-Aufbau des `BazaarDbContext` ab). (dv-dotnet:dotnet-ef-migrations, Program.cs)
- .NET-Tests: AAA mit Kommentaren `// Arrange` / `// Act` / `// Assert`, Namen `<Methode>_<Situation>_<Erwartung>`, Moq für Interfaces, Testprojekt spiegelt Produktion 1:1; Bestand respektieren (die vorhandenen Tests nutzen xUnit-`Assert`, keine Mitläufer-Migration auf FluentAssertions). (dv-dotnet:dotnet-xunit-conventions, dv-craft:craft-unit-testing)
- TDD: kein Produktionscode ohne fehlschlagenden Test; Act ist genau eine Zeile; ein Test, ein Verhalten. (dv-craft:craft-unit-testing)
- Design: Integration-Methoden delegieren, Operation-Methoden rechnen, keine macht beides; kein `if` mit Logik im Branch; keine Verschachtelung; Komponenten sind entweder Integration (orchestriert) oder Leaf (rendert); YAGNI innerhalb des DDD-Schnitts. (dv-craft:craft-design-principles)
- Angular: Standalone-Komponenten, `ChangeDetectionStrategy.OnPush`, `input()`/`output()`/`signal()`/`computed()`; Feature-Ordner `features/<feature>/{pages,components,data}` mit Dateien `<name>.ts/.html/.scss/.spec.ts` (die Projekt-Konvention ohne `.component`-Suffix geht dem Skill vor); Grenzen `core`/`shared`/`feature` per ESLint-`boundaries`. (dv-angular:angular, dv-angular:angular-project-layout)
- Angular-Tests: Vitest (`describe`/`it`, `vi.fn()`), AAA mit Kommentaren, Namen `<methode>_<Situation>_<Erwartung>`, Act → `await fixture.whenStable()` → Assert, jede injizierte Abhängigkeit in Arrange stubben, `HttpTestingController` + `afterEach(() => httpMock.verify())` für HTTP; bestehende Test-Namen und -Stil bleiben. (dv-angular:angular-testing-vitest-conventions)
- UI nur mit PrimeNG-Komponenten; Textfelder als `pTextarea` (`TextareaModule` aus `primeng/textarea`), Buttons als `p-button`; der PrimeNG-MCP war beim Planen nicht erreichbar, die Verwendung folgt dem Bestand (`artikel-dialog.html`). (primeng:primeng-component-implementation, docs/components/overview.md)

---

### Task 1: Settings-Domain — Freitexte (Domain, EF-Mapping, Migration)

**ACs:** AC-25, AC-26

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Domain/Settings/PrintTexts.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Settings/Settings.cs:3-31` · `Settings` (Klasse)
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs:9-17` · `SettingsConfiguration.Configure`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<timestamp>_AddPrintTexts.cs` (erzeugt von `dotnet ef`)
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<timestamp>_AddPrintTexts.Designer.cs` (erzeugt von `dotnet ef`)
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/BazaarDbContextModelSnapshot.cs` · `BazaarDbContextModelSnapshot` (erzeugt von `dotnet ef`)
- Test: `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/SettingsTests.cs` · `SettingsTests`
- Create: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/SettingsRepositoryTests.cs`

**Interfaces:**
- Consumes: bestehend `Bazaar.Domain.Settings.Settings.Create(int)`, `Settings.Update(int)`, `ISettingsRepository.Get()/Update(Settings)`.
- Produces:
  - `public sealed record PrintTexts(string Text1, string Text2, string Text3, string Text4, string Text5)` in `Bazaar.Domain.Settings` mit `public const int MaxLength = 5000;`, `public static PrintTexts CreateEmpty()`, `public IEnumerable<string> All()`.
  - `Settings.AbgabeBeleg` und `Settings.VerkaeuferUebersicht` (je `PrintTexts`, `{ get; private set; }`), `void Settings.UpdatePrintTexts(PrintTexts abgabeBeleg, PrintTexts verkaeuferUebersicht)` (wirft `ArgumentNullException` bei `null`/`null`-Text, `ArgumentOutOfRangeException` bei Text länger als `PrintTexts.MaxLength`).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `SettingsTests.cs` die `using`-Zeile `using Bazaar.Domain.Settings;` oberhalb von `using SettingsAggregate = …` ergänzen und vor der schließenden Klammer der Klasse (nach `Update_WithScannerPauseMsAtBoundary_Succeeds`) einfügen:
  ```csharp
      [Fact]
      public void Create_Always_StartsWithEmptyPrintTexts()
      {
          // Arrange & Act
          var settings = SettingsAggregate.Create(3000);

          // Assert
          Assert.Equal(PrintTexts.CreateEmpty(), settings.AbgabeBeleg);
          Assert.Equal(PrintTexts.CreateEmpty(), settings.VerkaeuferUebersicht);
      }

      [Fact]
      public void UpdatePrintTexts_ValidTexts_ReplacesBothTextSets()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          var abgabeBeleg = new PrintTexts("a1", "a2", "a3", "a4", "a5");
          var verkaeuferUebersicht = new PrintTexts("v1", "v2", "v3", "v4", "v5");

          // Act
          settings.UpdatePrintTexts(abgabeBeleg, verkaeuferUebersicht);

          // Assert
          Assert.Equal(abgabeBeleg, settings.AbgabeBeleg);
          Assert.Equal(verkaeuferUebersicht, settings.VerkaeuferUebersicht);
      }

      [Fact]
      public void UpdatePrintTexts_TextLongerThanMaxLength_Throws()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          var tooLong = new PrintTexts("", "", new string('x', PrintTexts.MaxLength + 1), "", "");

          // Act & Assert
          Assert.Throws<ArgumentOutOfRangeException>(() =>
              settings.UpdatePrintTexts(tooLong, PrintTexts.CreateEmpty()));
      }

      [Fact]
      public void UpdatePrintTexts_TextAtMaxLength_Succeeds()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          var atLimit = new PrintTexts(new string('x', PrintTexts.MaxLength), "", "", "", "");

          // Act
          settings.UpdatePrintTexts(PrintTexts.CreateEmpty(), atLimit);

          // Assert
          Assert.Equal(PrintTexts.MaxLength, settings.VerkaeuferUebersicht.Text1.Length);
      }

      [Fact]
      public void UpdatePrintTexts_NullText_Throws()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          var withNull = new PrintTexts(null!, "", "", "", "");

          // Act & Assert
          Assert.Throws<ArgumentNullException>(() =>
              settings.UpdatePrintTexts(withNull, PrintTexts.CreateEmpty()));
      }
  ```
  Neue Datei `SettingsRepositoryTests.cs`:
  ```csharp
  using Bazaar.Domain.Settings;
  using Bazaar.Infrastructure.Persistence;
  using Bazaar.Infrastructure.Persistence.Repositories;
  using Microsoft.EntityFrameworkCore;
  using SettingsAggregate = Bazaar.Domain.Settings.Settings;

  namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

  public class SettingsRepositoryTests
  {
      private static BazaarDbContext CreateContext(string databaseName)
      {
          var options = new DbContextOptionsBuilder<BazaarDbContext>()
              .UseInMemoryDatabase(databaseName)
              .Options;
          return new BazaarDbContext(options);
      }

      private static async Task<SettingsAggregate> Reload(string databaseName)
      {
          await using var context = CreateContext(databaseName);
          return await new SettingsRepository(context).Get();
      }

      [Fact]
      public async Task Update_PrintTexts_PersistsBothTextSets()
      {
          // Arrange
          var cancellationToken = TestContext.Current.CancellationToken;
          var databaseName = Guid.NewGuid().ToString();
          await using (var seedContext = CreateContext(databaseName))
          {
              await seedContext.Settings.AddAsync(SettingsAggregate.Create(3000), cancellationToken);
              await seedContext.SaveChangesAsync(cancellationToken);
          }

          await using (var writeContext = CreateContext(databaseName))
          {
              var repository = new SettingsRepository(writeContext);
              var settings = await repository.Get();
              settings.UpdatePrintTexts(
                  new PrintTexts("a1", "a2", "a3", "a4", "a5"),
                  new PrintTexts("v1", "v2", "v3", "v4", "v5"));
              await repository.Update(settings);
          }

          // Act
          var reloaded = await Reload(databaseName);

          // Assert
          Assert.Equal(new PrintTexts("a1", "a2", "a3", "a4", "a5"), reloaded.AbgabeBeleg);
          Assert.Equal(new PrintTexts("v1", "v2", "v3", "v4", "v5"), reloaded.VerkaeuferUebersicht);
      }
  }
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter-class "*SettingsTests"` — erwartet: FAIL (Build-Fehler: `PrintTexts` nicht gefunden)
- [ ] **Schritt 3: Minimal implementieren**
  `Bazaar.Domain/Settings/PrintTexts.cs`:
  ```csharp
  namespace Bazaar.Domain.Settings;

  /// <summary>
  /// Die fünf Freitexte eines Belegs (Kopfzeile links/Mitte, Text über der Artikelliste,
  /// Fußzeile links/Mitte). Markdown, Darstellung und Sanitizing sind Sache des Frontends.
  /// </summary>
  public sealed record PrintTexts(string Text1, string Text2, string Text3, string Text4, string Text5)
  {
      public const int MaxLength = 5000;

      /// <summary>
      /// Immer eine neue Instanz: EF Core erlaubt nicht, dieselbe Complex-Type-Instanz
      /// in mehreren Properties oder Entities zu teilen.
      /// </summary>
      public static PrintTexts CreateEmpty() =>
          new(string.Empty, string.Empty, string.Empty, string.Empty, string.Empty);

      public IEnumerable<string> All()
      {
          yield return Text1;
          yield return Text2;
          yield return Text3;
          yield return Text4;
          yield return Text5;
      }
  }
  ```
  `Settings.cs` — Properties direkt nach `ScannerPauseMs` einfügen und Methoden vor `EnsureValidScannerPauseMs`:
  ```csharp
      public PrintTexts AbgabeBeleg { get; private set; } = PrintTexts.CreateEmpty();
      public PrintTexts VerkaeuferUebersicht { get; private set; } = PrintTexts.CreateEmpty();
  ```
  ```csharp
      public void UpdatePrintTexts(PrintTexts abgabeBeleg, PrintTexts verkaeuferUebersicht)
      {
          EnsureValidPrintTexts(abgabeBeleg);
          EnsureValidPrintTexts(verkaeuferUebersicht);
          AbgabeBeleg = abgabeBeleg with { };
          VerkaeuferUebersicht = verkaeuferUebersicht with { };
      }

      private static void EnsureValidPrintTexts(PrintTexts texts)
      {
          ArgumentNullException.ThrowIfNull(texts);
          foreach (var text in texts.All())
          {
              ArgumentNullException.ThrowIfNull(text);
              if (text.Length > PrintTexts.MaxLength) throw new ArgumentOutOfRangeException(nameof(texts));
          }
      }
  ```
  `SettingsConfiguration.cs` — `using Bazaar.Domain.Settings;` ergänzen und in `Configure` nach der `ScannerPauseMs`-Zeile:
  ```csharp
          builder.ComplexProperty(s => s.AbgabeBeleg, ConfigurePrintTexts);
          builder.ComplexProperty(s => s.VerkaeuferUebersicht, ConfigurePrintTexts);
  ```
  und als private statische Methode der Klasse:
  ```csharp
      private static void ConfigurePrintTexts(ComplexPropertyBuilder<PrintTexts> builder)
      {
          builder.Property(t => t.Text1).IsRequired().HasMaxLength(PrintTexts.MaxLength);
          builder.Property(t => t.Text2).IsRequired().HasMaxLength(PrintTexts.MaxLength);
          builder.Property(t => t.Text3).IsRequired().HasMaxLength(PrintTexts.MaxLength);
          builder.Property(t => t.Text4).IsRequired().HasMaxLength(PrintTexts.MaxLength);
          builder.Property(t => t.Text5).IsRequired().HasMaxLength(PrintTexts.MaxLength);
      }
  ```
  Migration per CLI erzeugen (Arbeitsverzeichnis `<R>/src/bazaar-app/backend`, Bash-Tool). `dotnet ef` läuft ohne Environment-Angabe als Production; `Program.cs` wirft dann beim Aufbau des `BazaarDbContext` „ConnectionStrings__DefaultConnection is missing.". Deshalb steht vor beiden `dotnet ef`-Befehlen ein Design-Time-Connection-String; eine Datenbank muss dafür nicht laufen, `migrations add` und `has-pending-model-changes` verbinden sich nicht. Keine `IDesignTimeDbContextFactory` anlegen.
  ```
  ConnectionStrings__DefaultConnection="Host=localhost;Database=design_time" dotnet ef migrations add AddPrintTexts --project Bazaar.Infrastructure --startup-project Bazaar.Api
  ```
  (PowerShell-Variante: vorher `$env:ConnectionStrings__DefaultConnection = "Host=localhost;Database=design_time"`, dann denselben Befehl ohne Präfix.) — erwartet: `Done. To undo this action, use 'ef migrations remove'`.
  Prüfen: `Migrations/<timestamp>_AddPrintTexts.cs`, `….Designer.cs` und `BazaarDbContextModelSnapshot.cs` sind neu bzw. geändert; `Up()` enthält zehn `AddColumn<string>` (`AbgabeBeleg_Text1` … `VerkaeuferUebersicht_Text5`, `maxLength: 5000`, `nullable: false`, `defaultValue: ""`), damit die vorhandene Zeile `Id = 1` gültig bleibt. Fehlt `defaultValue: ""`, die Migration mit `dotnet ef migrations remove …` verwerfen und die Konfiguration prüfen, nicht von Hand ergänzen. Danach:
  ```
  ConnectionStrings__DefaultConnection="Host=localhost;Database=design_time" dotnet ef migrations has-pending-model-changes --project Bazaar.Infrastructure --startup-project Bazaar.Api
  ```
  — erwartet: Exit 0, Meldung „No changes have been made to the model since the last migration."
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehle: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter-class "*SettingsTests"` und `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*SettingsRepositoryTests"` — erwartet: PASS (alle Tests beider Klassen)
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/backend/Bazaar.Domain/Settings/PrintTexts.cs src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/*_AddPrintTexts.cs src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/*_AddPrintTexts.Designer.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/SettingsRepositoryTests.cs` · `git commit -m "feat(settings): Freitexte für Belege in Domain und Datenbank" -- src/bazaar-app/backend/Bazaar.Domain/Settings src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs src/bazaar-app/backend/Bazaar.Infrastructure/Migrations src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/SettingsTests.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/SettingsRepositoryTests.cs`

---

### Task 2: Freitexte — Application und API (`/api/settings/print-texts`)

**ACs:** AC-25, AC-26, AC-27

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Application/Settings/PrintTextsDto.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/Settings/GetPrintTextsHandler.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/Settings/UpdatePrintTextsCommand.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/Settings/UpdatePrintTextsCommandValidator.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/Settings/UpdatePrintTextsHandler.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Features/Settings/SettingsEndpoints.cs:8-23` · `SettingsEndpoints.MapSettingsEndpoints`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs:118` · `builder.Services.AddScoped<UpdateSettingsHandler>();`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/GetPrintTextsHandlerTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/UpdatePrintTextsHandlerTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/UpdatePrintTextsCommandValidatorTests.cs`

**Interfaces:**
- Consumes (Task 1): `PrintTexts`, `Settings.AbgabeBeleg`, `Settings.VerkaeuferUebersicht`, `Settings.UpdatePrintTexts(PrintTexts, PrintTexts)`; bestehend `ISettingsRepository.Get()/Update(Settings)`.
- Produces:
  - `public sealed record PrintTextsDto(string Text1, string Text2, string Text3, string Text4, string Text5)` mit `static PrintTextsDto From(PrintTexts)` und `PrintTexts ToDomain()`.
  - `public sealed record PrintTextsResponse(PrintTextsDto AbgabeBeleg, PrintTextsDto VerkaeuferUebersicht)`.
  - `GetPrintTextsHandler(ISettingsRepository)` mit `Task<PrintTextsResponse> Handle()`.
  - `UpdatePrintTextsCommand { PrintTextsDto AbgabeBeleg; PrintTextsDto VerkaeuferUebersicht }`, `UpdatePrintTextsHandler(ISettingsRepository)` mit `Task Handle(UpdatePrintTextsCommand)`.
  - HTTP: `GET /api/settings/print-texts` (angemeldet) → `200 { abgabeBeleg: {text1..text5}, verkaeuferUebersicht: {text1..text5} }`; `PUT /api/settings/print-texts` (Policy `admin`, Validierung) mit demselben Body → `204`.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  `GetPrintTextsHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.Settings;
  using Bazaar.Domain.Ports;
  using Bazaar.Domain.Settings;
  using Moq;
  using SettingsAggregate = Bazaar.Domain.Settings.Settings;

  namespace Bazaar.Application.UnitTests.Settings;

  public class GetPrintTextsHandlerTests
  {
      private readonly Mock<ISettingsRepository> _settingsRepository = new();

      [Fact]
      public async Task Handle_StoredTexts_ReturnsBothTextSets()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          settings.UpdatePrintTexts(
              new PrintTexts("a1", "a2", "a3", "a4", "a5"),
              new PrintTexts("v1", "v2", "v3", "v4", "v5"));
          _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
          var sut = new GetPrintTextsHandler(_settingsRepository.Object);

          // Act
          var result = await sut.Handle();

          // Assert
          Assert.Equal(new PrintTextsDto("a1", "a2", "a3", "a4", "a5"), result.AbgabeBeleg);
          Assert.Equal(new PrintTextsDto("v1", "v2", "v3", "v4", "v5"), result.VerkaeuferUebersicht);
      }
  }
  ```
  `UpdatePrintTextsHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.Settings;
  using Bazaar.Domain.Ports;
  using Moq;
  using SettingsAggregate = Bazaar.Domain.Settings.Settings;

  namespace Bazaar.Application.UnitTests.Settings;

  public class UpdatePrintTextsHandlerTests
  {
      private readonly Mock<ISettingsRepository> _settingsRepository = new();

      [Fact]
      public async Task Handle_ValidCommand_UpdatesPrintTextsViaRepository()
      {
          // Arrange
          var settings = SettingsAggregate.Create(3000);
          _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
          var sut = new UpdatePrintTextsHandler(_settingsRepository.Object);
          var command = new UpdatePrintTextsCommand
          {
              AbgabeBeleg = new PrintTextsDto("a1", "a2", "a3", "a4", "a5"),
              VerkaeuferUebersicht = new PrintTextsDto("v1", "v2", "v3", "v4", "v5")
          };

          // Act
          await sut.Handle(command);

          // Assert
          Assert.Equal("a3", settings.AbgabeBeleg.Text3);
          Assert.Equal("v5", settings.VerkaeuferUebersicht.Text5);
          _settingsRepository.Verify(r => r.Update(settings), Times.Once);
      }

      [Fact]
      public async Task Handle_ValidCommand_KeepsScannerPauseMs()
      {
          // Arrange
          var settings = SettingsAggregate.Create(4200);
          _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
          var sut = new UpdatePrintTextsHandler(_settingsRepository.Object);
          var command = new UpdatePrintTextsCommand
          {
              AbgabeBeleg = new PrintTextsDto("", "", "", "", ""),
              VerkaeuferUebersicht = new PrintTextsDto("", "", "", "", "")
          };

          // Act
          await sut.Handle(command);

          // Assert
          Assert.Equal(4200, settings.ScannerPauseMs);
      }
  }
  ```
  `UpdatePrintTextsCommandValidatorTests.cs`:
  ```csharp
  using Bazaar.Application.Settings;
  using Bazaar.Domain.Settings;

  namespace Bazaar.Application.UnitTests.Settings;

  public class UpdatePrintTextsCommandValidatorTests
  {
      private readonly UpdatePrintTextsCommandValidator _sut = new();

      private static PrintTextsDto Texts(string text3 = "") => new("", "", text3, "", "");

      [Fact]
      public void Validate_AllTextsEmpty_IsValid()
      {
          // Arrange
          var command = new UpdatePrintTextsCommand { AbgabeBeleg = Texts(), VerkaeuferUebersicht = Texts() };

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.True(result.IsValid);
      }

      [Fact]
      public void Validate_TextAboveMaxLength_HasValidationErrorOnThatField()
      {
          // Arrange
          var command = new UpdatePrintTextsCommand
          {
              AbgabeBeleg = Texts(new string('x', PrintTexts.MaxLength + 1)),
              VerkaeuferUebersicht = Texts()
          };

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == "AbgabeBeleg.Text3");
      }

      [Fact]
      public void Validate_MissingTextSet_HasValidationError()
      {
          // Arrange
          var command = new UpdatePrintTextsCommand { AbgabeBeleg = null!, VerkaeuferUebersicht = Texts() };

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdatePrintTextsCommand.AbgabeBeleg));
      }
  }
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*PrintTexts*"` — erwartet: FAIL (Build-Fehler: `GetPrintTextsHandler` nicht gefunden)
- [ ] **Schritt 3: Minimal implementieren**
  `PrintTextsDto.cs`:
  ```csharp
  using Bazaar.Domain.Settings;

  namespace Bazaar.Application.Settings;

  public sealed record PrintTextsDto(string Text1, string Text2, string Text3, string Text4, string Text5)
  {
      public static PrintTextsDto From(PrintTexts texts) =>
          new(texts.Text1, texts.Text2, texts.Text3, texts.Text4, texts.Text5);

      public PrintTexts ToDomain() => new(Text1, Text2, Text3, Text4, Text5);
  }

  public sealed record PrintTextsResponse(PrintTextsDto AbgabeBeleg, PrintTextsDto VerkaeuferUebersicht);
  ```
  `GetPrintTextsHandler.cs`:
  ```csharp
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.Settings;

  public sealed class GetPrintTextsHandler(ISettingsRepository settingsRepository)
  {
      public async Task<PrintTextsResponse> Handle()
      {
          var settings = await settingsRepository.Get();
          return new PrintTextsResponse(
              PrintTextsDto.From(settings.AbgabeBeleg),
              PrintTextsDto.From(settings.VerkaeuferUebersicht));
      }
  }
  ```
  `UpdatePrintTextsCommand.cs`:
  ```csharp
  namespace Bazaar.Application.Settings;

  /// <summary>
  /// Wird direkt aus dem JSON-Body von PUT /api/settings/print-texts gebunden.
  /// Ersetzt beide Freitext-Sätze vollständig.
  /// </summary>
  public sealed class UpdatePrintTextsCommand
  {
      public PrintTextsDto AbgabeBeleg { get; set; } = null!;
      public PrintTextsDto VerkaeuferUebersicht { get; set; } = null!;
  }
  ```
  `UpdatePrintTextsCommandValidator.cs`:
  ```csharp
  using Bazaar.Domain.Settings;
  using FluentValidation;

  namespace Bazaar.Application.Settings;

  public sealed class UpdatePrintTextsCommandValidator : AbstractValidator<UpdatePrintTextsCommand>
  {
      public UpdatePrintTextsCommandValidator()
      {
          RuleFor(x => x.AbgabeBeleg).NotNull().SetValidator(new PrintTextsDtoValidator());
          RuleFor(x => x.VerkaeuferUebersicht).NotNull().SetValidator(new PrintTextsDtoValidator());
      }

      private sealed class PrintTextsDtoValidator : AbstractValidator<PrintTextsDto>
      {
          public PrintTextsDtoValidator()
          {
              RuleFor(x => x.Text1).NotNull().MaximumLength(PrintTexts.MaxLength);
              RuleFor(x => x.Text2).NotNull().MaximumLength(PrintTexts.MaxLength);
              RuleFor(x => x.Text3).NotNull().MaximumLength(PrintTexts.MaxLength);
              RuleFor(x => x.Text4).NotNull().MaximumLength(PrintTexts.MaxLength);
              RuleFor(x => x.Text5).NotNull().MaximumLength(PrintTexts.MaxLength);
          }
      }
  }
  ```
  `UpdatePrintTextsHandler.cs`:
  ```csharp
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.Settings;

  public sealed class UpdatePrintTextsHandler(ISettingsRepository settingsRepository)
  {
      public async Task Handle(UpdatePrintTextsCommand command)
      {
          var settings = await settingsRepository.Get();
          settings.UpdatePrintTexts(command.AbgabeBeleg.ToDomain(), command.VerkaeuferUebersicht.ToDomain());
          await settingsRepository.Update(settings);
      }
  }
  ```
  `SettingsEndpoints.cs` — in `MapSettingsEndpoints` vor `return app;`:
  ```csharp
          app.MapGet("/api/settings/print-texts", async (GetPrintTextsHandler handler) =>
                  Results.Ok(await handler.Handle()))
              .RequireAuthorization();

          app.MapPut("/api/settings/print-texts", async (UpdatePrintTextsCommand command, UpdatePrintTextsHandler handler) =>
          {
              await handler.Handle(command);
              return Results.NoContent();
          })
          .RequireAuthorization("admin")
          .AddEndpointFilter<ValidationFilter<UpdatePrintTextsCommand>>();
  ```
  `Program.cs` — direkt nach `builder.Services.AddScoped<UpdateSettingsHandler>();`:
  ```csharp
  builder.Services.AddScoped<GetPrintTextsHandler>();
  builder.Services.AddScoped<UpdatePrintTextsHandler>();
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehle: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*PrintTexts*"` — erwartet: PASS; danach `dv-dotnet-build --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: OK
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/backend/Bazaar.Application/Settings/PrintTextsDto.cs src/bazaar-app/backend/Bazaar.Application/Settings/GetPrintTextsHandler.cs src/bazaar-app/backend/Bazaar.Application/Settings/UpdatePrintTextsCommand.cs src/bazaar-app/backend/Bazaar.Application/Settings/UpdatePrintTextsCommandValidator.cs src/bazaar-app/backend/Bazaar.Application/Settings/UpdatePrintTextsHandler.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/GetPrintTextsHandlerTests.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/UpdatePrintTextsHandlerTests.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings/UpdatePrintTextsCommandValidatorTests.cs` · `git commit -m "feat(settings): Endpoints für die Freitexte der Belege" -- src/bazaar-app/backend/Bazaar.Application/Settings src/bazaar-app/backend/Bazaar.Api/Features/Settings/SettingsEndpoints.cs src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Settings`

---

### Task 3: Artikelliste des Verkäufers liefert Größe und Farbe

**ACs:** AC-33

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Ports/IArticlesBySellerQuery.cs:14-22` · `SellerArticleSummary`
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/ArticlesBySellerQuery.cs:15-18` · `ArticlesBySellerQuery.GetBySellerId`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Features/Sellers/Dtos.cs:87-95` · `ArticleSummaryDto`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Features/Sellers/SellerEndpoints.cs:125-131` · `SellerEndpoints.MapSellerEndpoints` (Mapping im Endpoint `GET /api/sellers/{id}/articles`)
- Test: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticlesBySellerQueryTests.cs` · `ArticlesBySellerQueryTests`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/GetSellerArticlesHandlerTests.cs` · `Handle_KnownId_DelegatesToArticlesBySellerQuery`

**Interfaces:**
- Consumes: bestehend `Article.Size`, `Article.Color` (`string?`).
- Produces: `SellerArticleSummary(string Id, int Number, string Name, string? Brand, string? Category, string? Size, string? Color, decimal Price, string Status, bool SoldManually)` und `ArticleSummaryDto` mit derselben Feldreihenfolge; JSON-Felder `size`, `color` in `GET /api/sellers/{id}/articles`.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `ArticlesBySellerQueryTests.cs` nach `GetBySellerId_ArticleWithOnlyReleasedAt_HasSellingStatus` einfügen:
  ```csharp
      [Fact]
      public async Task GetBySellerId_ArticleWithSizeAndColor_ReturnsSizeAndColor()
      {
          // Arrange
          var cancellationToken = TestContext.Current.CancellationToken;
          await using var dbContext = CreateContext();
          var now = DateTimeOffset.UtcNow;
          var article = Article.Create(
              "ART00004", 4, "SEL00001", "Jacke", "Nike", "Jacken", 20m,
              "M", "Rot", null, now, now);
          await dbContext.Articles.AddAsync(article, cancellationToken);
          await dbContext.SaveChangesAsync(cancellationToken);
          var sut = new ArticlesBySellerQuery(dbContext);

          // Act
          var result = await sut.GetBySellerId("SEL00001");

          // Assert
          var item = Assert.Single(result);
          Assert.Equal("M", item.Size);
          Assert.Equal("Rot", item.Color);
      }
  ```
  In `GetSellerArticlesHandlerTests.cs` die Zeile `new("ART001", 1043, "Winterjacke", "Nike", "Jacken", 12.00m, "sold", false)` ersetzen durch:
  ```csharp
              new("ART001", 1043, "Winterjacke", "Nike", "Jacken", "M", "Rot", 12.00m, "sold", false)
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*ArticlesBySellerQueryTests"` — erwartet: FAIL (Build-Fehler: `SellerArticleSummary` enthält keine Definition für `Size`)
- [ ] **Schritt 3: Minimal implementieren**
  `IArticlesBySellerQuery.cs` — Record ersetzen:
  ```csharp
  public sealed record SellerArticleSummary(
      string Id,
      int Number,
      string Name,
      string? Brand,
      string? Category,
      string? Size,
      string? Color,
      decimal Price,
      string Status,
      bool SoldManually);
  ```
  `ArticlesBySellerQuery.cs` — Select ersetzen:
  ```csharp
              .Select(a => new SellerArticleSummary(
                  a.Id, a.Number, a.Name, a.Brand, a.Category, a.Size, a.Color, a.Price,
                  a.Status.ToString().ToLowerInvariant(),
                  a.SoldManually))
  ```
  `Dtos.cs` — Record ersetzen:
  ```csharp
  public sealed record ArticleSummaryDto(
      string Id,
      int Number,
      string Name,
      string? Brand,
      string? Category,
      string? Size,
      string? Color,
      decimal Price,
      string Status,
      bool SoldManually);
  ```
  `SellerEndpoints.cs` — Mapping ersetzen:
  ```csharp
              return Results.Ok(articles.Select(a => new ArticleSummaryDto(
                  a.Id, a.Number, a.Name, a.Brand, a.Category, a.Size, a.Color, a.Price, a.Status, a.SoldManually)));
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehle: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*ArticlesBySellerQueryTests"`, `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*GetSellerArticlesHandlerTests"` und `dv-dotnet-build --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: PASS / OK
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(sellers): Artikelliste des Verkäufers liefert Größe und Farbe" -- src/bazaar-app/backend/Bazaar.Domain/Ports/IArticlesBySellerQuery.cs src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/ArticlesBySellerQuery.cs src/bazaar-app/backend/Bazaar.Api/Features/Sellers/Dtos.cs src/bazaar-app/backend/Bazaar.Api/Features/Sellers/SellerEndpoints.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticlesBySellerQueryTests.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Sellers/GetSellerArticlesHandlerTests.cs`

---

### Task 4: Frontend-Daten — `ArticleSummary` mit Größe/Farbe und `PrintTextsApi`

**ACs:** AC-25, AC-26, AC-33

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/data/sellers-api.ts:39-48` · `ArticleSummary`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-detail-modal/seller-detail-modal.spec.ts:28-40` · `buildArticle`
- Test: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts:62-74` · `article`
- Test: `src/bazaar-app/frontend/src/app/core/print/print.service.spec.ts:24-36` · `article`
- Create: `src/bazaar-app/frontend/src/app/features/settings/data/print-texts-api.ts`
- Create: `src/bazaar-app/frontend/src/app/features/settings/data/print-texts-api.spec.ts`

**Interfaces:**
- Consumes (Task 2/3): `GET`/`PUT /api/settings/print-texts` und `size`/`color` an `GET /api/sellers/{id}/articles`.
- Produces:
  - `ArticleSummary.size: string | null`, `ArticleSummary.color: string | null` (neu, zwischen `category` und `price`).
  - In `print-texts-api.ts`: `export const PRINT_TEXT_MAX_LENGTH = 5000;`, `export type PrintTextField = 'text1' | 'text2' | 'text3' | 'text4' | 'text5';`, `export type PrintTextSection = 'abgabeBeleg' | 'verkaeuferUebersicht';`, `export type PrintTextSet = Record<PrintTextField, string>;`, `export type PrintTexts = Record<PrintTextSection, PrintTextSet>;`, `export function emptyPrintTexts(): PrintTexts;`, `@Injectable({ providedIn: 'root' }) class PrintTextsApi { get(): Observable<PrintTexts>; update(texts: PrintTexts): Observable<void>; }`.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `print-texts-api.spec.ts`:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { provideHttpClient } from '@angular/common/http';
  import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
  import { PrintTexts, PrintTextsApi, emptyPrintTexts } from './print-texts-api';

  const PRINT_TEXTS_URL = '/api/settings/print-texts';

  describe('PrintTextsApi', () => {
    let printTextsApi: PrintTextsApi;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      printTextsApi = TestBed.inject(PrintTextsApi);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('get_always_hitsGetPrintTextsEndpoint', () => {
      // Arrange
      let received: PrintTexts | undefined;

      // Act
      printTextsApi.get().subscribe((texts) => (received = texts));
      const req = httpMock.expectOne(PRINT_TEXTS_URL);
      req.flush(emptyPrintTexts());

      // Assert
      expect(req.request.method).toBe('GET');
      expect(received).toEqual(emptyPrintTexts());
    });

    it('update_texts_sendsThemAsPutBody', () => {
      // Arrange
      const texts = emptyPrintTexts();
      texts.abgabeBeleg.text3 = '**Hinweis**';

      // Act
      printTextsApi.update(texts).subscribe();
      const req = httpMock.expectOne(PRINT_TEXTS_URL);
      req.flush(null);

      // Assert
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(texts);
    });

    it('emptyPrintTexts_always_returnsTenEmptyTextsInIndependentObjects', () => {
      // Arrange & Act
      const first = emptyPrintTexts();
      const second = emptyPrintTexts();
      first.abgabeBeleg.text1 = 'x';

      // Assert
      expect(Object.keys(first.abgabeBeleg)).toEqual(['text1', 'text2', 'text3', 'text4', 'text5']);
      expect(Object.keys(first.verkaeuferUebersicht)).toEqual(['text1', 'text2', 'text3', 'text4', 'text5']);
      expect(second.abgabeBeleg.text1).toBe('');
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/data/print-texts-api.spec.ts` — erwartet: FAIL (`./print-texts-api` nicht auflösbar)
- [ ] **Schritt 3: Minimal implementieren**
  `print-texts-api.ts`:
  ```ts
  import { Injectable, inject } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';

  /** Obergrenze je Freitext — identisch zu `PrintTexts.MaxLength` im Backend. */
  export const PRINT_TEXT_MAX_LENGTH = 5000;

  export type PrintTextField = 'text1' | 'text2' | 'text3' | 'text4' | 'text5';
  export type PrintTextSection = 'abgabeBeleg' | 'verkaeuferUebersicht';
  export type PrintTextSet = Record<PrintTextField, string>;
  export type PrintTexts = Record<PrintTextSection, PrintTextSet>;

  function emptyTextSet(): PrintTextSet {
    return { text1: '', text2: '', text3: '', text4: '', text5: '' };
  }

  export function emptyPrintTexts(): PrintTexts {
    return { abgabeBeleg: emptyTextSet(), verkaeuferUebersicht: emptyTextSet() };
  }

  /**
   * `GET`/`PUT /api/settings/print-texts` — die zehn Freitexte der Belege (Abgabe-Beleg und
   * Verkäufer-Übersicht, je fünf). Lesen darf jeder angemeldete Nutzer (der Druck braucht sie),
   * Schreiben nur ein Admin.
   */
  @Injectable({ providedIn: 'root' })
  export class PrintTextsApi {
    private readonly http = inject(HttpClient);

    get(): Observable<PrintTexts> {
      return this.http.get<PrintTexts>('/api/settings/print-texts');
    }

    update(texts: PrintTexts): Observable<void> {
      return this.http.put<void>('/api/settings/print-texts', texts);
    }
  }
  ```
  `sellers-api.ts` — in `ArticleSummary` nach `category: string | null;` ergänzen:
  ```ts
    size: string | null;
    color: string | null;
  ```
  `seller-detail-modal.spec.ts` (`buildArticle`), `settlement-page.spec.ts` (`article`) und `core/print/print.service.spec.ts` (`article`, bis Task 10 die Datei ersetzt) — jeweils nach `category: null,` ergänzen:
  ```ts
      size: null,
      color: null,
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehle: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/data/print-texts-api.spec.ts`, `… --include src/app/features/sellers/components/seller-detail-modal/seller-detail-modal.spec.ts`, `… --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` und `… --include src/app/core/print/print.service.spec.ts` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/frontend/src/app/features/settings/data/print-texts-api.ts src/bazaar-app/frontend/src/app/features/settings/data/print-texts-api.spec.ts` · `git commit -m "feat(settings): PrintTextsApi und Größe/Farbe in der Artikelliste des Verkäufers" -- src/bazaar-app/frontend/src/app/features/settings/data src/bazaar-app/frontend/src/app/features/sellers/data/sellers-api.ts src/bazaar-app/frontend/src/app/features/sellers/components/seller-detail-modal/seller-detail-modal.spec.ts src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts src/bazaar-app/frontend/src/app/core/print/print.service.spec.ts`

---

### Task 5: Einstellungen — Formular für die zehn Freitexte

**ACs:** AC-25, AC-27

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.ts`
- Create: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.html`
- Create: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.scss`
- Create: `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.ts:10-22` · `SettingsPage`
- Test: `src/bazaar-app/frontend/src/app/features/settings/pages/settings-page/settings-page.spec.ts:39-45` · `hosts app-import-panel` (Einfügestelle des neuen Tests; Provider im `providers`-Array derselben Datei)
- Create: `src/bazaar-app/frontend/src/app/app.routes.spec.ts`

**Interfaces:**
- Consumes (Task 4): `PrintTextsApi.get(): Observable<PrintTexts>`, `PrintTextsApi.update(texts: PrintTexts): Observable<void>`, `emptyPrintTexts()`, `PRINT_TEXT_MAX_LENGTH`, `PrintTextField`, `PrintTextSection`; bestehend `MessageService` (`primeng/api`), `adminGuard` (`core/auth/admin.guard`), `routes` (`app.routes.ts`).
- Produces: Komponente `PrintTextsForm` (`selector: 'app-print-texts-form'`) mit `texts: WritableSignal<PrintTexts>`, `saving: WritableSignal<boolean>`, `valueOf(section: PrintTextSection, field: PrintTextField): string`, `onChange(section: PrintTextSection, field: PrintTextField, value: string): void`, `onSave(): void`.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  `print-texts-form.spec.ts`:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { MessageService } from 'primeng/api';
  import { of, throwError } from 'rxjs';
  import { PrintTextsForm } from './print-texts-form';
  import { PrintTexts, PrintTextsApi, emptyPrintTexts } from '../../data/print-texts-api';

  describe('PrintTextsForm', () => {
    let get: ReturnType<typeof vi.fn>;
    let update: ReturnType<typeof vi.fn>;
    let messageServiceAdd: ReturnType<typeof vi.fn>;

    function storedTexts(): PrintTexts {
      const texts = emptyPrintTexts();
      texts.abgabeBeleg.text1 = 'Kopf links';
      texts.verkaeuferUebersicht.text5 = 'Fuß Mitte';
      return texts;
    }

    beforeEach(async () => {
      get = vi.fn().mockReturnValue(of(storedTexts()));
      update = vi.fn();
      messageServiceAdd = vi.fn();

      await TestBed.configureTestingModule({
        imports: [PrintTextsForm],
        providers: [
          { provide: PrintTextsApi, useValue: { get, update } },
          { provide: MessageService, useValue: { add: messageServiceAdd } },
        ],
      }).compileComponents();
    });

    async function createForm() {
      const fixture = TestBed.createComponent(PrintTextsForm);
      await fixture.whenStable();
      return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
    }

    it('template_adminOpensSettings_showsFiveTextareasPerTemplate', async () => {
      // Arrange & Act
      const { el } = await createForm();

      // Assert
      expect(el.querySelectorAll('fieldset').length).toBe(2);
      expect(el.querySelectorAll('fieldset:nth-of-type(1) textarea').length).toBe(5);
      expect(el.querySelectorAll('fieldset:nth-of-type(2) textarea').length).toBe(5);
      expect(el.querySelectorAll('textarea').length).toBe(10);
    });

    it('template_eachTemplate_showsLimitedSpaceHintBelowTheFields', async () => {
      // Arrange & Act
      const { el } = await createForm();
      const fieldsets = Array.from(el.querySelectorAll('fieldset'));

      // Assert
      fieldsets.forEach((fieldset) => {
        const hint = fieldset.querySelector('.print-texts-form__hint');
        expect(hint?.textContent).toContain('abgeschnitten');
        expect(fieldset.lastElementChild).toBe(hint);
      });
    });

    it('constructor_always_loadsStoredTextsIntoTheFields', async () => {
      // Arrange & Act
      const { component, el } = await createForm();
      const first = el.querySelector<HTMLTextAreaElement>('#abgabeBeleg-text1');

      // Assert
      expect(get).toHaveBeenCalled();
      expect(component.valueOf('abgabeBeleg', 'text1')).toBe('Kopf links');
      expect(first?.value).toBe('Kopf links');
    });

    it('onChange_editedField_changesOnlyThatField', async () => {
      // Arrange
      const { component } = await createForm();

      // Act
      component.onChange('abgabeBeleg', 'text3', '**Hinweis**');

      // Assert
      expect(component.valueOf('abgabeBeleg', 'text3')).toBe('**Hinweis**');
      expect(component.valueOf('verkaeuferUebersicht', 'text3')).toBe('');
    });

    it('onSave_validTexts_sendsAllTenTextsAndShowsSuccessToast', async () => {
      // Arrange
      update.mockReturnValue(of(undefined));
      const { component } = await createForm();
      component.onChange('abgabeBeleg', 'text3', '**Hinweis**');

      // Act
      component.onSave();

      // Assert
      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          abgabeBeleg: expect.objectContaining({ text1: 'Kopf links', text3: '**Hinweis**' }),
          verkaeuferUebersicht: expect.objectContaining({ text5: 'Fuß Mitte' }),
        }),
      );
      expect(component.saving()).toBe(false);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: '✓ Freitexte gespeichert' }),
      );
    });

    it('onSave_serverError_showsErrorToast', async () => {
      // Arrange
      update.mockReturnValue(throwError(() => new Error('boom')));
      const { component } = await createForm();

      // Act
      component.onSave();

      // Assert
      expect(component.saving()).toBe(false);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Freitexte konnten nicht gespeichert werden' }),
      );
    });

    it('constructor_loadFails_showsErrorToast', async () => {
      // Arrange
      get.mockReturnValue(throwError(() => new Error('boom')));

      // Act
      await createForm();

      // Assert
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Freitexte konnten nicht geladen werden' }),
      );
    });
  });
  ```
  In `settings-page.spec.ts`: Import `import { PrintTextsApi, emptyPrintTexts } from '../../data/print-texts-api';` ergänzen, im `providers`-Array nach der `SettingsApi`-Zeile einfügen:
  ```ts
          { provide: PrintTextsApi, useValue: { get: vi.fn().mockReturnValue(of(emptyPrintTexts())), update: vi.fn() } },
  ```
  und nach dem Test `hosts app-import-panel` einfügen:
  ```ts
    it('hosts app-print-texts-form', () => {
      const fixture = TestBed.createComponent(SettingsPage);
      fixture.detectChanges();

      const printTextsForm = fixture.nativeElement.querySelector('app-print-texts-form');
      expect(printTextsForm).not.toBeNull();
    });
  ```
  `app.routes.spec.ts` (Absicherung AC-27 — die Settings-Route gehört nur Admins, die Felder sind dort die einzige Heimat):
  ```ts
  import { Route, Routes } from '@angular/router';
  import { routes } from './app.routes';
  import { adminGuard } from './core/auth/admin.guard';

  function findRoute(candidates: Routes, path: string): Route | undefined {
    for (const candidate of candidates) {
      if (candidate.path === path) return candidate;
      const nested = candidate.children ? findRoute(candidate.children, path) : undefined;
      if (nested) return nested;
    }
    return undefined;
  }

  describe('routes', () => {
    it('settingsRoute_always_isGuardedByAdminGuard', () => {
      // Arrange & Act
      const settingsRoute = findRoute(routes, 'settings');

      // Assert
      expect(settingsRoute?.canActivate).toContain(adminGuard);
    });
  });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts` — erwartet: FAIL (`./print-texts-form` nicht auflösbar)
- [ ] **Schritt 3: Minimal implementieren**
  `print-texts-form.ts`:
  ```ts
  import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { MessageService } from 'primeng/api';
  import { ButtonModule } from 'primeng/button';
  import { TextareaModule } from 'primeng/textarea';
  import {
    PRINT_TEXT_MAX_LENGTH,
    PrintTextField,
    PrintTextSection,
    PrintTexts,
    PrintTextsApi,
    emptyPrintTexts,
  } from '../../data/print-texts-api';

  /**
   * Admin-Formular für die zehn Freitexte der Belege (Abgabe-Beleg und Verkäufer-Übersicht, je
   * Freitext 1 bis 5). Eigener Speichern-Button, eigener Endpoint — unabhängig vom
   * `settings-form` (Scan-Pause). Die Route `/settings` trägt bereits `adminGuard`, deshalb
   * prüft diese Komponente die Rolle nicht erneut.
   */
  @Component({
    selector: 'app-print-texts-form',
    imports: [FormsModule, ButtonModule, TextareaModule],
    templateUrl: './print-texts-form.html',
    styleUrl: './print-texts-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class PrintTextsForm {
    private readonly printTextsApi = inject(PrintTextsApi);
    private readonly messageService = inject(MessageService);

    readonly maxLength = PRINT_TEXT_MAX_LENGTH;
    readonly sections: readonly { key: PrintTextSection; title: string }[] = [
      { key: 'abgabeBeleg', title: 'Abgabe-Beleg' },
      { key: 'verkaeuferUebersicht', title: 'Verkäufer-Übersicht' },
    ];
    readonly fields: readonly { key: PrintTextField; label: string }[] = [
      { key: 'text1', label: 'Freitext 1 (Kopfzeile links)' },
      { key: 'text2', label: 'Freitext 2 (Kopfzeile Mitte)' },
      { key: 'text3', label: 'Freitext 3 (über der Artikelliste)' },
      { key: 'text4', label: 'Freitext 4 (Fußzeile links)' },
      { key: 'text5', label: 'Freitext 5 (Fußzeile Mitte)' },
    ];
    readonly helpText =
      'Markdown: Überschriften, Fett, Kursiv, Absätze, Listen und Tabellen. Links, Bilder und HTML werden nicht dargestellt. Änderungen gelten ab dem nächsten Druck.';
    readonly spaceHint =
      'Der Platz auf dem Beleg ist begrenzt: Freitext 1, 2, 4 und 5 fassen nur wenige Zeilen in Kopf- bzw. Fußzeile, Freitext 3 höchstens 15 cm über der Artikelliste. Längerer Text wird beim Druck abgeschnitten.';

    readonly texts = signal<PrintTexts>(emptyPrintTexts());
    readonly saving = signal(false);

    constructor() {
      this.printTextsApi.get().subscribe({
        next: (texts) => this.texts.set(texts),
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Freitexte konnten nicht geladen werden',
          }),
      });
    }

    valueOf(section: PrintTextSection, field: PrintTextField): string {
      return this.texts()[section][field];
    }

    onChange(section: PrintTextSection, field: PrintTextField, value: string): void {
      this.texts.update((current) => ({
        ...current,
        [section]: { ...current[section], [field]: value },
      }));
    }

    onSave(): void {
      this.saving.set(true);
      this.printTextsApi.update(this.texts()).subscribe({
        next: () => {
          this.saving.set(false);
          this.messageService.add({ severity: 'success', summary: '✓ Freitexte gespeichert' });
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Freitexte konnten nicht gespeichert werden',
          });
        },
      });
    }
  }
  ```
  `print-texts-form.html`:
  ```html
  <div class="print-texts-form">
    <h3 class="print-texts-form__title">Freitexte der Belege</h3>
    <p class="print-texts-form__help">{{ helpText }}</p>

    @for (section of sections; track section.key) {
      <fieldset class="print-texts-form__section">
        <legend>{{ section.title }}</legend>
        @for (field of fields; track field.key) {
          <div class="print-texts-form__field">
            <label [for]="section.key + '-' + field.key">{{ field.label }}</label>
            <textarea
              pTextarea
              rows="3"
              [id]="section.key + '-' + field.key"
              [attr.maxlength]="maxLength"
              [ngModel]="valueOf(section.key, field.key)"
              (ngModelChange)="onChange(section.key, field.key, $event)"
            ></textarea>
          </div>
        }
        <p class="print-texts-form__hint">{{ spaceHint }}</p>
      </fieldset>
    }

    <p-button label="Freitexte speichern" [disabled]="saving()" (onClick)="onSave()" />
  </div>
  ```
  `print-texts-form.scss`:
  ```scss
  .print-texts-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;

    &__title {
      margin: 0;
    }

    &__help,
    &__hint {
      margin: 0;
      color: var(--p-text-muted-color);
      font-size: 0.875rem;
    }

    &__section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    &__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
  }
  ```
  `settings-page.ts` — Import und Verwendung:
  ```ts
  import { PrintTextsForm } from '../../components/print-texts-form/print-texts-form';
  ```
  `imports: [SettingsForm, PrintTextsForm, ImportPanel, UserManagement, DevToolsPanel, Page]` und im Template `<app-settings-form /><app-print-texts-form /><app-import-panel /><app-user-management /><app-dev-tools-panel />`.
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehle: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts`, `… --include src/app/features/settings/pages/settings-page/settings-page.spec.ts`, `… --include src/app/app.routes.spec.ts` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.ts src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.html src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.scss src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.spec.ts src/bazaar-app/frontend/src/app/app.routes.spec.ts` · `git commit -m "feat(settings): Formular für die Freitexte der Belege" -- src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form src/bazaar-app/frontend/src/app/features/settings/pages/settings-page src/bazaar-app/frontend/src/app/app.routes.spec.ts`

---

### Task 6: Markdown-Rendering für Freitexte

**ACs:** AC-18, AC-19

**Dateien:**
- Modify: `src/bazaar-app/frontend/package.json` · `dependencies`
- Modify: `src/bazaar-app/frontend/package-lock.json` · `"packages"` (Einträge für `marked` erzeugt von `npm install`, nicht von Hand)
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.markdown.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.markdown.spec.ts`

**Interfaces:**
- Consumes: Paket `marked` 18.1.1 (`Marked`-Klasse, Renderer-Methoden `html`, `link`, `image` mit Token-Objekten, `this.parser.parseInline(tokens)`).
- Produces: `export function renderPrintMarkdown(source: string): string` — HTML für Überschriften, Fett, Kursiv, Absätze, Listen und Tabellen; leerer/Whitespace-Text → `''`; Links werden zu ihrem Text, Bilder zu ihrem Alt-Text, HTML wird als Text maskiert.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  Abhängigkeit installieren (im Verzeichnis `<R>/src/bazaar-app/frontend`; erst jetzt, damit der Test-Import auflösbar ist):
  ```
  npm install marked@18.1.1 --save-exact
  ```
  `print-document.markdown.spec.ts`:
  ```ts
  import { renderPrintMarkdown } from './print-document.markdown';

  describe('renderPrintMarkdown', () => {
    it('renderPrintMarkdown_headingBoldItalicListAndTable_rendersAllFiveAsHtml', () => {
      // Arrange
      const source = [
        '# Titel',
        '',
        '**fett** und *kursiv*',
        '',
        '- Punkt eins',
        '- Punkt zwei',
        '',
        '| A | B |',
        '|---|---|',
        '| 1 | 2 |',
      ].join('\n');

      // Act
      const html = renderPrintMarkdown(source);

      // Assert
      expect(html).toContain('<h1>Titel</h1>');
      expect(html).toContain('<strong>fett</strong>');
      expect(html).toContain('<em>kursiv</em>');
      expect(html).toContain('<li>Punkt eins</li>');
      expect(html).toContain('<table>');
      expect(html).toContain('<td>1</td>');
    });

    it('renderPrintMarkdown_twoParagraphs_rendersTwoParagraphElements', () => {
      // Arrange & Act
      const html = renderPrintMarkdown('Erster Absatz\n\nZweiter Absatz');

      // Assert
      expect(html).toContain('<p>Erster Absatz</p>');
      expect(html).toContain('<p>Zweiter Absatz</p>');
    });

    it('renderPrintMarkdown_link_rendersTextWithoutAnchor', () => {
      // Arrange & Act
      const html = renderPrintMarkdown('Siehe [unsere Seite](https://example.org) hier');

      // Assert
      expect(html).not.toContain('<a');
      expect(html).not.toContain('href');
      expect(html).toContain('unsere Seite');
    });

    it('renderPrintMarkdown_image_rendersNoImageElement', () => {
      // Arrange & Act
      const html = renderPrintMarkdown('![Logo](https://example.org/logo.png)');

      // Assert
      expect(html).not.toContain('<img');
      expect(html).not.toContain('logo.png');
    });

    it('renderPrintMarkdown_inlineHtmlAndScript_escapesTheTags', () => {
      // Arrange & Act
      const html = renderPrintMarkdown('Text <b>fett</b> <script>alert(1)</script>');

      // Assert
      expect(html).not.toContain('<b>');
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;b&gt;');
      expect(html).toContain('&lt;script&gt;');
    });

    it('renderPrintMarkdown_blockHtml_escapesTheTags', () => {
      // Arrange & Act
      const html = renderPrintMarkdown('<div onclick="x()">Block</div>');

      // Assert
      expect(html).not.toContain('<div');
      expect(html).toContain('&lt;div');
    });

    it('renderPrintMarkdown_emptyOrWhitespace_returnsEmptyString', () => {
      // Arrange & Act & Assert
      expect(renderPrintMarkdown('')).toBe('');
      expect(renderPrintMarkdown('  \n ')).toBe('');
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.markdown.spec.ts` — erwartet: FAIL (`./print-document.markdown` nicht auflösbar)
- [ ] **Schritt 3: Minimal implementieren**
  `print-document.markdown.ts`:
  ```ts
  import { Marked } from 'marked';

  function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Freitexte erlauben Überschriften, Fett, Kursiv, Absätze, Listen und Tabellen — keine Links,
   * Bilder oder HTML. Rohes HTML wird als Text maskiert, ein Link wird zu seinem Text, ein Bild zu
   * seinem Alt-Text. Das Ergebnis geht zusätzlich durch Angulars Sanitizer (`[innerHTML]`).
   */
  const markdown = new Marked({
    gfm: true,
    async: false,
    renderer: {
      html({ text }) {
        return escapeHtml(text);
      },
      link({ tokens }) {
        return this.parser.parseInline(tokens);
      },
      image({ text }) {
        return escapeHtml(text);
      },
    },
  });

  export function renderPrintMarkdown(source: string): string {
    if (!source.trim()) {
      return '';
    }
    return markdown.parse(source, { async: false });
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.markdown.spec.ts` — erwartet: PASS (7 Tests)
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.markdown.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.markdown.spec.ts` · `git commit -m "feat(print): Markdown-Rendering für die Freitexte der Belege" -- src/bazaar-app/frontend/package.json src/bazaar-app/frontend/package-lock.json src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.markdown.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.markdown.spec.ts`

---

### Task 7: Seitenmaße und Paginierung des Druckdokuments

**ACs:** AC-17, AC-22

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.layout.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.layout.spec.ts`

**Interfaces:**
- Consumes: —
- Produces (alles aus `print-document.layout.ts`):
  - `PRINT_LAYOUT` (`as const`, Maße in mm): `pageWidthMm: 210`, `pageHeightMm: 296`, `paddingMm: 10`, `headerMm: 18`, `sellerBlockMm: 36`, `tileRowAMm: 20`, `tileRowBMm: 10`, `continuationMm: 8`, `footerMm: 14`, `tableHeadMm: 7`, `rowMm: 7`, `safetyMm: 2`, `maxFreitext3Mm: 150` (Obergrenze für Freitext 3 auf Seite 1; damit bleiben auf Seite 1 mindestens zwei Tabellenzeilen).
  - `PX_PER_MM: number` (= 96 / 25.4).
  - `firstPageListHeightMm(freitext3Mm: number): number`, `restPageListHeightMm(): number`, `listCapacityRows(listHeightMm: number): number`.
  - `paginateRows<T>(rows: readonly T[], firstCapacity: number, restCapacity: number, isHeading?: (row: T) => boolean): T[][]` — liefert immer mindestens eine Seite; eine Überschrift steht nie als letzte Zeile einer Seite, wenn danach noch Zeilen folgen (außer sie wäre die einzige Zeile der Seite).

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `print-document.layout.spec.ts`:
  ```ts
  import {
    PRINT_LAYOUT,
    firstPageListHeightMm,
    listCapacityRows,
    paginateRows,
    restPageListHeightMm,
  } from './print-document.layout';

  describe('PRINT_LAYOUT', () => {
    it('tileRowBMm_always_isHalfAsHighAsTileRowAMm', () => {
      // Arrange & Act & Assert
      expect(PRINT_LAYOUT.tileRowBMm).toBe(PRINT_LAYOUT.tileRowAMm / 2);
    });
  });

  describe('list heights', () => {
    it('firstPageListHeightMm_noFreitext3_isInnerHeightMinusFixedBlocks', () => {
      // Arrange & Act
      const height = firstPageListHeightMm(0);

      // Assert
      expect(height).toBe(178);
    });

    it('firstPageListHeightMm_freitext3Present_shrinksByItsHeight', () => {
      // Arrange & Act
      const height = firstPageListHeightMm(30);

      // Assert
      expect(height).toBe(148);
    });

    it('restPageListHeightMm_always_isInnerHeightMinusHeaderContinuationAndFooter', () => {
      // Arrange & Act
      const height = restPageListHeightMm();

      // Assert
      expect(height).toBe(236);
    });
  });

  describe('listCapacityRows', () => {
    it('listCapacityRows_firstPageWithoutFreitext3_fitsTwentyFourRows', () => {
      // Arrange & Act
      const rows = listCapacityRows(firstPageListHeightMm(0));

      // Assert
      expect(rows).toBe(24);
    });

    it('listCapacityRows_followingPage_fitsThirtyTwoRows', () => {
      // Arrange & Act
      const rows = listCapacityRows(restPageListHeightMm());

      // Assert
      expect(rows).toBe(32);
    });

    it('listCapacityRows_firstPageWithMaxFreitext3_keepsAtLeastOneRow', () => {
      // Arrange & Act
      const rows = listCapacityRows(firstPageListHeightMm(PRINT_LAYOUT.maxFreitext3Mm));

      // Assert
      expect(rows).toBeGreaterThanOrEqual(1);
    });

    it('listCapacityRows_heightSmallerThanTableHead_isZero', () => {
      // Arrange & Act
      const rows = listCapacityRows(5);

      // Assert
      expect(rows).toBe(0);
    });
  });

  describe('paginateRows', () => {
    it('paginateRows_noRows_yieldsOneEmptyPage', () => {
      // Arrange & Act
      const pages = paginateRows<number>([], 10, 20);

      // Assert
      expect(pages).toEqual([[]]);
    });

    it('paginateRows_moreRowsThanFirstCapacity_continuesOnRestPages', () => {
      // Arrange & Act
      const pages = paginateRows([1, 2, 3, 4, 5], 2, 2);

      // Assert
      expect(pages).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('paginateRows_firstCapacityZero_startsWithEmptyFirstPage', () => {
      // Arrange & Act
      const pages = paginateRows([1, 2, 3], 0, 2);

      // Assert
      expect(pages).toEqual([[], [1, 2], [3]]);
    });

    it('paginateRows_headingWouldEndAPage_movesHeadingToNextPage', () => {
      // Arrange
      const rows = ['H1', 'a', 'b', 'H2', 'c'];

      // Act
      const pages = paginateRows(rows, 4, 4, (row) => row.startsWith('H'));

      // Assert
      expect(pages).toEqual([['H1', 'a', 'b'], ['H2', 'c']]);
    });

    it('paginateRows_headingIsOnlyRowOfCapacityOnePage_terminatesAndKeepsIt', () => {
      // Arrange
      const rows = ['H1', 'a'];

      // Act
      const pages = paginateRows(rows, 1, 1, (row) => row.startsWith('H'));

      // Assert
      expect(pages).toEqual([['H1'], ['a']]);
    });

    it('paginateRows_eightyOneRowsWithDefaultCapacities_needsThreePages', () => {
      // Arrange
      const rows = Array.from({ length: 81 }, (_, index) => index);

      // Act
      const pages = paginateRows(rows, 24, 32);

      // Assert
      expect(pages.map((page) => page.length)).toEqual([24, 32, 25]);
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.layout.spec.ts` — erwartet: FAIL (`./print-document.layout` nicht auflösbar)
- [ ] **Schritt 3: Minimal implementieren**
  `print-document.layout.ts`:
  ```ts
  /**
   * Feste Maße des Druckdokuments in Millimetern. Kopf, Verkäufer-Block, Kennzahl-Kachel-Zeilen,
   * Fortsetzungszeile und Fußzeile haben feste Höhen; nur Freitext 3 ist variabel und wird zur
   * Laufzeit gemessen. Daraus ergibt sich, wie viele Tabellenzeilen auf eine Seite passen — die
   * Seitenaufteilung geschieht selbst, weil `counter(pages)`/Margin-Boxes unter iOS/Safari fehlen
   * und „Seite x von y" auf allen Geräten stehen muss.
   *
   * `pageHeightMm` liegt bewusst 1 mm unter 297 mm: eine Seite mit exakt A4-Höhe erzeugt durch
   * Rundung gelegentlich eine zusätzliche leere Seite.
   *
   * `maxFreitext3Mm` begrenzt Freitext 3 (bis 5000 Zeichen erlaubt): Ein längerer Text wird
   * abgeschnitten, statt Artikelliste und Fußzeile von Seite 1 zu verdrängen. 150 mm lassen
   * 28 mm Listenbereich, also Tabellenkopf und zwei Zeilen.
   */
  export const PRINT_LAYOUT = {
    pageWidthMm: 210,
    pageHeightMm: 296,
    paddingMm: 10,
    headerMm: 18,
    sellerBlockMm: 36,
    tileRowAMm: 20,
    tileRowBMm: 10,
    continuationMm: 8,
    footerMm: 14,
    tableHeadMm: 7,
    rowMm: 7,
    safetyMm: 2,
    maxFreitext3Mm: 150,
  } as const;

  /** CSS rechnet 1 mm immer mit 96 / 25,4 px — auf dem Bildschirm wie im Druck. */
  export const PX_PER_MM = 96 / 25.4;

  function innerHeightMm(): number {
    return PRINT_LAYOUT.pageHeightMm - 2 * PRINT_LAYOUT.paddingMm;
  }

  /** Höhe des Listenbereichs auf Seite 1, abhängig von der gemessenen Höhe von Freitext 3. */
  export function firstPageListHeightMm(freitext3Mm: number): number {
    const { headerMm, sellerBlockMm, tileRowAMm, tileRowBMm, footerMm } = PRINT_LAYOUT;
    return (
      innerHeightMm() - headerMm - sellerBlockMm - tileRowAMm - tileRowBMm - freitext3Mm - footerMm
    );
  }

  /** Höhe des Listenbereichs ab Seite 2: Kopfzeile, Fortsetzungszeile, Liste, Fußzeile. */
  export function restPageListHeightMm(): number {
    const { headerMm, continuationMm, footerMm } = PRINT_LAYOUT;
    return innerHeightMm() - headerMm - continuationMm - footerMm;
  }

  /** Anzahl Zeilen, die unter dem Tabellenkopf in einen Listenbereich der Höhe `listHeightMm` passen. */
  export function listCapacityRows(listHeightMm: number): number {
    const { tableHeadMm, safetyMm, rowMm } = PRINT_LAYOUT;
    return Math.max(0, Math.floor((listHeightMm - tableHeadMm - safetyMm) / rowMm));
  }

  /**
   * Verteilt Zeilen auf Seiten. Eine Gruppenüberschrift steht nie allein am Seitenende: Würde sie
   * die letzte Zeile einer Seite, rückt sie auf die nächste Seite (außer sie wäre dort die einzige
   * Zeile, sonst käme die Schleife nicht voran).
   */
  export function paginateRows<T>(
    rows: readonly T[],
    firstCapacity: number,
    restCapacity: number,
    isHeading: (row: T) => boolean = () => false,
  ): T[][] {
    const pages: T[][] = [];
    const rest = Math.max(1, restCapacity);
    let capacity = Math.max(0, firstCapacity);
    let start = 0;

    do {
      let end = Math.min(rows.length, start + capacity);
      const headingWouldEndPage = end < rows.length && end - start > 1 && isHeading(rows[end - 1]);
      if (headingWouldEndPage) {
        end -= 1;
      }
      pages.push(rows.slice(start, end));
      start = end;
      capacity = rest;
    } while (start < rows.length);

    return pages;
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.layout.spec.ts` — erwartet: PASS (14 Tests)
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.layout.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.layout.spec.ts` · `git commit -m "feat(print): Seitenmaße und Paginierung des Druckdokuments" -- src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.layout.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.layout.spec.ts`

---

### Task 8: Dokumentmodell und Builder für Abgabe-Beleg und Verkäufer-Übersicht

**ACs:** AC-04, AC-09, AC-10, AC-15, AC-16, AC-29, AC-30, AC-31

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.spec.ts`

**Interfaces:**
- Consumes: —
- Produces (alles aus `print-document.model.ts`):
  - `interface PrintSeller { id: string; firstName: string; lastName: string; address: string | null; postalCode: string | null; city: string | null }`
  - `interface PrintArticle { number: number; name: string; category: string | null; brand: string | null; size: string | null; color: string | null; price: number; status: string }`
  - `interface PrintFreitexts { text1: string; text2: string; text3: string; text4: string; text5: string }` (Freitext 1/2 Kopfzeile links/Mitte, 3 über der Artikelliste, 4/5 Fußzeile links/Mitte)
  - `interface PrintTile { title: string; value: string }`
  - `type PrintArticleStatus = 'registered' | 'selling' | 'sold' | 'returned'`; `interface PrintGroup { status: PrintArticleStatus; label: string; articles: PrintArticle[] }`
  - `type PrintRow = { kind: 'group'; label: string; count: number } | { kind: 'article'; article: PrintArticle }`
  - `interface PrintDocumentModel { seller: PrintSeller; printedAt: Date; freitexts: PrintFreitexts; tilesA: PrintTile[]; tilesB: PrintTile[]; groups: PrintGroup[] }`
  - `groupArticles(articles: PrintArticle[]): PrintGroup[]` (Reihenfolge „Registriert", „Im Verkauf", „Verkauft", „Zurückgegeben"; nur nicht-leere Gruppen; Nummer aufsteigend), `flattenGroups(groups: PrintGroup[]): PrintRow[]`
  - `formatCurrency(value: number): string` (de-DE, EUR), `formatPercent(value: number): string` (z. B. `20 %`); die Doku beider Funktionen nennt die gleichartigen Kopien in `settlement-panel.ts`, `verkaeufer-dialog.ts`, `statistics-page.ts` und verweist ihre Zusammenführung auf ein eigenes Folge-Refactoring
  - `interface AbgabeBelegInput { seller: PrintSeller; articles: PrintArticle[]; freitexts: PrintFreitexts; feePerItem: number; commissionRate: number; printedAt: Date }` und `buildAbgabeBelegModel(input: AbgabeBelegInput): PrintDocumentModel`
  - `interface VerkaeuferUebersichtInput { seller: PrintSeller; articles: PrintArticle[]; freitexts: PrintFreitexts; feePerItem: number; settlement: { revenue: number; commission: number; payout: number; commissionRate: number }; printedAt: Date }` und `buildVerkaeuferUebersichtModel(input: VerkaeuferUebersichtInput): PrintDocumentModel` (lässt „Registriert"-Artikel weg)

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `print-document.model.spec.ts`:
  ```ts
  import {
    PrintArticle,
    PrintFreitexts,
    PrintSeller,
    PrintTile,
    buildAbgabeBelegModel,
    buildVerkaeuferUebersichtModel,
    flattenGroups,
    groupArticles,
  } from './print-document.model';

  const seller: PrintSeller = {
    id: 'a3f9c2d1',
    firstName: 'Anna',
    lastName: 'Meier',
    address: 'Musterstraße 5',
    postalCode: '76133',
    city: 'Karlsruhe',
  };
  const noTexts: PrintFreitexts = { text1: '', text2: '', text3: '', text4: '', text5: '' };
  const printedAt = new Date(2026, 9, 14, 9, 30);

  function article(number: number, status: string, price = 10): PrintArticle {
    return {
      number,
      name: `Artikel ${number}`,
      category: 'Jacken',
      brand: 'Nike',
      size: 'M',
      color: 'Rot',
      price,
      status,
    };
  }

  /** Währungsformat nutzt ein geschütztes Leerzeichen vor „€"; Tests vergleichen mit normalem. */
  function plain(text: string): string {
    return text.replace(/ /g, ' ');
  }

  function tile(tiles: PrintTile[], title: string): PrintTile | undefined {
    return tiles.find((candidate) => plain(candidate.title) === title);
  }

  describe('groupArticles', () => {
    it('groupArticles_allStatuses_ordersGroupsAsSpecified', () => {
      // Arrange
      const articles = [
        article(1, 'returned'),
        article(2, 'sold'),
        article(3, 'selling'),
        article(4, 'registered'),
      ];

      // Act
      const groups = groupArticles(articles);

      // Assert
      expect(groups.map((group) => group.label)).toEqual([
        'Registriert',
        'Im Verkauf',
        'Verkauft',
        'Zurückgegeben',
      ]);
    });

    it('groupArticles_unsortedNumbersInOneGroup_sortsAscending', () => {
      // Arrange
      const articles = [article(12, 'selling'), article(5, 'selling'), article(9, 'selling')];

      // Act
      const groups = groupArticles(articles);

      // Assert
      expect(groups[0].articles.map((entry) => entry.number)).toEqual([5, 9, 12]);
    });

    it('groupArticles_groupWithoutArticles_isOmitted', () => {
      // Arrange
      const articles = [article(1, 'sold')];

      // Act
      const groups = groupArticles(articles);

      // Assert
      expect(groups.map((group) => group.status)).toEqual(['sold']);
    });
  });

  describe('flattenGroups', () => {
    it('flattenGroups_twoGroups_putsEachGroupRowBeforeItsArticles', () => {
      // Arrange
      const groups = groupArticles([article(1, 'selling'), article(2, 'sold')]);

      // Act
      const rows = flattenGroups(groups);

      // Assert
      expect(rows.map((row) => (row.kind === 'group' ? `G:${row.label}:${row.count}` : `A:${row.article.number}`))).toEqual([
        'G:Im Verkauf:1',
        'A:1',
        'G:Verkauft:1',
        'A:2',
      ]);
    });
  });

  describe('buildAbgabeBelegModel', () => {
    function build(articles: PrintArticle[], feePerItem = 0.5, commissionRate = 20) {
      return buildAbgabeBelegModel({ seller, articles, freitexts: noTexts, feePerItem, commissionRate, printedAt });
    }

    it('buildAbgabeBelegModel_always_putsSellerIdAndCountInRowA', () => {
      // Arrange & Act
      const model = build([article(1, 'selling'), article(2, 'selling')]);

      // Assert
      expect(model.tilesA.map((entry) => entry.title)).toEqual(['Verkäufer-ID', 'Anzahl abgegebener Artikel']);
      expect(tile(model.tilesA, 'Verkäufer-ID')?.value).toBe('a3f9c2d1');
      expect(tile(model.tilesA, 'Anzahl abgegebener Artikel')?.value).toBe('2');
    });

    it('buildAbgabeBelegModel_fourArticlesAndFeeFiftyCent_showsCalculatedFeeTile', () => {
      // Arrange
      const articles = [1, 2, 3, 4].map((number) => article(number, 'selling'));

      // Act
      const model = build(articles, 0.5);

      // Assert
      const fee = model.tilesB[0];
      expect(plain(fee.title)).toBe('Gebühr 0,50 € / Artikel');
      expect(plain(fee.value)).toBe('2,00 €');
    });

    it('buildAbgabeBelegModel_commissionRateTwentyPercent_showsRateInProvisionTile', () => {
      // Arrange & Act
      const model = build([article(1, 'selling')], 0.5, 20);

      // Assert
      expect(model.tilesB[1]).toEqual({ title: 'Provision', value: '20 %' });
    });

    it('buildAbgabeBelegModel_noArticles_showsZeroCountAndZeroFee', () => {
      // Arrange & Act
      const model = build([]);

      // Assert
      expect(tile(model.tilesA, 'Anzahl abgegebener Artikel')?.value).toBe('0');
      expect(plain(model.tilesB[0].value)).toBe('0,00 €');
      expect(model.groups).toEqual([]);
    });

    it('buildAbgabeBelegModel_registeredArticles_keepsRegistriertGroup', () => {
      // Arrange & Act
      const model = build([article(1, 'registered'), article(2, 'registered'), article(3, 'registered')]);

      // Assert
      expect(model.groups.map((group) => `${group.label}:${group.articles.length}`)).toEqual(['Registriert:3']);
    });
  });

  describe('buildVerkaeuferUebersichtModel', () => {
    function build(articles: PrintArticle[]) {
      return buildVerkaeuferUebersichtModel({
        seller,
        articles,
        freitexts: noTexts,
        feePerItem: 0.5,
        settlement: { revenue: 200, commission: 40, payout: 160, commissionRate: 20 },
        printedAt,
      });
    }

    it('buildVerkaeuferUebersichtModel_always_hasTheFiveTilesOfRowAAndThreeOfRowB', () => {
      // Arrange & Act
      const model = build([article(1, 'selling')]);

      // Assert
      expect(model.tilesA.map((entry) => entry.title)).toEqual([
        'Verkäufer-ID',
        'Anzahl abgegebener Artikel',
        'Anzahl offener Artikel',
        'Anzahl verkaufter Artikel',
        'Einnahmen',
      ]);
      expect(model.tilesB.map((entry) => plain(entry.title))).toEqual([
        'Gebühr 0,50 € / Artikel',
        'Provision 20 %',
        'Verdienst',
      ]);
    });

    it('buildVerkaeuferUebersichtModel_revenue200AndRate20_showsRevenueCommissionAndEarnings', () => {
      // Arrange & Act
      const model = build([article(1, 'sold')]);

      // Assert
      expect(plain(tile(model.tilesA, 'Einnahmen')?.value ?? '')).toBe('200,00 €');
      expect(plain(tile(model.tilesB, 'Provision 20 %')?.value ?? '')).toBe('40,00 €');
      expect(plain(tile(model.tilesB, 'Verdienst')?.value ?? '')).toBe('160,00 €');
    });

    it('buildVerkaeuferUebersichtModel_selling3Sold2Registered2_countsAndOmitsRegistered', () => {
      // Arrange
      const articles = [
        article(1, 'selling'),
        article(2, 'selling'),
        article(3, 'selling'),
        article(4, 'sold'),
        article(5, 'sold'),
        article(6, 'registered'),
        article(7, 'registered'),
      ];

      // Act
      const model = build(articles);

      // Assert
      expect(tile(model.tilesA, 'Anzahl offener Artikel')?.value).toBe('3');
      expect(tile(model.tilesA, 'Anzahl verkaufter Artikel')?.value).toBe('2');
      expect(tile(model.tilesA, 'Anzahl abgegebener Artikel')?.value).toBe('5');
      expect(model.groups.map((group) => group.label)).toEqual(['Im Verkauf', 'Verkauft']);
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.model.spec.ts` — erwartet: FAIL (`./print-document.model` nicht auflösbar)
- [ ] **Schritt 3: Minimal implementieren**
  `print-document.model.ts`:
  ```ts
  export interface PrintSeller {
    id: string;
    firstName: string;
    lastName: string;
    address: string | null;
    postalCode: string | null;
    city: string | null;
  }

  /** Eine Artikelzeile der Druck-Tabelle (Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis). */
  export interface PrintArticle {
    number: number;
    name: string;
    category: string | null;
    brand: string | null;
    size: string | null;
    color: string | null;
    price: number;
    status: string;
  }

  /** Freitext 1/2: Kopfzeile links/Mitte · 3: über der Artikelliste · 4/5: Fußzeile links/Mitte (Markdown). */
  export interface PrintFreitexts {
    text1: string;
    text2: string;
    text3: string;
    text4: string;
    text5: string;
  }

  /** Kennzahl-Kachel: Titel links oben, darunter der größere Wert. */
  export interface PrintTile {
    title: string;
    value: string;
  }

  export type PrintArticleStatus = 'registered' | 'selling' | 'sold' | 'returned';

  export interface PrintGroup {
    status: PrintArticleStatus;
    label: string;
    articles: PrintArticle[];
  }

  export type PrintRow =
    | { kind: 'group'; label: string; count: number }
    | { kind: 'article'; article: PrintArticle };

  export interface PrintDocumentModel {
    seller: PrintSeller;
    printedAt: Date;
    freitexts: PrintFreitexts;
    tilesA: PrintTile[];
    tilesB: PrintTile[];
    groups: PrintGroup[];
  }

  const GROUP_ORDER: readonly { status: PrintArticleStatus; label: string }[] = [
    { status: 'registered', label: 'Registriert' },
    { status: 'selling', label: 'Im Verkauf' },
    { status: 'sold', label: 'Verkauft' },
    { status: 'returned', label: 'Zurückgegeben' },
  ];

  const REGISTERED_STATUS: PrintArticleStatus = 'registered';

  /**
   * de-DE ohne `CurrencyPipe`/`LOCALE_ID` (im Projekt ist keine Locale registriert).
   *
   * Gilt für die Druckdokumente. Gleichartige private Kopien stehen noch in `settlement-panel.ts`,
   * `verkaeufer-dialog.ts` und `statistics-page.ts`; sie in eine gemeinsame Hilfsfunktion
   * zusammenzuführen ist ein eigenes Folge-Refactoring und nicht Teil dieser Änderung.
   */
  export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }

  /**
   * Der Satz kommt schon in Prozent (12,5 heißt „12,5 %"), nicht als Bruch 0,125.
   *
   * Gleichartige private Kopien stehen noch in `verkaeufer-dialog.ts` und `statistics-page.ts`;
   * Zusammenführung wie bei `formatCurrency` als eigenes Folge-Refactoring.
   */
  export function formatPercent(value: number): string {
    return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 }).format(value)} %`;
  }

  export function groupArticles(articles: PrintArticle[]): PrintGroup[] {
    return GROUP_ORDER.map(({ status, label }) => ({
      status,
      label,
      articles: articles
        .filter((entry) => entry.status === status)
        .sort((left, right) => left.number - right.number),
    })).filter((group) => group.articles.length > 0);
  }

  export function flattenGroups(groups: PrintGroup[]): PrintRow[] {
    return groups.flatMap((group): PrintRow[] => [
      { kind: 'group', label: group.label, count: group.articles.length },
      ...group.articles.map((entry): PrintRow => ({ kind: 'article', article: entry })),
    ]);
  }

  function countArticles(groups: PrintGroup[]): number {
    return groups.reduce((sum, group) => sum + group.articles.length, 0);
  }

  function countInGroup(groups: PrintGroup[], status: PrintArticleStatus): number {
    return groups.find((group) => group.status === status)?.articles.length ?? 0;
  }

  function roundToCents(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /** Berechnete (nicht die tatsächlich bezahlte) Gebühr: Anzahl der Artikel im Dokument × Gebühr je Artikel. */
  function feeTile(articleCount: number, feePerItem: number): PrintTile {
    return {
      title: `Gebühr ${formatCurrency(feePerItem)} / Artikel`,
      value: formatCurrency(roundToCents(articleCount * feePerItem)),
    };
  }

  export interface AbgabeBelegInput {
    seller: PrintSeller;
    articles: PrintArticle[];
    freitexts: PrintFreitexts;
    feePerItem: number;
    commissionRate: number;
    printedAt: Date;
  }

  export function buildAbgabeBelegModel(input: AbgabeBelegInput): PrintDocumentModel {
    const groups = groupArticles(input.articles);
    const count = countArticles(groups);
    return {
      seller: input.seller,
      printedAt: input.printedAt,
      freitexts: input.freitexts,
      groups,
      tilesA: [
        { title: 'Verkäufer-ID', value: input.seller.id },
        { title: 'Anzahl abgegebener Artikel', value: String(count) },
      ],
      tilesB: [
        feeTile(count, input.feePerItem),
        { title: 'Provision', value: formatPercent(input.commissionRate) },
      ],
    };
  }

  export interface VerkaeuferUebersichtInput {
    seller: PrintSeller;
    articles: PrintArticle[];
    freitexts: PrintFreitexts;
    feePerItem: number;
    settlement: { revenue: number; commission: number; payout: number; commissionRate: number };
    printedAt: Date;
  }

  export function buildVerkaeuferUebersichtModel(input: VerkaeuferUebersichtInput): PrintDocumentModel {
    const groups = groupArticles(input.articles.filter((entry) => entry.status !== REGISTERED_STATUS));
    const count = countArticles(groups);
    const { settlement } = input;
    return {
      seller: input.seller,
      printedAt: input.printedAt,
      freitexts: input.freitexts,
      groups,
      tilesA: [
        { title: 'Verkäufer-ID', value: input.seller.id },
        { title: 'Anzahl abgegebener Artikel', value: String(count) },
        { title: 'Anzahl offener Artikel', value: String(countInGroup(groups, 'selling')) },
        { title: 'Anzahl verkaufter Artikel', value: String(countInGroup(groups, 'sold')) },
        { title: 'Einnahmen', value: formatCurrency(settlement.revenue) },
      ],
      tilesB: [
        feeTile(count, input.feePerItem),
        {
          title: `Provision ${formatPercent(settlement.commissionRate)}`,
          value: formatCurrency(settlement.commission),
        },
        { title: 'Verdienst', value: formatCurrency(settlement.payout) },
      ],
    };
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.model.spec.ts` — erwartet: PASS (12 Tests)
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.spec.ts` · `git commit -m "feat(print): Dokumentmodell und Builder für Abgabe-Beleg und Verkäufer-Übersicht" -- src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.spec.ts`

---

### Task 9: Druckdokument-Komponente (Seiten, Kopf, Kacheln, Liste, Fuß)

**ACs:** AC-11, AC-12, AC-13, AC-14, AC-17, AC-18, AC-19, AC-20, AC-21, AC-22, AC-23, AC-33, AC-34

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.html`
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.scss`
- Create: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.spec.ts`

**Interfaces:**
- Consumes (Task 6/7/8): `renderPrintMarkdown(source: string): string`; `PRINT_LAYOUT`, `PX_PER_MM`, `firstPageListHeightMm`, `restPageListHeightMm`, `listCapacityRows`, `paginateRows`; `PrintDocumentModel`, `PrintRow`, `flattenGroups`, `formatCurrency`; bestehend `QrCode` (`shared/components/qr-code/qr-code`, Inputs `value`, `size`, `caption`).
- Produces: Komponente `PrintDocument` (`selector: 'app-print-document'`, `ViewEncapsulation.None`) mit `model = input.required<PrintDocumentModel>()`, `pages: Signal<PrintRow[][]>` und `applyMeasurement(): void` (misst die Höhe von Freitext 3 auf Seite 1, begrenzt sie auf `PRINT_LAYOUT.maxFreitext3Mm` — der Block trägt dieselbe `max-height` mit `overflow: hidden` — und verteilt die Zeilen neu; `PrintService` ruft es nach dem ersten Rendern, vor dem Druck). `.print-doc__list` trägt je Seite die Höhe des Listenbereichs als Inline-Stil (Seite 1 `firstPageListHeightMm(gemessene Höhe Freitext 3)`, ab Seite 2 `restPageListHeightMm()`) und steht unmittelbar vor `.print-doc__foot`, damit die Liste auf jeder Seite bis zur Fußzeile reicht (AC-34). CSS-Klassen (Vertrag für Tests und Isolations-CSS): `.print-doc`, `.print-page`, `.print-doc__head`, `.print-doc__text--left|--center`, `.print-doc__meta`, `.print-doc__seller`, `.print-doc__address`, `.print-doc__tiles--a|--b`, `.print-doc__tile`, `.print-doc__tile-title`, `.print-doc__tile-value`, `.print-doc__freitext3`, `.print-doc__continuation`, `.print-doc__list`, `.print-doc__table`, `.print-doc__group-row`, `.print-doc__foot`, `.print-doc__page-no`.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `print-document.spec.ts`:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { By } from '@angular/platform-browser';
  import { QrCode } from '../qr-code/qr-code';
  import { PrintDocument } from './print-document';
  import { PRINT_LAYOUT, firstPageListHeightMm, restPageListHeightMm } from './print-document.layout';
  import {
    PrintArticle,
    PrintDocumentModel,
    PrintFreitexts,
    PrintSeller,
    buildAbgabeBelegModel,
  } from './print-document.model';

  const seller: PrintSeller = {
    id: 'a3f9c2d1',
    firstName: 'Anna',
    lastName: 'Meier',
    address: 'Musterstraße 5',
    postalCode: '76133',
    city: 'Karlsruhe',
  };
  const noTexts: PrintFreitexts = { text1: '', text2: '', text3: '', text4: '', text5: '' };
  const printedAt = new Date(2026, 9, 14, 9, 30);

  function article(number: number): PrintArticle {
    return {
      number,
      name: `Artikel ${number}`,
      category: 'Jacken',
      brand: 'Nike',
      size: 'M',
      color: 'Rot',
      price: 12.5,
      status: 'selling',
    };
  }

  function model(options: { articles?: PrintArticle[]; freitexts?: Partial<PrintFreitexts> } = {}): PrintDocumentModel {
    return buildAbgabeBelegModel({
      seller,
      articles: options.articles ?? [article(1)],
      freitexts: { ...noTexts, ...options.freitexts },
      feePerItem: 0.5,
      commissionRate: 20,
      printedAt,
    });
  }

  function text(element: Element | null | undefined): string {
    return (element?.textContent ?? '').trim();
  }

  describe('PrintDocument', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [PrintDocument] }).compileComponents();
    });

    async function render(documentModel: PrintDocumentModel) {
      const fixture = TestBed.createComponent(PrintDocument);
      fixture.componentRef.setInput('model', documentModel);
      await fixture.whenStable();
      return { fixture, el: fixture.nativeElement as HTMLElement };
    }

    it('template_firstPage_showsBlocksInSpecifiedOrder', async () => {
      // Arrange & Act
      const { el } = await render(model({ freitexts: { text3: 'Hinweis' } }));
      const page = el.querySelector('.print-page') as HTMLElement;

      // Assert
      const order = Array.from(page.children).map((child) => child.classList[0]);
      expect(order).toEqual([
        'print-doc__head',
        'print-doc__seller',
        'print-doc__tiles',
        'print-doc__tiles',
        'print-doc__freitext3',
        'print-doc__list',
        'print-doc__foot',
      ]);
      expect(page.children[2].classList.contains('print-doc__tiles--a')).toBe(true);
      expect(page.children[3].classList.contains('print-doc__tiles--b')).toBe(true);
    });

    it('template_headerTexts_alignsLeftCenterAndPrintTimeRight', async () => {
      // Arrange & Act
      const { el } = await render(model({ freitexts: { text1: 'A', text2: 'B' } }));
      const head = el.querySelector('.print-doc__head') as HTMLElement;

      // Assert
      expect(text(head.querySelector('.print-doc__text--left'))).toBe('A');
      expect(text(head.querySelector('.print-doc__text--center'))).toBe('B');
      expect(text(head.querySelector('.print-doc__meta'))).toBe('14.10.2026, 09:30');
    });

    it('template_footerTexts_alignsLeftCenterAndPageNumberRight', async () => {
      // Arrange & Act
      const { el } = await render(model({ freitexts: { text4: 'Fuß links', text5: 'Fuß Mitte' } }));
      const foot = el.querySelector('.print-doc__foot') as HTMLElement;

      // Assert
      expect(text(foot.querySelector('.print-doc__text--left'))).toBe('Fuß links');
      expect(text(foot.querySelector('.print-doc__text--center'))).toBe('Fuß Mitte');
      expect(text(foot.querySelector('.print-doc__page-no'))).toBe('Seite 1 von 1');
    });

    it('template_sellerBlock_showsNameStreetAndCityLineWithoutContactData', async () => {
      // Arrange & Act
      const { el } = await render(model());
      const lines = Array.from(el.querySelectorAll('.print-doc__address p')).map((line) => text(line));

      // Assert
      expect(lines).toEqual(['Anna Meier', 'Musterstraße 5', '76133 Karlsruhe']);
    });

    it('template_sellerId_isQrValueCaptionAndTileTextOnPageOne', async () => {
      // Arrange & Act
      const { fixture, el } = await render(model());
      const qr = fixture.debugElement.query(By.directive(QrCode)).componentInstance as QrCode;
      const occurrences = (el.textContent ?? '').split('a3f9c2d1').length - 1;

      // Assert
      expect(qr.value()).toBe('a3f9c2d1');
      expect(text(el.querySelector('.qr-code__caption'))).toBe('a3f9c2d1');
      expect(occurrences).toBe(2);
    });

    it('template_tileRows_rowBIsHalfAsHighAsRowA', async () => {
      // Arrange & Act
      const { el } = await render(model());
      const rowA = el.querySelector('.print-doc__tiles--a') as HTMLElement;
      const rowB = el.querySelector('.print-doc__tiles--b') as HTMLElement;

      // Assert
      expect(parseFloat(rowB.style.height)).toBe(parseFloat(rowA.style.height) / 2);
      expect(rowA.style.height).toContain('mm');
    });

    it('template_tiles_showTitleAboveValue', async () => {
      // Arrange & Act
      const { el } = await render(model());
      const first = el.querySelector('.print-doc__tiles--a .print-doc__tile') as HTMLElement;

      // Assert
      expect(text(first.querySelector('.print-doc__tile-title'))).toBe('Verkäufer-ID');
      expect(text(first.querySelector('.print-doc__tile-value'))).toBe('a3f9c2d1');
    });

    it('template_freitext3WithMarkdown_rendersFormattedElements', async () => {
      // Arrange
      const markdown = ['# Titel', '', '**fett** und *kursiv*', '', '- Punkt', '', '| A | B |', '|---|---|', '| 1 | 2 |'].join('\n');

      // Act
      const { el } = await render(model({ freitexts: { text3: markdown } }));
      const block = el.querySelector('.print-doc__freitext3') as HTMLElement;

      // Assert
      expect(block.querySelector('h1')).not.toBeNull();
      expect(block.querySelector('strong')?.textContent).toBe('fett');
      expect(block.querySelector('em')?.textContent).toBe('kursiv');
      expect(block.querySelector('li')).not.toBeNull();
      expect(block.querySelector('table')).not.toBeNull();
      expect(block.textContent).not.toContain('**');
    });

    it('template_freitext3WithLinkImageAndHtml_rendersNoneOfThem', async () => {
      // Arrange
      const markdown = 'Ein [Link](https://example.org) ![Bild](https://example.org/a.png) <b>HTML</b>';

      // Act
      const { el } = await render(model({ freitexts: { text3: markdown } }));
      const block = el.querySelector('.print-doc__freitext3') as HTMLElement;

      // Assert
      expect(block.querySelector('a')).toBeNull();
      expect(block.querySelector('img')).toBeNull();
      expect(block.querySelector('b')).toBeNull();
      expect(block.textContent).toContain('<b>');
    });

    it('template_emptyFreitext3_omitsBlockAndListFollowsTileRowB', async () => {
      // Arrange & Act
      const { el } = await render(model());
      const rowB = el.querySelector('.print-doc__tiles--b') as HTMLElement;

      // Assert
      expect(el.querySelector('.print-doc__freitext3')).toBeNull();
      expect(rowB.nextElementSibling?.classList.contains('print-doc__list')).toBe(true);
    });

    it('template_emptyHeaderAndFooterTexts_keepTheirCells', async () => {
      // Arrange & Act
      const { el } = await render(model());

      // Assert
      expect(el.querySelector('.print-doc__head .print-doc__text--left')).not.toBeNull();
      expect(el.querySelector('.print-doc__foot .print-doc__text--left')).not.toBeNull();
      expect(text(el.querySelector('.print-doc__head .print-doc__text--left'))).toBe('');
    });

    it('template_eightyArticles_splitsIntoPagesEachWithHeadFootTableHeadAndPageNumber', async () => {
      // Arrange
      const articles = Array.from({ length: 80 }, (_, index) => article(index + 1));

      // Act
      const { el } = await render(model({ articles }));
      const pages = Array.from(el.querySelectorAll('.print-page'));

      // Assert
      expect(pages.length).toBeGreaterThan(1);
      pages.forEach((page, index) => {
        expect(page.querySelector('.print-doc__head')).not.toBeNull();
        expect(page.querySelector('.print-doc__foot')).not.toBeNull();
        expect(page.querySelector('thead')).not.toBeNull();
        expect(text(page.querySelector('.print-doc__page-no'))).toBe(`Seite ${index + 1} von ${pages.length}`);
      });
    });

    it('template_secondPage_showsContinuationRowInsteadOfFirstPageBlocks', async () => {
      // Arrange
      const articles = Array.from({ length: 80 }, (_, index) => article(index + 1));

      // Act
      const { el } = await render(model({ articles }));
      const secondPage = el.querySelectorAll('.print-page')[1] as HTMLElement;

      // Assert
      expect(text(secondPage.querySelector('.print-doc__continuation'))).toContain('a3f9c2d1');
      expect(text(secondPage.querySelector('.print-doc__continuation'))).toContain('Musterstraße 5');
      expect(secondPage.querySelector('.print-doc__tiles')).toBeNull();
      expect(secondPage.querySelector('app-qr-code')).toBeNull();
      expect(secondPage.querySelector('.print-doc__freitext3')).toBeNull();
      expect(secondPage.querySelector('.print-doc__seller')).toBeNull();
    });

    it('template_articles_showsSevenColumnsAsTableWithoutTilePerArticle', async () => {
      // Arrange & Act
      const { el } = await render(model());
      const headings = Array.from(el.querySelectorAll('.print-doc__table thead th')).map((cell) => text(cell));
      const cells = Array.from(el.querySelectorAll('.print-doc__table tbody tr:not(.print-doc__group-row) td')).map((cell) => text(cell));

      // Assert
      expect(headings).toEqual(['Artikelnummer', 'Bezeichnung', 'Kategorie', 'Marke', 'Größe', 'Farbe', 'Preis']);
      expect(cells.slice(0, 6)).toEqual(['1', 'Artikel 1', 'Jacken', 'Nike', 'M', 'Rot']);
      expect(el.querySelectorAll('.print-doc__tiles .print-doc__tile').length).toBe(4);
    });

    it('template_fewArticles_listAreaReachesDownToFooter', async () => {
      // Arrange & Act
      const { el } = await render(model());
      const page = el.querySelector('.print-page') as HTMLElement;
      const list = page.querySelector('.print-doc__list') as HTMLElement;
      const fixedBlocksMm =
        PRINT_LAYOUT.headerMm +
        PRINT_LAYOUT.sellerBlockMm +
        PRINT_LAYOUT.tileRowAMm +
        PRINT_LAYOUT.tileRowBMm +
        PRINT_LAYOUT.footerMm;

      // Assert
      expect(list.nextElementSibling?.classList.contains('print-doc__foot')).toBe(true);
      expect(parseFloat(list.style.height)).toBe(firstPageListHeightMm(0));
      expect(fixedBlocksMm + parseFloat(list.style.height)).toBe(
        PRINT_LAYOUT.pageHeightMm - 2 * PRINT_LAYOUT.paddingMm,
      );
    });

    it('template_eightyArticles_listAreaEndsDirectlyAboveFooterOnEveryPage', async () => {
      // Arrange
      const articles = Array.from({ length: 80 }, (_, index) => article(index + 1));

      // Act
      const { el } = await render(model({ articles }));
      const pages = Array.from(el.querySelectorAll('.print-page'));

      // Assert
      expect(pages.length).toBeGreaterThan(1);
      pages.forEach((page, index) => {
        const list = page.querySelector('.print-doc__list') as HTMLElement;
        const expectedMm = index === 0 ? firstPageListHeightMm(0) : restPageListHeightMm();
        expect(list.nextElementSibling?.classList.contains('print-doc__foot')).toBe(true);
        expect(page.lastElementChild?.classList.contains('print-doc__foot')).toBe(true);
        expect(parseFloat(list.style.height)).toBe(expectedMm);
      });
    });

    it('applyMeasurement_noLayoutEngine_keepsThePaginationStable', async () => {
      // Arrange
      const { fixture, el } = await render(model({ freitexts: { text3: 'Hinweis' } }));
      const pagesBefore = el.querySelectorAll('.print-page').length;

      // Act
      fixture.componentInstance.applyMeasurement();
      await fixture.whenStable();

      // Assert
      expect(el.querySelectorAll('.print-page').length).toBe(pagesBefore);
    });

    it('applyMeasurement_freitext3HigherThanPage_capsHeightAndKeepsArticlesOnPageOne', async () => {
      // Arrange
      const { fixture, el } = await render(model({ freitexts: { text3: 'Sehr lang' } }));
      const block = el.querySelector('.print-doc__freitext3') as HTMLElement;
      vi.spyOn(block, 'getBoundingClientRect').mockReturnValue({ height: 5000 } as DOMRect);

      // Act
      fixture.componentInstance.applyMeasurement();
      await fixture.whenStable();

      // Assert
      const list = el.querySelector('.print-page .print-doc__list') as HTMLElement;
      expect(parseFloat(list.style.height)).toBe(firstPageListHeightMm(PRINT_LAYOUT.maxFreitext3Mm));
      expect(fixture.componentInstance.pages()[0].some((row) => row.kind === 'article')).toBe(true);
      expect(block.style.maxHeight).toBe(`${PRINT_LAYOUT.maxFreitext3Mm}mm`);
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.spec.ts` — erwartet: FAIL (`./print-document` nicht auflösbar)
- [ ] **Schritt 3: Minimal implementieren**
  `print-document.ts`:
  ```ts
  import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewEncapsulation,
    computed,
    inject,
    input,
    signal,
  } from '@angular/core';
  import { DatePipe } from '@angular/common';
  import { QrCode } from '../qr-code/qr-code';
  import {
    PRINT_LAYOUT,
    PX_PER_MM,
    firstPageListHeightMm,
    listCapacityRows,
    paginateRows,
    restPageListHeightMm,
  } from './print-document.layout';
  import { renderPrintMarkdown } from './print-document.markdown';
  import { PrintDocumentModel, PrintRow, flattenGroups, formatCurrency } from './print-document.model';

  /**
   * Gemeinsames A4-Druckdokument für Abgabe-Beleg und Verkäufer-Übersicht — reine Darstellung
   * eines fertigen `PrintDocumentModel`, kein HTTP, keine Fachlogik. Die Seitenaufteilung ist
   * deterministisch (feste Maße aus `PRINT_LAYOUT`); nur die Höhe von Freitext 3 wird einmal
   * gemessen (`applyMeasurement()`), bevor gedruckt wird.
   *
   * `ViewEncapsulation.None`: Die Markdown-Ausgabe kommt per `[innerHTML]` und trägt keine
   * Encapsulation-Attribute, gekapselte Stile würden sie nicht erreichen.
   */
  @Component({
    selector: 'app-print-document',
    imports: [DatePipe, QrCode],
    templateUrl: './print-document.html',
    styleUrl: './print-document.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class PrintDocument {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly model = input.required<PrintDocumentModel>();

    protected readonly layout = PRINT_LAYOUT;
    protected readonly formatCurrency = formatCurrency;

    private readonly freitext3Mm = signal(0);

    /**
     * Höhe des Listenbereichs je Seite (mm). Die Liste reicht damit unabhängig von der Zeilenzahl
     * bis direkt über die Fußzeile; `flex: 1 1 auto` gleicht Rundungsreste aus.
     */
    protected readonly firstListMm = computed<number>(() => firstPageListHeightMm(this.freitext3Mm()));
    protected readonly restListMm = restPageListHeightMm();

    private readonly rows = computed<PrintRow[]>(() => flattenGroups(this.model().groups));

    readonly pages = computed<PrintRow[][]>(() =>
      paginateRows(
        this.rows(),
        listCapacityRows(this.firstListMm()),
        listCapacityRows(this.restListMm),
        (row) => row.kind === 'group',
      ),
    );

    protected readonly headLeftHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text1));
    protected readonly headCenterHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text2));
    protected readonly freitext3Html = computed(() => renderPrintMarkdown(this.model().freitexts.text3));
    protected readonly footLeftHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text4));
    protected readonly footCenterHtml = computed(() => renderPrintMarkdown(this.model().freitexts.text5));

    /** „PLZ Ort" — entfällt komplett, wenn beides fehlt, statt ein einzelnes Leerzeichen zu drucken. */
    protected readonly cityLine = computed<string>(() => {
      const { postalCode, city } = this.model().seller;
      return [postalCode, city].filter((part): part is string => !!part).join(' ');
    });

    /** Anschrift in einer Zeile für die Fortsetzungsseiten (ab Seite 2). */
    protected readonly addressLine = computed<string>(() => {
      const { firstName, lastName, address } = this.model().seller;
      return [`${firstName} ${lastName}`, address, this.cityLine()].filter((part) => !!part).join(', ');
    });

    /**
     * Misst die Höhe des Freitext-3-Blocks von Seite 1 (in mm) und verteilt die Tabellenzeilen
     * neu. Ohne Layout-Engine (z. B. jsdom) ist die Höhe 0 und die Aufteilung bleibt unverändert.
     * Die Höhe ist auf `PRINT_LAYOUT.maxFreitext3Mm` begrenzt (der Block selbst trägt dieselbe
     * `max-height`), damit ein langer Freitext 3 Liste und Fußzeile nicht von Seite 1 verdrängt.
     */
    applyMeasurement(): void {
      const block = this.host.nativeElement.querySelector<HTMLElement>('.print-doc__freitext3');
      const heightPx = block?.getBoundingClientRect().height ?? 0;
      this.freitext3Mm.set(Math.min(heightPx / PX_PER_MM, PRINT_LAYOUT.maxFreitext3Mm));
    }
  }
  ```
  `print-document.html`:
  ```html
  <div class="print-doc">
    @for (page of pages(); track $index) {
      <section
        class="print-page"
        [style.width.mm]="layout.pageWidthMm"
        [style.height.mm]="layout.pageHeightMm"
        [style.padding.mm]="layout.paddingMm"
      >
        <header class="print-doc__head" [style.height.mm]="layout.headerMm">
          <div class="print-doc__text print-doc__text--left" [innerHTML]="headLeftHtml()"></div>
          <div class="print-doc__text print-doc__text--center" [innerHTML]="headCenterHtml()"></div>
          <div class="print-doc__meta">{{ model().printedAt | date: 'dd.MM.yyyy, HH:mm' }}</div>
        </header>

        @if ($first) {
          <section class="print-doc__seller" [style.height.mm]="layout.sellerBlockMm">
            <div class="print-doc__address">
              <p class="print-doc__name">{{ model().seller.firstName }} {{ model().seller.lastName }}</p>
              @if (model().seller.address) {
                <p>{{ model().seller.address }}</p>
              }
              @if (cityLine()) {
                <p>{{ cityLine() }}</p>
              }
            </div>
            <app-qr-code [value]="model().seller.id" [size]="100" [caption]="model().seller.id" />
          </section>

          <div class="print-doc__tiles print-doc__tiles--a" [style.height.mm]="layout.tileRowAMm">
            @for (tile of model().tilesA; track tile.title) {
              <div class="print-doc__tile">
                <span class="print-doc__tile-title">{{ tile.title }}</span>
                <span class="print-doc__tile-value">{{ tile.value }}</span>
              </div>
            }
          </div>
          <div class="print-doc__tiles print-doc__tiles--b" [style.height.mm]="layout.tileRowBMm">
            @for (tile of model().tilesB; track tile.title) {
              <div class="print-doc__tile">
                <span class="print-doc__tile-title">{{ tile.title }}</span>
                <span class="print-doc__tile-value">{{ tile.value }}</span>
              </div>
            }
          </div>

          @if (freitext3Html()) {
            <div
              class="print-doc__freitext3"
              [style.max-height.mm]="layout.maxFreitext3Mm"
              [innerHTML]="freitext3Html()"
            ></div>
          }
        } @else {
          <div class="print-doc__continuation" [style.height.mm]="layout.continuationMm">
            <strong>{{ model().seller.id }}</strong> · {{ addressLine() }}
          </div>
        }

        <div class="print-doc__list" [style.height.mm]="$first ? firstListMm() : restListMm">
          <table class="print-doc__table">
            <colgroup>
              <col class="print-doc__col--number" />
              <col />
              <col class="print-doc__col--category" />
              <col class="print-doc__col--brand" />
              <col class="print-doc__col--size" />
              <col class="print-doc__col--color" />
              <col class="print-doc__col--price" />
            </colgroup>
            <thead>
              <tr [style.height.mm]="layout.tableHeadMm">
                <th>Artikelnummer</th>
                <th>Bezeichnung</th>
                <th>Kategorie</th>
                <th>Marke</th>
                <th>Größe</th>
                <th>Farbe</th>
                <th class="print-doc__cell--price">Preis</th>
              </tr>
            </thead>
            <tbody>
              @for (row of page; track $index) {
                @if (row.kind === 'group') {
                  <tr class="print-doc__group-row" [style.height.mm]="layout.rowMm">
                    <th colspan="7">{{ row.label }} ({{ row.count }})</th>
                  </tr>
                } @else {
                  <tr [style.height.mm]="layout.rowMm">
                    <td>{{ row.article.number }}</td>
                    <td>{{ row.article.name }}</td>
                    <td>{{ row.article.category ?? '' }}</td>
                    <td>{{ row.article.brand ?? '' }}</td>
                    <td>{{ row.article.size ?? '' }}</td>
                    <td>{{ row.article.color ?? '' }}</td>
                    <td class="print-doc__cell--price">{{ formatCurrency(row.article.price) }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <footer class="print-doc__foot" [style.height.mm]="layout.footerMm">
          <div class="print-doc__text print-doc__text--left" [innerHTML]="footLeftHtml()"></div>
          <div class="print-doc__text print-doc__text--center" [innerHTML]="footCenterHtml()"></div>
          <div class="print-doc__page-no">Seite {{ $index + 1 }} von {{ pages().length }}</div>
        </footer>
      </section>
    }
  </div>
  ```
  `print-document.scss`:
  ```scss
  app-print-document {
    display: block;
    background: #fff;
    color: #000;
    font-family: var(--font-body, sans-serif);
    font-size: 9pt;
    line-height: 1.25;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-page {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    break-after: page;
    page-break-after: always;

    &:last-child {
      break-after: auto;
      page-break-after: auto;
    }
  }

  .print-doc {
    &__head,
    &__foot {
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      column-gap: 4mm;
      flex: none;
      overflow: hidden;
    }

    &__text {
      min-width: 0;
      overflow: hidden;

      &--center {
        text-align: center;
      }
    }

    &__meta,
    &__page-no {
      text-align: right;
    }

    &__seller {
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex: none;
      overflow: hidden;
      padding: 2mm 0;
    }

    &__address p {
      margin: 0;
    }

    &__name {
      font-weight: 700;
    }

    &__tiles {
      box-sizing: border-box;
      display: flex;
      gap: 3mm;
      flex: none;
      padding-bottom: 2mm;
    }

    &__tile {
      box-sizing: border-box;
      flex: 1 1 0;
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      overflow: hidden;
      padding: 1.5mm 2mm;
      border: 0.3mm solid #000;
    }

    &__tile-title {
      font-size: 8pt;
    }

    &__tile-value {
      font-size: 13pt;
      font-weight: 700;
    }

    &__tiles--b &__tile-value {
      font-size: 10pt;
    }

    &__freitext3,
    &__continuation {
      flex: none;
      padding: 2mm 0;
    }

    &__freitext3 {
      box-sizing: border-box;
      overflow: hidden;
    }

    &__continuation {
      box-sizing: border-box;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &__list {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      border: 0.3mm solid #000;
    }

    &__table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;

      th,
      td {
        padding: 0 1.5mm;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: left;
        vertical-align: middle;
      }

      thead th {
        font-weight: 700;
        border-bottom: 0.3mm solid #000;
      }
    }

    &__col--number {
      width: 24mm;
    }

    &__col--category {
      width: 26mm;
    }

    &__col--brand {
      width: 24mm;
    }

    &__col--size {
      width: 14mm;
    }

    &__col--color {
      width: 20mm;
    }

    &__col--price {
      width: 20mm;
    }

    &__cell--price {
      text-align: right !important;
    }

    &__group-row th {
      background: #e6e6e6;
      font-weight: 700;
    }

    &__text p,
    &__freitext3 p {
      margin: 0 0 1mm;
    }

    &__text :is(h1, h2, h3, h4, h5, h6),
    &__freitext3 :is(h1, h2, h3, h4, h5, h6) {
      margin: 0 0 1mm;
      font-size: 11pt;
    }

    &__text :is(ul, ol),
    &__freitext3 :is(ul, ol) {
      margin: 0 0 1mm;
      padding-left: 5mm;
    }

    &__text table,
    &__freitext3 table {
      border-collapse: collapse;

      th,
      td {
        padding: 0 1.5mm;
        border: 0.2mm solid #000;
      }
    }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.spec.ts` — erwartet: PASS (18 Tests). Zusätzlich `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK (keine Lint-Fehler in den neuen Dateien).
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.html src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.scss src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.spec.ts` · `git commit -m "feat(print): gemeinsames A4-Druckdokument mit Seiten, Kacheln und Artikeltabelle" -- src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.html src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.scss src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.spec.ts`

---

### Task 10: `PrintService` und Aufrufer auf das neue Dokument umstellen

**ACs:** AC-02, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-24, AC-26, AC-28, AC-29, AC-30, AC-31, AC-32

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/core/print/print.service.ts:1-241` · `PrintService` (komplett ersetzen)
- Test: `src/bazaar-app/frontend/src/app/core/print/print.service.spec.ts:1-` · `describe('PrintService')` (Datei komplett ersetzen)
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.ts:136` · `IntakeSessionList.book`
- Test: `src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts:226-241` · `success: calls PrintService.printIntakeReceipt` (Testname des bestehenden `it`)
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.ts:162` · `ReleaseDialog.book`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.spec.ts:201-216` · `success: prints via PrintService` (Testname des bestehenden `it`)
- Modify: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.ts:134-141` · `SettlementPage.onPrint` und `:174` · `SettlementPage.onSettleConfirmed`
- Test: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts:535-571` · `onPrint_unsettledSeller_…`/`onPrint_settledSeller_…` und `:708`
- Modify: `src/bazaar-app/frontend/src/app/features/settlement/components/settlement-panel/settlement-panel.ts:13-15` · `SettlementPanel` (Klassenkommentar, Verweis auf `formatCurrency`)
- Modify: `src/bazaar-app/frontend/src/app/core/shell/shell.scss:20-30` · `@media print`
- Delete: `src/bazaar-app/frontend/src/app/shared/components/print-abgabe-beleg/` (`.ts`, `.scss`, `.spec.ts`)
- Delete: `src/bazaar-app/frontend/src/app/shared/components/print-verkaeufer-uebersicht/` (`.ts`, `.scss`, `.spec.ts`)

**Interfaces:**
- Consumes (Task 4/8/9): `SellersApi.getById(id): Observable<SellerDetail>` (`feePerItem`, `salesCommission`), `SellersApi.getArticles(id): Observable<ArticleSummary[]>`, `SettlementApi.getSettlement(id): Observable<SellerSettlement>` (`revenue`, `commission`, `payout`, `commissionRate`), `PrintTextsApi.get(): Observable<PrintTexts>`, `MessageService.add(...)`; `PrintDocument` (+ `applyMeasurement()`), `buildAbgabeBelegModel`, `buildVerkaeuferUebersichtModel`, `PrintArticle`, `PrintDocumentModel`, `PrintSeller`.
- Produces:
  - `PrintService.printSellerReceipt(sellerId: string): void` — Druckbutton: alle Artikel des Verkäufers außer „Registriert"; Ladefehler → Toast `{ severity: 'error', summary: 'Beleg konnte nicht geladen werden' }`, keine Vorschau.
  - `PrintService.printIntakeReceipt(data: IntakeReceiptData): void` mit `interface IntakeReceiptData { articleIds: string[]; sellerId: string }` (`feeAmount` entfällt) — nur die genannten Artikel; Ladefehler → derselbe Toast, keine Vorschau.
  - `PrintService.printSellerSummary(data: SellerSummaryPrintData): void` mit `interface SellerSummaryPrintData { sellerId: string }` (`phase` entfällt); Ladefehler → derselbe Toast, keine Vorschau.
  - DOM-Vertrag: Host `app-print-document[data-print-host]` im `body`, Stil-Element `style[data-print-style]` im `head`, beides bei `afterprint` entfernt; es gibt höchstens einen Host — ein neuer Druck baut einen noch hängenden Host samt Stil zuerst ab (ausgebliebenes `afterprint` auf Android/iOS, Doppelklick); wirft `window.print()`, wird sofort abgebaut.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  `print.service.spec.ts` komplett ersetzen:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { MessageService } from 'primeng/api';
  import { Observable, of, throwError } from 'rxjs';
  import { PrintService } from './print.service';
  // eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
  import { ArticleSummary, SellerDetail, SellersApi } from '../../features/sellers/data/sellers-api';
  // eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
  import { SellerSettlement, SettlementApi } from '../../features/settlement/data/settlement-api';
  // eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
  import { PrintTexts, PrintTextsApi, emptyPrintTexts } from '../../features/settings/data/print-texts-api';

  const seller: SellerDetail = {
    id: 'seller-1',
    firstName: 'Anna',
    lastName: 'Meier',
    address: 'Musterstraße 5',
    postalCode: '76133',
    city: 'Karlsruhe',
    phone: '0721 123456',
    email: 'anna@example.com',
    sellerTypeId: 'type-1',
    salesCommission: 20,
    feePerItem: 0.5,
    intakeFeePaid: 0,
    settledAt: null,
    payoutAmount: null,
  };

  const settlement: SellerSettlement = {
    seller: {
      id: 'seller-1',
      firstName: 'Anna',
      lastName: 'Meier',
      address: 'Musterstraße 5',
      postalCode: '76133',
      city: 'Karlsruhe',
    },
    openCount: 3,
    soldCount: 2,
    returnedCount: 0,
    revenue: 200,
    commissionRate: 20,
    commission: 40,
    payout: 160,
    intakeFeePaid: 1.5,
    notDeliveredCount: 0,
    settledAt: null,
    payoutAmount: null,
    canSettle: true,
  };

  function article(id: string, number: number, status: string): ArticleSummary {
    return {
      id,
      number,
      name: `Artikel ${number}`,
      brand: 'Nike',
      category: 'Jacken',
      size: 'M',
      color: 'Rot',
      price: 10,
      status,
      soldManually: false,
    };
  }

  /** Währungsformat nutzt ein geschütztes Leerzeichen vor „€"; Tests vergleichen mit normalem. */
  function plain(text: string | null | undefined): string {
    return (text ?? '').replace(/ /g, ' ').trim();
  }

  function printHost(): HTMLElement | null {
    return document.querySelector<HTMLElement>('app-print-document[data-print-host]');
  }

  function tileValue(host: HTMLElement, title: string): string {
    const tile = Array.from(host.querySelectorAll('.print-doc__tile')).find(
      (candidate) => plain(candidate.querySelector('.print-doc__tile-title')?.textContent) === title,
    );
    return plain(tile?.querySelector('.print-doc__tile-value')?.textContent);
  }

  function groupLabels(host: HTMLElement): string[] {
    return Array.from(host.querySelectorAll('.print-doc__group-row th')).map((cell) => plain(cell.textContent));
  }

  function articleNumbers(host: HTMLElement): string[] {
    return Array.from(host.querySelectorAll('.print-doc__table tbody tr:not(.print-doc__group-row) td:first-child')).map(
      (cell) => plain(cell.textContent),
    );
  }

  describe('PrintService', () => {
    let getByIdSpy: ReturnType<typeof vi.fn>;
    let getArticlesSpy: ReturnType<typeof vi.fn>;
    let getSettlementSpy: ReturnType<typeof vi.fn>;
    let getTextsSpy: ReturnType<typeof vi.fn>;
    let messageAddSpy: ReturnType<typeof vi.fn>;
    let printSpy: ReturnType<typeof vi.fn>;

    function setup(
      options: { articles?: ArticleSummary[]; texts?: PrintTexts; sellerResult?: Observable<SellerDetail> } = {},
    ): PrintService {
      TestBed.resetTestingModule();
      getByIdSpy = vi.fn().mockReturnValue(options.sellerResult ?? of(seller));
      getArticlesSpy = vi.fn().mockReturnValue(of(options.articles ?? []));
      getSettlementSpy = vi.fn().mockReturnValue(of(settlement));
      getTextsSpy = vi.fn().mockReturnValue(of(options.texts ?? emptyPrintTexts()));
      messageAddSpy = vi.fn();

      TestBed.configureTestingModule({
        providers: [
          { provide: SellersApi, useValue: { getById: getByIdSpy, getArticles: getArticlesSpy } },
          { provide: SettlementApi, useValue: { getSettlement: getSettlementSpy } },
          { provide: PrintTextsApi, useValue: { get: getTextsSpy } },
          { provide: MessageService, useValue: { add: messageAddSpy } },
        ],
      });

      return TestBed.inject(PrintService);
    }

    beforeEach(() => {
      printSpy = vi.fn();
      vi.stubGlobal('print', printSpy);
    });

    afterEach(() => {
      window.dispatchEvent(new Event('afterprint'));
      vi.unstubAllGlobals();
      document.querySelectorAll('app-print-document').forEach((element) => element.remove());
      document.querySelectorAll('style[data-print-style]').forEach((element) => element.remove());
    });

    describe('printSellerReceipt', () => {
      it('printSellerReceipt_mixedStatuses_rendersGroupsInOrderWithoutRegisteredAndSortedByNumber', () => {
        // Arrange
        const articles = [
          article('a1', 12, 'selling'),
          article('a2', 5, 'selling'),
          article('a3', 9, 'selling'),
          article('a4', 20, 'sold'),
          article('a5', 21, 'sold'),
          article('a6', 30, 'returned'),
          article('a7', 40, 'registered'),
          article('a8', 41, 'registered'),
        ];
        const service = setup({ articles });

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        const host = printHost();
        expect(host).not.toBeNull();
        expect(groupLabels(host!)).toEqual(['Im Verkauf (3)', 'Verkauft (2)', 'Zurückgegeben (1)']);
        expect(articleNumbers(host!)).toEqual(['5', '9', '12', '20', '21', '30']);
        expect(tileValue(host!, 'Anzahl abgegebener Artikel')).toBe('6');
        expect(printSpy).toHaveBeenCalledTimes(1);
      });

      it('printSellerReceipt_sellerWithoutArticles_stillPrintsEmptyReceipt', () => {
        // Arrange
        const service = setup({ articles: [] });

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        const host = printHost();
        expect(host).not.toBeNull();
        expect(articleNumbers(host!)).toEqual([]);
        expect(tileValue(host!, 'Anzahl abgegebener Artikel')).toBe('0');
        expect(tileValue(host!, 'Gebühr 0,50 € / Artikel')).toBe('0,00 €');
        expect(printSpy).toHaveBeenCalledTimes(1);
      });

      it('printSellerReceipt_dataCannotBeLoaded_showsErrorToastAndDoesNotPrint', () => {
        // Arrange
        const service = setup({ sellerResult: throwError(() => new Error('offline')) });

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        expect(messageAddSpy).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error', summary: 'Beleg konnte nicht geladen werden' }),
        );
        expect(printHost()).toBeNull();
        expect(printSpy).not.toHaveBeenCalled();
      });

      it('printSellerReceipt_afterPrint_removesDocumentAndPrintStyle', () => {
        // Arrange
        const service = setup({ articles: [article('a1', 1, 'selling')] });
        service.printSellerReceipt('seller-1');

        // Act
        window.dispatchEvent(new Event('afterprint'));

        // Assert
        expect(printHost()).toBeNull();
        expect(document.querySelector('style[data-print-style]')).toBeNull();
      });

      it('printSellerReceipt_always_setsA4PortraitAndHidesEverythingButTheDocument', () => {
        // Arrange
        const service = setup({ articles: [article('a1', 1, 'selling')] });

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        const css = document.querySelector('style[data-print-style]')?.textContent ?? '';
        expect(css).toContain('size: A4 portrait');
        expect(css).toContain('body > *:not([data-print-host])');
        expect(css).toContain('display: none !important');
      });

      it('printSellerReceipt_savedFreitext_appearsInTheNextReceipt', () => {
        // Arrange
        const texts = emptyPrintTexts();
        texts.abgabeBeleg.text1 = 'Kopf A';
        const service = setup({ articles: [article('a1', 1, 'selling')], texts });

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        expect(plain(printHost()?.querySelector('.print-doc__head .print-doc__text--left')?.textContent)).toBe('Kopf A');
        expect(getTextsSpy).toHaveBeenCalledTimes(1);
      });

      it('printSellerReceipt_rendersSizeColorAndCategoryColumns', () => {
        // Arrange
        const service = setup({ articles: [article('a1', 7, 'selling')] });

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        const cells = Array.from(printHost()!.querySelectorAll('.print-doc__table tbody tr:not(.print-doc__group-row) td')).map(
          (cell) => plain(cell.textContent),
        );
        expect(cells.slice(0, 6)).toEqual(['7', 'Artikel 7', 'Jacken', 'Nike', 'M', 'Rot']);
      });
    });

    describe('printIntakeReceipt', () => {
      it('printIntakeReceipt_threeBookedRegisteredArticles_rendersOnlyThemInGroupRegistriert', () => {
        // Arrange
        const articles = [
          article('a1', 1, 'registered'),
          article('a2', 2, 'registered'),
          article('a3', 3, 'registered'),
          article('a4', 4, 'selling'),
          article('a5', 5, 'registered'),
        ];
        const service = setup({ articles });

        // Act
        service.printIntakeReceipt({ articleIds: ['a1', 'a2', 'a3'], sellerId: 'seller-1' });

        // Assert
        const host = printHost();
        expect(groupLabels(host!)).toEqual(['Registriert (3)']);
        expect(articleNumbers(host!)).toEqual(['1', '2', '3']);
        expect(tileValue(host!, 'Anzahl abgegebener Artikel')).toBe('3');
        expect(printSpy).toHaveBeenCalledTimes(1);
      });

      it('printIntakeReceipt_twoReleasedArticles_rendersGroupImVerkauf', () => {
        // Arrange
        const articles = [article('a1', 1, 'selling'), article('a2', 2, 'selling'), article('a3', 3, 'registered')];
        const service = setup({ articles });

        // Act
        service.printIntakeReceipt({ articleIds: ['a1', 'a2'], sellerId: 'seller-1' });

        // Assert
        expect(groupLabels(printHost()!)).toEqual(['Im Verkauf (2)']);
      });

      it('printIntakeReceipt_loadFails_showsErrorToastAndDoesNotPrint', () => {
        // Arrange
        const service = setup({ sellerResult: throwError(() => new Error('offline')) });

        // Act
        service.printIntakeReceipt({ articleIds: ['a1'], sellerId: 'seller-1' });

        // Assert
        expect(messageAddSpy).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error', summary: 'Beleg konnte nicht geladen werden' }),
        );
        expect(printHost()).toBeNull();
        expect(printSpy).not.toHaveBeenCalled();
      });
    });

    describe('printSellerSummary', () => {
      const summaryArticles = [
        article('a1', 1, 'selling'),
        article('a2', 2, 'selling'),
        article('a3', 3, 'selling'),
        article('a4', 4, 'sold'),
        article('a5', 5, 'sold'),
        article('a6', 6, 'registered'),
        article('a7', 7, 'registered'),
      ];

      it('printSellerSummary_settlementWithSoldArticles_rendersRowATilesAndGroupsWithoutRegistered', () => {
        // Arrange
        const service = setup({ articles: summaryArticles });

        // Act
        service.printSellerSummary({ sellerId: 'seller-1' });

        // Assert
        const host = printHost();
        expect(getSettlementSpy).toHaveBeenCalledWith('seller-1');
        expect(groupLabels(host!)).toEqual(['Im Verkauf (3)', 'Verkauft (2)']);
        expect(tileValue(host!, 'Anzahl offener Artikel')).toBe('3');
        expect(tileValue(host!, 'Anzahl verkaufter Artikel')).toBe('2');
        expect(tileValue(host!, 'Anzahl abgegebener Artikel')).toBe('5');
        expect(printSpy).toHaveBeenCalledTimes(1);
      });

      it('printSellerSummary_revenue200Rate20_rendersRevenueCommissionAndEarningsFromSettlement', () => {
        // Arrange
        const service = setup({ articles: summaryArticles });

        // Act
        service.printSellerSummary({ sellerId: 'seller-1' });

        // Assert
        const host = printHost()!;
        expect(tileValue(host, 'Einnahmen')).toBe('200,00 €');
        expect(tileValue(host, 'Provision 20 %')).toBe('40,00 €');
        expect(tileValue(host, 'Verdienst')).toBe('160,00 €');
      });

      it('printSellerSummary_afterPrint_removesDocument', () => {
        // Arrange
        const service = setup({ articles: summaryArticles });
        service.printSellerSummary({ sellerId: 'seller-1' });

        // Act
        window.dispatchEvent(new Event('afterprint'));

        // Assert
        expect(printHost()).toBeNull();
      });

      it('printSellerSummary_dataCannotBeLoaded_showsErrorToastAndDoesNotPrint', () => {
        // Arrange
        const service = setup({ sellerResult: throwError(() => new Error('offline')) });

        // Act
        service.printSellerSummary({ sellerId: 'seller-1' });

        // Assert
        expect(messageAddSpy).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'error', summary: 'Beleg konnte nicht geladen werden' }),
        );
        expect(printHost()).toBeNull();
        expect(printSpy).not.toHaveBeenCalled();
      });
    });

    describe('Aufräumen', () => {
      it('print_secondPrintWithoutAfterprint_keepsOnlyOneDocumentAndOneStyle', () => {
        // Arrange
        const service = setup({ articles: [article('a1', 1, 'selling')] });
        service.printSellerReceipt('seller-1');

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        expect(document.querySelectorAll('app-print-document[data-print-host]').length).toBe(1);
        expect(document.querySelectorAll('style[data-print-style]').length).toBe(1);
        expect(printSpy).toHaveBeenCalledTimes(2);
      });

      it('print_windowPrintThrows_removesDocumentAndPrintStyle', () => {
        // Arrange
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        printSpy.mockImplementation(() => {
          throw new Error('print blocked');
        });
        const service = setup({ articles: [article('a1', 1, 'selling')] });

        // Act
        service.printSellerReceipt('seller-1');

        // Assert
        expect(printHost()).toBeNull();
        expect(document.querySelector('style[data-print-style]')).toBeNull();
        consoleError.mockRestore();
      });
    });

    describe('Freitexte je Vorlage', () => {
      it('print_freitext3OnlyMaintainedForAbgabeBeleg_appearsOnlyInTheReceipt', () => {
        // Arrange
        const texts = emptyPrintTexts();
        texts.abgabeBeleg.text3 = 'Nur im Beleg';
        const service = setup({ articles: [article('a1', 1, 'selling')], texts });

        // Act
        service.printSellerReceipt('seller-1');
        const receiptHasText = (printHost()?.textContent ?? '').includes('Nur im Beleg');
        window.dispatchEvent(new Event('afterprint'));
        service.printSellerSummary({ sellerId: 'seller-1' });

        // Assert
        expect(receiptHasText).toBe(true);
        expect(printHost()?.textContent ?? '').not.toContain('Nur im Beleg');
        expect(printHost()?.querySelector('.print-doc__freitext3')).toBeNull();
      });
    });
  });
  ```
  Aufrufer-Specs anpassen:
  - `intake-session-list.spec.ts` — im Test `success: calls PrintService.printIntakeReceipt, …` den Erwartungsblock ersetzen durch:
    ```ts
        expect(printService.printIntakeReceipt).toHaveBeenCalledWith({
          articleIds: ['ART00099'],
          sellerId: SELLER_ID,
        });
    ```
  - `release-dialog.spec.ts` — im Test `success: prints via PrintService, …` den Erwartungsblock ersetzen durch:
    ```ts
        expect(printService.printIntakeReceipt).toHaveBeenCalledWith({
          articleIds: ['a1', 'a2'],
          sellerId: SELLER_ID,
        });
    ```
  - `settlement-page.spec.ts` — die beiden Tests `onPrint_unsettledSeller_printsPreliminarySummary` und `onPrint_settledSeller_printsFinalSummary` (vom `it(` des ersten bis zur schließenden `});` des zweiten) ersetzen durch:
    ```ts
        it('onPrint_sellerSelected_printsSellerSummaryWithoutPhase', async () => {
          // Arrange
          const printService = printServiceStub();
          const { fixture, print } = await renderWithActions({ openCount: 3 }, printService);

          // Act
          print.click();
          await fixture.whenStable();

          // Assert
          expect(printService.printSellerSummary).toHaveBeenCalledWith({ sellerId: 'SEL00001' });
        });
    ```
    und in `onSettleConfirmed`-Test die Zeile `expect(printService.printSellerSummary).toHaveBeenCalledWith({ sellerId: 'SEL00001', phase: 'final' });` ersetzen durch `expect(printService.printSellerSummary).toHaveBeenCalledWith({ sellerId: 'SEL00001' });`.
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehle: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/core/print/print.service.spec.ts`, `… --include src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts`, `… --include src/app/features/sellers/components/release-dialog/release-dialog.spec.ts`, `… --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` — erwartet: FAIL (`printSellerReceipt` existiert nicht; Aufrufer-Erwartungen weichen ab)
- [ ] **Schritt 3: Minimal implementieren**
  `print.service.ts` komplett ersetzen:
  ```ts
  import { ApplicationRef, ComponentRef, Injectable, createComponent, inject } from '@angular/core';
  import { MessageService } from 'primeng/api';
  import { Observable, forkJoin, map } from 'rxjs';
  // Sanctioned `core` → `feature` boundary crossing (first one in this project, Round-23): the
  // print flows load the seller/article/settlement/text data themselves, so their callers keep
  // passing only ids. `SellersApi`'s same-feature import in `release-dialog.ts` is no precedent.
  // eslint-disable-next-line boundaries/dependencies
  import { ArticleSummary, SellersApi } from '../../features/sellers/data/sellers-api';
  // Sanctioned `core` → `feature` boundary crossing, same justification as above.
  // eslint-disable-next-line boundaries/dependencies
  import { SettlementApi } from '../../features/settlement/data/settlement-api';
  // Sanctioned `core` → `feature` boundary crossing, same justification as above.
  // eslint-disable-next-line boundaries/dependencies
  import { PrintTextsApi } from '../../features/settings/data/print-texts-api';
  // Sanctioned `core` → `shared` boundary crossing: `PrintDocument` is the one presentation
  // component this service renders.
  // eslint-disable-next-line boundaries/dependencies
  import { PrintDocument } from '../../shared/components/print-document/print-document';
  import {
    PrintArticle,
    PrintDocumentModel,
    PrintSeller,
    buildAbgabeBelegModel,
    buildVerkaeuferUebersichtModel,
    // eslint-disable-next-line boundaries/dependencies
  } from '../../shared/components/print-document/print-document.model';

  /** Data needed to print the Abgabe-Beleg after "Speichern" (Artikelannahme) or a Freigabe. */
  export interface IntakeReceiptData {
    articleIds: string[];
    sellerId: string;
  }

  /** Data needed to print a seller's Verkäufer-Übersicht (Abrechnung). */
  export interface SellerSummaryPrintData {
    sellerId: string;
  }

  const REGISTERED_STATUS = 'registered';
  const PRINT_HOST_ATTRIBUTE = 'data-print-host';
  const PRINT_STYLE_ATTRIBUTE = 'data-print-style';

  /**
   * Gilt nur, solange das Druckdokument im DOM hängt: A4 hochkant ohne Seitenrand, und im Druck
   * bleibt von der Seite nur das Dokument übrig — alles andere im `body` (App, Overlays, Toasts)
   * entfällt, der Host rückt aus dem Off-Canvas-Bereich in den normalen Fluss.
   */
  const PRINT_STYLE = `
  @page { size: A4 portrait; margin: 0; }
  @media print {
    html, body { margin: 0 !important; background: #fff !important; }
    body > *:not([data-print-host]) { display: none !important; }
    body > [data-print-host] { position: static !important; left: auto !important; top: auto !important; }
  }
  `;

  const LOAD_ERROR_MESSAGE = 'Beleg konnte nicht geladen werden';

  function toPrintSeller(seller: PrintSeller): PrintSeller {
    return {
      id: seller.id,
      firstName: seller.firstName,
      lastName: seller.lastName,
      address: seller.address,
      postalCode: seller.postalCode,
      city: seller.city,
    };
  }

  function toPrintArticle(article: ArticleSummary): PrintArticle {
    return {
      number: article.number,
      name: article.name,
      category: article.category,
      brand: article.brand,
      size: article.size,
      color: article.color,
      price: article.price,
      status: article.status,
    };
  }

  /**
   * Lädt die Daten, baut das Modell des Belegs, rendert `PrintDocument` dynamisch, öffnet den
   * Druckdialog des Geräts und baut alles bei `afterprint` wieder ab. Die Aufrufer übergeben nur
   * Ids; welche Artikel auf den Beleg kommen, entscheidet der jeweilige Auslöser:
   * Druckbutton = alle außer „Registriert", Speichern/Freigabe = die gebuchten bzw. freigegebenen.
   */
  @Injectable({ providedIn: 'root' })
  export class PrintService {
    private readonly sellersApi = inject(SellersApi);
    private readonly settlementApi = inject(SettlementApi);
    private readonly printTextsApi = inject(PrintTextsApi);
    private readonly messageService = inject(MessageService);
    private readonly appRef = inject(ApplicationRef);

    /** Abbau des aktuell eingehängten Dokuments; `null`, solange keins hängt. */
    private activeCleanup: (() => void) | null = null;

    /** Druckbutton der Verkäufer-Kachel: alle Artikel des Verkäufers außer „Registriert". */
    printSellerReceipt(sellerId: string): void {
      this.loadAbgabeBeleg(sellerId, (articles) =>
        articles.filter((article) => article.status !== REGISTERED_STATUS),
      ).subscribe({
        next: (model) => this.mountRenderAndPrint(model),
        error: () => this.showLoadError(),
      });
    }

    /** „Speichern" in der Artikelannahme und Freigabe: genau die übergebenen Artikel. */
    printIntakeReceipt(data: IntakeReceiptData): void {
      const wanted = new Set(data.articleIds);
      this.loadAbgabeBeleg(data.sellerId, (articles) =>
        articles.filter((article) => wanted.has(article.id)),
      ).subscribe({
        next: (model) => this.mountRenderAndPrint(model),
        // Die Buchung ist schon erfolgt; der Toast sagt nur, dass der Beleg fehlt.
        error: () => this.showLoadError(),
      });
    }

    /** Druck in der Abrechnung: Verkäufer-Übersicht mit den Beträgen der Abrechnung. */
    printSellerSummary(data: SellerSummaryPrintData): void {
      forkJoin({
        seller: this.sellersApi.getById(data.sellerId),
        settlement: this.settlementApi.getSettlement(data.sellerId),
        articles: this.sellersApi.getArticles(data.sellerId),
        texts: this.printTextsApi.get(),
      })
        .pipe(
          map(({ seller, settlement, articles, texts }) =>
            buildVerkaeuferUebersichtModel({
              seller: toPrintSeller(seller),
              articles: articles.map(toPrintArticle),
              freitexts: texts.verkaeuferUebersicht,
              feePerItem: seller.feePerItem,
              settlement: {
                revenue: settlement.revenue,
                commission: settlement.commission,
                payout: settlement.payout,
                commissionRate: settlement.commissionRate,
              },
              printedAt: new Date(),
            }),
          ),
        )
        .subscribe({
          next: (model) => this.mountRenderAndPrint(model),
          error: () => this.showLoadError(),
        });
    }

    private showLoadError(): void {
      this.messageService.add({ severity: 'error', summary: LOAD_ERROR_MESSAGE });
    }

    private loadAbgabeBeleg(
      sellerId: string,
      selectArticles: (articles: ArticleSummary[]) => ArticleSummary[],
    ): Observable<PrintDocumentModel> {
      return forkJoin({
        seller: this.sellersApi.getById(sellerId),
        articles: this.sellersApi.getArticles(sellerId),
        texts: this.printTextsApi.get(),
      }).pipe(
        map(({ seller, articles, texts }) =>
          buildAbgabeBelegModel({
            seller: toPrintSeller(seller),
            articles: selectArticles(articles).map(toPrintArticle),
            freitexts: texts.abgabeBeleg,
            feePerItem: seller.feePerItem,
            commissionRate: seller.salesCommission,
            printedAt: new Date(),
          }),
        ),
      );
    }

    private mountRenderAndPrint(model: PrintDocumentModel): void {
      // Ein Dokument aus einem früheren Druck, dessen `afterprint` ausblieb (Android/iOS) oder das
      // nach einem Doppelklick noch hängt, wird zuerst abgebaut — es hängt immer höchstens eins.
      this.activeCleanup?.();

      const componentRef: ComponentRef<PrintDocument> = createComponent(PrintDocument, {
        environmentInjector: this.appRef.injector,
      });
      componentRef.setInput('model', model);

      const hostElement = componentRef.location.nativeElement as HTMLElement;
      hostElement.setAttribute(PRINT_HOST_ATTRIBUTE, '');
      // Off-screen, not `display: none` — a hidden host would stay unrendered for `window.print()`
      // too. Im Druck rückt das Isolations-CSS den Host in den normalen Fluss.
      hostElement.style.position = 'fixed';
      hostElement.style.top = '0';
      hostElement.style.left = '-10000px';
      document.body.appendChild(hostElement);

      const styleElement = document.createElement('style');
      styleElement.setAttribute(PRINT_STYLE_ATTRIBUTE, '');
      styleElement.textContent = PRINT_STYLE;
      document.head.appendChild(styleElement);

      this.appRef.attachView(componentRef.hostView);

      const cleanup = (): void => {
        window.removeEventListener('afterprint', cleanup);
        this.activeCleanup = null;
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
        hostElement.remove();
        styleElement.remove();
      };
      this.activeCleanup = cleanup;
      window.addEventListener('afterprint', cleanup);

      this.appRef.tick();
      componentRef.instance.applyMeasurement();
      this.appRef.tick();
      this.openPrintDialog(cleanup);
    }

    /**
     * Kein `finally`: Auf Android/iOS kehrt `window.print()` sofort zurück, während der Dialog
     * noch rendert — abgebaut wird hier nur, wenn der Aufruf selbst wirft.
     */
    private openPrintDialog(cleanup: () => void): void {
      try {
        window.print();
      } catch (error: unknown) {
        cleanup();
        console.error('[PrintService] window.print failed', error);
      }
    }
  }
  ```
  `intake-session-list.ts` — in `book` den Aufruf ersetzen durch:
  ```ts
          this.printService.printIntakeReceipt({
            articleIds: result.articleIds,
            sellerId: this.sellerId(),
          });
  ```
  `release-dialog.ts` — in `book` den Aufruf ersetzen durch:
  ```ts
          this.printService.printIntakeReceipt({
            articleIds: Array.from(this.sessionIds()),
            sellerId: this.sellerId(),
          });
  ```
  `settlement-page.ts` — `onPrint` ersetzen durch:
  ```ts
    onPrint(): void {
      const sellerId = this.selectedSellerId();
      if (!sellerId) return;
      this.printService.printSellerSummary({ sellerId });
    }
  ```
  und in `onSettleConfirmed` die Zeile `this.printService.printSellerSummary({ sellerId, phase: 'final' });` ersetzen durch `this.printService.printSellerSummary({ sellerId });`.
  `settlement-panel.ts` Zeile 15 — Verweis `` `print-abgabe-beleg.ts`'s `formatCurrency` `` ersetzen durch `` `print-document.model.ts`'s `formatCurrency` ``.
  `shell.scss` — den Block `@media print { … }` (Zeilen 20–30) vollständig entfernen; das Isolations-CSS kommt jetzt vom `PrintService`.
  Alte Komponenten löschen (Befehl im Checkout-Wurzelverzeichnis):
  ```
  git rm -r src/bazaar-app/frontend/src/app/shared/components/print-abgabe-beleg src/bazaar-app/frontend/src/app/shared/components/print-verkaeufer-uebersicht
  ```
  Danach prüfen: `grep -rn "print-abgabe-beleg\|print-verkaeufer-uebersicht\|PrintAbgabeBeleg\|PrintVerkaeuferUebersicht" src/bazaar-app/frontend/src` — erwartet: keine Treffer.
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehle: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/core/print/print.service.spec.ts`, `… --include src/app/features/intake/components/intake-session-list/intake-session-list.spec.ts`, `… --include src/app/features/sellers/components/release-dialog/release-dialog.spec.ts`, `… --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` — erwartet: PASS; danach `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(print): PrintService druckt das neue Dokument, Aufrufer ohne Gebührenbetrag und Phase" -- src/bazaar-app/frontend/src/app/core/print src/bazaar-app/frontend/src/app/core/shell/shell.scss src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog src/bazaar-app/frontend/src/app/features/settlement src/bazaar-app/frontend/src/app/shared/components/print-abgabe-beleg src/bazaar-app/frontend/src/app/shared/components/print-verkaeufer-uebersicht`

---

### Task 11: Druckbutton an der Verkäufer-Kachel

**ACs:** AC-01, AC-02, AC-03

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card/seller-card.html:14-43` · `.seller-card__actions`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card/seller-card.ts:39-48` · `SellerCard` (Outputs) und `onStatusClick`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card/seller-card.spec.ts:26-` · `render_ImportVisibleAndNotSettled_ShowsEnabledIconOnlyButtonAfterCameraButton` (bestehender Test; der neue Block kommt ans Ende des äußeren `describe` für `SellerCard`)
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html:86-91` · `(importArticles)="onImportArticles($event)"`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts:132,292` · `onImportArticles` (dazu der Inject neben `private readonly messageService = inject(MessageService);`)
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts:90,119,145,574` · `describe('article import'` (neuer Block direkt davor, also nach dem Block für `scan`; Provider nach `{ provide: MessageService, useValue: { add: messageServiceAdd } },`)

**Interfaces:**
- Consumes (Task 10): `PrintService.printSellerReceipt(sellerId: string): void` (`core/print/print.service`); bestehend `SellerCard`-Modell (`features/sellers/data/sellers-api`).
- Produces: `SellerCard.printReceipt = output<SellerCardModel>()`, `SellerCard.onPrintReceipt(): void`; `SellersPage.onPrintReceipt(card: SellerCardModel): void`. Der Druckbutton (`ariaLabel="Drucken"`, Icon `pi pi-print`) ist die letzte Aktion rechts und unabhängig von `importVisible` sichtbar.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  `seller-card.spec.ts` — im bestehenden Test `render_ImportVisibleAndNotSettled_ShowsEnabledIconOnlyButtonAfterCameraButton` (im `describe('import button')`) die erwartete Liste ersetzen durch (AC-01: Drucken ist die letzte Aktion, auch nach „Importieren"):
  ```ts
        expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
          'Bearbeiten',
          'Scannen',
          'Importieren',
          'Drucken',
        ]);
  ```
  Außerdem vor der schließenden Klammer des äußeren `describe('SellerCard', () => { … })` einfügen:
  ```ts
    describe('print button', () => {
      function actionLabels(el: HTMLElement): string[] {
        return Array.from(el.querySelectorAll('.seller-card__actions button')).map(
          (button) => button.getAttribute('aria-label') ?? '',
        );
      }

      it('template_withoutImportRight_showsPrintAsLastActionNextToEditAndScan', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', buildCard());
        fixture.componentRef.setInput('importVisible', false);

        // Act
        await fixture.whenStable();

        // Assert
        expect(actionLabels(fixture.nativeElement)).toEqual(['Bearbeiten', 'Scannen', 'Drucken']);
      });

      it('template_printButton_usesPrinterIcon', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', buildCard());

        // Act
        await fixture.whenStable();

        // Assert
        const button = (fixture.nativeElement as HTMLElement).querySelector('button[aria-label="Drucken"]');
        expect(button?.querySelector('.pi-print')).not.toBeNull();
      });

      it('onPrintReceipt_buttonClicked_emitsCardWithoutOpeningDetail', async () => {
        // Arrange
        const card = buildCard({ articleCount: 0 });
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', card);
        const printSpy = vi.fn();
        const cardClickSpy = vi.fn();
        fixture.componentInstance.printReceipt.subscribe(printSpy);
        fixture.componentInstance.cardClick.subscribe(cardClickSpy);
        await fixture.whenStable();
        const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
          'button[aria-label="Drucken"]',
        );

        // Act
        button?.click();

        // Assert
        expect(printSpy).toHaveBeenCalledWith(card);
        expect(cardClickSpy).not.toHaveBeenCalled();
      });
    });
  ```
  `sellers-page.spec.ts` — Import ergänzen und Provider einfügen:
  ```ts
  import { PrintService } from '../../../../core/print/print.service';
  import { SellerCard as SellerCardComponent } from '../../components/seller-card/seller-card';
  ```
  Im `let`-Block `let printSellerReceipt: ReturnType<typeof vi.fn>;` ergänzen, in `beforeEach` vor `await TestBed.configureTestingModule` die Zeile `printSellerReceipt = vi.fn();` und im `providers`-Array nach `{ provide: MessageService, useValue: { add: messageServiceAdd } },` die Zeile:
  ```ts
          { provide: PrintService, useValue: { printSellerReceipt } },
  ```
  Neuer Block nach dem Block `describe('scan', () => { … })`, direkt vor `describe('article import', () => {`:
  ```ts
    describe('print receipt', () => {
      it('onPrintReceipt_clickedCard_printsTheReceiptOfThatSeller', async () => {
        // Arrange
        const { component } = await createPage();

        // Act
        component.onPrintReceipt(buildCard({ id: 's1' }));

        // Assert
        expect(printSellerReceipt).toHaveBeenCalledWith('s1');
        expect(component.detailModalVisible()).toBe(false);
      });

      it('template_printOutputOfSellerCard_isWiredToOnPrintReceipt', async () => {
        // Arrange
        itemsSignal.set([buildCard({ id: 's7' })]);
        const { fixture } = await createPage();
        const cardComponent = fixture.debugElement.query(By.directive(SellerCardComponent))
          .componentInstance as SellerCardComponent;

        // Act
        cardComponent.printReceipt.emit(buildCard({ id: 's7' }));

        // Assert
        expect(printSellerReceipt).toHaveBeenCalledWith('s7');
      });
    });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehle: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/seller-card/seller-card.spec.ts` und `… --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL (`printReceipt` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `seller-card.html` — nach dem schließenden `}` des `@if (importVisible()) { … }`-Blocks (vor dem `</div>` der Aktionsleiste) einfügen:
  ```html
        <p-button
          icon="pi pi-print"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          ariaLabel="Drucken"
          (click)="$event.stopPropagation()"
          (onClick)="onPrintReceipt(); $event.stopPropagation()"
        />
  ```
  `seller-card.ts` — nach `readonly importArticles = output<SellerCardModel>();` ergänzen:
  ```ts
    readonly printReceipt = output<SellerCardModel>();
  ```
  und nach der Methode `onImportArticles`:
  ```ts
    onPrintReceipt(): void {
      this.printReceipt.emit(this.card());
    }
  ```
  `sellers-page.html` — im `<app-seller-card …>` nach `(importArticles)="onImportArticles($event)"` ergänzen:
  ```html
                  (printReceipt)="onPrintReceipt($event)"
  ```
  `sellers-page.ts` — Import `import { PrintService } from '../../../../core/print/print.service';` (neben dem Import von `RoleService`), nach `private readonly messageService = inject(MessageService);` ergänzen `private readonly printService = inject(PrintService);` und vor `onImportArticles` einfügen:
  ```ts
    onPrintReceipt(card: SellerCardModel): void {
      this.printService.printSellerReceipt(card.id);
    }
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehle: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/seller-card/seller-card.spec.ts` und `… --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(sellers): Druckbutton an der Verkäufer-Kachel" -- src/bazaar-app/frontend/src/app/features/sellers/components/seller-card src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page`

---

### Task 12: Dokumentation nachführen und Gesamtprüfung

**ACs:** AC-01, AC-02, AC-05, AC-11, AC-24, AC-25, AC-34

**Dateien:**
- Create: `docs/requirements/bazaar-app/components/print-document.md`
- Delete: `docs/requirements/bazaar-app/components/print-abgabe-beleg.md`
- Delete: `docs/requirements/bazaar-app/components/print-verkaeufer-uebersicht.md`
- Modify: `docs/requirements/bazaar-app/components/overview.md:45-50` · `## Druckansichten` (Abschnitt, Tabellenzeilen 49–50)
- Modify: `docs/components/form/component.md:26` · `| **R-4** |` (Tabellenzeile der Regel R-4 mit den Links)
- Modify: `docs/requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md:8,26` · `# Epic: Druckfunktionen` (Nachtrag darunter; Links in Zeile 26 `Component-Details`)
- Modify: `docs/glossary/frontend-terms.md:100,105` · `### Abgabe-Beleg` (dazu `### Verkäufer-Übersicht` ersetzen; neue Einträge `### Kennzahl-Kachel` und `### Freitext (Beleg)` am Ende der Datei)
- Modify: `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md:5,7` · `## Capabilities` (dazu `**Last reviewed:**`)
- Modify: `docs/knowledge/feature-profile/bazaar-app-settings/feature.md:3,5,14,36` · `## Capabilities` (Abschnitt vor `### Stammdaten-Import`; dazu `## Spans`, `**Intent:**`, `**Last reviewed:**`)
- Modify: `docs/knowledge/feature-profile/bazaar-app-settlement/feature.md:11` · `User can print a Zwischen- bzw. Endabrechnung`
- Modify: `docs/knowledge/feature-profile/bazaar-app-intake/feature.md:40` · `User sees einen Beleg-Druck ausgelöst nach erfolgreicher Buchung`

**Interfaces:**
- Consumes: Ergebnis der Tasks 1–11 (Namen: `PrintDocument`, `PrintService.printSellerReceipt|printIntakeReceipt|printSellerSummary`, `PrintTextsForm`, `GET/PUT /api/settings/print-texts`).
- Produces: aktuelle Anforderungs-Doku, Glossar und Profile; kein Code.

- [ ] **Schritt 1: Ist-Stand prüfen**
  Befehl: `grep -rn "print-abgabe-beleg\|print-verkaeufer-uebersicht" docs/requirements docs/components docs/glossary docs/knowledge` — erwartet: Treffer in `overview.md`, `form/component.md`, `Epic_Druckfunktionen/epic.md`, `glossary/frontend-terms.md` und den beiden Komponenten-Dokus selbst (das sind genau die Stellen dieses Tasks).
- [ ] **Schritt 2: Dokumentation anpassen**
  1. Neue Datei `docs/requirements/bazaar-app/components/print-document.md`:
     ```markdown
     ---
     status: reviewed
     reviewed-date: 2026-10-14
     ---

     # Component: print-document

     **Bibliothek:** keine PrimeNG-Komponente — reines HTML/CSS-Dokument; QR-Code über [`qr-code`](../../../components/qr-code/component.md)
     **Verwendung:** Nur Haupt-App — Abgabe-Beleg und Verkäufer-Übersicht ([Epic_Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md)); Spec: [`docs/forge/2026-10-14-beleg-druck-vorlagen/spec.md`](../../../forge/2026-10-14-beleg-druck-vorlagen/spec.md)

     ## Überblick
     Ein gemeinsames A4-Dokument (`app-print-document`) für zwei Vorlagen. Es rendert ein fertiges Modell (`PrintDocumentModel`) und kennt weder HTTP noch Fachregeln. Der `PrintService` lädt die Daten, baut das Modell (`buildAbgabeBelegModel` bzw. `buildVerkaeuferUebersichtModel`), hängt das Dokument als einziges sichtbares Element in die Seite und öffnet den Druckdialog des Geräts.

     ## Auslöser und Artikelmenge
     | Auslöser | Vorlage | Artikel im Dokument |
     |---|---|---|
     | „Speichern" in der Artikelannahme | Abgabe-Beleg | die gerade gebuchten Artikel (alle „Registriert") |
     | Freigabe | Abgabe-Beleg | die freigegebenen Artikel („Im Verkauf") |
     | Druckbutton der Verkäufer-Kachel | Abgabe-Beleg | alle Artikel des Verkäufers außer „Registriert" |
     | Drucken in der Abrechnung | Verkäufer-Übersicht | alle Artikel außer „Registriert" |

     Der Druckbutton ist für alle Rollen sichtbar, die die Verkäufer-Kachel sehen, und bleibt auch ohne Artikel aktiv. Lässt sich der Beleg nicht laden, erscheint ein Toast „Beleg konnte nicht geladen werden" und keine Vorschau.

     ## Layout
     Seite 1 von oben nach unten: Kopfzeile (Freitext 1 links, Freitext 2 zentriert, Datum/Uhrzeit des Drucks rechts) · Verkäufer-Block (Name, Straße, PLZ Ort; rechts QR-Code der Verkäufer-ID mit ID als Text) · Kennzahl-Kacheln Zeile A · Zeile B (halb so hoch) · Freitext 3 (entfällt ohne Text) · Artikelliste bis zur Fußzeile · Fußzeile (Freitext 4 links, Freitext 5 zentriert, „Seite x von y" rechts). Ab Seite 2: Kopfzeile, eine Zeile mit Verkäufer-ID und Anschrift, Fortsetzung der Artikelliste mit wiederholtem Tabellenkopf, Fußzeile.

     | Vorlage | Zeile A | Zeile B |
     |---|---|---|
     | Abgabe-Beleg | Verkäufer-ID · Anzahl abgegebener Artikel | Gebühr Y € / Artikel (= Anzahl × Y, berechnet) · Provision (Satz X %) |
     | Verkäufer-Übersicht | Verkäufer-ID · Anzahl abgegebener · offener · verkaufter Artikel · Einnahmen | Gebühr · Provision X % (= Umsatz × X / 100) · Verdienst (= Umsatz − Provision) |

     Artikelliste: Tabelle mit Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis; gruppiert nach „Registriert" (nur bei „Speichern"), „Im Verkauf", „Verkauft", „Zurückgegeben"; leere Gruppen entfallen; je Gruppe Artikelnummer aufsteigend.

     ## Seitenaufteilung
     Feste Maße (`print-document.layout.ts`, A4 hochkant), Zeilen mit fester Höhe (zu lange Texte werden abgeschnitten), Kopf- und Fußzeile mit fester Höhe. Nur die Höhe von Freitext 3 wird vor dem Druck gemessen. „Seite x von y" ist Text im Dokument, nicht CSS-Seitenzähler — damit es auch unter iOS/Safari funktioniert.

     ## Freitexte
     Je Vorlage fünf Freitexte, gepflegt von einem Admin unter Einstellungen → „Freitexte der Belege" (`PrintTextsForm`, `GET/PUT /api/settings/print-texts`, je Text höchstens 5000 Zeichen). Markdown mit Überschriften, Fett, Kursiv, Absätzen, Listen und Tabellen; Links, Bilder und HTML werden nicht dargestellt. Änderungen gelten ab dem nächsten Druck.

     ## Akzeptanzkriterien
     Siehe die ACs der [Spec](../../../forge/2026-10-14-beleg-druck-vorlagen/spec.md) (AC-01 bis AC-34).
     ```
  2. `git rm docs/requirements/bazaar-app/components/print-abgabe-beleg.md docs/requirements/bazaar-app/components/print-verkaeufer-uebersicht.md`
  3. `overview.md`: die beiden Tabellenzeilen unter `## Druckansichten` (Zeilen 49–50, Komponenten `print-abgabe-beleg` und `print-verkaeufer-uebersicht`) durch eine Zeile ersetzen:
     ```markdown
     | [print-document](print-document.md) | Gemeinsames A4-Druckdokument für Abgabe-Beleg und Verkäufer-Übersicht (Kennzahl-Kacheln, Freitexte, Artikeltabelle) | [Druckfunktionen](../epics/Epic_Druckfunktionen/epic.md) |
     ```
  4. Links in `docs/components/form/component.md` (Regel R-4) und `docs/requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md` umbiegen:
     ```
     sed -i 's#print-abgabe-beleg\.md#print-document.md#g; s#print-verkaeufer-uebersicht\.md#print-document.md#g' docs/components/form/component.md docs/requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md
     ```
     Im Epic direkt unter der Überschrift `# Epic: Druckfunktionen` einen Hinweis einfügen:
     ```markdown
     > **Nachtrag 2026-10-14:** Layout, Freitexte, Kennzahl-Kacheln, Druckbutton an der Verkäufer-Kachel und die Verkäufer-Übersicht ohne „vorläufig/endgültig" sind in [Abgabe-Beleg und Verkäufer-Übersicht drucken](../../../../forge/2026-10-14-beleg-druck-vorlagen/spec.md) neu festgelegt und ersetzen die Beschreibungen in den Abschnitten 1 und 2 dieses Epics, soweit sie widersprechen (z. B. „gezahlter Gebührenbetrag" → berechnete Gebühr, „Auszahlung" → „Verdienst").
     ```
  5. `docs/glossary/frontend-terms.md`: Den Eintrag `### Abgabe-Beleg` ersetzen durch:
     ```markdown
     ### Abgabe-Beleg
     - **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.ts` — Druckdokument der Haupt-App über abgegebene Artikel (Komponente `PrintDocument`, Modell-Builder `buildAbgabeBelegModel`), gedruckt über `PrintService.printIntakeReceipt` bei „Speichern" in der Artikelannahme und bei der Freigabe sowie über `PrintService.printSellerReceipt` beim Druckbutton der Verkäufer-Kachel. Nicht verwenden: „Druckvorlage".
     - **Confidence:** user-confirmed
     - **First seen:** 2026-10-14
     ```
     den Eintrag `### Verkäufer-Übersicht` ersetzen durch:
     ```markdown
     ### Verkäufer-Übersicht
     - **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.ts` — Druckdokument der Abrechnung in der Haupt-App (dieselbe Komponente `PrintDocument` wie der Abgabe-Beleg, Modell-Builder `buildVerkaeuferUebersichtModel`, mehr Kennzahl-Kacheln, „Verdienst" statt „Auszahlung"), gedruckt über `PrintService.printSellerSummary`.
     - **Confidence:** user-confirmed
     - **First seen:** 2026-10-14
     ```
     und am Ende der Datei neue Einträge anfügen:
     ```markdown
     ### Kennzahl-Kachel
     - **Maps to:** `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.html` — Infoblock auf dem Beleg (Titel links oben, darunter größerer, dickerer Wert, linksbündig), Klassen `.print-doc__tile`, Zeilen `.print-doc__tiles--a|--b`. „Kachel" allein bleibt die Verkäufer-Kachel.
     - **Confidence:** user-confirmed
     - **First seen:** 2026-10-14

     ### Freitext (Beleg)
     - **Maps to:** `src/bazaar-app/frontend/src/app/features/settings/components/print-texts-form/print-texts-form.ts` — fünf Markdown-Texte je Vorlage (Abgabe-Beleg, Verkäufer-Übersicht), zusammen zehn Felder: 1 Kopfzeile links, 2 Kopfzeile Mitte, 3 über der Artikelliste, 4 Fußzeile links, 5 Fußzeile Mitte; Backend `Settings.AbgabeBeleg`/`Settings.VerkaeuferUebersicht` (`PrintTexts`), Endpoints `GET/PUT /api/settings/print-texts`.
     - **Confidence:** user-confirmed
     - **First seen:** 2026-10-14
     ```
  6. Feature-Profile (je eine Zeile bzw. ein kurzer Abschnitt, Format der Datei beibehalten):
     - `bazaar-app-sellers/feature.md`, unter `## Capabilities` anfügen: `- User can print the Abgabe-Beleg of a seller from the Verkäufer-Kachel (Drucker-Icon, last action, visible for all roles, active even without articles; error toast if data cannot be loaded) — \`components/seller-card/seller-card.{ts,html}\` (\`printReceipt\`), \`pages/sellers-page/sellers-page.ts\` (\`onPrintReceipt\` → \`PrintService.printSellerReceipt\`)`; `**Last reviewed:**` auf `2026-10-14` setzen.
     - `bazaar-app-settings/feature.md`: unter `## Capabilities` vor `### Stammdaten-Import` einen Abschnitt `### Freitexte der Belege (\`print-texts-form\`)` mit den Zeilen `- Admin edits five Markdown free texts per template (Abgabe-Beleg, Verkäufer-Übersicht) — \`features/settings/components/print-texts-form/print-texts-form.{ts,html}\`, \`data/print-texts-api.ts\`` und `- Free texts apply from the next print; links, images and HTML are not rendered — \`shared/components/print-document/print-document.markdown.ts\``; in `## Spans` Backend ergänzen: `Bazaar.Api/Features/Settings/SettingsEndpoints.cs` (`GET/PUT /api/settings/print-texts`); `**Last reviewed:**` auf `2026-10-14`; Intent-Satz um „Freitexte der Belege" erweitern.
     - `bazaar-app-settlement/feature.md` Zeile 11 ersetzen durch: `- User can print the Verkäufer-Übersicht (Kennzahl-Kacheln, Freitexte, nach Status gruppierte Artikeltabelle, Verdienst statt Auszahlung; kein vorläufig/endgültig mehr) — \`settlement-page.ts\` (\`onPrint\`, \`PrintService.printSellerSummary({ sellerId })\`)`.
     - `bazaar-app-intake/feature.md` Zeile 40 ersetzen durch: `- User sees den Abgabe-Beleg (neues A4-Layout, Gruppe „Registriert") als Druckvorschau nach erfolgreicher Buchung — \`intake-session-list.ts\` (\`onPaymentConfirmed\` → \`PrintService.printIntakeReceipt({ articleIds, sellerId })\`)`.
- [ ] **Schritt 3: Gesamtprüfung laufen lassen**
  Befehle (in dieser Reihenfolge):
  `grep -rn "print-abgabe-beleg\|print-verkaeufer-uebersicht" docs/requirements docs/components docs/glossary docs/knowledge` — erwartet: keine Treffer;
  `dv-dotnet-build --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: OK;
  `dv-dotnet-test --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: alle Tests PASS (Integrationstests mit Testcontainern brauchen Docker; schlagen sie nur wegen fehlendem Docker fehl, im Bericht nennen);
  `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK;
  `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK, keine Budget-Fehler für `print-document.scss`;
  `dv-angular-test --root <R>/src/bazaar-app/frontend` — erwartet: alle Tests PASS (schlägt eine andere Spec fehl, weil sie `SellersPage` oder `PrintService` ohne `HttpClient` instanziiert, dort `PrintService` bzw. `PrintTextsApi` wie in Task 11 per `useValue` stubben).
  AC-24, AC-17 und AC-34 sind automatisiert über Struktur und Maße abgesichert (Task 10: `@page`-CSS; Task 7/9: Höhe Zeile B, Listenbereich mit fester Höhe unmittelbar vor der Fußzeile auf jeder Seite). Zusätzlich bleibt die Sichtprüfung der echten Darstellung im Druckdialog auf Desktop, Tablet und Smartphone, weil jsdom nicht rendert; im Abschlussbericht als manuelle Abnahme nennen.
- [ ] **Schritt 4: Commit**
  `git add -N docs/requirements/bazaar-app/components/print-document.md` · `git commit -m "docs(print): Beleg-Dokumentation, Glossar und Profile nachgeführt" -- docs/requirements/bazaar-app/components docs/components/form/component.md docs/requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md docs/glossary/frontend-terms.md docs/knowledge/feature-profile`

## Entscheidungen
- **W · Fehlermeldung bei nicht ladbaren Belegdaten (AC-05)** · Aussage — Die sichtbare Fehlermeldung ist ein Toast (`MessageService`, Severity `error`), wie überall in der Haupt-App; keine Vorschau. Umgesetzt in Task 10 mit dem Text „Beleg konnte nicht geladen werden".
- **E · Ablage der Freitexte** · Planer — Eigene Endpoints `GET/PUT /api/settings/print-texts` statt Erweiterung von `GET/PUT /api/settings`. Grund: Das Lesen braucht jeder angemeldete Nutzer (Druck), das Schreiben nur der Admin; so bleiben `settings-form` (Scan-Pause), `SettingsService` und deren Tests unverändert, und beide Formulare speichern unabhängig voneinander.
- **E · Datenmodell der Freitexte** · Planer — Zwei Complex-Type-Sätze `AbgabeBeleg`/`VerkaeuferUebersicht` (je fünf Strings) am `Settings`-Singleton, Spalten `AbgabeBeleg_Text1` … `VerkaeuferUebersicht_Text5`, höchstens 5000 Zeichen je Text (die Spec nennt keine Grenze; sie schützt vor unbeabsichtigt riesigen Texten). Die bestehende Zeile `Id = 1` erhält Standardwert `""`.
- **E · Markdown-Bibliothek** · Planer — `marked` 18.1.1 mit eigenem Renderer: HTML wird als Text maskiert, Links werden zu ihrem Text, Bilder zu ihrem Alt-Text; zusätzlich filtert Angulars Sanitizer bei `[innerHTML]`. Grund: kleine Abhängigkeit, Token-Renderer-API im installierten Paket geprüft; kein eigener Parser, kein zusätzlicher Sanitizer nötig.
- **E · Seitenaufteilung und „Seite x von y"** · Planer — Eigene Paginierung mit festen Maßen (`print-document.layout.ts`) statt CSS-Seitenzähler/Margin-Boxes; nur Freitext 3 wird gemessen. Grund: „Seite x von y" und der wiederholte Kopf sollen auf Desktop, Tablet und Smartphone (iOS/Safari) gleich funktionieren; Seitenhöhe 296 mm statt 297 mm gegen Rundungs-Leerseiten.
- **E · Feste Zeilen- und Blockhöhen** · Planer — Tabellenzeilen, Kopf- und Fußzeile haben feste Höhe; zu lange Texte werden abgeschnitten (Ellipsis bzw. Überlauf verborgen). Grund: Voraussetzung für die deterministische Seitenaufteilung; Freitexte in Kopf- und Fußzeile müssen in ca. 18 mm bzw. 14 mm passen.
- **E · Nur nicht-leere Status-Gruppen** · Planer — Gruppen ohne Artikel erscheinen nicht (die alte Verkäufer-Übersicht zeigte leere Gruppen mit „—"). Grund: Die Spec nennt nur die Reihenfolge der Gruppen; „Registriert" steht bei „Speichern" ohnehin allein, und ein Verkäufer ohne Artikel hat laut AC-04 eine leere Liste.
- **E · Anschrift im Verkäufer-Block** · Planer — Drei Zeilen: „Vorname Nachname", Straße, „PLZ Ort" (PLZ und Ort in einer Zeile, wie die Soll-Vorgabe sagt). AC-13 („stehen … in einer Zeile") lässt eine zweite Lesart zu (alles in einer Zeile); die Soll-Vorgabe ist die engere und wurde gewählt — bei Widerspruch zur Absicht der Spec ist eine Rückfrage fällig.
- **E · Druck-Isolierung** · Planer — Der `PrintService` fügt beim Druck ein `<style data-print-style>` mit `@page { size: A4 portrait; margin: 0 }` und einer Regel ein, die im Druck alle `body`-Kinder außer dem Dokument-Host ausblendet; beim `afterprint` wird alles entfernt. Der alte `@media print`-Block in `shell.scss` entfällt. Grund: Die Ursache des Fehlers („Vorschau zeigt den Seiteninhalt") war, dass nur Navigation und Topbar ausgeblendet wurden; die neue Regel ist unabhängig vom Seitenaufbau und von Overlays.
- **E · Datenquellen der Kennzahlen** · Planer — Gebühr je Artikel aus `SellerDetail.feePerItem`, Provisionssatz im Abgabe-Beleg aus `SellerDetail.salesCommission`; in der Verkäufer-Übersicht kommen Einnahmen, Provision und Verdienst aus der Abrechnung (`revenue`, `commission`, `payout`, `commissionRate`) ohne eigene Rechnung, die Zähler aus den Artikeln im Dokument.
- **E · Signaturen des `PrintService`** · Planer — `printIntakeReceipt` verliert `feeAmount`, `printSellerSummary` verliert `phase` (beide Werte erscheinen nicht mehr auf dem Dokument); neu `printSellerReceipt(sellerId)` für den Druckbutton. Die Aufrufer und ihre Tests werden im selben Task angepasst, damit der Build zu keinem Zeitpunkt bricht.
- **E · Fehlerbehandlung je Auslöser** · Planer — Der Toast „Beleg konnte nicht geladen werden" bei Ladefehler gilt für alle vier Auslöser (Druckbutton laut AC-05, dazu „Speichern", Freigabe und Abrechnung); bei „Speichern" und Freigabe ist die Buchung schon erfolgt, der Toast meldet nur den fehlenden Beleg. Grund: sonst passiert sichtbar nichts und der Anwender hält den Beleg für gedruckt (W · Fehlerfall: sichtbare Fehlermeldung, keine Vorschau).
- **E · Test von AC-24/AC-17/AC-34** · Planer — Papierformat und Isolation sind über den eingefügten CSS-Text, die Höhe von Zeile B über die Maße (`PRINT_LAYOUT`, `style.height`) abgesichert; AC-34 über die Struktur und Maße in Task 9 (`.print-doc__list` steht auf jeder Seite unmittelbar vor `.print-doc__foot` und trägt die Höhe des Listenbereichs, Seite 1 = Innenhöhe minus feste Blöcke, auch bei wenigen Artikeln). Nur die echte Darstellung im Druckdialog lässt sich in jsdom nicht prüfen und bleibt zusätzlich eine manuelle Sichtprüfung.
- **R1 · Entscheidungen** — geändert — AC-34 hatte keinen automatisierten Test. Task 9 bindet jetzt die Höhe des Listenbereichs je Seite als Inline-Stil (`firstListMm`/`restListMm`, gleiche Werte wie die Paginierung) und prüft in zwei neuen Tests: bei einem Artikel steht die Liste direkt vor der Fußzeile und füllt mit den festen Blöcken genau die Innenhöhe; bei 80 Artikeln steht sie auf jeder Seite unmittelbar vor der Fußzeile mit der Höhe der jeweiligen Seite. Der E-Eintrag zum Test und Task 12 Schritt 3 nennen nur noch die echte Darstellung als zusätzliche manuelle Abnahme.
- **R1 · Global Constraints** — geändert — Alle genannten Soll-Vorgaben der Spec stehen jetzt mit ihren Werten in Global Constraints: Druckbutton für alle Rollen und ohne Artikel aktiv, Artikelmenge je Auslöser, Verkäufer-Block, Kennzahl-Kacheln beider Vorlagen (berechnete Gebühr, Provision, Verdienst statt Auszahlung), Spalten und Tabellenform, Liste bis zur Fußzeile, leere Freitexte, Aufbau ab Seite 2, Verkäufer-Übersicht mit denselben Gruppen ohne vorläufig/endgültig und sonst unverändert.
- **R1 · Task 1** — geändert — Beide `dotnet ef`-Befehle laufen jetzt mit vorangestelltem `ConnectionStrings__DefaultConnection="Host=localhost;Database=design_time"` (PowerShell-Variante genannt, keine Datenbank nötig, keine `IDesignTimeDbContextFactory`), weil `Program.cs` ohne Connection-String beim Design-Time-Aufbau wirft; erwartete Ausgaben ergänzt, Global Constraint zu EF-Migrationen nachgezogen. Die Snapshot-Zeile hat den Anker `BazaarDbContextModelSnapshot`.
- **R1 · Task 10** — geändert — `PrintService` zeigt den Toast „Beleg konnte nicht geladen werden" jetzt bei allen Auslösern (auch Abrechnung, Speichern, Freigabe; E-Eintrag Fehlerbehandlung angepasst). Vor jedem neuen Druck baut `activeCleanup` ein noch hängendes Dokument samt Stil ab (ausgebliebenes `afterprint` auf Android/iOS, Doppelklick); wirft `window.print()`, räumt `openPrintDialog` sofort auf (bewusst kein `finally`, weil `print()` mobil sofort zurückkehrt). Vier Tests ergänzt bzw. ersetzt. Anker der Dateizeilen auf existierende Testnamen und `SettlementPanel` umgestellt, Zeilenbereich Release-Spec auf 201–216 korrigiert.
- **R1 · Task 11** — geändert — Anker auf existierende Zeichenfolgen umgestellt: Testname `render_ImportVisibleAndNotSettled_…` in `seller-card.spec.ts`, `(importArticles)="onImportArticles($event)"` in `sellers-page.html`, `onImportArticles` in `sellers-page.ts`, `describe('article import'` in `sellers-page.spec.ts` (neuer Block direkt davor); Zeilennummern nach dem Ist-Stand korrigiert.
- **R1 · Task 12** — geändert — Jede Dateizeile beginnt jetzt mit einem literalen Anker aus der Datei (`## Druckansichten`, `| **R-4** |`, `# Epic: Druckfunktionen`, `### Abgabe-Beleg`, `## Capabilities`, die wörtlichen Profilzeilen zu Settlement und Intake); Zusatzstellen und Zeilennummern stehen in Klammern dahinter.
- **R1 · Task 3** — geändert — Anker der Zeile zu `SellerEndpoints.cs` ist jetzt `SellerEndpoints.MapSellerEndpoints`; der Endpoint-Pfad steht nur noch in der Klammer.
- **R1 · Task 5** — geändert — Anker der Zeile zu `settings-page.spec.ts` ist jetzt der bestehende Testname `hosts app-import-panel` (Einfügestelle des neuen Tests), Zeilenbereich 39–45.
- **R1 · Task 6** — geändert — Die Zeile zu `package-lock.json` hat den Anker `"packages"` und den Hinweis, dass die `marked`-Einträge von `npm install` erzeugt werden.
- **F · AC-13** — spec-rückfrage — Vorschlag 1: Die Spec ändert nur der Mensch; der Plan bleibt bei drei Zeilen (E · Anschrift im Verkäufer-Block), bis die Rückfrage beantwortet ist.
- **R2 · AC-13** — frage an den menschen — Die Soll-Vorgabe sagt „Postleitzahl und Ort in einer Zeile", AC-13 sagt „‚Anna Meier', ‚Musterstraße 5' und ‚76133 Karlsruhe' in einer Zeile". Gilt: Name, Straße und „PLZ Ort" stehen jeweils in einer eigenen Zeile, PLZ und Ort zusammen in einer Zeile (so baut und testet der Plan)? Wenn ja, wird AC-13 so umformuliert und die Planer-Entscheidung zur W-Entscheidung; wenn nein (alles in einer Zeile), ändern sich Template und Test in Task 9.
- **F · Task 8** — geändert — Vorschlag 1: `formatCurrency`/`formatPercent` bleiben in `print-document.model.ts`; ihre Doku nennt die gleichartigen privaten Kopien in `settlement-panel.ts`, `verkaeufer-dialog.ts` und `statistics-page.ts` und verweist die Zusammenführung auf ein eigenes Folge-Refactoring außerhalb dieses Plans.
- **F · Task 9** — geändert — Vorschlag 1: Neue Konstante `PRINT_LAYOUT.maxFreitext3Mm = 150` (Task 7, mit Test: Seite 1 behält dann mindestens eine Zeile, rechnerisch zwei); `applyMeasurement` begrenzt die gemessene Höhe per `Math.min` darauf, der Freitext-3-Block trägt dieselbe `max-height` mit `overflow: hidden`; neuer Test in Task 9 mit übergroßer Höhe (Listenhöhe = Wert bei Obergrenze, Seite 1 enthält einen Artikel). Task 5 zeigt in beiden Feldgruppen unter Freitext 1 bis 5 einen Hinweis zum begrenzten Platz (mit Test).
