# Etiketten-Vordruck (Haupt-App) — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-11-02-etiketten-vordruck/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Admins drucken auf der neuen Seite „Etiketten-Vordruck" Blanko-Etiketten mit fortlaufender Nummer, QR-Code, Logo, Verkäufer-Symbol und Preisfeld auf frei einstellbare Etikettenbögen, ohne Bezug zu Artikeln.
**Architektur:** Backend: neues Aggregat `LabelSheetFormat` (benannte Bogenformate) und Singleton `LabelPrintDefaults` (Logo, Verkäufer-Symbol, Währung des letzten Drucks, eigene Bilder als Data-URL) in `Bazaar.Domain/BlankLabels`, Handler in `Bazaar.Application/BlankLabels`, Endpoints `/api/label-sheet-formats` und `/api/label-print-defaults` nur für Admin. Frontend: reine Geometrie-, Layout- und Platzierungsfunktionen plus Leaf-Komponenten `app-label-card`/`app-label-sheet` in `shared/components/label-sheet` (Positionen in Prozent, Schrift in `cqw`, dadurch skaliert dasselbe Markup in der Vorschau und liegt im Druck in mm); Feature `features/blank-labels` mit Api, Store, Prüfregeln, drei Formular-Komponenten und der Seite; gedruckt wird über `PrintService.printLabelSheets` mit Seitengröße = Bogengröße.
**Tech-Stack:** .NET 10 Minimal API, EF Core 10 + Npgsql (PostgreSQL), FluentValidation, xUnit v3 + Moq, Testcontainers; Angular 22 (Standalone, Signals, OnPush, template-driven `FormsModule`), PrimeNG 22, `@lucide/angular`, `@zxing/library` (über `app-qr-code`), Vitest über `@angular/build:unit-test`.
**Spec:** docs/forge/2026-11-02-etiketten-vordruck/spec.md
**Basis:** f8fc8892

## Global Constraints
- Seite „Etiketten-Vordruck": eigener Menüeintrag in der Gruppe „System" direkt über „Einstellungen", nur Admin (Spec AC-01, AC-02).
- Alle Maße in mm; Etikettgröße und Bogengröße > 0, Ränder und Abstände ≥ 0, höchstens eine Nachkommastelle; Spalten und Zeilen ganzzahlig ≥ 1.
- Widersprüchlich, wenn Spalten × Etikettbreite + (Spalten − 1) × waagerechter Abstand + Rand links + Rand rechts die Bogenbreite um mehr als 0,5 mm übersteigt (Höhe analog mit Zeilen, senkrechtem Abstand, Rand oben/unten).
- Startnummer 1 bis 2147483646, Startnummer + Anzahl − 1 höchstens 2147483646; Anzahl 1 bis 5000; Währungssymbol 1 bis 3 Zeichen; Startposition 1 bis Anzahl pro Seite, leer = 1.
- Eigene Bilder: PNG, JPEG oder SVG, höchstens 1 MB (= 1 048 576 Byte).
- Eigene Bilder (auch SVG) werden nur über `<img [src]>` mit der Data-URL gerendert, nie per `innerHTML`, `bypassSecurityTrust*` oder inline-SVG; das Backend prüft nur Medientyp und Größe, nicht den Inhalt (Schutz vor gespeichertem XSS).
- Die Falzlinie erscheint nur in der Vorschau, nicht im Druck.
- Inhalt eines Etiketts skaliert mit der Etikettgröße; 105 × 35 mm = Maßstab 1; bei anderem Seitenverhältnis gilt das kleinere Verhältnis.
- Bogenformat-Namen eindeutig (exakt gleicher Name = gleiches Format), an den Enden getrimmt, nur Leerzeichen = leer, höchstens 50 Zeichen; beim Start kein gespeichertes Format, Felder mit Avery 16er vorbelegt (A4 210 × 297, Etikett 105 × 35, Ränder oben/unten 8,5, links/rechts 0, Abstand 0, 2 Spalten × 8 Zeilen).
- Speichert ein Admin unter einem Namen, den ein anderer Admin inzwischen gespeichert hat, erscheint die Rückfrage „Überschreiben?" wie bei einem bereits bekannten Namen (Backend 409 `label_sheet_format.name_taken`, Spec AC-11, AC-38; E · Überschreiben-Ablauf).
- Die Icon-Liste bietet mindestens ein wählbares Icon für Verkäufer-Symbol und Logo; ihr Inhalt ist Umsetzungssache (Spec-Entscheidung Icon-Liste-Umfang; Umsetzung siehe E · Icon-Liste).
- Die Seite prüft keine Nummern gegen Artikel und legt keine Artikel an oder ändert sie.
- Leere Pflichtfelder sind ungültig (Fehler am Feld; „Drucken" gesperrt, bei Maßfeldern auch „Speichern"); Logo und Verkäufer-Symbol dürfen leer bleiben, das Element entfällt dann im Etikett, sein Platz bleibt leer.
- Bei ungültiger Eingabe ist die Schaltfläche sofort gesperrt, der Fehler steht am Feld; feldübergreifende Fehler stehen am zuletzt geänderten beteiligten Feld (W · Fehlerort).
- Logo, Verkäufer-Symbol und Währungssymbol des letzten Drucks werden im Backend gemerkt, Startnummer, Anzahl, Startposition nie; Bogenformate liegen im Backend.
- Ausgabe über den Druckdialog des Browsers; die Seite zeigt den Hinweis „Skalierung 100 %, keine Seitenränder".
- Projekt-Architektur (`docs/requirements/bazaar-app/spec.md` §7.0.1): Hexagonal, Ports in `Bazaar.Domain/Ports`, ein Repository je Aggregat, Fluent-API-Mapping in Infrastructure, Domain-Exceptions → `ProblemDetails` mit `errorCode`, Formatvalidierung per FluentValidation-`ValidationFilter` (400), Invarianten im Handler (409); jeder `*Handler` in `Program.cs` per `AddScoped<…>()` registriert (`DiRegistrationTests`).
- Frontend Feature-First: `pages/*.page` orchestriert, `components/**` rendert nur (`input()`/`output()`, kein Service, kein HTTP); `shared/` importiert nie aus `features/`; Cross-Feature-Imports verboten; `core` → `shared` nur mit `eslint-disable-next-line boundaries/dependencies` und Begründung wie in `print.service.ts`.
- Nur PrimeNG für interaktive Elemente (`p-button`/`pButton`, `pInputText`, `p-select`, `p-confirmdialog`), Icons über `@lucide/angular` wie in der Sidebar.
- Code, Routen, JSON englisch; UI-Texte, Doku, Commit-Texte deutsch; Conventional Commits `type(scope): Beschreibung`; Commits immer mit Pfadangabe in einem Schritt (`git add -- <pfade> && git commit -m "…" -- <pfade>`); Dateien mit LF.
- dv-craft:craft-design-principles — IOSP: Methoden integrieren oder operieren, nie beides; `if`/`switch` delegiert (Guard Clauses ausgenommen); keine Verschachtelung über zwei Ebenen; kleine Funktionen mit einer Aufgabe; höchstens 3–4 Parameter, kein verhaltensumschaltendes `bool`-Flag.
- dv-craft:craft-design-principles — Component-Hierarchie: Integration-Component orchestriert, Leaf-Component rendert; keine macht beides.
- dv-craft:craft-design-principles — DDD: Code spricht die Domänensprache (Etikett = Label, Etikettenbogen = LabelSheet, Bogenformat = LabelSheetFormat, Startposition = startPosition, Verkäufer-Symbol = sellerSymbol).
- dv-craft:craft-unit-testing — AAA mit Kommentaren `// Arrange`, `// Act`, `// Assert`; Act genau eine Zeile; Name `<Methode>_<Situation>_<Erwartung>`; ein Verhalten je Test; Tests unabhängig; TDD: erst roter Test.
- dv-dotnet:dotnet-xunit-conventions — xUnit v3, Testprojekt spiegelt Produktion; Bestand respektieren: die Testprojekte nutzen natives `Assert` und Moq, kein FluentAssertions-Paket wird ergänzt; Integrationstests in `Bazaar.Api.IntegrationTests` mit `PostgresWebApplicationFactory` (Docker nötig).
- dv-dotnet:dotnet-ef-migrations — neue Migration nur per `dotnet ef migrations add`; Triplet `.cs` + `.Designer.cs` + `BazaarDbContextModelSnapshot.cs`; danach `dotnet ef migrations has-pending-model-changes` ohne Änderungen.
- dv-angular:angular-testing-vitest-conventions — Vitest-Globals (`describe`/`it`/`vi`), `vi.fn()`/`vi.spyOn()`, `HttpTestingController` mit `httpMock.verify()`, Act → `await fixture.whenStable()` → Assert.
- primeng:primeng-component-implementation — PrimeNG-Verwendungen gegen die PrimeNG-API geprüft (`validate_usage`: `pButton` mit `outlined`, `p-button` mit `severity`/`disabled`/`onClick`, `p-select` mit `options`/`optionLabel`/`optionValue`/`appendTo`, `pInputText` mit `invalid`, `p-confirmdialog` mit `key`; `Confirmation` mit `key`, `header`, `message`, `acceptLabel`, `rejectLabel`, `accept`).
- Befehle: Backend-Tests `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/<Projekt> -- --filter-class "*<Klasse>"`; Frontend-Tests `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include <pfad>.spec.ts`; Lint `dv-angular-lint --root <R>/src/bazaar-app/frontend`; alle im Bash-Tool. Meldet der .NET-Build `MSB3027`, läuft `Bazaar.Api` noch; Prozess beenden lassen, nicht selbst beenden.

---

### Task 1: Domain — Bogenformat mit Geometrie

**ACs:** AC-06, AC-07, AC-08, AC-37

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetGeometry.cs`
- Create: `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetFormat.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelSheetFormatTests.cs`

**Interfaces:**
- Consumes: —
- Produces:
  - `namespace Bazaar.Domain.BlankLabels`
  - `public sealed record LabelSheetGeometry(decimal SheetWidth, decimal SheetHeight, decimal LabelWidth, decimal LabelHeight, decimal MarginTop, decimal MarginRight, decimal MarginBottom, decimal MarginLeft, decimal GapHorizontal, decimal GapVertical, int Columns, int Rows)` mit `const decimal FitToleranceMm = 0.5m`, `bool HasValidMeasures()`, `bool FitsSheetWidth()`, `bool FitsSheetHeight()`, `static bool HasAtMostOneDecimal(decimal value)`
  - `public sealed class LabelSheetFormat` mit `const int NameMaxLength = 50`, `const string NameTakenErrorCode = "label_sheet_format.name_taken"`, `const string NotFoundErrorCode = "label_sheet_format.not_found"`, `string Id`, `string Name`, `LabelSheetGeometry Geometry`, `static LabelSheetFormat Create(string id, string name, LabelSheetGeometry geometry)`, `void ReplaceGeometry(LabelSheetGeometry geometry)`, `static string NormalizeName(string name)`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelSheetFormatTests.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Domain.UnitTests;

  public class LabelSheetFormatTests
  {
      private static LabelSheetGeometry Avery16() =>
          new(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8);

      private static LabelSheetGeometry InvalidGeometry(string caseName) => caseName switch
      {
          "zero-label-width" => Avery16() with { LabelWidth = 0m },
          "zero-sheet-height" => Avery16() with { SheetHeight = 0m },
          "two-decimals" => Avery16() with { MarginLeft = 0.25m },
          "negative-margin" => Avery16() with { MarginTop = -1m },
          "zero-columns" => Avery16() with { Columns = 0 },
          "zero-rows" => Avery16() with { Rows = 0 },
          _ => throw new ArgumentOutOfRangeException(nameof(caseName)),
      };

      [Fact]
      public void Create_Avery16WithPaddedName_TrimsNameAndKeepsGeometry()
      {
          // Arrange
          var geometry = Avery16();

          // Act
          var format = LabelSheetFormat.Create("LSF00001", "  Avery 16er  ", geometry);

          // Assert
          Assert.Equal("LSF00001", format.Id);
          Assert.Equal("Avery 16er", format.Name);
          Assert.Equal(geometry, format.Geometry);
      }

      [Fact]
      public void Create_ThreeColumnsOf105OnA4_Throws()
      {
          // Arrange
          var geometry = Avery16() with { Columns = 3 };

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", "Zu breit", geometry));
      }

      [Fact]
      public void Create_MarginTop8_9WithinTolerance_Succeeds()
      {
          // Arrange
          var geometry = Avery16() with { MarginTop = 8.9m };

          // Act
          var format = LabelSheetFormat.Create("LSF00001", "Toleranz", geometry);

          // Assert
          Assert.Equal(8.9m, format.Geometry.MarginTop);
      }

      [Fact]
      public void Create_MarginTop9_1BeyondTolerance_Throws()
      {
          // Arrange
          var geometry = Avery16() with { MarginTop = 9.1m };

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", "Zu hoch", geometry));
      }

      [Theory]
      [InlineData("zero-label-width")]
      [InlineData("zero-sheet-height")]
      [InlineData("two-decimals")]
      [InlineData("negative-margin")]
      [InlineData("zero-columns")]
      [InlineData("zero-rows")]
      public void Create_InvalidMeasure_Throws(string caseName)
      {
          // Arrange
          var geometry = InvalidGeometry(caseName);

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", "Ungültig", geometry));
      }

      [Fact]
      public void Create_ZeroMarginsAndGaps_Succeeds()
      {
          // Arrange
          var geometry = Avery16() with { MarginTop = 0m, MarginBottom = 0m };

          // Act
          var format = LabelSheetFormat.Create("LSF00001", "Ohne Rand", geometry);

          // Assert
          Assert.Equal(0m, format.Geometry.MarginTop);
      }

      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void Create_BlankName_Throws(string name)
      {
          // Arrange
          var geometry = Avery16();

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", name, geometry));
      }

      [Fact]
      public void Create_Name51Characters_Throws()
      {
          // Arrange
          var name = new string('x', 51);

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", name, Avery16()));
      }

      [Fact]
      public void Create_Name50CharactersWithPadding_Succeeds()
      {
          // Arrange
          var name = "  " + new string('x', 50) + "  ";

          // Act
          var format = LabelSheetFormat.Create("LSF00001", name, Avery16());

          // Assert
          Assert.Equal(50, format.Name.Length);
      }

      [Fact]
      public void ReplaceGeometry_ValidGeometry_ReplacesGeometry()
      {
          // Arrange
          var format = LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16());
          var avery12 = new LabelSheetGeometry(210m, 297m, 105m, 48m, 4.5m, 0m, 4.5m, 0m, 0m, 0m, 2, 6);

          // Act
          format.ReplaceGeometry(avery12);

          // Assert
          Assert.Equal(avery12, format.Geometry);
      }

      [Fact]
      public void ReplaceGeometry_NotFitting_ThrowsAndKeepsGeometry()
      {
          // Arrange
          var format = LabelSheetFormat.Create("LSF00001", "Avery 16er", Avery16());

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => format.ReplaceGeometry(Avery16() with { Rows = 9 }));
          Assert.Equal(8, format.Geometry.Rows);
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter-class "*LabelSheetFormatTests"` — erwartet: FAIL (Build-Fehler: `Bazaar.Domain.BlankLabels` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetGeometry.cs`:
  ```csharp
  namespace Bazaar.Domain.BlankLabels;

  /// <summary>
  /// Maße eines Etikettenbogens in mm (Bogenformat ohne Namen). Etikett- und Bogengröße sind
  /// größer als 0, Ränder und Abstände mindestens 0, alle Maße mit höchstens einer
  /// Nachkommastelle; Spalten und Zeilen ganzzahlig ab 1.
  /// </summary>
  public sealed record LabelSheetGeometry(
      decimal SheetWidth,
      decimal SheetHeight,
      decimal LabelWidth,
      decimal LabelHeight,
      decimal MarginTop,
      decimal MarginRight,
      decimal MarginBottom,
      decimal MarginLeft,
      decimal GapHorizontal,
      decimal GapVertical,
      int Columns,
      int Rows)
  {
      /// <summary>So weit darf das Raster den Bogen überragen, ohne als widersprüchlich zu gelten.</summary>
      public const decimal FitToleranceMm = 0.5m;

      public bool HasValidMeasures() =>
          AreAll(IsPositiveMeasure, SheetWidth, SheetHeight, LabelWidth, LabelHeight)
          && AreAll(IsNonNegativeMeasure, MarginTop, MarginRight, MarginBottom, MarginLeft, GapHorizontal, GapVertical)
          && Columns >= 1
          && Rows >= 1;

      public bool FitsSheetWidth() =>
          Columns * LabelWidth + (Columns - 1) * GapHorizontal + MarginLeft + MarginRight
          <= SheetWidth + FitToleranceMm;

      public bool FitsSheetHeight() =>
          Rows * LabelHeight + (Rows - 1) * GapVertical + MarginTop + MarginBottom
          <= SheetHeight + FitToleranceMm;

      public static bool HasAtMostOneDecimal(decimal value) => decimal.Round(value, 1) == value;

      private static bool IsPositiveMeasure(decimal value) => value > 0 && HasAtMostOneDecimal(value);

      private static bool IsNonNegativeMeasure(decimal value) => value >= 0 && HasAtMostOneDecimal(value);

      private static bool AreAll(Func<decimal, bool> rule, params decimal[] values) => values.All(rule);
  }
  ```
  `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetFormat.cs`:
  ```csharp
  namespace Bazaar.Domain.BlankLabels;

  /// <summary>
  /// Unter einem Namen gespeichertes Bogenformat. Der Name ist eindeutig und wird exakt
  /// verglichen (gleicher Name = gleiches Format).
  /// </summary>
  public sealed class LabelSheetFormat
  {
      public const int NameMaxLength = 50;
      public const string NameTakenErrorCode = "label_sheet_format.name_taken";
      public const string NotFoundErrorCode = "label_sheet_format.not_found";

      public string Id { get; private init; } = null!;
      public string Name { get; private set; } = null!;
      public LabelSheetGeometry Geometry { get; private set; } = null!;

      public static LabelSheetFormat Create(string id, string name, LabelSheetGeometry geometry)
      {
          if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.", nameof(id));
          var normalizedName = NormalizeName(name);
          EnsureValidGeometry(geometry);
          return new LabelSheetFormat { Id = id, Name = normalizedName, Geometry = geometry with { } };
      }

      public void ReplaceGeometry(LabelSheetGeometry geometry)
      {
          EnsureValidGeometry(geometry);
          Geometry = geometry with { };
      }

      /// <summary>Trimmt den Namen; leer oder länger als <see cref="NameMaxLength"/> ist ungültig.</summary>
      public static string NormalizeName(string name)
      {
          ArgumentNullException.ThrowIfNull(name);
          var trimmed = name.Trim();
          if (trimmed.Length == 0) throw new ArgumentException("Name required.", nameof(name));
          if (trimmed.Length > NameMaxLength) throw new ArgumentOutOfRangeException(nameof(name));
          return trimmed;
      }

      private static void EnsureValidGeometry(LabelSheetGeometry geometry)
      {
          ArgumentNullException.ThrowIfNull(geometry);
          if (!geometry.HasValidMeasures()) throw new ArgumentOutOfRangeException(nameof(geometry));
          if (!geometry.FitsSheetWidth() || !geometry.FitsSheetHeight())
          {
              throw new ArgumentException("Labels do not fit on the sheet.", nameof(geometry));
          }
      }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter-class "*LabelSheetFormatTests"` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetGeometry.cs src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetFormat.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelSheetFormatTests.cs && git commit -m "feat(blank-labels): Bogenformat mit Geometrie und Toleranzprüfung im Domain" -- src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetGeometry.cs src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelSheetFormat.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelSheetFormatTests.cs`

### Task 2: Domain — Logo/Verkäufer-Symbol und gemerkte Druckwerte

**ACs:** AC-14, AC-15, AC-17, AC-35

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelGraphic.cs`
- Create: `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelPrintDefaults.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelGraphicTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelPrintDefaultsTests.cs`

**Interfaces:**
- Consumes: —
- Produces:
  - `public enum LabelGraphicKind { Icon, Image }` (JSON `"icon"`/`"image"` über den app-weiten camelCase-Enum-Konverter)
  - `public sealed partial record LabelGraphic(LabelGraphicKind Kind, string Value)` mit `const int MaxImageBytes = 1_048_576` und `bool IsValid()`
  - `public sealed class LabelPrintDefaults` mit `const int FixedId = 1`, `const string DefaultCurrencySymbol = "€"`, `const int CurrencySymbolMaxLength = 3`, Properties `int Id`, `LabelGraphicKind? LogoKind`, `string? LogoValue`, `LabelGraphicKind? SellerSymbolKind`, `string? SellerSymbolValue`, `string CurrencySymbol`, berechnet `LabelGraphic? Logo`, `LabelGraphic? SellerSymbol`; `static LabelPrintDefaults CreateInitial()`, `void Update(LabelGraphic? logo, LabelGraphic? sellerSymbol, string currencySymbol)`, `static bool IsValidCurrencySymbol(string? currencySymbol)`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelGraphicTests.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Domain.UnitTests;

  public class LabelGraphicTests
  {
      private static string DataUrl(string mediaType, int byteCount) =>
          $"data:{mediaType};base64,{Convert.ToBase64String(new byte[byteCount])}";

      [Theory]
      [InlineData("star")]
      [InlineData("flower")]
      public void IsValid_KnownIconKeyFormat_ReturnsTrue(string iconKey)
      {
          // Arrange
          var graphic = new LabelGraphic(LabelGraphicKind.Icon, iconKey);

          // Act
          var valid = graphic.IsValid();

          // Assert
          Assert.True(valid);
      }

      [Theory]
      [InlineData("")]
      [InlineData("Star!")]
      public void IsValid_MalformedIconKey_ReturnsFalse(string iconKey)
      {
          // Arrange
          var graphic = new LabelGraphic(LabelGraphicKind.Icon, iconKey);

          // Act
          var valid = graphic.IsValid();

          // Assert
          Assert.False(valid);
      }

      [Theory]
      [InlineData("image/png")]
      [InlineData("image/jpeg")]
      [InlineData("image/svg+xml")]
      public void IsValid_AllowedImageTypeUpTo1Mb_ReturnsTrue(string mediaType)
      {
          // Arrange
          var graphic = new LabelGraphic(LabelGraphicKind.Image, DataUrl(mediaType, LabelGraphic.MaxImageBytes));

          // Act
          var valid = graphic.IsValid();

          // Assert
          Assert.True(valid);
      }

      [Fact]
      public void IsValid_GifImage_ReturnsFalse()
      {
          // Arrange
          var graphic = new LabelGraphic(LabelGraphicKind.Image, DataUrl("image/gif", 10));

          // Act
          var valid = graphic.IsValid();

          // Assert
          Assert.False(valid);
      }

      [Fact]
      public void IsValid_PngOver1Mb_ReturnsFalse()
      {
          // Arrange
          var graphic = new LabelGraphic(LabelGraphicKind.Image, DataUrl("image/png", LabelGraphic.MaxImageBytes + 1));

          // Act
          var valid = graphic.IsValid();

          // Assert
          Assert.False(valid);
      }

      [Theory]
      [InlineData("data:image/png;base64,###")]
      [InlineData("https://example.com/logo.png")]
      [InlineData("data:image/png,rohdaten")]
      public void IsValid_NoBase64DataUrl_ReturnsFalse(string value)
      {
          // Arrange
          var graphic = new LabelGraphic(LabelGraphicKind.Image, value);

          // Act
          var valid = graphic.IsValid();

          // Assert
          Assert.False(valid);
      }
  }
  ```
  `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelPrintDefaultsTests.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Domain.UnitTests;

  public class LabelPrintDefaultsTests
  {
      private static readonly LabelGraphic StarIcon = new(LabelGraphicKind.Icon, "star");
      private static readonly LabelGraphic PngImage = new(LabelGraphicKind.Image, "data:image/png;base64,AAAA");

      [Fact]
      public void CreateInitial_Always_HasEuroAndNoGraphics()
      {
          // Arrange & Act
          var defaults = LabelPrintDefaults.CreateInitial();

          // Assert
          Assert.Equal(LabelPrintDefaults.FixedId, defaults.Id);
          Assert.Equal("€", defaults.CurrencySymbol);
          Assert.Null(defaults.Logo);
          Assert.Null(defaults.SellerSymbol);
      }

      [Fact]
      public void Update_LogoSymbolAndDollar_StoresAllThree()
      {
          // Arrange
          var defaults = LabelPrintDefaults.CreateInitial();

          // Act
          defaults.Update(PngImage, StarIcon, "$");

          // Assert
          Assert.Equal(PngImage, defaults.Logo);
          Assert.Equal(StarIcon, defaults.SellerSymbol);
          Assert.Equal("$", defaults.CurrencySymbol);
      }

      [Fact]
      public void Update_NoGraphics_ClearsLogoAndSymbol()
      {
          // Arrange
          var defaults = LabelPrintDefaults.CreateInitial();
          defaults.Update(PngImage, StarIcon, "€");

          // Act
          defaults.Update(null, null, "€");

          // Assert
          Assert.Null(defaults.Logo);
          Assert.Null(defaults.SellerSymbol);
      }

      [Theory]
      [InlineData("")]
      [InlineData("EURO")]
      public void Update_CurrencyOutsideOneToThreeCharacters_Throws(string currencySymbol)
      {
          // Arrange
          var defaults = LabelPrintDefaults.CreateInitial();

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => defaults.Update(null, null, currencySymbol));
      }

      [Fact]
      public void Update_InvalidGraphic_ThrowsAndKeepsValues()
      {
          // Arrange
          var defaults = LabelPrintDefaults.CreateInitial();
          var gif = new LabelGraphic(LabelGraphicKind.Image, "data:image/gif;base64,AAAA");

          // Act & Assert
          Assert.ThrowsAny<ArgumentException>(() => defaults.Update(gif, null, "€"));
          Assert.Null(defaults.Logo);
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter-class "*LabelGraphicTests" --filter-class "*LabelPrintDefaultsTests"` — erwartet: FAIL (Build-Fehler: `LabelGraphic` und `LabelPrintDefaults` fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelGraphic.cs`:
  ```csharp
  using System.Text.RegularExpressions;

  namespace Bazaar.Domain.BlankLabels;

  public enum LabelGraphicKind
  {
      Icon,
      Image,
  }

  /// <summary>
  /// Logo oder Verkäufer-Symbol eines Etiketts: ein Icon aus der Icon-Liste (Schlüssel) oder
  /// ein eigenes Bild als Base64-Data-URL (PNG, JPEG oder SVG, höchstens 1 MB).
  /// </summary>
  public sealed partial record LabelGraphic(LabelGraphicKind Kind, string Value)
  {
      public const int MaxImageBytes = 1_048_576;

      private const string DataPrefix = "data:";
      private const string Base64Marker = ";base64,";
      private const int MaxBase64Length = (MaxImageBytes + 2) / 3 * 4;

      private static readonly string[] ImageMediaTypes = ["image/png", "image/jpeg", "image/svg+xml"];

      public bool IsValid() => Kind switch
      {
          LabelGraphicKind.Icon => IsValidIconKey(Value),
          LabelGraphicKind.Image => IsValidImageDataUrl(Value),
          _ => false,
      };

      private static bool IsValidIconKey(string? value) => value is not null && IconKeyPattern().IsMatch(value);

      private static bool IsValidImageDataUrl(string? value)
      {
          if (value is null || !value.StartsWith(DataPrefix, StringComparison.Ordinal)) return false;
          var markerIndex = value.IndexOf(Base64Marker, StringComparison.Ordinal);
          if (markerIndex < 0) return false;
          var mediaType = value[DataPrefix.Length..markerIndex];
          var payload = value[(markerIndex + Base64Marker.Length)..];
          return ImageMediaTypes.Contains(mediaType) && HasAllowedPayloadSize(payload);
      }

      private static bool HasAllowedPayloadSize(string base64Payload)
      {
          if (base64Payload.Length > MaxBase64Length) return false;
          var buffer = new byte[base64Payload.Length];
          return Convert.TryFromBase64String(base64Payload, buffer, out var byteCount) && byteCount <= MaxImageBytes;
      }

      [GeneratedRegex("^[a-z0-9-]{1,30}$")]
      private static partial Regex IconKeyPattern();
  }
  ```
  `src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelPrintDefaults.cs`:
  ```csharp
  namespace Bazaar.Domain.BlankLabels;

  /// <summary>
  /// Logo, Verkäufer-Symbol und Währungssymbol des letzten Etiketten-Vordrucks; eine Zeile für
  /// alle Geräte. Startnummer, Anzahl und Startposition werden bewusst nie gemerkt.
  /// </summary>
  public sealed class LabelPrintDefaults
  {
      public const int FixedId = 1;
      public const string DefaultCurrencySymbol = "€";
      public const int CurrencySymbolMaxLength = 3;

      public int Id { get; private init; }
      public LabelGraphicKind? LogoKind { get; private set; }
      public string? LogoValue { get; private set; }
      public LabelGraphicKind? SellerSymbolKind { get; private set; }
      public string? SellerSymbolValue { get; private set; }
      public string CurrencySymbol { get; private set; } = DefaultCurrencySymbol;

      public LabelGraphic? Logo => ToGraphic(LogoKind, LogoValue);
      public LabelGraphic? SellerSymbol => ToGraphic(SellerSymbolKind, SellerSymbolValue);

      public static LabelPrintDefaults CreateInitial() => new() { Id = FixedId };

      public void Update(LabelGraphic? logo, LabelGraphic? sellerSymbol, string currencySymbol)
      {
          EnsureValidGraphic(logo, nameof(logo));
          EnsureValidGraphic(sellerSymbol, nameof(sellerSymbol));
          if (!IsValidCurrencySymbol(currencySymbol)) throw new ArgumentOutOfRangeException(nameof(currencySymbol));
          LogoKind = logo?.Kind;
          LogoValue = logo?.Value;
          SellerSymbolKind = sellerSymbol?.Kind;
          SellerSymbolValue = sellerSymbol?.Value;
          CurrencySymbol = currencySymbol;
      }

      /// <summary>1 bis 3 Zeichen, gezählt als Unicode-Zeichen (Runes), wie im Frontend.</summary>
      public static bool IsValidCurrencySymbol(string? currencySymbol) =>
          currencySymbol is not null && currencySymbol.EnumerateRunes().Count() is >= 1 and <= CurrencySymbolMaxLength;

      private static void EnsureValidGraphic(LabelGraphic? graphic, string paramName)
      {
          if (graphic is not null && !graphic.IsValid()) throw new ArgumentException("Invalid label graphic.", paramName);
      }

      private static LabelGraphic? ToGraphic(LabelGraphicKind? kind, string? value) =>
          kind is { } graphicKind && value is not null ? new LabelGraphic(graphicKind, value) : null;
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter-class "*LabelGraphicTests" --filter-class "*LabelPrintDefaultsTests"` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelGraphic.cs src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelPrintDefaults.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelGraphicTests.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelPrintDefaultsTests.cs && git commit -m "feat(blank-labels): Logo, Verkäufer-Symbol und gemerkte Druckwerte im Domain" -- src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelGraphic.cs src/bazaar-app/backend/Bazaar.Domain/BlankLabels/LabelPrintDefaults.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelGraphicTests.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/LabelPrintDefaultsTests.cs`

### Task 3: Infrastructure — Ports, Repositories, EF-Mapping und Migration

**ACs:** AC-09, AC-11, AC-12, AC-17, AC-38

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelSheetFormatRepository.cs`
- Create: `src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelPrintDefaultsRepository.cs`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/LabelSheetFormatConfiguration.cs`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/LabelPrintDefaultsConfiguration.cs`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/LabelSheetFormatRepository.cs`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/LabelPrintDefaultsRepository.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/BazaarDbContext.cs:26` · `BazaarDbContext.Settings`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs:84` · `builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<timestamp>_AddBlankLabels.cs` (erzeugt von `dotnet ef migrations add`)
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/<timestamp>_AddBlankLabels.Designer.cs` (erzeugt)
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Migrations/BazaarDbContextModelSnapshot.cs` · `BazaarDbContextModelSnapshot.BuildModel` (erzeugt)
- Create: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelSheetFormatRepositoryTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelPrintDefaultsRepositoryTests.cs`

**Interfaces:**
- Consumes: `LabelSheetFormat`, `LabelSheetGeometry`, `LabelPrintDefaults`, `LabelGraphic`, `LabelGraphicKind` (Task 1, 2); `ConflictException(string message, string errorCode)` aus `Bazaar.Domain.Exceptions`
- Produces:
  - `public interface ILabelSheetFormatRepository { Task<IReadOnlyList<LabelSheetFormat>> GetAll(); Task<LabelSheetFormat?> GetById(string id); Task<LabelSheetFormat?> FindByName(string name); Task Add(LabelSheetFormat format); Task Update(LabelSheetFormat format); Task Remove(LabelSheetFormat format); }` — `Add` wirft `ConflictException` mit `LabelSheetFormat.NameTakenErrorCode`, wenn der eindeutige Name inzwischen vergeben ist
  - `public interface ILabelPrintDefaultsRepository { Task<LabelPrintDefaults?> Find(); Task Add(LabelPrintDefaults defaults); Task Update(LabelPrintDefaults defaults); }`
  - `BazaarDbContext.LabelSheetFormats` (`DbSet<LabelSheetFormat>`), `BazaarDbContext.LabelPrintDefaults` (`DbSet<LabelPrintDefaults>`); Tabellen `LabelSheetFormats` (eindeutiger Index auf `Name`), `LabelPrintDefaults`
  - DI in `Program.cs`: `AddScoped<ILabelSheetFormatRepository, LabelSheetFormatRepository>()`, `AddScoped<ILabelPrintDefaultsRepository, LabelPrintDefaultsRepository>()`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelSheetFormatRepositoryTests.cs` (SQLite statt InMemory wie `SettingsRepositoryTests`: InMemory kann Complex Properties nicht lesen):
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Infrastructure.Persistence;
  using Bazaar.Infrastructure.Persistence.Repositories;
  using Microsoft.Data.Sqlite;
  using Microsoft.EntityFrameworkCore;

  namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

  public class LabelSheetFormatRepositoryTests
  {
      // EF Core InMemory kann Complex Properties nicht lesen (siehe SettingsRepositoryTests).
      private static BazaarDbContext CreateContext(SqliteConnection connection) =>
          new(new DbContextOptionsBuilder<BazaarDbContext>().UseSqlite(connection).Options);

      private static LabelSheetGeometry Avery16() =>
          new(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8);

      private static async Task<SqliteConnection> OpenDatabase()
      {
          var cancellationToken = TestContext.Current.CancellationToken;
          var connection = new SqliteConnection("DataSource=:memory:");
          await connection.OpenAsync(cancellationToken);
          await using var context = CreateContext(connection);
          await context.Database.EnsureCreatedAsync(cancellationToken);
          return connection;
      }

      [Fact]
      public async Task Add_NewFormat_IsFoundInFreshContext()
      {
          // Arrange
          await using var connection = await OpenDatabase();
          await using (var writeContext = CreateContext(connection))
          {
              await new LabelSheetFormatRepository(writeContext).Add(LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16()));
          }
          await using var readContext = CreateContext(connection);
          var sut = new LabelSheetFormatRepository(readContext);

          // Act
          var found = await sut.GetById("LSF00001");

          // Assert
          Assert.NotNull(found);
          Assert.Equal("Avery 12er", found!.Name);
          Assert.Equal(Avery16(), found.Geometry);
      }

      [Fact]
      public async Task FindByName_ExactName_ReturnsFormat()
      {
          // Arrange
          await using var connection = await OpenDatabase();
          await using var dbContext = CreateContext(connection);
          var sut = new LabelSheetFormatRepository(dbContext);
          await sut.Add(LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16()));

          // Act
          var found = await sut.FindByName("Avery 12er");

          // Assert
          Assert.Equal("LSF00001", found?.Id);
      }

      [Fact]
      public async Task FindByName_DifferentCase_ReturnsNull()
      {
          // Arrange
          await using var connection = await OpenDatabase();
          await using var dbContext = CreateContext(connection);
          var sut = new LabelSheetFormatRepository(dbContext);
          await sut.Add(LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16()));

          // Act
          var found = await sut.FindByName("avery 12er");

          // Assert
          Assert.Null(found);
      }

      [Fact]
      public async Task Update_ReplacedGeometry_IsPersisted()
      {
          // Arrange
          await using var connection = await OpenDatabase();
          var avery12 = new LabelSheetGeometry(210m, 297m, 105m, 48m, 4.5m, 0m, 4.5m, 0m, 0m, 0m, 2, 6);
          await using (var writeContext = CreateContext(connection))
          {
              var repository = new LabelSheetFormatRepository(writeContext);
              var format = LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16());
              await repository.Add(format);
              format.ReplaceGeometry(avery12);
              await repository.Update(format);
          }
          await using var readContext = CreateContext(connection);

          // Act
          var found = await new LabelSheetFormatRepository(readContext).GetById("LSF00001");

          // Assert
          Assert.Equal(avery12, found!.Geometry);
      }

      [Fact]
      public async Task Remove_ExistingFormat_IsGoneFromGetAll()
      {
          // Arrange
          await using var connection = await OpenDatabase();
          await using var dbContext = CreateContext(connection);
          var sut = new LabelSheetFormatRepository(dbContext);
          var format = LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16());
          await sut.Add(format);

          // Act
          await sut.Remove(format);

          // Assert
          Assert.Empty(await sut.GetAll());
      }
  }
  ```
  `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelPrintDefaultsRepositoryTests.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Infrastructure.Persistence;
  using Bazaar.Infrastructure.Persistence.Repositories;
  using Microsoft.EntityFrameworkCore;

  namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

  public class LabelPrintDefaultsRepositoryTests
  {
      private static BazaarDbContext CreateContext(string databaseName) =>
          new(new DbContextOptionsBuilder<BazaarDbContext>().UseInMemoryDatabase(databaseName).Options);

      [Fact]
      public async Task Find_NothingStored_ReturnsNull()
      {
          // Arrange
          await using var dbContext = CreateContext(Guid.NewGuid().ToString());
          var sut = new LabelPrintDefaultsRepository(dbContext);

          // Act
          var found = await sut.Find();

          // Assert
          Assert.Null(found);
      }

      [Fact]
      public async Task Add_DefaultsWithIconAndImage_AreFoundInFreshContext()
      {
          // Arrange
          var databaseName = Guid.NewGuid().ToString();
          var logo = new LabelGraphic(LabelGraphicKind.Image, "data:image/png;base64,AAAA");
          var symbol = new LabelGraphic(LabelGraphicKind.Icon, "star");
          await using (var writeContext = CreateContext(databaseName))
          {
              var defaults = LabelPrintDefaults.CreateInitial();
              defaults.Update(logo, symbol, "$");
              await new LabelPrintDefaultsRepository(writeContext).Add(defaults);
          }
          await using var readContext = CreateContext(databaseName);

          // Act
          var found = await new LabelPrintDefaultsRepository(readContext).Find();

          // Assert
          Assert.Equal(logo, found!.Logo);
          Assert.Equal(symbol, found.SellerSymbol);
          Assert.Equal("$", found.CurrencySymbol);
      }

      [Fact]
      public async Task Update_ChangedCurrency_IsPersisted()
      {
          // Arrange
          var databaseName = Guid.NewGuid().ToString();
          await using (var writeContext = CreateContext(databaseName))
          {
              var repository = new LabelPrintDefaultsRepository(writeContext);
              var defaults = LabelPrintDefaults.CreateInitial();
              await repository.Add(defaults);
              defaults.Update(null, null, "CHF");
              await repository.Update(defaults);
          }
          await using var readContext = CreateContext(databaseName);

          // Act
          var found = await new LabelPrintDefaultsRepository(readContext).Find();

          // Assert
          Assert.Equal("CHF", found!.CurrencySymbol);
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*LabelSheetFormatRepositoryTests" --filter-class "*LabelPrintDefaultsRepositoryTests"` — erwartet: FAIL (Build-Fehler: Repositories fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelSheetFormatRepository.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Domain.Ports;

  public interface ILabelSheetFormatRepository
  {
      Task<IReadOnlyList<LabelSheetFormat>> GetAll();

      Task<LabelSheetFormat?> GetById(string id);

      /// <summary>Exakter Vergleich, Groß-/Kleinschreibung zählt (gleicher Name = gleiches Format).</summary>
      Task<LabelSheetFormat?> FindByName(string name);

      /// <summary>
      /// Wirft <c>ConflictException</c> mit <see cref="LabelSheetFormat.NameTakenErrorCode"/>, wenn ein
      /// anderer Admin den Namen zwischen Prüfung und Speichern vergeben hat.
      /// </summary>
      Task Add(LabelSheetFormat format);

      Task Update(LabelSheetFormat format);

      Task Remove(LabelSheetFormat format);
  }
  ```
  `src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelPrintDefaultsRepository.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Domain.Ports;

  public interface ILabelPrintDefaultsRepository
  {
      /// <summary>Die eine Zeile mit den gemerkten Werten; <c>null</c>, solange noch nie gedruckt wurde.</summary>
      Task<LabelPrintDefaults?> Find();

      Task Add(LabelPrintDefaults defaults);

      Task Update(LabelPrintDefaults defaults);
  }
  ```
  `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/LabelSheetFormatConfiguration.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.EntityFrameworkCore.Metadata.Builders;

  namespace Bazaar.Infrastructure.Persistence.Configurations;

  public sealed class LabelSheetFormatConfiguration : IEntityTypeConfiguration<LabelSheetFormat>
  {
      private const int MeasurePrecision = 6;
      private const int MeasureScale = 1;

      public void Configure(EntityTypeBuilder<LabelSheetFormat> builder)
      {
          builder.ToTable("LabelSheetFormats");
          builder.HasKey(f => f.Id);
          builder.Property(f => f.Id).HasMaxLength(8).ValueGeneratedNever();
          builder.Property(f => f.Name).IsRequired().HasMaxLength(LabelSheetFormat.NameMaxLength);
          builder.HasIndex(f => f.Name).IsUnique();
          builder.ComplexProperty(f => f.Geometry, ConfigureGeometry);
      }

      private static void ConfigureGeometry(ComplexPropertyBuilder<LabelSheetGeometry> builder)
      {
          builder.Property(g => g.SheetWidth).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.SheetHeight).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.LabelWidth).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.LabelHeight).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.MarginTop).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.MarginRight).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.MarginBottom).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.MarginLeft).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.GapHorizontal).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.GapVertical).HasPrecision(MeasurePrecision, MeasureScale);
          builder.Property(g => g.Columns);
          builder.Property(g => g.Rows);
      }
  }
  ```
  `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Configurations/LabelPrintDefaultsConfiguration.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Microsoft.EntityFrameworkCore;
  using Microsoft.EntityFrameworkCore.Metadata.Builders;

  namespace Bazaar.Infrastructure.Persistence.Configurations;

  public sealed class LabelPrintDefaultsConfiguration : IEntityTypeConfiguration<LabelPrintDefaults>
  {
      private const int KindMaxLength = 10;

      public void Configure(EntityTypeBuilder<LabelPrintDefaults> builder)
      {
          builder.ToTable("LabelPrintDefaults");
          builder.HasKey(d => d.Id);
          builder.Property(d => d.Id).ValueGeneratedNever();
          builder.Property(d => d.LogoKind).HasConversion<string>().HasMaxLength(KindMaxLength);
          builder.Property(d => d.LogoValue);
          builder.Property(d => d.SellerSymbolKind).HasConversion<string>().HasMaxLength(KindMaxLength);
          builder.Property(d => d.SellerSymbolValue);
          // Drei Runes können als Surrogatpaare bis zu sechs UTF-16-Zeichen belegen.
          builder.Property(d => d.CurrencySymbol).IsRequired().HasMaxLength(LabelPrintDefaults.CurrencySymbolMaxLength * 2);
          builder.Ignore(d => d.Logo);
          builder.Ignore(d => d.SellerSymbol);
      }
  }
  ```
  `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/LabelSheetFormatRepository.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;
  using Microsoft.EntityFrameworkCore;
  using Npgsql;

  namespace Bazaar.Infrastructure.Persistence.Repositories;

  public sealed class LabelSheetFormatRepository(BazaarDbContext dbContext) : ILabelSheetFormatRepository
  {
      public async Task<IReadOnlyList<LabelSheetFormat>> GetAll() =>
          await dbContext.LabelSheetFormats.ToListAsync();

      public Task<LabelSheetFormat?> GetById(string id) =>
          dbContext.LabelSheetFormats.SingleOrDefaultAsync(f => f.Id == id);

      public Task<LabelSheetFormat?> FindByName(string name) =>
          dbContext.LabelSheetFormats.SingleOrDefaultAsync(f => f.Name == name);

      public async Task Add(LabelSheetFormat format)
      {
          await dbContext.LabelSheetFormats.AddAsync(format);
          try
          {
              await dbContext.SaveChangesAsync();
          }
          catch (DbUpdateException exception) when (IsUniqueViolation(exception))
          {
              dbContext.Entry(format).State = EntityState.Detached;
              throw new ConflictException("Bogenformat existiert bereits", LabelSheetFormat.NameTakenErrorCode);
          }
      }

      public async Task Update(LabelSheetFormat format)
      {
          dbContext.LabelSheetFormats.Update(format);
          await dbContext.SaveChangesAsync();
      }

      public async Task Remove(LabelSheetFormat format)
      {
          dbContext.LabelSheetFormats.Remove(format);
          await dbContext.SaveChangesAsync();
      }

      private static bool IsUniqueViolation(DbUpdateException exception) =>
          exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation };
  }
  ```
  `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/LabelPrintDefaultsRepository.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Ports;
  using Microsoft.EntityFrameworkCore;

  namespace Bazaar.Infrastructure.Persistence.Repositories;

  public sealed class LabelPrintDefaultsRepository(BazaarDbContext dbContext) : ILabelPrintDefaultsRepository
  {
      public Task<LabelPrintDefaults?> Find() =>
          dbContext.LabelPrintDefaults.SingleOrDefaultAsync(d => d.Id == LabelPrintDefaults.FixedId);

      public async Task Add(LabelPrintDefaults defaults)
      {
          await dbContext.LabelPrintDefaults.AddAsync(defaults);
          await dbContext.SaveChangesAsync();
      }

      public async Task Update(LabelPrintDefaults defaults)
      {
          dbContext.LabelPrintDefaults.Update(defaults);
          await dbContext.SaveChangesAsync();
      }
  }
  ```
  `BazaarDbContext.cs`: oben `using Bazaar.Domain.BlankLabels;` zu den anderen `using`-Zeilen ergänzen und direkt nach der Zeile `public DbSet<SettingsAggregate> Settings { get; set; } = null!;` einfügen:
  ```csharp

      public DbSet<LabelSheetFormat> LabelSheetFormats { get; set; } = null!;

      public DbSet<LabelPrintDefaults> LabelPrintDefaults { get; set; } = null!;
  ```
  `Program.cs`: direkt nach der Zeile `builder.Services.AddScoped<ISettingsRepository, SettingsRepository>();` einfügen:
  ```csharp
  builder.Services.AddScoped<ILabelSheetFormatRepository, LabelSheetFormatRepository>();
  builder.Services.AddScoped<ILabelPrintDefaultsRepository, LabelPrintDefaultsRepository>();
  ```
  (Die nötigen `using`-Zeilen `Bazaar.Domain.Ports` und `Bazaar.Infrastructure.Persistence.Repositories` stehen schon in `Program.cs`.)

  Migration erzeugen, Arbeitsverzeichnis `<R>/src/bazaar-app/backend`:
  `dotnet ef migrations add AddBlankLabels --project Bazaar.Infrastructure --startup-project Bazaar.Api`
  Danach prüfen, dass `Bazaar.Infrastructure/Migrations/<timestamp>_AddBlankLabels.cs` die Tabellen `LabelSheetFormats` (mit eindeutigem Index `IX_LabelSheetFormats_Name` und den zwölf Geometrie-Spalten) und `LabelPrintDefaults` anlegt, dass die Datei `<timestamp>_AddBlankLabels.Designer.cs` existiert und `BazaarDbContextModelSnapshot.cs` beide Entitäten enthält. Dann:
  `dotnet ef migrations has-pending-model-changes --project Bazaar.Infrastructure --startup-project Bazaar.Api` — erwartet: Meldung, dass seit der letzten Migration keine Änderungen am Modell vorliegen.
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*LabelSheetFormatRepositoryTests" --filter-class "*LabelPrintDefaultsRepositoryTests"` — erwartet: PASS
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests` — erwartet: PASS (Ports liegen in `Domain/Ports`, Domain ohne Framework-Abhängigkeit)
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelSheetFormatRepository.cs src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelPrintDefaultsRepository.cs src/bazaar-app/backend/Bazaar.Infrastructure/Persistence src/bazaar-app/backend/Bazaar.Infrastructure/Migrations src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelSheetFormatRepositoryTests.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelPrintDefaultsRepositoryTests.cs && git commit -m "feat(blank-labels): Persistenz für Bogenformate und gemerkte Druckwerte" -- src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelSheetFormatRepository.cs src/bazaar-app/backend/Bazaar.Domain/Ports/ILabelPrintDefaultsRepository.cs src/bazaar-app/backend/Bazaar.Infrastructure/Persistence src/bazaar-app/backend/Bazaar.Infrastructure/Migrations src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelSheetFormatRepositoryTests.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/LabelPrintDefaultsRepositoryTests.cs`

### Task 4: Application — Bogenformate laden, speichern (mit Überschreiben) und löschen

**ACs:** AC-06, AC-07, AC-08, AC-09, AC-11, AC-12, AC-13, AC-34, AC-36, AC-37, AC-38

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/SaveLabelSheetFormatCommand.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/SaveLabelSheetFormatCommandValidator.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/SaveLabelSheetFormatHandler.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/GetLabelSheetFormatsHandler.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/DeleteLabelSheetFormatHandler.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs:120` · `builder.Services.AddScoped<UpdatePrintTextsHandler>();`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/SaveLabelSheetFormatHandlerTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/SaveLabelSheetFormatCommandValidatorTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/GetLabelSheetFormatsHandlerTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/DeleteLabelSheetFormatHandlerTests.cs`

**Interfaces:**
- Consumes: `ILabelSheetFormatRepository` (Task 3); `LabelSheetFormat.Create/NormalizeName/ReplaceGeometry`, `LabelSheetFormat.NameTakenErrorCode`, `LabelSheetFormat.NotFoundErrorCode`, `LabelSheetFormat.NameMaxLength`, `LabelSheetGeometry` mit `HasValidMeasures()`, `FitsSheetWidth()`, `FitsSheetHeight()`, `HasAtMostOneDecimal(decimal)` (Task 1); `IIdGenerator.Generate()`; `ConflictException`, `NotFoundException`
- Produces:
  - `public sealed class SaveLabelSheetFormatCommand` mit Properties `string Name`, `decimal SheetWidth`, `decimal SheetHeight`, `decimal LabelWidth`, `decimal LabelHeight`, `decimal MarginTop`, `decimal MarginRight`, `decimal MarginBottom`, `decimal MarginLeft`, `decimal GapHorizontal`, `decimal GapVertical`, `int Columns`, `int Rows`, `bool Overwrite` und `LabelSheetGeometry ToGeometry()`
  - `public sealed class SaveLabelSheetFormatCommandValidator : AbstractValidator<SaveLabelSheetFormatCommand>`
  - `public sealed class SaveLabelSheetFormatHandler(ILabelSheetFormatRepository repository, IIdGenerator idGenerator)` mit `Task<LabelSheetFormat> Handle(SaveLabelSheetFormatCommand command)`
  - `public sealed class GetLabelSheetFormatsHandler(ILabelSheetFormatRepository repository)` mit `Task<IReadOnlyList<LabelSheetFormat>> Handle()` (nach Name, ohne Groß-/Kleinschreibung)
  - `public sealed class DeleteLabelSheetFormatHandler(ILabelSheetFormatRepository repository)` mit `Task Handle(string id)`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/SaveLabelSheetFormatHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.BlankLabels;
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;
  using Moq;

  namespace Bazaar.Application.UnitTests.BlankLabels;

  public class SaveLabelSheetFormatHandlerTests
  {
      private readonly Mock<ILabelSheetFormatRepository> _repository = new();
      private readonly Mock<IIdGenerator> _idGenerator = new();

      private SaveLabelSheetFormatHandler CreateSut() => new(_repository.Object, _idGenerator.Object);

      private static SaveLabelSheetFormatCommand Avery12Command(string name, bool overwrite) => new()
      {
          Name = name,
          SheetWidth = 210m,
          SheetHeight = 297m,
          LabelWidth = 105m,
          LabelHeight = 48m,
          MarginTop = 4.5m,
          MarginRight = 0m,
          MarginBottom = 4.5m,
          MarginLeft = 0m,
          GapHorizontal = 0m,
          GapVertical = 0m,
          Columns = 2,
          Rows = 6,
          Overwrite = overwrite,
      };

      private static LabelSheetFormat StoredAvery16(string name) =>
          LabelSheetFormat.Create("LSF00001", name, new LabelSheetGeometry(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8));

      [Fact]
      public async Task Handle_NewPaddedName_AddsFormatWithTrimmedName()
      {
          // Arrange
          _repository.Setup(r => r.FindByName("Avery 12er")).ReturnsAsync((LabelSheetFormat?)null);
          _idGenerator.Setup(g => g.Generate()).Returns("LSF00002");
          var sut = CreateSut();

          // Act
          var saved = await sut.Handle(Avery12Command(" Avery 12er ", overwrite: false));

          // Assert
          Assert.Equal("LSF00002", saved.Id);
          Assert.Equal("Avery 12er", saved.Name);
          Assert.Equal(6, saved.Geometry.Rows);
          _repository.Verify(r => r.Add(It.Is<LabelSheetFormat>(f => f.Name == "Avery 12er")), Times.Once);
      }

      [Fact]
      public async Task Handle_ExistingNameWithoutOverwrite_ThrowsNameTakenAndChangesNothing()
      {
          // Arrange
          var stored = StoredAvery16("Avery 12er");
          _repository.Setup(r => r.FindByName("Avery 12er")).ReturnsAsync(stored);
          var sut = CreateSut();

          // Act
          var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(Avery12Command("Avery 12er", overwrite: false)));

          // Assert
          Assert.Equal(LabelSheetFormat.NameTakenErrorCode, exception.ErrorCode);
          Assert.Equal(8, stored.Geometry.Rows);
          _repository.Verify(r => r.Update(It.IsAny<LabelSheetFormat>()), Times.Never);
          _repository.Verify(r => r.Add(It.IsAny<LabelSheetFormat>()), Times.Never);
      }

      [Fact]
      public async Task Handle_ExistingNameWithOverwrite_ReplacesGeometryOfStoredFormat()
      {
          // Arrange
          var stored = StoredAvery16("Avery 12er");
          _repository.Setup(r => r.FindByName("Avery 12er")).ReturnsAsync(stored);
          var sut = CreateSut();

          // Act
          var saved = await sut.Handle(Avery12Command("Avery 12er", overwrite: true));

          // Assert
          Assert.Equal("LSF00001", saved.Id);
          Assert.Equal(6, saved.Geometry.Rows);
          _repository.Verify(r => r.Update(stored), Times.Once);
          _repository.Verify(r => r.Add(It.IsAny<LabelSheetFormat>()), Times.Never);
      }
  }
  ```
  `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/SaveLabelSheetFormatCommandValidatorTests.cs`:
  ```csharp
  using Bazaar.Application.BlankLabels;

  namespace Bazaar.Application.UnitTests.BlankLabels;

  public class SaveLabelSheetFormatCommandValidatorTests
  {
      private readonly SaveLabelSheetFormatCommandValidator _sut = new();

      private static SaveLabelSheetFormatCommand Avery16(string name = "Avery 16er") => new()
      {
          Name = name,
          SheetWidth = 210m,
          SheetHeight = 297m,
          LabelWidth = 105m,
          LabelHeight = 35m,
          MarginTop = 8.5m,
          MarginRight = 0m,
          MarginBottom = 8.5m,
          MarginLeft = 0m,
          GapHorizontal = 0m,
          GapVertical = 0m,
          Columns = 2,
          Rows = 8,
      };

      [Fact]
      public void Validate_Avery16_IsValid()
      {
          // Arrange
          var command = Avery16();

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.True(result.IsValid);
      }

      [Theory]
      [InlineData("")]
      [InlineData("   ")]
      public void Validate_BlankName_HasNameError(string name)
      {
          // Arrange
          var command = Avery16(name);

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Name));
      }

      [Fact]
      public void Validate_Name51Characters_HasNameError()
      {
          // Arrange
          var command = Avery16(new string('x', 51));

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Name));
      }

      [Fact]
      public void Validate_ThreeColumnsOnA4_HasColumnsError()
      {
          // Arrange
          var command = Avery16();
          command.Columns = 3;

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Columns));
      }

      [Fact]
      public void Validate_MarginTop9_1_HasRowsError()
      {
          // Arrange
          var command = Avery16();
          command.MarginTop = 9.1m;

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Rows));
      }

      [Fact]
      public void Validate_MarginTop8_9_IsValid()
      {
          // Arrange
          var command = Avery16();
          command.MarginTop = 8.9m;

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.True(result.IsValid);
      }

      [Fact]
      public void Validate_ZeroLabelWidth_HasLabelWidthError()
      {
          // Arrange
          var command = Avery16();
          command.LabelWidth = 0m;

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.LabelWidth));
      }

      [Fact]
      public void Validate_TwoDecimals_HasMarginLeftError()
      {
          // Arrange
          var command = Avery16();
          command.MarginLeft = 0.25m;

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.MarginLeft));
      }

      [Fact]
      public void Validate_NegativeMargin_HasMarginBottomError()
      {
          // Arrange
          var command = Avery16();
          command.MarginBottom = -1m;

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.MarginBottom));
      }

      [Fact]
      public void Validate_ZeroColumns_HasColumnsError()
      {
          // Arrange
          var command = Avery16();
          command.Columns = 0;

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Columns));
      }
  }
  ```
  `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/GetLabelSheetFormatsHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.BlankLabels;
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Ports;
  using Moq;

  namespace Bazaar.Application.UnitTests.BlankLabels;

  public class GetLabelSheetFormatsHandlerTests
  {
      [Fact]
      public async Task Handle_UnsortedFormats_ReturnsThemSortedByName()
      {
          // Arrange
          var geometry = new LabelSheetGeometry(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8);
          var repository = new Mock<ILabelSheetFormatRepository>();
          repository.Setup(r => r.GetAll()).ReturnsAsync(new List<LabelSheetFormat>
          {
              LabelSheetFormat.Create("LSF00002", "Zweckform", geometry),
              LabelSheetFormat.Create("LSF00001", "avery 16er", geometry),
          });
          var sut = new GetLabelSheetFormatsHandler(repository.Object);

          // Act
          var formats = await sut.Handle();

          // Assert
          Assert.Equal(new[] { "avery 16er", "Zweckform" }, formats.Select(f => f.Name));
      }
  }
  ```
  `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/DeleteLabelSheetFormatHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.BlankLabels;
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;
  using Moq;

  namespace Bazaar.Application.UnitTests.BlankLabels;

  public class DeleteLabelSheetFormatHandlerTests
  {
      private readonly Mock<ILabelSheetFormatRepository> _repository = new();

      [Fact]
      public async Task Handle_ExistingFormat_RemovesIt()
      {
          // Arrange
          var format = LabelSheetFormat.Create("LSF00001", "Avery 12er",
              new LabelSheetGeometry(210m, 297m, 105m, 48m, 4.5m, 0m, 4.5m, 0m, 0m, 0m, 2, 6));
          _repository.Setup(r => r.GetById("LSF00001")).ReturnsAsync(format);
          var sut = new DeleteLabelSheetFormatHandler(_repository.Object);

          // Act
          await sut.Handle("LSF00001");

          // Assert
          _repository.Verify(r => r.Remove(format), Times.Once);
      }

      [Fact]
      public async Task Handle_UnknownId_ThrowsNotFound()
      {
          // Arrange
          _repository.Setup(r => r.GetById("UNKNOWN1")).ReturnsAsync((LabelSheetFormat?)null);
          var sut = new DeleteLabelSheetFormatHandler(_repository.Object);

          // Act
          var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("UNKNOWN1"));

          // Assert
          Assert.Equal(LabelSheetFormat.NotFoundErrorCode, exception.ErrorCode);
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*SaveLabelSheetFormatHandlerTests" --filter-class "*SaveLabelSheetFormatCommandValidatorTests" --filter-class "*GetLabelSheetFormatsHandlerTests" --filter-class "*DeleteLabelSheetFormatHandlerTests"` — erwartet: FAIL (Build-Fehler: `Bazaar.Application.BlankLabels` fehlt)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/SaveLabelSheetFormatCommand.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Application.BlankLabels;

  /// <summary>
  /// Body von POST /api/label-sheet-formats. <see cref="Overwrite"/> = true ersetzt ein Format
  /// mit exakt gleichem Namen, nachdem die Seite „Überschreiben?" bestätigt hat.
  /// </summary>
  public sealed class SaveLabelSheetFormatCommand
  {
      public string Name { get; set; } = string.Empty;
      public decimal SheetWidth { get; set; }
      public decimal SheetHeight { get; set; }
      public decimal LabelWidth { get; set; }
      public decimal LabelHeight { get; set; }
      public decimal MarginTop { get; set; }
      public decimal MarginRight { get; set; }
      public decimal MarginBottom { get; set; }
      public decimal MarginLeft { get; set; }
      public decimal GapHorizontal { get; set; }
      public decimal GapVertical { get; set; }
      public int Columns { get; set; }
      public int Rows { get; set; }
      public bool Overwrite { get; set; }

      public LabelSheetGeometry ToGeometry() => new(
          SheetWidth, SheetHeight, LabelWidth, LabelHeight,
          MarginTop, MarginRight, MarginBottom, MarginLeft,
          GapHorizontal, GapVertical, Columns, Rows);
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/SaveLabelSheetFormatCommandValidator.cs`:
  ```csharp
  using System.Linq.Expressions;
  using Bazaar.Domain.BlankLabels;
  using FluentValidation;

  namespace Bazaar.Application.BlankLabels;

  public sealed class SaveLabelSheetFormatCommandValidator : AbstractValidator<SaveLabelSheetFormatCommand>
  {
      private const string OneDecimalMessage = "Höchstens eine Nachkommastelle";

      public SaveLabelSheetFormatCommandValidator()
      {
          RuleFor(x => x.Name)
              .Must(name => !string.IsNullOrWhiteSpace(name)).WithMessage("Name fehlt")
              .Must(name => (name ?? string.Empty).Trim().Length <= LabelSheetFormat.NameMaxLength)
              .WithMessage($"Höchstens {LabelSheetFormat.NameMaxLength} Zeichen");

          PositiveMeasure(x => x.SheetWidth);
          PositiveMeasure(x => x.SheetHeight);
          PositiveMeasure(x => x.LabelWidth);
          PositiveMeasure(x => x.LabelHeight);
          NonNegativeMeasure(x => x.MarginTop);
          NonNegativeMeasure(x => x.MarginRight);
          NonNegativeMeasure(x => x.MarginBottom);
          NonNegativeMeasure(x => x.MarginLeft);
          NonNegativeMeasure(x => x.GapHorizontal);
          NonNegativeMeasure(x => x.GapVertical);
          RuleFor(x => x.Columns).GreaterThanOrEqualTo(1);
          RuleFor(x => x.Rows).GreaterThanOrEqualTo(1);

          When(x => x.ToGeometry().HasValidMeasures(), () =>
          {
              RuleFor(x => x.Columns)
                  .Must((command, _) => command.ToGeometry().FitsSheetWidth())
                  .WithMessage("Etiketten passen nicht in die Bogenbreite");
              RuleFor(x => x.Rows)
                  .Must((command, _) => command.ToGeometry().FitsSheetHeight())
                  .WithMessage("Etiketten passen nicht in die Bogenhöhe");
          });
      }

      private void PositiveMeasure(Expression<Func<SaveLabelSheetFormatCommand, decimal>> measure) =>
          RuleFor(measure).GreaterThan(0).Must(LabelSheetGeometry.HasAtMostOneDecimal).WithMessage(OneDecimalMessage);

      private void NonNegativeMeasure(Expression<Func<SaveLabelSheetFormatCommand, decimal>> measure) =>
          RuleFor(measure).GreaterThanOrEqualTo(0).Must(LabelSheetGeometry.HasAtMostOneDecimal).WithMessage(OneDecimalMessage);
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/SaveLabelSheetFormatHandler.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.BlankLabels;

  /// <summary>
  /// Legt ein Bogenformat an oder ersetzt eines mit exakt gleichem Namen. Ohne
  /// <c>Overwrite</c> antwortet ein vergebener Name mit 409 <c>label_sheet_format.name_taken</c>,
  /// auch wenn ein anderer Admin ihn inzwischen gespeichert hat; die Seite fragt dann „Überschreiben?".
  /// </summary>
  public sealed class SaveLabelSheetFormatHandler(ILabelSheetFormatRepository repository, IIdGenerator idGenerator)
  {
      public async Task<LabelSheetFormat> Handle(SaveLabelSheetFormatCommand command)
      {
          var name = LabelSheetFormat.NormalizeName(command.Name);
          var existing = await repository.FindByName(name);
          if (existing is null) return await AddNew(name, command.ToGeometry());
          if (!command.Overwrite) throw new ConflictException("Bogenformat existiert bereits", LabelSheetFormat.NameTakenErrorCode);
          return await Overwrite(existing, command.ToGeometry());
      }

      private async Task<LabelSheetFormat> AddNew(string name, LabelSheetGeometry geometry)
      {
          var format = LabelSheetFormat.Create(idGenerator.Generate(), name, geometry);
          await repository.Add(format);
          return format;
      }

      private async Task<LabelSheetFormat> Overwrite(LabelSheetFormat existing, LabelSheetGeometry geometry)
      {
          existing.ReplaceGeometry(geometry);
          await repository.Update(existing);
          return existing;
      }
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/GetLabelSheetFormatsHandler.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.BlankLabels;

  public sealed class GetLabelSheetFormatsHandler(ILabelSheetFormatRepository repository)
  {
      public async Task<IReadOnlyList<LabelSheetFormat>> Handle()
      {
          var formats = await repository.GetAll();
          return formats.OrderBy(f => f.Name, StringComparer.OrdinalIgnoreCase).ToList();
      }
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/DeleteLabelSheetFormatHandler.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.BlankLabels;

  public sealed class DeleteLabelSheetFormatHandler(ILabelSheetFormatRepository repository)
  {
      public async Task Handle(string id)
      {
          var format = await repository.GetById(id)
              ?? throw new NotFoundException("Bogenformat nicht gefunden", LabelSheetFormat.NotFoundErrorCode);
          await repository.Remove(format);
      }
  }
  ```
  `Program.cs`: oben `using Bazaar.Application.BlankLabels;` zu den anderen `using Bazaar.Application.*`-Zeilen ergänzen und direkt nach der Zeile `builder.Services.AddScoped<UpdatePrintTextsHandler>();` einfügen:
  ```csharp
  builder.Services.AddScoped<GetLabelSheetFormatsHandler>();
  builder.Services.AddScoped<SaveLabelSheetFormatHandler>();
  builder.Services.AddScoped<DeleteLabelSheetFormatHandler>();
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*SaveLabelSheetFormatHandlerTests" --filter-class "*SaveLabelSheetFormatCommandValidatorTests" --filter-class "*GetLabelSheetFormatsHandlerTests" --filter-class "*DeleteLabelSheetFormatHandlerTests"` — erwartet: PASS
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests -- --filter-class "*DiRegistrationTests"` — erwartet: PASS `AllApplicationHandlers_AreRegisteredInProgram`
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Application/BlankLabels src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels && git commit -m "feat(blank-labels): Bogenformate laden, speichern mit Überschreiben und löschen" -- src/bazaar-app/backend/Bazaar.Application/BlankLabels src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels`

### Task 5: Application — gemerkte Druckwerte lesen und speichern

**ACs:** AC-14, AC-15, AC-17, AC-27, AC-35

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/GetLabelPrintDefaultsHandler.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/UpdateLabelPrintDefaultsCommand.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/UpdateLabelPrintDefaultsCommandValidator.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/BlankLabels/UpdateLabelPrintDefaultsHandler.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs` · `builder.Services.AddScoped<DeleteLabelSheetFormatHandler>();`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/GetLabelPrintDefaultsHandlerTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/UpdateLabelPrintDefaultsHandlerTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/UpdateLabelPrintDefaultsCommandValidatorTests.cs`

**Interfaces:**
- Consumes: `ILabelPrintDefaultsRepository` mit `Find()`, `Add(LabelPrintDefaults)`, `Update(LabelPrintDefaults)` (Task 3); `LabelPrintDefaults.CreateInitial()`, `Update(LabelGraphic?, LabelGraphic?, string)`, `IsValidCurrencySymbol(string?)`; `LabelGraphic.IsValid()`, `LabelGraphicKind` (Task 2)
- Produces:
  - `public sealed class GetLabelPrintDefaultsHandler(ILabelPrintDefaultsRepository repository)` mit `Task<LabelPrintDefaults> Handle()` (ohne gespeicherte Zeile: `LabelPrintDefaults.CreateInitial()`)
  - `public sealed class UpdateLabelPrintDefaultsCommand` mit `LabelGraphic? Logo`, `LabelGraphic? SellerSymbol`, `string CurrencySymbol`
  - `public sealed class UpdateLabelPrintDefaultsCommandValidator : AbstractValidator<UpdateLabelPrintDefaultsCommand>`
  - `public sealed class UpdateLabelPrintDefaultsHandler(ILabelPrintDefaultsRepository repository)` mit `Task Handle(UpdateLabelPrintDefaultsCommand command)`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/GetLabelPrintDefaultsHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.BlankLabels;
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Ports;
  using Moq;

  namespace Bazaar.Application.UnitTests.BlankLabels;

  public class GetLabelPrintDefaultsHandlerTests
  {
      private readonly Mock<ILabelPrintDefaultsRepository> _repository = new();

      [Fact]
      public async Task Handle_NothingStored_ReturnsEuroWithoutGraphics()
      {
          // Arrange
          _repository.Setup(r => r.Find()).ReturnsAsync((LabelPrintDefaults?)null);
          var sut = new GetLabelPrintDefaultsHandler(_repository.Object);

          // Act
          var defaults = await sut.Handle();

          // Assert
          Assert.Equal("€", defaults.CurrencySymbol);
          Assert.Null(defaults.Logo);
          Assert.Null(defaults.SellerSymbol);
      }

      [Fact]
      public async Task Handle_StoredDefaults_ReturnsThem()
      {
          // Arrange
          var stored = LabelPrintDefaults.CreateInitial();
          stored.Update(new LabelGraphic(LabelGraphicKind.Icon, "star"), null, "$");
          _repository.Setup(r => r.Find()).ReturnsAsync(stored);
          var sut = new GetLabelPrintDefaultsHandler(_repository.Object);

          // Act
          var defaults = await sut.Handle();

          // Assert
          Assert.Same(stored, defaults);
      }
  }
  ```
  `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/UpdateLabelPrintDefaultsHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.BlankLabels;
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Ports;
  using Moq;

  namespace Bazaar.Application.UnitTests.BlankLabels;

  public class UpdateLabelPrintDefaultsHandlerTests
  {
      private static readonly LabelGraphic StarIcon = new(LabelGraphicKind.Icon, "star");
      private static readonly LabelGraphic PngLogo = new(LabelGraphicKind.Image, "data:image/png;base64,AAAA");

      private readonly Mock<ILabelPrintDefaultsRepository> _repository = new();

      [Fact]
      public async Task Handle_NothingStoredYet_AddsDefaults()
      {
          // Arrange
          _repository.Setup(r => r.Find()).ReturnsAsync((LabelPrintDefaults?)null);
          var sut = new UpdateLabelPrintDefaultsHandler(_repository.Object);

          // Act
          await sut.Handle(new UpdateLabelPrintDefaultsCommand { Logo = PngLogo, SellerSymbol = StarIcon, CurrencySymbol = "$" });

          // Assert
          _repository.Verify(r => r.Add(It.Is<LabelPrintDefaults>(d =>
              d.Logo == PngLogo && d.SellerSymbol == StarIcon && d.CurrencySymbol == "$")), Times.Once);
          _repository.Verify(r => r.Update(It.IsAny<LabelPrintDefaults>()), Times.Never);
      }

      [Fact]
      public async Task Handle_StoredDefaults_UpdatesThemWithoutGraphics()
      {
          // Arrange
          var stored = LabelPrintDefaults.CreateInitial();
          stored.Update(PngLogo, StarIcon, "$");
          _repository.Setup(r => r.Find()).ReturnsAsync(stored);
          var sut = new UpdateLabelPrintDefaultsHandler(_repository.Object);

          // Act
          await sut.Handle(new UpdateLabelPrintDefaultsCommand { Logo = null, SellerSymbol = null, CurrencySymbol = "€" });

          // Assert
          Assert.Null(stored.Logo);
          Assert.Null(stored.SellerSymbol);
          Assert.Equal("€", stored.CurrencySymbol);
          _repository.Verify(r => r.Update(stored), Times.Once);
      }
  }
  ```
  `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels/UpdateLabelPrintDefaultsCommandValidatorTests.cs`:
  ```csharp
  using Bazaar.Application.BlankLabels;
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Application.UnitTests.BlankLabels;

  public class UpdateLabelPrintDefaultsCommandValidatorTests
  {
      private readonly UpdateLabelPrintDefaultsCommandValidator _sut = new();

      [Fact]
      public void Validate_IconSymbolAndPngLogo_IsValid()
      {
          // Arrange
          var command = new UpdateLabelPrintDefaultsCommand
          {
              Logo = new LabelGraphic(LabelGraphicKind.Image, "data:image/png;base64,AAAA"),
              SellerSymbol = new LabelGraphic(LabelGraphicKind.Icon, "star"),
              CurrencySymbol = "€",
          };

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.True(result.IsValid);
      }

      [Fact]
      public void Validate_NoGraphics_IsValid()
      {
          // Arrange
          var command = new UpdateLabelPrintDefaultsCommand { Logo = null, SellerSymbol = null, CurrencySymbol = "€" };

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.True(result.IsValid);
      }

      [Fact]
      public void Validate_GifLogo_HasLogoError()
      {
          // Arrange
          var command = new UpdateLabelPrintDefaultsCommand
          {
              Logo = new LabelGraphic(LabelGraphicKind.Image, "data:image/gif;base64,AAAA"),
              CurrencySymbol = "€",
          };

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateLabelPrintDefaultsCommand.Logo));
      }

      [Theory]
      [InlineData("")]
      [InlineData("EURO")]
      public void Validate_CurrencyOutsideOneToThreeCharacters_HasCurrencyError(string currencySymbol)
      {
          // Arrange
          var command = new UpdateLabelPrintDefaultsCommand { CurrencySymbol = currencySymbol };

          // Act
          var result = _sut.Validate(command);

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateLabelPrintDefaultsCommand.CurrencySymbol));
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*GetLabelPrintDefaultsHandlerTests" --filter-class "*UpdateLabelPrintDefaultsHandlerTests" --filter-class "*UpdateLabelPrintDefaultsCommandValidatorTests"` — erwartet: FAIL (Build-Fehler: Handler und Command fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/GetLabelPrintDefaultsHandler.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.BlankLabels;

  public sealed class GetLabelPrintDefaultsHandler(ILabelPrintDefaultsRepository repository)
  {
      /// <summary>Ohne gespeicherte Zeile gelten „€" und leeres Logo/Symbol (erstes Öffnen).</summary>
      public async Task<LabelPrintDefaults> Handle() =>
          await repository.Find() ?? LabelPrintDefaults.CreateInitial();
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/UpdateLabelPrintDefaultsCommand.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Application.BlankLabels;

  /// <summary>Body von PUT /api/label-print-defaults; die Seite sendet ihn bei jedem Druck.</summary>
  public sealed class UpdateLabelPrintDefaultsCommand
  {
      public LabelGraphic? Logo { get; set; }
      public LabelGraphic? SellerSymbol { get; set; }
      public string CurrencySymbol { get; set; } = string.Empty;
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/UpdateLabelPrintDefaultsCommandValidator.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using FluentValidation;

  namespace Bazaar.Application.BlankLabels;

  public sealed class UpdateLabelPrintDefaultsCommandValidator : AbstractValidator<UpdateLabelPrintDefaultsCommand>
  {
      private const string GraphicMessage = "Icon aus der Liste oder Bild als PNG, JPEG oder SVG bis 1 MB";

      public UpdateLabelPrintDefaultsCommandValidator()
      {
          RuleFor(x => x.Logo).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
          RuleFor(x => x.SellerSymbol).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
          RuleFor(x => x.CurrencySymbol)
              .Must(LabelPrintDefaults.IsValidCurrencySymbol)
              .WithMessage($"1 bis {LabelPrintDefaults.CurrencySymbolMaxLength} Zeichen");
      }

      private static bool IsEmptyOrValid(LabelGraphic? graphic) => graphic is null || graphic.IsValid();
  }
  ```
  `src/bazaar-app/backend/Bazaar.Application/BlankLabels/UpdateLabelPrintDefaultsHandler.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.BlankLabels;

  public sealed class UpdateLabelPrintDefaultsHandler(ILabelPrintDefaultsRepository repository)
  {
      public async Task Handle(UpdateLabelPrintDefaultsCommand command)
      {
          var existing = await repository.Find();
          if (existing is null)
          {
              await AddInitial(command);
              return;
          }
          existing.Update(command.Logo, command.SellerSymbol, command.CurrencySymbol);
          await repository.Update(existing);
      }

      private async Task AddInitial(UpdateLabelPrintDefaultsCommand command)
      {
          var defaults = LabelPrintDefaults.CreateInitial();
          defaults.Update(command.Logo, command.SellerSymbol, command.CurrencySymbol);
          await repository.Add(defaults);
      }
  }
  ```
  `Program.cs`: direkt nach der Zeile `builder.Services.AddScoped<DeleteLabelSheetFormatHandler>();` einfügen:
  ```csharp
  builder.Services.AddScoped<GetLabelPrintDefaultsHandler>();
  builder.Services.AddScoped<UpdateLabelPrintDefaultsHandler>();
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*GetLabelPrintDefaultsHandlerTests" --filter-class "*UpdateLabelPrintDefaultsHandlerTests" --filter-class "*UpdateLabelPrintDefaultsCommandValidatorTests"` — erwartet: PASS
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests -- --filter-class "*DiRegistrationTests"` — erwartet: PASS `AllApplicationHandlers_AreRegisteredInProgram`
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Application/BlankLabels src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels && git commit -m "feat(blank-labels): Logo, Symbol und Währung des letzten Drucks merken" -- src/bazaar-app/backend/Bazaar.Application/BlankLabels src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/BlankLabels`

### Task 6: API — Endpoints, Admin-Schutz, Proxy-Limit und Integrationstests

**ACs:** AC-02, AC-09, AC-11, AC-12, AC-15, AC-17, AC-37, AC-38

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Api/Features/BlankLabels/BlankLabelEndpoints.cs`
- Create: `src/bazaar-app/backend/Bazaar.Api/Features/BlankLabels/Dtos.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs:207` · `app.MapSettingsEndpoints();`
- Modify: `nginx/nginx.conf.template:19-22` · `client_max_body_size 2100k;`
- Test: `src/bazaar-app/backend/tests/Bazaar.Architecture.Tests/NginxProxyLimitsTests.cs` · `NginxProxyLimitsTests.ApiLocation_ArticleImportLimits_ContainsDirective`
- Create: `src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests/BlankLabelEndpointsTests.cs`

**Interfaces:**
- Consumes: `GetLabelSheetFormatsHandler.Handle()`, `SaveLabelSheetFormatHandler.Handle(SaveLabelSheetFormatCommand)`, `DeleteLabelSheetFormatHandler.Handle(string)` (Task 4); `GetLabelPrintDefaultsHandler.Handle()`, `UpdateLabelPrintDefaultsHandler.Handle(UpdateLabelPrintDefaultsCommand)` (Task 5); `ValidationFilter<TRequest>`; Policy `"admin"`
- Produces (JSON-Vertrag für Task 10):
  - `GET /api/label-sheet-formats` (admin) → `200` `[{ id, name, sheetWidth, sheetHeight, labelWidth, labelHeight, marginTop, marginRight, marginBottom, marginLeft, gapHorizontal, gapVertical, columns, rows }]`, nach Name sortiert
  - `POST /api/label-sheet-formats` (admin) Body `{ name, sheetWidth, …, columns, rows, overwrite }` → `200` mit dem gespeicherten Format; `409` `{ errorCode: "label_sheet_format.name_taken" }`, wenn der Name vergeben ist und `overwrite` false; `400` mit `errors` (camelCase-Keys) bei Formatfehlern
  - `DELETE /api/label-sheet-formats/{id}` (admin) → `204`; `404` `{ errorCode: "label_sheet_format.not_found" }`
  - `GET /api/label-print-defaults` (admin) → `200` `{ logo: { kind: "icon"|"image", value } | null, sellerSymbol: … | null, currencySymbol }`
  - `PUT /api/label-print-defaults` (admin) Body wie GET-Antwort → `204`; `400` bei ungültigem Bild oder Währungssymbol
  - `public static IEndpointRouteBuilder MapBlankLabelEndpoints(this IEndpointRouteBuilder app)`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `NginxProxyLimitsTests.cs` die Zeile `[InlineData(@"^\s*client_max_body_size\s+2100k;")]` ersetzen durch:
  ```csharp
      [InlineData(@"^\s*client_max_body_size\s+3000k;")]
  ```
  und im XML-Kommentar der Klasse den Satzteil `Uploads einer 2-MB-Datei samt multipart-Overhead (2100k)` ersetzen durch `Uploads einer 2-MB-Datei samt multipart-Overhead sowie die gemerkten Etiketten-Druckwerte mit zwei Bildern bis je 1 MB als Base64 (3000k)`.

  `src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests/BlankLabelEndpointsTests.cs`:
  ```csharp
  using System.Net;
  using System.Net.Http.Headers;
  using System.Net.Http.Json;

  namespace Bazaar.Api.IntegrationTests;

  /// <summary>
  /// Endpoints des Etiketten-Vordrucks gegen echtes PostgreSQL (Testcontainers, Docker nötig).
  /// Wie ImportEndpointsTests bekommt jeder Test eine frische Datenbank, damit bootstrap-admin
  /// ein Admin-Token ausgeben kann.
  /// </summary>
  public class BlankLabelEndpointsTests : IAsyncLifetime
  {
      private const string FormatsUrl = "/api/label-sheet-formats";
      private const string DefaultsUrl = "/api/label-print-defaults";
      private const string NameTakenErrorCode = "label_sheet_format.name_taken";

      private PostgresWebApplicationFactory _factory = null!;

      public async ValueTask InitializeAsync()
      {
          _factory = new PostgresWebApplicationFactory();
          await _factory.InitializeAsync();
      }

      public async ValueTask DisposeAsync()
      {
          await _factory.DisposeAsync();
      }

      [Fact]
      public async Task GetFormats_WithoutAuth_ReturnsUnauthorized()
      {
          // Arrange
          var client = _factory.CreateClient();

          // Act
          var response = await client.GetAsync(FormatsUrl, TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
      }

      [Fact]
      public async Task GetFormats_AsCashier_ReturnsForbidden()
      {
          // Arrange
          var client = _factory.CreateClient();
          var adminToken = await BootstrapAdminToken(client);
          var cashierToken = await CreateCashierToken(client, adminToken);
          client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", cashierToken);

          // Act
          var response = await client.GetAsync(FormatsUrl, TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
      }

      [Fact]
      public async Task PostFormat_PaddedName_IsListedTrimmed()
      {
          // Arrange
          var client = await AdminClient();
          var post = await client.PostAsJsonAsync(FormatsUrl, Avery16(" Avery 12er "), TestContext.Current.CancellationToken);
          post.EnsureSuccessStatusCode();

          // Act
          var formats = await client.GetFromJsonAsync<FormatBody[]>(FormatsUrl, TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal("Avery 12er", Assert.Single(formats!).Name);
      }

      [Fact]
      public async Task PostFormat_SameNameWithoutOverwrite_ReturnsConflictNameTaken()
      {
          // Arrange
          var client = await AdminClient();
          (await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er"), TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

          // Act
          var response = await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er", rows: 7), TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
          var problem = await response.Content.ReadFromJsonAsync<ProblemBody>(TestContext.Current.CancellationToken);
          Assert.Equal(NameTakenErrorCode, problem!.ErrorCode);
      }

      [Fact]
      public async Task PostFormat_SameNameWithOverwrite_ReplacesFormat()
      {
          // Arrange
          var client = await AdminClient();
          (await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er"), TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

          // Act
          var response = await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er", rows: 7, overwrite: true), TestContext.Current.CancellationToken);

          // Assert
          response.EnsureSuccessStatusCode();
          var formats = await client.GetFromJsonAsync<FormatBody[]>(FormatsUrl, TestContext.Current.CancellationToken);
          Assert.Equal(7, Assert.Single(formats!).Rows);
      }

      [Fact]
      public async Task PostFormat_ThreeColumnsOnA4_ReturnsBadRequestWithColumnsError()
      {
          // Arrange
          var client = await AdminClient();

          // Act
          var response = await client.PostAsJsonAsync(FormatsUrl, Avery16("Zu breit", columns: 3), TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
          var problem = await response.Content.ReadFromJsonAsync<ValidationBody>(TestContext.Current.CancellationToken);
          Assert.True(problem!.Errors.ContainsKey("columns"));
      }

      [Fact]
      public async Task DeleteFormat_ExistingFormat_RemovesItFromList()
      {
          // Arrange
          var client = await AdminClient();
          var post = await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er"), TestContext.Current.CancellationToken);
          var saved = await post.Content.ReadFromJsonAsync<FormatBody>(TestContext.Current.CancellationToken);

          // Act
          var response = await client.DeleteAsync($"{FormatsUrl}/{saved!.Id}", TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
          var formats = await client.GetFromJsonAsync<FormatBody[]>(FormatsUrl, TestContext.Current.CancellationToken);
          Assert.Empty(formats!);
      }

      [Fact]
      public async Task GetDefaults_NothingPrintedYet_ReturnsEuroWithoutGraphics()
      {
          // Arrange
          var client = await AdminClient();

          // Act
          var defaults = await client.GetFromJsonAsync<DefaultsBody>(DefaultsUrl, TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal("€", defaults!.CurrencySymbol);
          Assert.Null(defaults.Logo);
          Assert.Null(defaults.SellerSymbol);
      }

      [Fact]
      public async Task PutDefaults_IconImageAndDollar_AreReturnedByGet()
      {
          // Arrange
          var client = await AdminClient();
          var body = new
          {
              logo = new { kind = "image", value = "data:image/png;base64,AAAA" },
              sellerSymbol = new { kind = "icon", value = "star" },
              currencySymbol = "$",
          };
          (await client.PutAsJsonAsync(DefaultsUrl, body, TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

          // Act
          var defaults = await client.GetFromJsonAsync<DefaultsBody>(DefaultsUrl, TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal(new GraphicBody("image", "data:image/png;base64,AAAA"), defaults!.Logo);
          Assert.Equal(new GraphicBody("icon", "star"), defaults.SellerSymbol);
          Assert.Equal("$", defaults.CurrencySymbol);
      }

      [Fact]
      public async Task PutDefaults_GifLogo_ReturnsBadRequest()
      {
          // Arrange
          var client = await AdminClient();
          var body = new { logo = new { kind = "image", value = "data:image/gif;base64,AAAA" }, sellerSymbol = (object?)null, currencySymbol = "€" };

          // Act
          var response = await client.PutAsJsonAsync(DefaultsUrl, body, TestContext.Current.CancellationToken);

          // Assert
          Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
      }

      private static object Avery16(string name, int columns = 2, int rows = 8, bool overwrite = false) => new
      {
          name,
          sheetWidth = 210m,
          sheetHeight = 297m,
          labelWidth = 105m,
          labelHeight = 35m,
          marginTop = 8.5m,
          marginRight = 0m,
          marginBottom = 8.5m,
          marginLeft = 0m,
          gapHorizontal = 0m,
          gapVertical = 0m,
          columns,
          rows,
          overwrite,
      };

      private async Task<HttpClient> AdminClient()
      {
          var client = _factory.CreateClient();
          client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await BootstrapAdminToken(client));
          return client;
      }

      private static async Task<string> BootstrapAdminToken(HttpClient client)
      {
          var response = await client.PostAsJsonAsync(
              "/api/public/bootstrap-admin",
              new { username = "label-admin", password = "changeme1" },
              TestContext.Current.CancellationToken);
          response.EnsureSuccessStatusCode();
          var body = await response.Content.ReadFromJsonAsync<TokenBody>(TestContext.Current.CancellationToken);
          return body!.AccessToken;
      }

      private static async Task<string> CreateCashierToken(HttpClient client, string adminToken)
      {
          using var createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/users")
          {
              Content = JsonContent.Create(new { username = "kasse", role = "cashier", initialPassword = "kasse1234" }),
          };
          createRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
          (await client.SendAsync(createRequest, TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

          var login = await client.PostAsJsonAsync(
              "/api/auth/login",
              new { username = "kasse", password = "kasse1234" },
              TestContext.Current.CancellationToken);
          login.EnsureSuccessStatusCode();
          var body = await login.Content.ReadFromJsonAsync<TokenBody>(TestContext.Current.CancellationToken);
          return body!.AccessToken;
      }

      private sealed record TokenBody(string AccessToken);

      private sealed record FormatBody(string Id, string Name, int Columns, int Rows);

      private sealed record ProblemBody(string? ErrorCode);

      private sealed record ValidationBody(Dictionary<string, string[]> Errors);

      private sealed record GraphicBody(string Kind, string Value);

      private sealed record DefaultsBody(GraphicBody? Logo, GraphicBody? SellerSymbol, string CurrencySymbol);
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests -- --filter-class "*NginxProxyLimitsTests"` — erwartet: FAIL `ApiLocation_ArticleImportLimits_ContainsDirective`
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests -- --filter-class "*BlankLabelEndpointsTests"` — erwartet: FAIL (404 statt 401/403/200, Endpoints fehlen; Docker muss laufen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/backend/Bazaar.Api/Features/BlankLabels/Dtos.cs`:
  ```csharp
  using Bazaar.Domain.BlankLabels;

  namespace Bazaar.Api.Features.BlankLabels;

  public sealed record LabelSheetFormatDto(
      string Id,
      string Name,
      decimal SheetWidth,
      decimal SheetHeight,
      decimal LabelWidth,
      decimal LabelHeight,
      decimal MarginTop,
      decimal MarginRight,
      decimal MarginBottom,
      decimal MarginLeft,
      decimal GapHorizontal,
      decimal GapVertical,
      int Columns,
      int Rows)
  {
      public static LabelSheetFormatDto From(LabelSheetFormat format)
      {
          var geometry = format.Geometry;
          return new LabelSheetFormatDto(
              format.Id, format.Name,
              geometry.SheetWidth, geometry.SheetHeight, geometry.LabelWidth, geometry.LabelHeight,
              geometry.MarginTop, geometry.MarginRight, geometry.MarginBottom, geometry.MarginLeft,
              geometry.GapHorizontal, geometry.GapVertical, geometry.Columns, geometry.Rows);
      }
  }

  public sealed record LabelPrintDefaultsDto(LabelGraphic? Logo, LabelGraphic? SellerSymbol, string CurrencySymbol)
  {
      public static LabelPrintDefaultsDto From(LabelPrintDefaults defaults) =>
          new(defaults.Logo, defaults.SellerSymbol, defaults.CurrencySymbol);
  }
  ```
  `src/bazaar-app/backend/Bazaar.Api/Features/BlankLabels/BlankLabelEndpoints.cs`:
  ```csharp
  using Bazaar.Api.Filters;
  using Bazaar.Application.BlankLabels;

  namespace Bazaar.Api.Features.BlankLabels;

  /// <summary>
  /// Etiketten-Vordruck: Bogenformate und die Werte des letzten Drucks. Alles nur für Admin,
  /// auch das Lesen — die Seite gibt es für Kassenpersonal nicht.
  /// </summary>
  public static class BlankLabelEndpoints
  {
      public static IEndpointRouteBuilder MapBlankLabelEndpoints(this IEndpointRouteBuilder app)
      {
          app.MapGet("/api/label-sheet-formats", async (GetLabelSheetFormatsHandler handler) =>
                  Results.Ok((await handler.Handle()).Select(LabelSheetFormatDto.From)))
              .RequireAuthorization("admin");

          app.MapPost("/api/label-sheet-formats", async (SaveLabelSheetFormatCommand command, SaveLabelSheetFormatHandler handler) =>
                  Results.Ok(LabelSheetFormatDto.From(await handler.Handle(command))))
              .RequireAuthorization("admin")
              .AddEndpointFilter<ValidationFilter<SaveLabelSheetFormatCommand>>();

          app.MapDelete("/api/label-sheet-formats/{id}", async (string id, DeleteLabelSheetFormatHandler handler) =>
          {
              await handler.Handle(id);
              return Results.NoContent();
          })
          .RequireAuthorization("admin");

          app.MapGet("/api/label-print-defaults", async (GetLabelPrintDefaultsHandler handler) =>
                  Results.Ok(LabelPrintDefaultsDto.From(await handler.Handle())))
              .RequireAuthorization("admin");

          app.MapPut("/api/label-print-defaults", async (UpdateLabelPrintDefaultsCommand command, UpdateLabelPrintDefaultsHandler handler) =>
          {
              await handler.Handle(command);
              return Results.NoContent();
          })
          .RequireAuthorization("admin")
          .AddEndpointFilter<ValidationFilter<UpdateLabelPrintDefaultsCommand>>();

          return app;
      }
  }
  ```
  `Program.cs`: oben `using Bazaar.Api.Features.BlankLabels;` zu den anderen `using Bazaar.Api.Features.*`-Zeilen ergänzen und direkt nach der Zeile `app.MapSettingsEndpoints();` einfügen:
  ```csharp
  app.MapBlankLabelEndpoints();
  ```
  `nginx/nginx.conf.template`: im Block `location /api/` die zwei Kommentarzeilen und die Direktive
  ```
          # Artikel-Import: Datei bis 2 MB plus multipart-Overhead (2100k) und Antwortzeit bis 3 Minuten
          # (nginx-Standard: 1 MB / 60 s). Die genaue 2-MB-Grenze prüfen Modal und Endpoint.
          client_max_body_size 2100k;
  ```
  ersetzen durch:
  ```
          # Artikel-Import: Datei bis 2 MB plus multipart-Overhead; Etiketten-Vordruck: zwei Bilder bis je
          # 1 MB als Base64 im JSON (ca. 2,8 MB) — daher 3000k. Antwortzeit bis 3 Minuten
          # (nginx-Standard: 1 MB / 60 s). Die genauen Grenzen prüfen Modal und Endpoints.
          client_max_body_size 3000k;
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests` — erwartet: PASS
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests -- --filter-class "*BlankLabelEndpointsTests"` — erwartet: PASS (Docker-Daemon muss laufen; eine `TestcontainersException` heißt: Docker starten, nicht Code ändern)
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/backend/Bazaar.Api/Features/BlankLabels src/bazaar-app/backend/Bazaar.Api/Program.cs nginx/nginx.conf.template src/bazaar-app/backend/tests/Bazaar.Architecture.Tests/NginxProxyLimitsTests.cs src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests/BlankLabelEndpointsTests.cs && git commit -m "feat(blank-labels): Admin-Endpoints für Bogenformate und Druckwerte" -- src/bazaar-app/backend/Bazaar.Api/Features/BlankLabels src/bazaar-app/backend/Bazaar.Api/Program.cs nginx/nginx.conf.template src/bazaar-app/backend/tests/Bazaar.Architecture.Tests/NginxProxyLimitsTests.cs src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests/BlankLabelEndpointsTests.cs`

### Task 7: Frontend shared — Bogengeometrie, Etikett-Layout und Platzierung

**ACs:** AC-04, AC-21, AC-22, AC-23, AC-24, AC-32

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-geometry.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-geometry.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-slots.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-slots.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic.spec.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `label-geometry.ts`: `interface LabelSheetGeometry { sheetWidth: number; sheetHeight: number; labelWidth: number; labelHeight: number; marginTop: number; marginRight: number; marginBottom: number; marginLeft: number; gapHorizontal: number; gapVertical: number; columns: number; rows: number }`, `const AVERY_16_GEOMETRY: LabelSheetGeometry`, `const FIT_TOLERANCE_MM = 0.5`, `interface SlotRect { left: number; top: number; width: number; height: number }`, `labelsPerSheet(g: LabelSheetGeometry): number`, `fitsSheetWidth(g: LabelSheetGeometry): boolean`, `fitsSheetHeight(g: LabelSheetGeometry): boolean`, `slotRects(g: LabelSheetGeometry): SlotRect[]`
  - `label-layout.ts`: `const LABEL_BASE_WIDTH_MM = 105`, `const LABEL_BASE_HEIGHT_MM = 35`, `interface LabelBox { x: number; y: number; size: number }`, `interface LabelText { x: number; y: number; fontSize: number }`, `interface LabelLine { x1: number; x2: number; y: number }`, `interface LabelLayout { scale: number; foldX: number; qr: LabelBox; numberText: LabelText; logo: LabelBox; sellerSymbolTopRight: LabelBox; sellerSymbolBottomLeft: LabelBox; priceLine: LabelLine; currency: LabelText }`, `labelScale(width: number, height: number): number`, `labelLayout(width: number, height: number): LabelLayout`
  - `label-slots.ts`: `type LabelSlot = { kind: 'skipped' } | { kind: 'empty' } | { kind: 'label'; number: number }`, `placeLabels(startNumber: number, count: number, startPosition: number, perSheet: number): LabelSlot[][]`, `startPositionPreview(startPosition: number, perSheet: number): LabelSlot[]`
  - `label-graphic.ts`: `const LABEL_ICON_KEYS = ['star', 'heart', 'sun', 'moon', 'flower', 'leaf', 'crown', 'gift', 'cloud'] as const`, `type LabelIconKey`, `const LABEL_ICON_TITLES: Record<LabelIconKey, string>`, `type LabelGraphic = { kind: 'icon'; value: LabelIconKey } | { kind: 'image'; value: string }`, `interface LabelContent { logo: LabelGraphic | null; sellerSymbol: LabelGraphic | null; currencySymbol: string }`, `const EMPTY_LABEL_CONTENT: LabelContent`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-geometry.spec.ts`:
  ```typescript
  import { AVERY_16_GEOMETRY, fitsSheetHeight, fitsSheetWidth, labelsPerSheet, slotRects } from './label-geometry';

  describe('label-geometry', () => {
    it('labelsPerSheet_avery16_returns16', () => {
      // Arrange
      const geometry = AVERY_16_GEOMETRY;

      // Act
      const perSheet = labelsPerSheet(geometry);

      // Assert
      expect(perSheet).toBe(16);
    });

    it('fitsSheetWidth_threeColumnsOf105OnA4_returnsFalse', () => {
      // Arrange
      const geometry = { ...AVERY_16_GEOMETRY, columns: 3 };

      // Act
      const fits = fitsSheetWidth(geometry);

      // Assert
      expect(fits).toBe(false);
    });

    it('fitsSheetHeight_marginTop8_9Sum297_4_returnsTrue', () => {
      // Arrange
      const geometry = { ...AVERY_16_GEOMETRY, marginTop: 8.9 };

      // Act
      const fits = fitsSheetHeight(geometry);

      // Assert
      expect(fits).toBe(true);
    });

    it('fitsSheetHeight_marginTop9_1Sum297_6_returnsFalse', () => {
      // Arrange
      const geometry = { ...AVERY_16_GEOMETRY, marginTop: 9.1 };

      // Act
      const fits = fitsSheetHeight(geometry);

      // Assert
      expect(fits).toBe(false);
    });

    it('fitsSheetHeight_sumExactly0_5Over_returnsTrue', () => {
      // Arrange
      const geometry = { ...AVERY_16_GEOMETRY, marginTop: 9 };

      // Act
      const fits = fitsSheetHeight(geometry);

      // Assert
      expect(fits).toBe(true);
    });

    it('slotRects_avery16_placesSlotsRowWiseFromTopLeft', () => {
      // Arrange
      const geometry = AVERY_16_GEOMETRY;

      // Act
      const rects = slotRects(geometry);

      // Assert
      expect(rects).toHaveLength(16);
      expect(rects[0]).toEqual({ left: 0, top: 8.5, width: 105, height: 35 });
      expect(rects[1]).toEqual({ left: 105, top: 8.5, width: 105, height: 35 });
      expect(rects[2]).toEqual({ left: 0, top: 43.5, width: 105, height: 35 });
    });

    it('slotRects_gapsAndMargins_addGapBetweenNeighbours', () => {
      // Arrange
      const geometry = { ...AVERY_16_GEOMETRY, labelWidth: 100, marginLeft: 3, gapHorizontal: 4 };

      // Act
      const rects = slotRects(geometry);

      // Assert
      expect(rects[1].left).toBe(107);
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.spec.ts`:
  ```typescript
  import { LabelBox, LabelLayout, labelLayout, labelScale } from './label-layout';

  function boxes(layout: LabelLayout): LabelBox[] {
    return [layout.qr, layout.logo, layout.sellerSymbolTopRight, layout.sellerSymbolBottomLeft];
  }

  describe('label-layout', () => {
    it('labelScale_base105x35_returns1', () => {
      // Arrange & Act
      const scale = labelScale(105, 35);

      // Assert
      expect(scale).toBe(1);
    });

    it('labelScale_105x17_5_takesSmallerRatio0_5', () => {
      // Arrange & Act
      const scale = labelScale(105, 17.5);

      // Assert
      expect(scale).toBe(0.5);
    });

    it('labelLayout_halfSize52_5x17_5_everyElementIsHalfAsLarge', () => {
      // Arrange
      const full = labelLayout(105, 35);

      // Act
      const half = labelLayout(52.5, 17.5);

      // Assert
      expect(half.qr.size).toBeCloseTo(full.qr.size / 2);
      expect(half.qr.x).toBeCloseTo(full.qr.x / 2);
      expect(half.qr.y).toBeCloseTo(full.qr.y / 2);
      expect(half.logo.size).toBeCloseTo(full.logo.size / 2);
      expect(half.logo.x).toBeCloseTo(full.logo.x / 2);
      expect(half.sellerSymbolTopRight.size).toBeCloseTo(full.sellerSymbolTopRight.size / 2);
      expect(half.sellerSymbolTopRight.x).toBeCloseTo(full.sellerSymbolTopRight.x / 2);
      expect(half.sellerSymbolBottomLeft.y).toBeCloseTo(full.sellerSymbolBottomLeft.y / 2);
      expect(half.numberText.fontSize).toBeCloseTo(full.numberText.fontSize / 2);
      expect(half.numberText.y).toBeCloseTo(full.numberText.y / 2);
      expect(half.priceLine.x1).toBeCloseTo(full.priceLine.x1 / 2);
      expect(half.priceLine.x2).toBeCloseTo(full.priceLine.x2 / 2);
      expect(half.currency.fontSize).toBeCloseTo(full.currency.fontSize / 2);
      expect(half.foldX).toBeCloseTo(full.foldX / 2);
    });

    it('labelLayout_105x17_5_elementsHalfSizeAndInsideLabel', () => {
      // Arrange
      const full = labelLayout(105, 35);

      // Act
      const flat = labelLayout(105, 17.5);

      // Assert
      expect(flat.qr.size).toBeCloseTo(full.qr.size / 2);
      expect(flat.logo.size).toBeCloseTo(full.logo.size / 2);
      expect(flat.numberText.fontSize).toBeCloseTo(full.numberText.fontSize / 2);
      for (const box of boxes(flat)) {
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.size).toBeLessThanOrEqual(105);
        expect(box.y + box.size).toBeLessThanOrEqual(17.5);
      }
      expect(flat.numberText.y + flat.numberText.fontSize).toBeLessThanOrEqual(17.5);
      expect(flat.priceLine.x2).toBeLessThanOrEqual(105);
      expect(flat.priceLine.y).toBeLessThanOrEqual(17.5);
      expect(flat.currency.x + flat.currency.fontSize).toBeLessThanOrEqual(105);
      expect(flat.currency.y + flat.currency.fontSize).toBeLessThanOrEqual(17.5);
    });

    it('labelLayout_base_placesQrLeftLogoBesideAndPriceRight', () => {
      // Arrange & Act
      const layout = labelLayout(105, 35);

      // Assert
      expect(layout.logo.x).toBeGreaterThan(layout.qr.x + layout.qr.size);
      expect(layout.logo.x + layout.logo.size).toBeLessThan(layout.foldX);
      expect(layout.numberText.y).toBeGreaterThan(layout.qr.y + layout.qr.size);
      expect(layout.priceLine.x1).toBeGreaterThan(layout.foldX);
      expect(layout.currency.x).toBeGreaterThan(layout.priceLine.x2);
      expect(layout.sellerSymbolTopRight.x).toBeGreaterThan(layout.foldX);
      expect(layout.sellerSymbolBottomLeft.y).toBeGreaterThan(layout.numberText.y + layout.numberText.fontSize);
      expect(layout.sellerSymbolBottomLeft.y + layout.sellerSymbolBottomLeft.size).toBeLessThanOrEqual(35);
      expect(layout.foldX).toBe(52.5);
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-slots.spec.ts`:
  ```typescript
  import { LabelSlot, placeLabels, startPositionPreview } from './label-slots';

  function numbersOf(slots: LabelSlot[]): (number | null)[] {
    return slots.map((slot) => (slot.kind === 'label' ? slot.number : null));
  }

  describe('label-slots', () => {
    it('placeLabels_avery16Start1000Count4Position7_fillsRow4And5LeftToRight', () => {
      // Arrange & Act
      const sheets = placeLabels(1000, 4, 7, 16);

      // Assert
      expect(sheets).toHaveLength(1);
      expect(sheets[0].slice(0, 6).every((slot) => slot.kind === 'skipped')).toBe(true);
      expect(numbersOf(sheets[0]).slice(6, 10)).toEqual([1000, 1001, 1002, 1003]);
      expect(sheets[0].slice(10).every((slot) => slot.kind === 'empty')).toBe(true);
    });

    it('placeLabels_emptyStartPositionMeansOne_fillsRows1And2', () => {
      // Arrange & Act
      const sheets = placeLabels(1000, 4, 1, 16);

      // Assert
      expect(numbersOf(sheets[0]).slice(0, 4)).toEqual([1000, 1001, 1002, 1003]);
    });

    it('placeLabels_count12FromPosition7_continuesOnSecondSheetAtSlot1', () => {
      // Arrange & Act
      const sheets = placeLabels(1000, 12, 7, 16);

      // Assert
      expect(sheets).toHaveLength(2);
      expect(numbersOf(sheets[0]).slice(6)).toEqual([1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009]);
      expect(numbersOf(sheets[1]).slice(0, 2)).toEqual([1010, 1011]);
      expect(sheets[1].slice(2).every((slot) => slot.kind === 'empty')).toBe(true);
    });

    it('placeLabels_exactlyOneFullSheet_returnsOneSheet', () => {
      // Arrange & Act
      const sheets = placeLabels(1, 16, 1, 16);

      // Assert
      expect(sheets).toHaveLength(1);
      expect(numbersOf(sheets[0])[15]).toBe(16);
    });

    it('startPositionPreview_position7_greysFirstSixSlots', () => {
      // Arrange & Act
      const slots = startPositionPreview(7, 16);

      // Assert
      expect(slots.filter((slot) => slot.kind === 'skipped')).toHaveLength(6);
      expect(slots[6].kind).toBe('empty');
      expect(slots).toHaveLength(16);
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic.spec.ts`:
  ```typescript
  import { EMPTY_LABEL_CONTENT, LABEL_ICON_KEYS, LABEL_ICON_TITLES } from './label-graphic';

  describe('label-graphic', () => {
    it('LABEL_ICON_KEYS_always_offersAtLeastOneIconWithTitle', () => {
      // Arrange & Act
      const titles = LABEL_ICON_KEYS.map((key) => LABEL_ICON_TITLES[key]);

      // Assert
      expect(LABEL_ICON_KEYS.length).toBeGreaterThanOrEqual(1);
      expect(titles.every((title) => title.length > 0)).toBe(true);
    });

    it('EMPTY_LABEL_CONTENT_always_hasEuroAndNoGraphics', () => {
      // Arrange & Act
      const content = EMPTY_LABEL_CONTENT;

      // Assert
      expect(content).toEqual({ logo: null, sellerSymbol: null, currencySymbol: '€' });
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/label-sheet/label-geometry.spec.ts --include src/app/shared/components/label-sheet/label-layout.spec.ts --include src/app/shared/components/label-sheet/label-slots.spec.ts --include src/app/shared/components/label-sheet/label-graphic.spec.ts` — erwartet: FAIL (Module `./label-geometry`, `./label-layout`, `./label-slots`, `./label-graphic` fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-geometry.ts`:
  ```typescript
  /** Maße eines Etikettenbogens in mm (Bogenformat ohne Namen); Feldnamen wie im JSON-Vertrag. */
  export interface LabelSheetGeometry {
    sheetWidth: number;
    sheetHeight: number;
    labelWidth: number;
    labelHeight: number;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    gapHorizontal: number;
    gapVertical: number;
    columns: number;
    rows: number;
  }

  /** Vorbelegung ohne gespeichertes Bogenformat: Avery 16er auf A4. */
  export const AVERY_16_GEOMETRY: LabelSheetGeometry = {
    sheetWidth: 210,
    sheetHeight: 297,
    labelWidth: 105,
    labelHeight: 35,
    marginTop: 8.5,
    marginRight: 0,
    marginBottom: 8.5,
    marginLeft: 0,
    gapHorizontal: 0,
    gapVertical: 0,
    columns: 2,
    rows: 8,
  };

  /** So weit darf das Raster den Bogen überragen, ohne als widersprüchlich zu gelten. */
  export const FIT_TOLERANCE_MM = 0.5;

  /** Lage eines Etikettplatzes auf dem Bogen in mm, gemessen ab der linken oberen Bogenecke. */
  export interface SlotRect {
    left: number;
    top: number;
    width: number;
    height: number;
  }

  export function labelsPerSheet(geometry: LabelSheetGeometry): number {
    return geometry.columns * geometry.rows;
  }

  export function fitsSheetWidth(geometry: LabelSheetGeometry): boolean {
    const required =
      geometry.columns * geometry.labelWidth +
      (geometry.columns - 1) * geometry.gapHorizontal +
      geometry.marginLeft +
      geometry.marginRight;
    return roundToTenth(required) <= geometry.sheetWidth + FIT_TOLERANCE_MM;
  }

  export function fitsSheetHeight(geometry: LabelSheetGeometry): boolean {
    const required =
      geometry.rows * geometry.labelHeight +
      (geometry.rows - 1) * geometry.gapVertical +
      geometry.marginTop +
      geometry.marginBottom;
    return roundToTenth(required) <= geometry.sheetHeight + FIT_TOLERANCE_MM;
  }

  /** Alle Plätze eines Bogens zeilenweise: in der Zeile von links nach rechts, dann die nächste Zeile. */
  export function slotRects(geometry: LabelSheetGeometry): SlotRect[] {
    return Array.from({ length: labelsPerSheet(geometry) }, (_, index) => slotRectAt(geometry, index));
  }

  function slotRectAt(geometry: LabelSheetGeometry, index: number): SlotRect {
    const column = index % geometry.columns;
    const row = Math.floor(index / geometry.columns);
    return {
      left: geometry.marginLeft + column * (geometry.labelWidth + geometry.gapHorizontal),
      top: geometry.marginTop + row * (geometry.labelHeight + geometry.gapVertical),
      width: geometry.labelWidth,
      height: geometry.labelHeight,
    };
  }

  /** Maße haben höchstens eine Nachkommastelle; Rundung entfernt Gleitkomma-Reste wie 297.40000000000003. */
  function roundToTenth(value: number): number {
    return Math.round(value * 10) / 10;
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-layout.ts`:
  ```typescript
  /** Maßstab 1 des Etikett-Inhalts. */
  export const LABEL_BASE_WIDTH_MM = 105;
  export const LABEL_BASE_HEIGHT_MM = 35;

  /** Quadratisches Element (QR-Code, Logo, Verkäufer-Symbol) in mm. */
  export interface LabelBox {
    x: number;
    y: number;
    size: number;
  }

  /** Textelement in mm; `x` ist beim Klartext die horizontale Mitte, beim Währungssymbol die linke Kante. */
  export interface LabelText {
    x: number;
    y: number;
    fontSize: number;
  }

  export interface LabelLine {
    x1: number;
    x2: number;
    y: number;
  }

  export interface LabelLayout {
    scale: number;
    foldX: number;
    qr: LabelBox;
    numberText: LabelText;
    logo: LabelBox;
    sellerSymbolTopRight: LabelBox;
    sellerSymbolBottomLeft: LabelBox;
    priceLine: LabelLine;
    currency: LabelText;
  }

  /** 105 × 35 mm = 1; bei anderem Seitenverhältnis gilt das kleinere der beiden Verhältnisse. */
  export function labelScale(width: number, height: number): number {
    return Math.min(width / LABEL_BASE_WIDTH_MM, height / LABEL_BASE_HEIGHT_MM);
  }

  /**
   * Lage aller Elemente in mm. Linke Elemente hängen an der linken, rechte an der rechten
   * Kante, untere an der Unterkante; Abstände und Größen skalieren mit `labelScale`, damit der
   * Inhalt bei jedem Seitenverhältnis vollständig im Etikett liegt.
   */
  export function labelLayout(width: number, height: number): LabelLayout {
    const k = labelScale(width, height);
    return {
      scale: k,
      foldX: width / 2,
      qr: { x: 4 * k, y: 2 * k, size: 20 * k },
      numberText: { x: 14 * k, y: 23 * k, fontSize: 3.5 * k },
      logo: { x: 26 * k, y: 2 * k, size: 20 * k },
      sellerSymbolTopRight: { x: width - 6.5 * k, y: 1.5 * k, size: 5 * k },
      sellerSymbolBottomLeft: { x: 1.5 * k, y: height - 6.5 * k, size: 5 * k },
      priceLine: { x1: width - 48 * k, x2: width - 14 * k, y: height - 11 * k },
      currency: { x: width - 12.5 * k, y: height - 17 * k, fontSize: 6 * k },
    };
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-slots.ts`:
  ```typescript
  /** Ein Platz auf dem Etikettenbogen: vor der Startposition übersprungen, leer oder mit Etikett. */
  export type LabelSlot = { kind: 'skipped' } | { kind: 'empty' } | { kind: 'label'; number: number };

  const SKIPPED: LabelSlot = { kind: 'skipped' };
  const EMPTY: LabelSlot = { kind: 'empty' };

  /**
   * Verteilt `count` Etiketten ab `startNumber` zeilenweise auf ganze Bögen. Die Plätze vor der
   * Startposition (1-basiert) bleiben auf dem ersten Bogen leer; Folgebögen beginnen bei Platz 1.
   */
  export function placeLabels(startNumber: number, count: number, startPosition: number, perSheet: number): LabelSlot[][] {
    const skipped = startPosition - 1;
    const sheetCount = Math.ceil((skipped + count) / perSheet);
    const slots = Array.from({ length: sheetCount * perSheet }, (_, index) => slotAt(index, skipped, startNumber, count));
    return chunk(slots, perSheet);
  }

  /** Erster Bogen der Vorschau von Bereich C: Plätze vor der Startposition ausgegraut. */
  export function startPositionPreview(startPosition: number, perSheet: number): LabelSlot[] {
    return Array.from({ length: perSheet }, (_, index) => (index < startPosition - 1 ? SKIPPED : EMPTY));
  }

  function slotAt(index: number, skipped: number, startNumber: number, count: number): LabelSlot {
    if (index < skipped) return SKIPPED;
    if (index >= skipped + count) return EMPTY;
    return { kind: 'label', number: startNumber + index - skipped };
  }

  function chunk<T>(items: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic.ts`:
  ```typescript
  /** Icon-Liste für Logo und Verkäufer-Symbol; Schlüssel wie im Backend (`^[a-z0-9-]{1,30}$`). */
  export const LABEL_ICON_KEYS = ['star', 'heart', 'sun', 'moon', 'flower', 'leaf', 'crown', 'gift', 'cloud'] as const;

  export type LabelIconKey = (typeof LABEL_ICON_KEYS)[number];

  export const LABEL_ICON_TITLES: Record<LabelIconKey, string> = {
    star: 'Stern',
    heart: 'Herz',
    sun: 'Sonne',
    moon: 'Mond',
    flower: 'Blume',
    leaf: 'Blatt',
    crown: 'Krone',
    gift: 'Geschenk',
    cloud: 'Wolke',
  };

  /** Logo oder Verkäufer-Symbol: Icon der Liste oder eigenes Bild als Data-URL; JSON wie `LabelGraphic` im Backend. */
  export type LabelGraphic = { kind: 'icon'; value: LabelIconKey } | { kind: 'image'; value: string };

  /** Was auf jedem Etikett eines Drucks gleich ist. */
  export interface LabelContent {
    logo: LabelGraphic | null;
    sellerSymbol: LabelGraphic | null;
    currencySymbol: string;
  }

  export const EMPTY_LABEL_CONTENT: LabelContent = { logo: null, sellerSymbol: null, currencySymbol: '€' };
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/label-sheet/label-geometry.spec.ts --include src/app/shared/components/label-sheet/label-layout.spec.ts --include src/app/shared/components/label-sheet/label-slots.spec.ts --include src/app/shared/components/label-sheet/label-graphic.spec.ts` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/shared/components/label-sheet && git commit -m "feat(blank-labels): Bogengeometrie, Etikett-Layout und Platzierung als reine Funktionen" -- src/bazaar-app/frontend/src/app/shared/components/label-sheet`

### Task 8: Frontend shared — Etikett und Etikettenbogen als Leaf-Komponenten

**ACs:** AC-15, AC-16, AC-18, AC-19, AC-20, AC-25, AC-31, AC-35

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic-view.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic-view.html`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic-view.scss`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.html`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.scss`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.html`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.scss`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.spec.ts`

**Interfaces:**
- Consumes: `labelLayout(width, height): LabelLayout`, `LabelBox`, `LabelText`, `LabelLine` (Task 7); `LabelSheetGeometry`, `slotRects(g): SlotRect[]`, `SlotRect`, `AVERY_16_GEOMETRY` (Task 7); `LabelSlot`, `startPositionPreview(startPosition, perSheet)` (Task 7); `LabelGraphic`, `LabelContent`, `EMPTY_LABEL_CONTENT` (Task 7); `QrCode` (`app-qr-code`, Inputs `value: string` required, `size: number`) aus `shared/components/qr-code/qr-code.ts`; Lucide-Komponenten `LucideStar`, `LucideHeart`, `LucideSun`, `LucideMoon`, `LucideFlower`, `LucideLeaf`, `LucideCrown`, `LucideGift`, `LucideCloud` (Selektor `svg[lucideStar]` usw.) aus `@lucide/angular`
- Produces:
  - `LabelGraphicView` (Selektor `app-label-graphic`), Input `graphic: LabelGraphic` (required); Icon → `<svg lucide…>`, Bild → `<img [src]>`
  - `LabelCard` (Selektor `app-label-card`), Inputs `width: number` (required, mm), `height: number` (required, mm), `number: number | null` (Default `null`), `logo: LabelGraphic | null`, `sellerSymbol: LabelGraphic | null`, `currencySymbol: string` (Default `'€'`), `showFoldLine: boolean` (Default `false`); öffentliche Signale `numberText(): string | null`, `aspectRatio(): string`, `styles(): LabelCardStyles`; CSS-Klassen `.label-card`, `.label-card__fold`, `.label-card__qr`, `.label-card__number`, `.label-card__logo`, `.label-card__symbol--top-right`, `.label-card__symbol--bottom-left`, `.label-card__price-line`, `.label-card__currency`
  - `type LabelCardStyles = Record<'fold' | 'qr' | 'numberText' | 'logo' | 'sellerSymbolTopRight' | 'sellerSymbolBottomLeft' | 'priceLine' | 'currency', Record<string, string>>`
  - `LabelSheet` (Selektor `app-label-sheet`), Inputs `geometry: LabelSheetGeometry` (required), `slots: LabelSlot[]` (required), `content: LabelContent` (Default `EMPTY_LABEL_CONTENT`), `width: string` (Default `'100%'`), `maxHeight: string | null` (Default `null`), `outlineSlots: boolean` (Default `false`), `showFoldLines: boolean` (Default `false`); öffentliches Signal `sheetStyle(): Record<string, string>`; Platz-Elemente `.label-sheet__slot` mit `data-slot="<1-basiert>"`, übersprungen zusätzlich `.label-sheet__slot--skipped`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { By } from '@angular/platform-browser';
  import { LabelCard } from './label-card';
  import { LabelGraphic } from './label-graphic';
  import { QrCode } from '../qr-code/qr-code';

  const STAR: LabelGraphic = { kind: 'icon', value: 'star' };
  const PNG_LOGO: LabelGraphic = { kind: 'image', value: 'data:image/png;base64,AAAA' };
  const SVG_WITH_SCRIPT: LabelGraphic = {
    kind: 'image',
    value: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>')}`,
  };

  async function render(inputs: Record<string, unknown>): Promise<ComponentFixture<LabelCard>> {
    const fixture = TestBed.createComponent(LabelCard);
    fixture.componentRef.setInput('width', 105);
    fixture.componentRef.setInput('height', 35);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture;
  }

  function element(fixture: ComponentFixture<LabelCard>, selector: string): HTMLElement | null {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(selector);
  }

  function percent(value: string | undefined): number {
    return Number.parseFloat(value ?? 'NaN');
  }

  describe('LabelCard', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [LabelCard] }).compileComponents();
    });

    it('render_number1000_encodesExactly1000InQrCode', async () => {
      // Arrange & Act
      const fixture = await render({ number: 1000 });

      // Assert
      const qrCode = fixture.debugElement.query(By.directive(QrCode)).componentInstance as QrCode;
      expect(qrCode.value()).toBe('1000');
    });

    it('render_number1000_showsPlainText1000DirectlyBelowQrCode', async () => {
      // Arrange & Act
      const fixture = await render({ number: 1000 });

      // Assert
      const styles = fixture.componentInstance.styles();
      expect(element(fixture, '.label-card__number')?.textContent?.trim()).toBe('1000');
      expect(percent(styles.numberText['top'])).toBeGreaterThan(percent(styles.qr['top']) + percent(styles.qr['height']));
      expect(percent(styles.numberText['left'])).toBeGreaterThan(percent(styles.qr['left']));
      expect(percent(styles.numberText['left'])).toBeLessThan(percent(styles.qr['left']) + percent(styles.qr['width']));
    });

    it('render_logoSymbolAndDollar_placesLogoBesideQrSymbolsInCornersAndPriceRight', async () => {
      // Arrange & Act
      const fixture = await render({ number: 1000, logo: PNG_LOGO, sellerSymbol: STAR, currencySymbol: '$' });

      // Assert
      const styles = fixture.componentInstance.styles();
      expect(element(fixture, '.label-card__logo')).not.toBeNull();
      expect(percent(styles.logo['left'])).toBeGreaterThan(percent(styles.qr['left']) + percent(styles.qr['width']));
      expect(percent(styles.sellerSymbolTopRight['left'])).toBeGreaterThan(50);
      expect(percent(styles.sellerSymbolTopRight['top'])).toBeLessThan(50);
      expect(percent(styles.sellerSymbolBottomLeft['left'])).toBeLessThan(50);
      expect(percent(styles.sellerSymbolBottomLeft['top'])).toBeGreaterThan(50);
      expect(percent(styles.priceLine['left'])).toBeGreaterThan(50);
      expect(element(fixture, '.label-card__price-line')).not.toBeNull();
      expect(element(fixture, '.label-card__currency')?.textContent?.trim()).toBe('$');
      expect((fixture.nativeElement as HTMLElement).querySelectorAll('.label-card__symbol')).toHaveLength(2);
    });

    it('render_withoutLogoAndSymbol_rendersNoGraphic', async () => {
      // Arrange & Act
      const fixture = await render({ number: 1000, logo: null, sellerSymbol: null });

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-label-graphic')).toHaveLength(0);
      expect(element(fixture, '.label-card__price-line')).not.toBeNull();
    });

    it('render_showFoldLine_rendersFoldLineAtCenter', async () => {
      // Arrange & Act
      const fixture = await render({ showFoldLine: true });

      // Assert
      expect(element(fixture, '.label-card__fold')?.style.left).toBe('50%');
    });

    it('render_foldLineNotRequested_rendersNoFoldLine', async () => {
      // Arrange & Act
      const fixture = await render({ showFoldLine: false });

      // Assert
      expect(element(fixture, '.label-card__fold')).toBeNull();
    });

    it('render_iconSymbol_rendersIconSvg', async () => {
      // Arrange & Act
      const fixture = await render({ sellerSymbol: STAR });

      // Assert
      expect(element(fixture, '.label-card__symbol--top-right svg')).not.toBeNull();
    });

    it('render_imageLogo_rendersImageWithItsDataUrl', async () => {
      // Arrange & Act
      const fixture = await render({ logo: PNG_LOGO });

      // Assert
      expect(element(fixture, '.label-card__logo img')?.getAttribute('src')).toBe(PNG_LOGO.value);
    });

    it('render_svgImageWithScript_rendersOnlyImgSrcNoScriptElement', async () => {
      // Arrange & Act
      const fixture = await render({ logo: SVG_WITH_SCRIPT });

      // Assert
      const logo = element(fixture, '.label-card__logo');
      expect(logo?.querySelectorAll('img')).toHaveLength(1);
      expect(logo?.querySelector('img')?.getAttribute('src')).toBe(SVG_WITH_SCRIPT.value);
      expect(logo?.querySelector('script')).toBeNull();
      expect(logo?.querySelector('svg')).toBeNull();
    });

    it('render_noNumber_rendersNoQrCodeAndNoPlainText', async () => {
      // Arrange & Act
      const fixture = await render({ number: null });

      // Assert
      expect(element(fixture, 'app-qr-code')).toBeNull();
      expect(element(fixture, '.label-card__number')).toBeNull();
    });

    it('styles_halfSizeLabel_keepsSamePercentagesAsFullSize', async () => {
      // Arrange
      const full = await render({ number: 1000 });
      const fullStyles = full.componentInstance.styles();

      // Act
      const half = await render({ width: 52.5, height: 17.5, number: 1000 });

      // Assert
      const halfStyles = half.componentInstance.styles();
      expect(percent(halfStyles.qr['width'])).toBeCloseTo(percent(fullStyles.qr['width']));
      expect(halfStyles.numberText['font-size']).toBe(fullStyles.numberText['font-size']);
      expect(half.componentInstance.aspectRatio()).toBe('52.5 / 17.5');
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { LabelSheet } from './label-sheet';
  import { AVERY_16_GEOMETRY } from './label-geometry';
  import { LabelSlot, startPositionPreview } from './label-slots';

  async function render(slots: LabelSlot[], inputs: Record<string, unknown> = {}): Promise<ComponentFixture<LabelSheet>> {
    const fixture = TestBed.createComponent(LabelSheet);
    fixture.componentRef.setInput('geometry', AVERY_16_GEOMETRY);
    fixture.componentRef.setInput('slots', slots);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture;
  }

  function slotElements(fixture: ComponentFixture<LabelSheet>): HTMLElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.label-sheet__slot'));
  }

  describe('LabelSheet', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [LabelSheet] }).compileComponents();
    });

    it('render_avery16_rendersSixteenSlotsRowWise', async () => {
      // Arrange & Act
      const fixture = await render(startPositionPreview(1, 16));

      // Assert
      const slots = slotElements(fixture);
      expect(slots).toHaveLength(16);
      expect(Number.parseFloat(slots[1].style.left)).toBeCloseTo(50);
      expect(Number.parseFloat(slots[1].style.top)).toBeCloseTo((8.5 / 297) * 100);
      expect(Number.parseFloat(slots[2].style.left)).toBeCloseTo(0);
      expect(Number.parseFloat(slots[2].style.top)).toBeCloseTo((43.5 / 297) * 100);
      expect(slots[6].getAttribute('data-slot')).toBe('7');
    });

    it('render_startPosition7_greysSlotsOneToSix', async () => {
      // Arrange & Act
      const fixture = await render(startPositionPreview(7, 16));

      // Assert
      const skipped = slotElements(fixture).filter((slot) => slot.classList.contains('label-sheet__slot--skipped'));
      expect(skipped.map((slot) => slot.getAttribute('data-slot'))).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    it('sheetStyle_previewWidth_scalesWithContainerAndKeepsSheetAspectRatio', async () => {
      // Arrange & Act
      const fixture = await render(startPositionPreview(1, 16), { maxHeight: '70vh' });

      // Assert
      expect(fixture.componentInstance.sheetStyle()).toEqual({
        width: '100%',
        'aspect-ratio': '210 / 297',
        'max-width': 'calc(70vh * 210 / 297)',
      });
    });

    it('sheetStyle_printWidthInMm_usesExactSheetWidth', async () => {
      // Arrange & Act
      const fixture = await render(startPositionPreview(1, 16), { width: '210mm' });

      // Assert
      expect(fixture.componentInstance.sheetStyle()).toEqual({ width: '210mm', 'aspect-ratio': '210 / 297' });
    });

    it('render_labelSlot_rendersLabelCardWithNumberAndContent', async () => {
      // Arrange
      const slots: LabelSlot[] = [{ kind: 'label', number: 1000 }, ...startPositionPreview(1, 15)];

      // Act
      const fixture = await render(slots, { content: { logo: null, sellerSymbol: null, currencySymbol: '$' } });

      // Assert
      const first = slotElements(fixture)[0];
      expect(first.querySelector('.label-card__number')?.textContent?.trim()).toBe('1000');
      expect(first.querySelector('.label-card__currency')?.textContent?.trim()).toBe('$');
      expect(slotElements(fixture)[1].querySelector('app-label-card')).toBeNull();
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/label-sheet/label-card.spec.ts --include src/app/shared/components/label-sheet/label-sheet.spec.ts` — erwartet: FAIL (Module `./label-card` und `./label-sheet` fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic-view.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, input } from '@angular/core';
  import {
    LucideCloud,
    LucideCrown,
    LucideFlower,
    LucideGift,
    LucideHeart,
    LucideLeaf,
    LucideMoon,
    LucideStar,
    LucideSun,
  } from '@lucide/angular';
  import { LabelGraphic } from './label-graphic';

  /**
   * Leaf: zeigt Logo oder Verkäufer-Symbol — ein Icon der Icon-Liste oder ein eigenes Bild
   * (Data-URL im `<img>`, dadurch laufen in SVG-Bildern keine Skripte) — und füllt seinen Host.
   * Sicherheit: Eigene Bilder (auch SVG) nur über `<img [src]>` rendern, nie per `innerHTML`,
   * `bypassSecurityTrust*` oder inline-SVG — das Backend prüft den Bildinhalt nicht.
   */
  @Component({
    selector: 'app-label-graphic',
    imports: [LucideStar, LucideHeart, LucideSun, LucideMoon, LucideFlower, LucideLeaf, LucideCrown, LucideGift, LucideCloud],
    templateUrl: './label-graphic-view.html',
    styleUrl: './label-graphic-view.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class LabelGraphicView {
    readonly graphic = input.required<LabelGraphic>();
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic-view.html`:
  ```html
  @switch (graphic().kind) {
    @case ('image') {
      <img class="label-graphic__image" [src]="graphic().value" alt="" />
    }
    @default {
      @switch (graphic().value) {
        @case ('star') {
          <svg lucideStar></svg>
        }
        @case ('heart') {
          <svg lucideHeart></svg>
        }
        @case ('sun') {
          <svg lucideSun></svg>
        }
        @case ('moon') {
          <svg lucideMoon></svg>
        }
        @case ('flower') {
          <svg lucideFlower></svg>
        }
        @case ('leaf') {
          <svg lucideLeaf></svg>
        }
        @case ('crown') {
          <svg lucideCrown></svg>
        }
        @case ('gift') {
          <svg lucideGift></svg>
        }
        @case ('cloud') {
          <svg lucideCloud></svg>
        }
      }
    }
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-graphic-view.scss`:
  ```scss
  :host {
    display: block;
  }

  .label-graphic__image,
  :host svg {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
  import { QrCode } from '../qr-code/qr-code';
  import { LabelGraphic } from './label-graphic';
  import { LabelGraphicView } from './label-graphic-view';
  import { LabelBox, LabelLine, LabelText, labelLayout } from './label-layout';

  type Style = Record<string, string>;

  export type LabelCardStyles = Record<
    'fold' | 'qr' | 'numberText' | 'logo' | 'sellerSymbolTopRight' | 'sellerSymbolBottomLeft' | 'priceLine' | 'currency',
    Style
  >;

  /**
   * Leaf: ein Etikett (docs/components/label-sheet/component.md). Lage in Prozent der
   * Etikettgröße, Schrift in `cqw` des Etiketts: Dasselbe Markup skaliert in der Vorschau mit der
   * Containerbreite und liegt im Druck exakt in mm. Ohne Nummer (Vorschau vor gültiger
   * Startnummer) entfallen QR-Code und Klartext; ohne Logo oder Symbol bleibt deren Platz leer.
   */
  @Component({
    selector: 'app-label-card',
    imports: [QrCode, LabelGraphicView],
    templateUrl: './label-card.html',
    styleUrl: './label-card.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class LabelCard {
    readonly width = input.required<number>();
    readonly height = input.required<number>();
    readonly number = input<number | null>(null);
    readonly logo = input<LabelGraphic | null>(null);
    readonly sellerSymbol = input<LabelGraphic | null>(null);
    readonly currencySymbol = input<string>('€');
    readonly showFoldLine = input<boolean>(false);

    /** Derselbe Wert für QR-Code und Klartext — genau die Nummer, ohne weitere Zeichen. */
    readonly numberText = computed(() => {
      const value = this.number();
      return value === null ? null : String(value);
    });

    readonly aspectRatio = computed(() => `${this.width()} / ${this.height()}`);

    readonly styles = computed<LabelCardStyles>(() => {
      const width = this.width();
      const height = this.height();
      const layout = labelLayout(width, height);
      return {
        fold: { left: percentOf(layout.foldX, width) },
        qr: boxStyle(layout.qr, width, height),
        numberText: { ...textStyle(layout.numberText, width, height), transform: 'translateX(-50%)' },
        logo: boxStyle(layout.logo, width, height),
        sellerSymbolTopRight: boxStyle(layout.sellerSymbolTopRight, width, height),
        sellerSymbolBottomLeft: boxStyle(layout.sellerSymbolBottomLeft, width, height),
        priceLine: lineStyle(layout.priceLine, width, height),
        currency: textStyle(layout.currency, width, height),
      };
    });
  }

  function percentOf(value: number, total: number): string {
    return `${(value / total) * 100}%`;
  }

  function boxStyle(box: LabelBox, width: number, height: number): Style {
    return {
      left: percentOf(box.x, width),
      top: percentOf(box.y, height),
      width: percentOf(box.size, width),
      height: percentOf(box.size, height),
    };
  }

  /** `cqw` bezieht sich auf die Breite des Etiketts (`container-type: inline-size` in `.label-card`). */
  function textStyle(text: LabelText, width: number, height: number): Style {
    return {
      left: percentOf(text.x, width),
      top: percentOf(text.y, height),
      'font-size': `${(text.fontSize / width) * 100}cqw`,
    };
  }

  function lineStyle(line: LabelLine, width: number, height: number): Style {
    return {
      left: percentOf(line.x1, width),
      width: percentOf(line.x2 - line.x1, width),
      top: percentOf(line.y, height),
    };
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.html`:
  ```html
  <div class="label-card" [style.aspect-ratio]="aspectRatio()">
    @if (showFoldLine()) {
      <div class="label-card__fold" [style]="styles().fold"></div>
    }
    @if (numberText(); as text) {
      <div class="label-card__qr" [style]="styles().qr">
        <app-qr-code [value]="text" [size]="128" />
      </div>
      <div class="label-card__number" [style]="styles().numberText">{{ text }}</div>
    }
    @if (logo(); as logoGraphic) {
      <app-label-graphic class="label-card__logo" [graphic]="logoGraphic" [style]="styles().logo" />
    }
    @if (sellerSymbol(); as symbol) {
      <app-label-graphic
        class="label-card__symbol label-card__symbol--top-right"
        [graphic]="symbol"
        [style]="styles().sellerSymbolTopRight"
      />
      <app-label-graphic
        class="label-card__symbol label-card__symbol--bottom-left"
        [graphic]="symbol"
        [style]="styles().sellerSymbolBottomLeft"
      />
    }
    <div class="label-card__price-line" [style]="styles().priceLine"></div>
    <div class="label-card__currency" [style]="styles().currency">{{ currencySymbol() }}</div>
  </div>
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-card.scss`:
  ```scss
  :host {
    display: block;
  }

  .label-card {
    position: relative;
    width: 100%;
    container-type: inline-size;
    overflow: hidden;
    background: #fff;
    color: #000;
    font-family: 'Barlow Condensed', sans-serif;
  }

  .label-card__fold,
  .label-card__qr,
  .label-card__number,
  .label-card__logo,
  .label-card__symbol,
  .label-card__price-line,
  .label-card__currency {
    position: absolute;
  }

  .label-card__fold {
    top: 0;
    bottom: 0;
    border-left: 0.2mm dashed #888;
  }

  .label-card__qr ::ng-deep app-qr-code,
  .label-card__qr ::ng-deep .qr-code,
  .label-card__qr ::ng-deep .qr-code__image,
  .label-card__qr ::ng-deep .qr-code__image svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .label-card__number,
  .label-card__currency {
    line-height: 1;
    white-space: nowrap;
  }

  .label-card__number {
    font-weight: 600;
  }

  .label-card__price-line {
    height: 0;
    border-bottom: 0.3mm solid #000;
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
  import { LabelCard } from './label-card';
  import { EMPTY_LABEL_CONTENT, LabelContent } from './label-graphic';
  import { LabelSheetGeometry, SlotRect, slotRects } from './label-geometry';
  import { LabelSlot } from './label-slots';

  type Style = Record<string, string>;

  interface PlacedSlot {
    position: number;
    skipped: boolean;
    number: number | null;
    style: Style;
  }

  const EMPTY_SLOT: LabelSlot = { kind: 'empty' };

  /**
   * Leaf: ein Etikettenbogen mit Rand und Raster (docs/components/label-sheet/component.md).
   * Breite als CSS-Länge (`100%` in der Vorschau, `<Bogenbreite>mm` im Druck), Höhe über das
   * Seitenverhältnis des Bogens; Plätze in Prozent der Bogengröße.
   */
  @Component({
    selector: 'app-label-sheet',
    imports: [LabelCard],
    templateUrl: './label-sheet.html',
    styleUrl: './label-sheet.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class LabelSheet {
    readonly geometry = input.required<LabelSheetGeometry>();
    readonly slots = input.required<LabelSlot[]>();
    readonly content = input<LabelContent>(EMPTY_LABEL_CONTENT);
    readonly width = input<string>('100%');
    /** Vorschau: höchstens so hoch; die Breite schrumpft mit, das Seitenverhältnis bleibt. */
    readonly maxHeight = input<string | null>(null);
    readonly outlineSlots = input<boolean>(false);
    readonly showFoldLines = input<boolean>(false);

    readonly sheetStyle = computed(() => sheetStyleOf(this.geometry(), this.width(), this.maxHeight()));

    readonly placedSlots = computed<PlacedSlot[]>(() => {
      const geometry = this.geometry();
      const slots = this.slots();
      return slotRects(geometry).map((rect, index) => placeSlot(slots[index] ?? EMPTY_SLOT, rect, index, geometry));
    });
  }

  function sheetStyleOf(geometry: LabelSheetGeometry, width: string, maxHeight: string | null): Style {
    const ratio = `${geometry.sheetWidth} / ${geometry.sheetHeight}`;
    const style: Style = { width, 'aspect-ratio': ratio };
    if (maxHeight === null) return style;
    return { ...style, 'max-width': `calc(${maxHeight} * ${ratio})` };
  }

  function placeSlot(slot: LabelSlot, rect: SlotRect, index: number, geometry: LabelSheetGeometry): PlacedSlot {
    return {
      position: index + 1,
      skipped: slot.kind === 'skipped',
      number: slot.kind === 'label' ? slot.number : null,
      style: {
        left: `${(rect.left / geometry.sheetWidth) * 100}%`,
        top: `${(rect.top / geometry.sheetHeight) * 100}%`,
        width: `${(rect.width / geometry.sheetWidth) * 100}%`,
        height: `${(rect.height / geometry.sheetHeight) * 100}%`,
      },
    };
  }
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.html`:
  ```html
  <div class="label-sheet" [class.label-sheet--outlined]="outlineSlots()" [style]="sheetStyle()">
    @for (placed of placedSlots(); track placed.position) {
      <div
        class="label-sheet__slot"
        [class.label-sheet__slot--skipped]="placed.skipped"
        [attr.data-slot]="placed.position"
        [style]="placed.style"
      >
        @if (placed.number !== null) {
          <app-label-card
            [width]="geometry().labelWidth"
            [height]="geometry().labelHeight"
            [number]="placed.number"
            [logo]="content().logo"
            [sellerSymbol]="content().sellerSymbol"
            [currencySymbol]="content().currencySymbol"
            [showFoldLine]="showFoldLines()"
          />
        }
      </div>
    }
  </div>
  ```
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheet.scss`:
  ```scss
  :host {
    display: block;
  }

  .label-sheet {
    position: relative;
    box-sizing: border-box;
    background: #fff;
  }

  .label-sheet--outlined {
    outline: 1px solid var(--p-content-border-color, #ccc);
  }

  .label-sheet__slot {
    position: absolute;
    box-sizing: border-box;
  }

  .label-sheet--outlined .label-sheet__slot {
    outline: 1px dashed #999;
  }

  .label-sheet__slot--skipped {
    background: #d9d9d9;
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/label-sheet/label-card.spec.ts --include src/app/shared/components/label-sheet/label-sheet.spec.ts` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/shared/components/label-sheet && git commit -m "feat(blank-labels): Etikett und Etikettenbogen als skalierende Leaf-Komponenten" -- src/bazaar-app/frontend/src/app/shared/components/label-sheet`

### Task 9: Frontend — Druckdokument der Etikettenbögen und `PrintService.printLabelSheets`

**ACs:** AC-20, AC-22, AC-23, AC-24, AC-29

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.spec.ts`
- Modify: `src/bazaar-app/frontend/src/app/core/print/print.service.ts:51-66` · `PRINT_STYLE`
- Modify: `src/bazaar-app/frontend/src/app/core/print/print.service.ts:231-286` · `PrintService.mountAndPrint`
- Test: `src/bazaar-app/frontend/src/app/core/print/print.service.spec.ts` · `describe('printArticleAushang'`

**Interfaces:**
- Consumes: `LabelSheet` (`app-label-sheet`, Inputs `geometry`, `slots`, `content`, `width`) (Task 8); `LabelSheetGeometry`, `AVERY_16_GEOMETRY` (Task 7); `LabelSlot`, `placeLabels(startNumber, count, startPosition, perSheet)` (Task 7); `LabelContent` (Task 7)
- Produces:
  - `interface LabelSheetsPrintModel { geometry: LabelSheetGeometry; sheets: LabelSlot[][]; content: LabelContent }` in `shared/components/label-sheet/label-sheets-document.ts`
  - `LabelSheetsDocument` (Selektor `app-label-sheets-document`), Input `model: LabelSheetsPrintModel` (required), öffentliches Signal `sheetWidth(): string` (`'<Bogenbreite>mm'`)
  - `PrintService.printLabelSheets(model: LabelSheetsPrintModel): void` — Seitengröße `@page { size: <Bogenbreite>mm <Bogenhöhe>mm }`, alle Bögen, ohne Falzlinie, öffnet `window.print()`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { LabelSheetsDocument, LabelSheetsPrintModel } from './label-sheets-document';
  import { AVERY_16_GEOMETRY } from './label-geometry';
  import { placeLabels } from './label-slots';

  function model(startNumber: number, count: number, startPosition: number): LabelSheetsPrintModel {
    return {
      geometry: AVERY_16_GEOMETRY,
      sheets: placeLabels(startNumber, count, startPosition, 16),
      content: { logo: null, sellerSymbol: null, currencySymbol: '€' },
    };
  }

  async function render(printModel: LabelSheetsPrintModel): Promise<ComponentFixture<LabelSheetsDocument>> {
    const fixture = TestBed.createComponent(LabelSheetsDocument);
    fixture.componentRef.setInput('model', printModel);
    await fixture.whenStable();
    return fixture;
  }

  function numberIn(sheet: Element, slot: number): string | undefined {
    return sheet.querySelector(`[data-slot="${slot}"] .label-card__number`)?.textContent?.trim();
  }

  describe('LabelSheetsDocument', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [LabelSheetsDocument] }).compileComponents();
    });

    it('render_count12FromPosition7_rendersTwoSheetsWithNumbersInPlace', async () => {
      // Arrange & Act
      const fixture = await render(model(1000, 12, 7));

      // Assert
      const sheets = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('app-label-sheet'));
      expect(sheets).toHaveLength(2);
      expect(numberIn(sheets[0], 7)).toBe('1000');
      expect(numberIn(sheets[0], 16)).toBe('1009');
      expect(numberIn(sheets[1], 1)).toBe('1010');
      expect(numberIn(sheets[1], 2)).toBe('1011');
      expect(sheets[0].querySelector('[data-slot="6"] app-label-card')).toBeNull();
    });

    it('render_startPosition7Count4_putsNumbersInRows4And5', async () => {
      // Arrange & Act
      const fixture = await render(model(1000, 4, 7));

      // Assert
      const sheet = (fixture.nativeElement as HTMLElement).querySelector('app-label-sheet') as Element;
      expect([7, 8, 9, 10].map((slot) => numberIn(sheet, slot))).toEqual(['1000', '1001', '1002', '1003']);
    });

    it('render_always_printsNoFoldLine', async () => {
      // Arrange & Act
      const fixture = await render(model(1000, 4, 1));

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector('.label-card__fold')).toBeNull();
    });

    it('sheetWidth_avery16_isSheetWidthInMm', async () => {
      // Arrange & Act
      const fixture = await render(model(1000, 4, 1));

      // Assert
      expect(fixture.componentInstance.sheetWidth()).toBe('210mm');
    });
  });
  ```
  `print.service.spec.ts`: nach der Zeile `import { PrintTexts, PrintTextsApi, emptyPrintTexts } from '../../features/settings/data/print-texts-api';` einfügen:
  ```typescript
  // eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
  import { AVERY_16_GEOMETRY } from '../../shared/components/label-sheet/label-geometry';
  // eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
  import { placeLabels } from '../../shared/components/label-sheet/label-slots';
  ```
  und direkt vor der Zeile `  describe('printArticleAushang', () => {` einfügen:
  ```typescript
    describe('printLabelSheets', () => {
      function labelHost(): HTMLElement | null {
        return document.querySelector<HTMLElement>('app-label-sheets-document[data-print-host]');
      }

      it('printLabelSheets_count12FromPosition7_mountsBothSheetsAndOpensPrintDialog', () => {
        // Arrange
        const service = setup();

        // Act
        service.printLabelSheets({
          geometry: AVERY_16_GEOMETRY,
          sheets: placeLabels(1000, 12, 7, 16),
          content: { logo: null, sellerSymbol: null, currencySymbol: '€' },
        });

        // Assert
        expect(labelHost()?.querySelectorAll('app-label-sheet')).toHaveLength(2);
        expect(printSpy).toHaveBeenCalledTimes(1);
      });

      it('printLabelSheets_avery16_setsPageSizeToSheetSize', () => {
        // Arrange
        const service = setup();

        // Act
        service.printLabelSheets({
          geometry: AVERY_16_GEOMETRY,
          sheets: placeLabels(1000, 4, 1, 16),
          content: { logo: null, sellerSymbol: null, currencySymbol: '€' },
        });

        // Assert
        const css = document.querySelector('style[data-print-style]')?.textContent ?? '';
        expect(css).toContain('size: 210mm 297mm');
        expect(css).not.toContain('A4 portrait');
      });

      it('printLabelSheets_always_printsNoFoldLine', () => {
        // Arrange
        const service = setup();

        // Act
        service.printLabelSheets({
          geometry: AVERY_16_GEOMETRY,
          sheets: placeLabels(1000, 4, 1, 16),
          content: { logo: null, sellerSymbol: null, currencySymbol: '€' },
        });

        // Assert
        expect(labelHost()?.querySelector('.label-card__fold')).toBeNull();
      });

      it('printLabelSheets_afterPrint_removesDocumentAndPrintStyle', () => {
        // Arrange
        const service = setup();
        service.printLabelSheets({
          geometry: AVERY_16_GEOMETRY,
          sheets: placeLabels(1000, 4, 1, 16),
          content: { logo: null, sellerSymbol: null, currencySymbol: '€' },
        });

        // Act
        window.dispatchEvent(new Event('afterprint'));

        // Assert
        expect(labelHost()).toBeNull();
        expect(document.querySelector('style[data-print-style]')).toBeNull();
      });
    });

  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/label-sheet/label-sheets-document.spec.ts --include src/app/core/print/print.service.spec.ts` — erwartet: FAIL (Modul `./label-sheets-document` fehlt, `printLabelSheets` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
  import { LabelContent } from './label-graphic';
  import { LabelSheetGeometry } from './label-geometry';
  import { LabelSheet } from './label-sheet';
  import { LabelSlot } from './label-slots';

  /** Alles, was ein Etiketten-Vordruck druckt: Bogenformat, alle Bögen mit ihren Plätzen, gleicher Inhalt. */
  export interface LabelSheetsPrintModel {
    geometry: LabelSheetGeometry;
    sheets: LabelSlot[][];
    content: LabelContent;
  }

  /**
   * Leaf: Druckdokument des Etiketten-Vordrucks — je Bogen eine Druckseite in Originalgröße
   * (Breite in mm), ohne Falzlinie und ohne Rasterlinien.
   */
  @Component({
    selector: 'app-label-sheets-document',
    imports: [LabelSheet],
    template: `
      @for (sheet of model().sheets; track $index) {
        <app-label-sheet
          class="label-sheets-document__sheet"
          [geometry]="model().geometry"
          [slots]="sheet"
          [content]="model().content"
          [width]="sheetWidth()"
        />
      }
    `,
    styles: `
      :host {
        display: block;
      }

      .label-sheets-document__sheet {
        break-after: page;
      }

      .label-sheets-document__sheet:last-child {
        break-after: auto;
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class LabelSheetsDocument {
    readonly model = input.required<LabelSheetsPrintModel>();

    readonly sheetWidth = computed(() => `${this.model().geometry.sheetWidth}mm`);
  }
  ```
  `print.service.ts`:
  1. Nach dem Import-Block von `ArticleAushang` (Zeile `import { ArticleAushang } from '../../shared/components/print-document/article-aushang';`) einfügen:
  ```typescript
  // Sanctioned `core` → `shared` boundary crossing, same justification as above: the label sheets
  // document is the presentation component of the Etiketten-Vordruck print.
  // eslint-disable-next-line boundaries/dependencies
  import { LabelSheetsDocument, LabelSheetsPrintModel } from '../../shared/components/label-sheet/label-sheets-document';
  ```
  2. Den Doc-Kommentar und die Konstante `PRINT_STYLE` (vom Kommentar `/**` mit „Gilt nur, solange das Druckdokument im DOM hängt" bis zum schließenden `` `; ``) ersetzen durch:
  ```typescript
  /** Seitengröße der Belege und des Aushangs. */
  const A4_PAGE_SIZE = 'A4 portrait';

  /**
   * Gilt nur, solange das Druckdokument im DOM hängt: Seite ohne Rand in der übergebenen Größe
   * (A4 hochkant für Belege, Bogengröße für Etiketten), und im Druck bleibt von der Seite nur das
   * Dokument übrig — alles andere im `body` (App, Overlays, Toasts) entfällt, der Host rückt aus dem
   * Off-Canvas-Bereich in den normalen Fluss.
   */
  function printStyle(pageSize: string): string {
    return `
  @page { size: ${pageSize}; margin: 0; }
  @media print {
    html, body { margin: 0 !important; background: #fff !important; }
    body > *:not([data-print-host]) { display: none !important; }
    body > [data-print-host] { position: static !important; left: auto !important; top: auto !important; visibility: visible !important; }
  }
  `;
  }
  ```
  3. In `PrintService` direkt vor dem Doc-Kommentar von `mountAndPrint` („Hängt ein Druckdokument (beliebige Komponente) ein") die öffentliche Methode einfügen:
  ```typescript
    /** Etiketten-Vordruck: alle Bögen eines Drucks; Seitengröße = Bogengröße, keine Falzlinie. */
    printLabelSheets(model: LabelSheetsPrintModel): void {
      const { sheetWidth, sheetHeight } = model.geometry;
      this.mountAndPrint(
        LabelSheetsDocument,
        (ref) => ref.setInput('model', model),
        undefined,
        `${sheetWidth}mm ${sheetHeight}mm`,
      );
    }

  ```
  4. In `mountAndPrint` die Signatur
  ```typescript
    private mountAndPrint<T>(
      type: Type<T>,
      configure: (componentRef: ComponentRef<T>) => void,
      measure?: (instance: T) => void,
    ): void {
  ```
  ersetzen durch
  ```typescript
    private mountAndPrint<T>(
      type: Type<T>,
      configure: (componentRef: ComponentRef<T>) => void,
      measure?: (instance: T) => void,
      pageSize: string = A4_PAGE_SIZE,
    ): void {
  ```
  und darin die Zeile `styleElement.textContent = PRINT_STYLE;` ersetzen durch `styleElement.textContent = printStyle(pageSize);`. Im Doc-Kommentar von `mountAndPrint` den Satz ergänzen: `` `pageSize` ist der Wert von `@page size` (Standard A4 hochkant). ``
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/label-sheet/label-sheets-document.spec.ts --include src/app/core/print/print.service.spec.ts` — erwartet: PASS (auch der bestehende Test `printSellerReceipt_always_setsA4PortraitAndHidesEverythingButTheDocument`)
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.ts src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.spec.ts src/bazaar-app/frontend/src/app/core/print/print.service.ts src/bazaar-app/frontend/src/app/core/print/print.service.spec.ts && git commit -m "feat(blank-labels): Etikettenbögen über den Druckdialog in Bogengröße drucken" -- src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.ts src/bazaar-app/frontend/src/app/shared/components/label-sheet/label-sheets-document.spec.ts src/bazaar-app/frontend/src/app/core/print/print.service.ts src/bazaar-app/frontend/src/app/core/print/print.service.spec.ts`

### Task 10: Frontend Feature — Api, Store und Prüfregeln der Eingaben

**ACs:** AC-04, AC-06, AC-07, AC-08, AC-13, AC-15, AC-26, AC-27, AC-28, AC-33, AC-34, AC-36, AC-37

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/data/blank-labels-api.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/data/blank-labels-api.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/blank-labels-store.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/blank-labels-store.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/number-input.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/number-input.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/sheet-format-rules.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/sheet-format-rules.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/label-content-rules.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/label-content-rules.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/image-file.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/model/image-file.spec.ts`

**Interfaces:**
- Consumes: `LabelSheetGeometry`, `fitsSheetWidth`, `fitsSheetHeight` (Task 7); `LabelGraphic` (Task 7); JSON-Vertrag aus Task 6 (`/api/label-sheet-formats`, `/api/label-print-defaults`, `errorCode` `label_sheet_format.name_taken`)
- Produces:
  - `data/blank-labels-api.ts`: `const SHEET_FORMATS_URL = '/api/label-sheet-formats'`, `const PRINT_DEFAULTS_URL = '/api/label-print-defaults'`, `const NAME_TAKEN_ERROR_CODE = 'label_sheet_format.name_taken'`, `interface SheetFormat extends LabelSheetGeometry { id: string; name: string }`, `interface SaveSheetFormatRequest extends LabelSheetGeometry { name: string; overwrite: boolean }`, `interface LabelPrintDefaults { logo: LabelGraphic | null; sellerSymbol: LabelGraphic | null; currencySymbol: string }`, `class BlankLabelsApi` mit `getFormats(): Observable<SheetFormat[]>`, `saveFormat(request: SaveSheetFormatRequest): Observable<SheetFormat>`, `deleteFormat(id: string): Observable<void>`, `getDefaults(): Observable<LabelPrintDefaults>`, `saveDefaults(defaults: LabelPrintDefaults): Observable<void>`
  - `blank-labels-store.ts`: `class BlankLabelsStore` (`providedIn: 'root'`) mit `formats: WritableSignal<SheetFormat[]>` (nach Name sortiert), `loadFormats(): void`, `saveFormat(request: SaveSheetFormatRequest): Observable<SheetFormat>`, `deleteFormat(id: string): Observable<void>`, `loadDefaults(): Observable<LabelPrintDefaults>`, `saveDefaults(defaults: LabelPrintDefaults): Observable<void>`
  - `model/number-input.ts`: `type ParsedNumber = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'number'; value: number; decimals: number }`, `parseDecimal(text: string): ParsedNumber`, `formatDecimal(value: number): string`
  - `model/sheet-format-rules.ts`: `type SheetFormatField = keyof LabelSheetGeometry`, `type SheetFormatTexts = Record<SheetFormatField, string>`, `type SheetFormatErrors = Partial<Record<SheetFormatField, string>>`, `interface SheetFormatValidation { errors: SheetFormatErrors; geometry: LabelSheetGeometry | null }`, `const SHEET_FORMAT_FIELDS: readonly SheetFormatField[]`, `const FORMAT_NAME_MAX_LENGTH = 50`, `const SHEET_FORMAT_MESSAGES`, `textsFromGeometry(geometry: LabelSheetGeometry): SheetFormatTexts`, `validateSheetFormat(texts: SheetFormatTexts, lastEdited: SheetFormatField | null): SheetFormatValidation`, `normalizeFormatName(name: string): string`, `formatNameError(name: string): string | null`, `canSaveFormat(validation: SheetFormatValidation, name: string): boolean`
  - `model/label-content-rules.ts`: `const MAX_LABEL_NUMBER = 2147483646`, `const MAX_LABEL_COUNT = 5000`, `type LabelContentField = 'startNumber' | 'count' | 'currencySymbol' | 'startPosition'`, `type LabelContentTexts = Record<LabelContentField, string>`, `type LabelContentErrors = Partial<Record<LabelContentField, string>>`, `interface LabelRun { startNumber: number; count: number; startPosition: number; currencySymbol: string }`, `interface LabelContentValidation { errors: LabelContentErrors; run: LabelRun | null }`, `const INITIAL_CONTENT_TEXTS: LabelContentTexts`, `validateLabelContent(texts: LabelContentTexts, perSheet: number | null, lastEdited: LabelContentField | null): LabelContentValidation`, `previewStartNumber(text: string): number | null`, `previewStartPosition(text: string, perSheet: number): number`
  - `model/image-file.ts`: `const MAX_IMAGE_BYTES = 1_048_576`, `const IMAGE_FILE_ACCEPT: string`, `imageFileError(file: File): string | null`, `readFileAsDataUrl(file: File): Promise<string>`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/number-input.spec.ts`:
  ```typescript
  import { formatDecimal, parseDecimal } from './number-input';

  describe('number-input', () => {
    it('parseDecimal_germanComma_returnsNumberWithOneDecimal', () => {
      // Arrange & Act
      const parsed = parseDecimal('8,5');

      // Assert
      expect(parsed).toEqual({ kind: 'number', value: 8.5, decimals: 1 });
    });

    it('parseDecimal_dotAndTwoDecimals_countsTwoDecimals', () => {
      // Arrange & Act
      const parsed = parseDecimal(' 0.25 ');

      // Assert
      expect(parsed).toEqual({ kind: 'number', value: 0.25, decimals: 2 });
    });

    it('parseDecimal_negativeInteger_returnsNegativeNumber', () => {
      // Arrange & Act
      const parsed = parseDecimal('-1');

      // Assert
      expect(parsed).toEqual({ kind: 'number', value: -1, decimals: 0 });
    });

    it('parseDecimal_blank_returnsEmpty', () => {
      // Arrange & Act
      const parsed = parseDecimal('   ');

      // Assert
      expect(parsed).toEqual({ kind: 'empty' });
    });

    it('parseDecimal_letters_returnsInvalid', () => {
      // Arrange & Act
      const parsed = parseDecimal('12a');

      // Assert
      expect(parsed).toEqual({ kind: 'invalid' });
    });

    it('formatDecimal_eightPointFive_usesGermanComma', () => {
      // Arrange & Act
      const text = formatDecimal(8.5);

      // Assert
      expect(text).toBe('8,5');
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/sheet-format-rules.spec.ts`:
  ```typescript
  import { AVERY_16_GEOMETRY } from '../../../shared/components/label-sheet/label-geometry';
  import {
    SHEET_FORMAT_MESSAGES,
    SheetFormatTexts,
    canSaveFormat,
    formatNameError,
    normalizeFormatName,
    textsFromGeometry,
    validateSheetFormat,
  } from './sheet-format-rules';

  function avery16Texts(overrides: Partial<SheetFormatTexts> = {}): SheetFormatTexts {
    return { ...textsFromGeometry(AVERY_16_GEOMETRY), ...overrides };
  }

  describe('sheet-format-rules', () => {
    it('textsFromGeometry_avery16_formatsAllTwelveFieldsGerman', () => {
      // Arrange & Act
      const texts = textsFromGeometry(AVERY_16_GEOMETRY);

      // Assert
      expect(texts).toEqual({
        sheetWidth: '210',
        sheetHeight: '297',
        labelWidth: '105',
        labelHeight: '35',
        marginTop: '8,5',
        marginRight: '0',
        marginBottom: '8,5',
        marginLeft: '0',
        gapHorizontal: '0',
        gapVertical: '0',
        columns: '2',
        rows: '8',
      });
    });

    it('validateSheetFormat_avery16_returnsGeometryWithoutErrors', () => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts(), null);

      // Assert
      expect(validation.errors).toEqual({});
      expect(validation.geometry).toEqual(AVERY_16_GEOMETRY);
    });

    it('validateSheetFormat_threeColumnsJustEdited_errorAtColumns', () => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts({ columns: '3' }), 'columns');

      // Assert
      expect(validation.errors).toEqual({ columns: SHEET_FORMAT_MESSAGES.widthOverflow });
      expect(validation.geometry).toBeNull();
    });

    it('validateSheetFormat_marginTop9_1JustEdited_errorAtMarginTop', () => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts({ marginTop: '9,1' }), 'marginTop');

      // Assert
      expect(validation.errors).toEqual({ marginTop: SHEET_FORMAT_MESSAGES.heightOverflow });
    });

    it('validateSheetFormat_marginTop8_9_noError', () => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts({ marginTop: '8,9' }), 'marginTop');

      // Assert
      expect(validation.errors).toEqual({});
      expect(validation.geometry?.marginTop).toBe(8.9);
    });

    it('validateSheetFormat_overflowWithoutEdit_errorAtRows', () => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts({ rows: '9' }), null);

      // Assert
      expect(validation.errors).toEqual({ rows: SHEET_FORMAT_MESSAGES.heightOverflow });
    });

    it('validateSheetFormat_overflowAfterEditingOtherAxis_errorAtColumns', () => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts({ columns: '3' }), 'marginTop');

      // Assert
      expect(validation.errors).toEqual({ columns: SHEET_FORMAT_MESSAGES.widthOverflow });
    });

    it.each([
      ['labelWidth', '0', SHEET_FORMAT_MESSAGES.positive],
      ['sheetHeight', '0', SHEET_FORMAT_MESSAGES.positive],
      ['marginLeft', '0,25', SHEET_FORMAT_MESSAGES.oneDecimal],
      ['marginTop', '-1', SHEET_FORMAT_MESSAGES.nonNegative],
      ['columns', '0', SHEET_FORMAT_MESSAGES.wholeNumber],
      ['rows', '2,5', SHEET_FORMAT_MESSAGES.wholeNumber],
      ['sheetWidth', 'abc', SHEET_FORMAT_MESSAGES.notANumber],
      ['labelHeight', '', SHEET_FORMAT_MESSAGES.required],
    ] as const)('validateSheetFormat_%s=%s_errorAtThatFieldAndNoGeometry', (field, text, message) => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts({ [field]: text }), field);

      // Assert
      expect(validation.errors).toEqual({ [field]: message });
      expect(validation.geometry).toBeNull();
    });

    it('validateSheetFormat_zeroMarginsAndGaps_isValid', () => {
      // Arrange & Act
      const validation = validateSheetFormat(avery16Texts({ marginTop: '0', marginBottom: '0' }), 'marginBottom');

      // Assert
      expect(validation.geometry).not.toBeNull();
    });

    it('canSaveFormat_validFormatAndName_returnsTrue', () => {
      // Arrange
      const validation = validateSheetFormat(avery16Texts(), null);

      // Act
      const canSave = canSaveFormat(validation, 'Avery 12er');

      // Assert
      expect(canSave).toBe(true);
    });

    it.each(['', '   ', 'x'.repeat(51)])('canSaveFormat_name"%s"_returnsFalse', (name) => {
      // Arrange
      const validation = validateSheetFormat(avery16Texts(), null);

      // Act
      const canSave = canSaveFormat(validation, name);

      // Assert
      expect(canSave).toBe(false);
    });

    it('canSaveFormat_invalidMeasure_returnsFalse', () => {
      // Arrange
      const validation = validateSheetFormat(avery16Texts({ labelWidth: '' }), 'labelWidth');

      // Act
      const canSave = canSaveFormat(validation, 'Avery 12er');

      // Assert
      expect(canSave).toBe(false);
    });

    it('formatNameError_51Characters_returnsMaxLengthMessage', () => {
      // Arrange & Act
      const error = formatNameError('x'.repeat(51));

      // Assert
      expect(error).toBe('Höchstens 50 Zeichen');
    });

    it('normalizeFormatName_paddedName_trimsBothEnds', () => {
      // Arrange & Act
      const name = normalizeFormatName(' Avery 12er ');

      // Assert
      expect(name).toBe('Avery 12er');
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/label-content-rules.spec.ts`:
  ```typescript
  import {
    INITIAL_CONTENT_TEXTS,
    LabelContentTexts,
    previewStartNumber,
    previewStartPosition,
    validateLabelContent,
  } from './label-content-rules';

  function texts(overrides: Partial<LabelContentTexts>): LabelContentTexts {
    return { ...INITIAL_CONTENT_TEXTS, startNumber: '1000', count: '4', ...overrides };
  }

  describe('label-content-rules', () => {
    it('INITIAL_CONTENT_TEXTS_firstOpen_euroAndEverythingElseEmpty', () => {
      // Arrange & Act
      const initial = INITIAL_CONTENT_TEXTS;

      // Assert
      expect(initial).toEqual({ startNumber: '', count: '', currencySymbol: '€', startPosition: '' });
    });

    it('validateLabelContent_valid_returnsRunWithStartPosition1ForEmpty', () => {
      // Arrange & Act
      const validation = validateLabelContent(texts({}), 16, null);

      // Assert
      expect(validation.errors).toEqual({});
      expect(validation.run).toEqual({ startNumber: 1000, count: 4, startPosition: 1, currencySymbol: '€' });
    });

    it('validateLabelContent_emptyStartNumberAndCount_errorsAtBoth', () => {
      // Arrange & Act
      const validation = validateLabelContent(INITIAL_CONTENT_TEXTS, 16, null);

      // Assert
      expect(validation.errors.startNumber).toBe('Pflichtfeld');
      expect(validation.errors.count).toBe('Pflichtfeld');
      expect(validation.run).toBeNull();
    });

    it.each([
      ['startNumber', '0'],
      ['startNumber', '2147483647'],
      ['count', '0'],
      ['count', '5001'],
      ['currencySymbol', 'EURO'],
      ['currencySymbol', ''],
      ['startPosition', '0'],
      ['startPosition', '17'],
    ] as const)('validateLabelContent_%s=%s_errorAtThatField', (field, text) => {
      // Arrange & Act
      const validation = validateLabelContent(texts({ [field]: text }), 16, field);

      // Assert
      expect(validation.errors[field]).toBeDefined();
      expect(validation.run).toBeNull();
    });

    it('validateLabelContent_lastNumberBeyondMaxAfterEditingCount_errorAtCount', () => {
      // Arrange & Act
      const validation = validateLabelContent(texts({ startNumber: '2147483000', count: '1000' }), 16, 'count');

      // Assert
      expect(validation.errors).toEqual({ count: 'Letzte Nummer darf 2147483646 nicht überschreiten' });
    });

    it('validateLabelContent_lastNumberBeyondMaxAfterEditingStartNumber_errorAtStartNumber', () => {
      // Arrange & Act
      const validation = validateLabelContent(texts({ startNumber: '2147483000', count: '1000' }), 16, 'startNumber');

      // Assert
      expect(validation.errors).toEqual({ startNumber: 'Letzte Nummer darf 2147483646 nicht überschreiten' });
    });

    it('validateLabelContent_lastNumberExactlyMax_isValid', () => {
      // Arrange & Act
      const validation = validateLabelContent(texts({ startNumber: '2147483643', count: '4' }), 16, 'count');

      // Assert
      expect(validation.run).not.toBeNull();
    });

    it('validateLabelContent_noValidSheetFormat_checksStartPositionLowerBoundOnly', () => {
      // Arrange & Act
      const validation = validateLabelContent(texts({ startPosition: '40' }), null, 'startPosition');

      // Assert
      expect(validation.errors.startPosition).toBeUndefined();
    });

    it('previewStartNumber_validNumber_returnsIt', () => {
      // Arrange & Act
      const value = previewStartNumber('1000');

      // Assert
      expect(value).toBe(1000);
    });

    it('previewStartNumber_empty_returnsNull', () => {
      // Arrange & Act
      const value = previewStartNumber('');

      // Assert
      expect(value).toBeNull();
    });

    it('previewStartPosition_outOfRange_fallsBackTo1', () => {
      // Arrange & Act
      const position = previewStartPosition('17', 16);

      // Assert
      expect(position).toBe(1);
    });

    it('previewStartPosition_seven_returns7', () => {
      // Arrange & Act
      const position = previewStartPosition('7', 16);

      // Assert
      expect(position).toBe(7);
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/image-file.spec.ts`:
  ```typescript
  import { MAX_IMAGE_BYTES, imageFileError, readFileAsDataUrl } from './image-file';

  function fileOf(type: string, size: number): File {
    return new File([new Uint8Array(size)], 'bild', { type });
  }

  describe('image-file', () => {
    it.each(['image/png', 'image/jpeg', 'image/svg+xml'])('imageFileError_%sUpTo1Mb_returnsNull', (type) => {
      // Arrange
      const file = fileOf(type, MAX_IMAGE_BYTES);

      // Act
      const error = imageFileError(file);

      // Assert
      expect(error).toBeNull();
    });

    it('imageFileError_gif_returnsTypeError', () => {
      // Arrange
      const file = fileOf('image/gif', 10);

      // Act
      const error = imageFileError(file);

      // Assert
      expect(error).toBe('Nur PNG, JPEG oder SVG');
    });

    it('imageFileError_pngOver1Mb_returnsSizeError', () => {
      // Arrange
      const file = fileOf('image/png', MAX_IMAGE_BYTES + 1);

      // Act
      const error = imageFileError(file);

      // Assert
      expect(error).toBe('Bild ist größer als 1 MB');
    });

    it('readFileAsDataUrl_png_returnsBase64DataUrl', async () => {
      // Arrange
      const file = fileOf('image/png', 3);

      // Act
      const dataUrl = await readFileAsDataUrl(file);

      // Assert
      expect(dataUrl).toBe('data:image/png;base64,AAAA');
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/data/blank-labels-api.spec.ts`:
  ```typescript
  import { TestBed } from '@angular/core/testing';
  import { provideHttpClient } from '@angular/common/http';
  import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
  import { AVERY_16_GEOMETRY } from '../../../shared/components/label-sheet/label-geometry';
  import { BlankLabelsApi, PRINT_DEFAULTS_URL, SHEET_FORMATS_URL } from './blank-labels-api';

  describe('BlankLabelsApi', () => {
    let api: BlankLabelsApi;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
      api = TestBed.inject(BlankLabelsApi);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
    });

    it('getFormats_always_hitsGetSheetFormats', () => {
      // Arrange & Act
      api.getFormats().subscribe();

      // Assert
      const req = httpMock.expectOne(SHEET_FORMATS_URL);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('saveFormat_request_postsNameGeometryAndOverwriteFlag', () => {
      // Arrange
      const request = { ...AVERY_16_GEOMETRY, name: 'Avery 16er', overwrite: false };

      // Act
      api.saveFormat(request).subscribe();

      // Assert
      const req = httpMock.expectOne(SHEET_FORMATS_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush({ ...AVERY_16_GEOMETRY, id: 'LSF00001', name: 'Avery 16er' });
    });

    it('deleteFormat_id_hitsDeleteWithId', () => {
      // Arrange & Act
      api.deleteFormat('LSF00001').subscribe();

      // Assert
      const req = httpMock.expectOne(`${SHEET_FORMATS_URL}/LSF00001`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('getDefaults_always_hitsGetPrintDefaults', () => {
      // Arrange & Act
      api.getDefaults().subscribe();

      // Assert
      const req = httpMock.expectOne(PRINT_DEFAULTS_URL);
      expect(req.request.method).toBe('GET');
      req.flush({ logo: null, sellerSymbol: null, currencySymbol: '€' });
    });

    it('saveDefaults_defaults_putsThem', () => {
      // Arrange
      const defaults = { logo: null, sellerSymbol: { kind: 'icon' as const, value: 'star' as const }, currencySymbol: '$' };

      // Act
      api.saveDefaults(defaults).subscribe();

      // Assert
      const req = httpMock.expectOne(PRINT_DEFAULTS_URL);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(defaults);
      req.flush(null);
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/blank-labels-store.spec.ts`:
  ```typescript
  import { TestBed } from '@angular/core/testing';
  import { of } from 'rxjs';
  import { AVERY_16_GEOMETRY } from '../../shared/components/label-sheet/label-geometry';
  import { BlankLabelsStore } from './blank-labels-store';
  import { BlankLabelsApi, SheetFormat } from './data/blank-labels-api';

  function format(id: string, name: string, rows = 8): SheetFormat {
    return { ...AVERY_16_GEOMETRY, rows, id, name };
  }

  describe('BlankLabelsStore', () => {
    let api: { getFormats: ReturnType<typeof vi.fn>; saveFormat: ReturnType<typeof vi.fn>; deleteFormat: ReturnType<typeof vi.fn> };
    let store: BlankLabelsStore;

    beforeEach(() => {
      api = { getFormats: vi.fn(), saveFormat: vi.fn(), deleteFormat: vi.fn() };
      TestBed.configureTestingModule({ providers: [{ provide: BlankLabelsApi, useValue: api }] });
      store = TestBed.inject(BlankLabelsStore);
    });

    it('loadFormats_unsorted_keepsThemSortedByName', () => {
      // Arrange
      api.getFormats.mockReturnValue(of([format('B', 'Zweckform'), format('A', 'Avery 16er')]));

      // Act
      store.loadFormats();

      // Assert
      expect(store.formats().map((f) => f.name)).toEqual(['Avery 16er', 'Zweckform']);
    });

    it('saveFormat_newFormat_addsItSorted', () => {
      // Arrange
      api.getFormats.mockReturnValue(of([format('B', 'Zweckform')]));
      store.loadFormats();
      api.saveFormat.mockReturnValue(of(format('A', 'Avery 12er', 6)));

      // Act
      store.saveFormat({ ...AVERY_16_GEOMETRY, rows: 6, name: 'Avery 12er', overwrite: false }).subscribe();

      // Assert
      expect(store.formats().map((f) => f.name)).toEqual(['Avery 12er', 'Zweckform']);
    });

    it('saveFormat_overwrittenFormat_replacesItById', () => {
      // Arrange
      api.getFormats.mockReturnValue(of([format('A', 'Avery 12er', 8)]));
      store.loadFormats();
      api.saveFormat.mockReturnValue(of(format('A', 'Avery 12er', 6)));

      // Act
      store.saveFormat({ ...AVERY_16_GEOMETRY, rows: 6, name: 'Avery 12er', overwrite: true }).subscribe();

      // Assert
      expect(store.formats()).toEqual([format('A', 'Avery 12er', 6)]);
    });

    it('deleteFormat_existingId_removesIt', () => {
      // Arrange
      api.getFormats.mockReturnValue(of([format('A', 'Avery 12er')]));
      store.loadFormats();
      api.deleteFormat.mockReturnValue(of(undefined));

      // Act
      store.deleteFormat('A').subscribe();

      // Assert
      expect(store.formats()).toEqual([]);
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/blank-labels/model/number-input.spec.ts --include src/app/features/blank-labels/model/sheet-format-rules.spec.ts --include src/app/features/blank-labels/model/label-content-rules.spec.ts --include src/app/features/blank-labels/model/image-file.spec.ts --include src/app/features/blank-labels/data/blank-labels-api.spec.ts --include src/app/features/blank-labels/blank-labels-store.spec.ts` — erwartet: FAIL (Module fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/number-input.ts`:
  ```typescript
  export type ParsedNumber = { kind: 'empty' } | { kind: 'invalid' } | { kind: 'number'; value: number; decimals: number };

  const DECIMAL_PATTERN = /^-?\d+(?:[.,](\d+))?$/;

  /** Liest eine Eingabe wie „8,5" oder „8.5"; Leerraum an den Enden zählt nicht. */
  export function parseDecimal(text: string): ParsedNumber {
    const trimmed = text.trim();
    if (trimmed === '') return { kind: 'empty' };
    const match = DECIMAL_PATTERN.exec(trimmed);
    if (match === null) return { kind: 'invalid' };
    return { kind: 'number', value: Number(trimmed.replace(',', '.')), decimals: match[1]?.length ?? 0 };
  }

  /** Zeigt mm-Werte mit deutschem Komma („8,5"). */
  export function formatDecimal(value: number): string {
    return String(value).replace('.', ',');
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/sheet-format-rules.ts`:
  ```typescript
  import {
    LabelSheetGeometry,
    fitsSheetHeight,
    fitsSheetWidth,
  } from '../../../shared/components/label-sheet/label-geometry';
  import { formatDecimal, parseDecimal } from './number-input';

  export type SheetFormatField = keyof LabelSheetGeometry;
  export type SheetFormatTexts = Record<SheetFormatField, string>;
  export type SheetFormatErrors = Partial<Record<SheetFormatField, string>>;

  export interface SheetFormatValidation {
    errors: SheetFormatErrors;
    /** Nur gesetzt, wenn alle Felder gültig sind und das Raster auf den Bogen passt. */
    geometry: LabelSheetGeometry | null;
  }

  export const SHEET_FORMAT_FIELDS: readonly SheetFormatField[] = [
    'sheetWidth',
    'sheetHeight',
    'labelWidth',
    'labelHeight',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'gapHorizontal',
    'gapVertical',
    'columns',
    'rows',
  ];

  export const FORMAT_NAME_MAX_LENGTH = 50;

  export const SHEET_FORMAT_MESSAGES = {
    required: 'Pflichtfeld',
    notANumber: 'Bitte eine Zahl eingeben',
    positive: 'Muss größer als 0 sein',
    nonNegative: 'Darf nicht negativ sein',
    oneDecimal: 'Höchstens eine Nachkommastelle',
    wholeNumber: 'Ganze Zahl ab 1',
    widthOverflow: 'Etiketten passen nicht in die Bogenbreite',
    heightOverflow: 'Etiketten passen nicht in die Bogenhöhe',
  } as const;

  const POSITIVE_FIELDS: ReadonlySet<SheetFormatField> = new Set(['sheetWidth', 'sheetHeight', 'labelWidth', 'labelHeight']);
  const COUNT_FIELDS: ReadonlySet<SheetFormatField> = new Set(['columns', 'rows']);
  const WIDTH_FIELDS: readonly SheetFormatField[] = ['sheetWidth', 'labelWidth', 'marginLeft', 'marginRight', 'gapHorizontal', 'columns'];
  const HEIGHT_FIELDS: readonly SheetFormatField[] = ['sheetHeight', 'labelHeight', 'marginTop', 'marginBottom', 'gapVertical', 'rows'];

  interface FieldCheck {
    field: SheetFormatField;
    value: number;
    error: string | null;
  }

  export function textsFromGeometry(geometry: LabelSheetGeometry): SheetFormatTexts {
    return Object.fromEntries(SHEET_FORMAT_FIELDS.map((field) => [field, formatDecimal(geometry[field])])) as SheetFormatTexts;
  }

  /**
   * Prüft jedes Feld und danach, ob das Raster auf den Bogen passt. Ein Fehler der Summe steht am
   * zuletzt geänderten Feld dieser Achse, sonst an „Spalten" (Breite) bzw. „Zeilen" (Höhe).
   */
  export function validateSheetFormat(texts: SheetFormatTexts, lastEdited: SheetFormatField | null): SheetFormatValidation {
    const checks = SHEET_FORMAT_FIELDS.map((field) => checkField(field, texts[field]));
    const fieldErrors = errorsOf(checks);
    if (Object.keys(fieldErrors).length > 0) return { errors: fieldErrors, geometry: null };
    const geometry = Object.fromEntries(checks.map((check) => [check.field, check.value])) as unknown as LabelSheetGeometry;
    const fitErrors = fitErrorsOf(geometry, lastEdited);
    return { errors: fitErrors, geometry: Object.keys(fitErrors).length === 0 ? geometry : null };
  }

  export function normalizeFormatName(name: string): string {
    return name.trim();
  }

  /** Ein leerer Name ist kein Fehlertext am Feld, sperrt aber „Speichern" (`canSaveFormat`). */
  export function formatNameError(name: string): string | null {
    return normalizeFormatName(name).length > FORMAT_NAME_MAX_LENGTH ? `Höchstens ${FORMAT_NAME_MAX_LENGTH} Zeichen` : null;
  }

  export function canSaveFormat(validation: SheetFormatValidation, name: string): boolean {
    const normalized = normalizeFormatName(name);
    return validation.geometry !== null && normalized.length > 0 && normalized.length <= FORMAT_NAME_MAX_LENGTH;
  }

  function checkField(field: SheetFormatField, text: string): FieldCheck {
    const parsed = parseDecimal(text);
    if (parsed.kind === 'empty') return { field, value: Number.NaN, error: SHEET_FORMAT_MESSAGES.required };
    if (parsed.kind === 'invalid') return { field, value: Number.NaN, error: SHEET_FORMAT_MESSAGES.notANumber };
    return { field, value: parsed.value, error: rangeErrorOf(field, parsed.value, parsed.decimals) };
  }

  function rangeErrorOf(field: SheetFormatField, value: number, decimals: number): string | null {
    if (COUNT_FIELDS.has(field)) return decimals === 0 && value >= 1 ? null : SHEET_FORMAT_MESSAGES.wholeNumber;
    if (decimals > 1) return SHEET_FORMAT_MESSAGES.oneDecimal;
    if (POSITIVE_FIELDS.has(field)) return value > 0 ? null : SHEET_FORMAT_MESSAGES.positive;
    return value >= 0 ? null : SHEET_FORMAT_MESSAGES.nonNegative;
  }

  function errorsOf(checks: FieldCheck[]): SheetFormatErrors {
    return Object.fromEntries(
      checks.filter((check) => check.error !== null).map((check) => [check.field, check.error]),
    ) as SheetFormatErrors;
  }

  function fitErrorsOf(geometry: LabelSheetGeometry, lastEdited: SheetFormatField | null): SheetFormatErrors {
    const widthError = fitsSheetWidth(geometry) ? {} : { [errorFieldOf(WIDTH_FIELDS, lastEdited, 'columns')]: SHEET_FORMAT_MESSAGES.widthOverflow };
    const heightError = fitsSheetHeight(geometry) ? {} : { [errorFieldOf(HEIGHT_FIELDS, lastEdited, 'rows')]: SHEET_FORMAT_MESSAGES.heightOverflow };
    return { ...widthError, ...heightError };
  }

  function errorFieldOf(
    axisFields: readonly SheetFormatField[],
    lastEdited: SheetFormatField | null,
    fallback: SheetFormatField,
  ): SheetFormatField {
    return lastEdited !== null && axisFields.includes(lastEdited) ? lastEdited : fallback;
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/label-content-rules.ts`:
  ```typescript
  import { parseDecimal } from './number-input';

  export const MAX_LABEL_NUMBER = 2147483646;
  export const MAX_LABEL_COUNT = 5000;
  const CURRENCY_SYMBOL_MAX_LENGTH = 3;

  export type LabelContentField = 'startNumber' | 'count' | 'currencySymbol' | 'startPosition';
  export type LabelContentTexts = Record<LabelContentField, string>;
  export type LabelContentErrors = Partial<Record<LabelContentField, string>>;

  /** Ein gültiger Druckauftrag: Nummern, Startposition (leer = 1) und Währungssymbol. */
  export interface LabelRun {
    startNumber: number;
    count: number;
    startPosition: number;
    currencySymbol: string;
  }

  export interface LabelContentValidation {
    errors: LabelContentErrors;
    run: LabelRun | null;
  }

  /** Erstes Öffnen: nur das Währungssymbol ist vorbelegt; Startnummer, Anzahl und Startposition nie. */
  export const INITIAL_CONTENT_TEXTS: LabelContentTexts = { startNumber: '', count: '', currencySymbol: '€', startPosition: '' };

  const MESSAGES = {
    required: 'Pflichtfeld',
    startNumberRange: `Zahl von 1 bis ${MAX_LABEL_NUMBER}`,
    countRange: `Zahl von 1 bis ${MAX_LABEL_COUNT}`,
    lastNumberTooLarge: `Letzte Nummer darf ${MAX_LABEL_NUMBER} nicht überschreiten`,
    currencyLength: `1 bis ${CURRENCY_SYMBOL_MAX_LENGTH} Zeichen`,
  } as const;

  interface NumberCheck {
    value: number;
    error: string | null;
  }

  /**
   * `perSheet` ist die Anzahl pro Seite des gültigen Bogenformats, sonst `null` (dann prüft die
   * Startposition nur die Untergrenze). Überschreitet die letzte Nummer die Grenze, steht der
   * Fehler am zuletzt geänderten der beiden Felder, sonst an „Anzahl".
   */
  export function validateLabelContent(
    texts: LabelContentTexts,
    perSheet: number | null,
    lastEdited: LabelContentField | null,
  ): LabelContentValidation {
    const startNumber = checkWholeNumber(texts.startNumber, MAX_LABEL_NUMBER, MESSAGES.startNumberRange);
    const count = checkWholeNumber(texts.count, MAX_LABEL_COUNT, MESSAGES.countRange);
    const startPosition = checkStartPosition(texts.startPosition, perSheet);
    const errors = withoutNulls({
      startNumber: startNumber.error,
      count: count.error,
      currencySymbol: currencyErrorOf(texts.currencySymbol),
      startPosition: startPosition.error,
      ...lastNumberErrorOf(startNumber, count, lastEdited),
    });
    if (Object.keys(errors).length > 0) return { errors, run: null };
    return {
      errors,
      run: { startNumber: startNumber.value, count: count.value, startPosition: startPosition.value, currencySymbol: texts.currencySymbol },
    };
  }

  /** Nummer für das Etikett der Vorschau; ungültig oder leer → kein QR-Code und kein Klartext. */
  export function previewStartNumber(text: string): number | null {
    const check = checkWholeNumber(text, MAX_LABEL_NUMBER, MESSAGES.startNumberRange);
    return check.error === null ? check.value : null;
  }

  /** Startposition der Vorschau von Bereich C; ungültig oder leer → 1. */
  export function previewStartPosition(text: string, perSheet: number): number {
    const check = checkStartPosition(text, perSheet);
    return check.error === null ? check.value : 1;
  }

  function checkWholeNumber(text: string, max: number, rangeMessage: string): NumberCheck {
    const parsed = parseDecimal(text);
    if (parsed.kind === 'empty') return { value: Number.NaN, error: MESSAGES.required };
    if (parsed.kind === 'invalid' || parsed.decimals > 0) return { value: Number.NaN, error: rangeMessage };
    return parsed.value >= 1 && parsed.value <= max ? { value: parsed.value, error: null } : { value: Number.NaN, error: rangeMessage };
  }

  function checkStartPosition(text: string, perSheet: number | null): NumberCheck {
    if (text.trim() === '') return { value: 1, error: null };
    const max = perSheet ?? Number.MAX_SAFE_INTEGER;
    return checkWholeNumber(text, max, perSheet === null ? 'Ganze Zahl ab 1' : `Platz 1 bis ${perSheet}`);
  }

  /** Zählt Unicode-Zeichen wie das Backend (Runes), nicht UTF-16-Einheiten. */
  function currencyErrorOf(symbol: string): string | null {
    const length = [...symbol].length;
    return length >= 1 && length <= CURRENCY_SYMBOL_MAX_LENGTH ? null : MESSAGES.currencyLength;
  }

  function lastNumberErrorOf(startNumber: NumberCheck, count: NumberCheck, lastEdited: LabelContentField | null): LabelContentErrors {
    if (startNumber.error !== null || count.error !== null) return {};
    if (startNumber.value + count.value - 1 <= MAX_LABEL_NUMBER) return {};
    const field = lastEdited === 'startNumber' ? 'startNumber' : 'count';
    return { [field]: MESSAGES.lastNumberTooLarge };
  }

  function withoutNulls(errors: Partial<Record<LabelContentField, string | null>>): LabelContentErrors {
    return Object.fromEntries(
      Object.entries(errors).filter(([, error]) => error !== null && error !== undefined),
    ) as LabelContentErrors;
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/model/image-file.ts`:
  ```typescript
  const ACCEPTED_IMAGE_TYPES: readonly string[] = ['image/png', 'image/jpeg', 'image/svg+xml'];

  /** 1 MB = 1 048 576 Byte, gleiche Grenze wie `LabelGraphic.MaxImageBytes` im Backend. */
  export const MAX_IMAGE_BYTES = 1_048_576;

  /** Filter des Dateidialogs; geprüft wird trotzdem mit `imageFileError` (Drag & Drop umgeht ihn). */
  export const IMAGE_FILE_ACCEPT = '.png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml';

  export function imageFileError(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Nur PNG, JPEG oder SVG';
    if (file.size > MAX_IMAGE_BYTES) return 'Bild ist größer als 1 MB';
    return null;
  }

  /** Liest das Bild als Base64-Data-URL, so wie das Backend es speichert. */
  export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('Datei konnte nicht gelesen werden'));
      reader.readAsDataURL(file);
    });
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/data/blank-labels-api.ts`:
  ```typescript
  import { Injectable, inject } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { LabelGraphic } from '../../../shared/components/label-sheet/label-graphic';
  import { LabelSheetGeometry } from '../../../shared/components/label-sheet/label-geometry';

  export const SHEET_FORMATS_URL = '/api/label-sheet-formats';
  export const PRINT_DEFAULTS_URL = '/api/label-print-defaults';
  export const NAME_TAKEN_ERROR_CODE = 'label_sheet_format.name_taken';

  /** Gespeichertes Bogenformat, flach wie im JSON-Vertrag. */
  export interface SheetFormat extends LabelSheetGeometry {
    id: string;
    name: string;
  }

  export interface SaveSheetFormatRequest extends LabelSheetGeometry {
    name: string;
    /** true nach bestätigtem „Überschreiben?"; sonst antwortet ein vergebener Name mit 409. */
    overwrite: boolean;
  }

  /** Logo, Verkäufer-Symbol und Währungssymbol des letzten Drucks. */
  export interface LabelPrintDefaults {
    logo: LabelGraphic | null;
    sellerSymbol: LabelGraphic | null;
    currencySymbol: string;
  }

  @Injectable({ providedIn: 'root' })
  export class BlankLabelsApi {
    private readonly http = inject(HttpClient);

    getFormats(): Observable<SheetFormat[]> {
      return this.http.get<SheetFormat[]>(SHEET_FORMATS_URL);
    }

    saveFormat(request: SaveSheetFormatRequest): Observable<SheetFormat> {
      return this.http.post<SheetFormat>(SHEET_FORMATS_URL, request);
    }

    deleteFormat(id: string): Observable<void> {
      return this.http.delete<void>(`${SHEET_FORMATS_URL}/${encodeURIComponent(id)}`);
    }

    getDefaults(): Observable<LabelPrintDefaults> {
      return this.http.get<LabelPrintDefaults>(PRINT_DEFAULTS_URL);
    }

    saveDefaults(defaults: LabelPrintDefaults): Observable<void> {
      return this.http.put<void>(PRINT_DEFAULTS_URL, defaults);
    }
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/blank-labels-store.ts`:
  ```typescript
  import { Injectable, inject, signal } from '@angular/core';
  import { Observable, tap } from 'rxjs';
  import { BlankLabelsApi, LabelPrintDefaults, SaveSheetFormatRequest, SheetFormat } from './data/blank-labels-api';

  function sortedByName(formats: SheetFormat[]): SheetFormat[] {
    return [...formats].sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Feature-Store des Etiketten-Vordrucks: hält die Bogenformate des Auswahlfelds nach Name
   * sortiert. Schreibende Aufrufe geben das `Observable` zurück, damit die Seite auf Erfolg und
   * Fehler (z. B. 409 → „Überschreiben?") selbst reagiert.
   */
  @Injectable({ providedIn: 'root' })
  export class BlankLabelsStore {
    private readonly api = inject(BlankLabelsApi);

    readonly formats = signal<SheetFormat[]>([]);

    loadFormats(): void {
      this.api.getFormats().subscribe({
        next: (formats) => this.formats.set(sortedByName(formats)),
        error: () => this.formats.set([]),
      });
    }

    /** Ein überschriebenes Format behält seine Id und ersetzt den bisherigen Eintrag. */
    saveFormat(request: SaveSheetFormatRequest): Observable<SheetFormat> {
      return this.api
        .saveFormat(request)
        .pipe(tap((saved) => this.formats.set(sortedByName([...this.formats().filter((f) => f.id !== saved.id), saved]))));
    }

    deleteFormat(id: string): Observable<void> {
      return this.api.deleteFormat(id).pipe(tap(() => this.formats.set(this.formats().filter((f) => f.id !== id))));
    }

    loadDefaults(): Observable<LabelPrintDefaults> {
      return this.api.getDefaults();
    }

    saveDefaults(defaults: LabelPrintDefaults): Observable<void> {
      return this.api.saveDefaults(defaults);
    }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/blank-labels/model/number-input.spec.ts --include src/app/features/blank-labels/model/sheet-format-rules.spec.ts --include src/app/features/blank-labels/model/label-content-rules.spec.ts --include src/app/features/blank-labels/model/image-file.spec.ts --include src/app/features/blank-labels/data/blank-labels-api.spec.ts --include src/app/features/blank-labels/blank-labels-store.spec.ts` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/features/blank-labels && git commit -m "feat(blank-labels): Api, Store und Prüfregeln für Bogenformat und Etiketten-Inhalt" -- src/bazaar-app/frontend/src/app/features/blank-labels`

### Task 11: Frontend Feature — Eingabe-Komponenten der Bereiche A, B und C

**ACs:** AC-04, AC-06, AC-13, AC-14, AC-15, AC-16, AC-26, AC-33, AC-36

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.html`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.scss`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.html`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.scss`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.html`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.scss`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/start-position-form/start-position-form.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/components/start-position-form/start-position-form.spec.ts`

**Interfaces:**
- Consumes: `SheetFormat` (Task 10, `data/blank-labels-api.ts`); `SHEET_FORMAT_FIELDS`, `SheetFormatField`, `SheetFormatTexts`, `SheetFormatErrors`, `textsFromGeometry` (Task 10); `LabelContentField`, `LabelContentTexts`, `LabelContentErrors`, `INITIAL_CONTENT_TEXTS` (Task 10); `IMAGE_FILE_ACCEPT` (Task 10); `LABEL_ICON_KEYS`, `LABEL_ICON_TITLES`, `LabelGraphic` (Task 7); `LabelGraphicView` (`app-label-graphic`, Task 8); `AVERY_16_GEOMETRY` (Task 7); `FileDropzone` (`app-file-dropzone`, Input `accept: string`, Output `filesChosen: File[]`) aus `shared/components/file-dropzone/file-dropzone.ts`
- Produces:
  - `SheetFormatForm` (Selektor `app-sheet-format-form`): Inputs `texts: SheetFormatTexts` (required), `errors: SheetFormatErrors` (Default `{}`), `formats: SheetFormat[]` (Default `[]`), `selectedFormatId: string | null`, `name: string`, `nameError: string | null`, `perSheet: number | null`, `canSave: boolean`; Outputs `fieldChange: SheetFormatFieldChange`, `formatSelected: string`, `nameChange: string`, `save: void`, `remove: void`; `interface SheetFormatFieldChange { field: SheetFormatField; text: string }`
  - `GraphicPicker` (Selektor `app-graphic-picker`): Inputs `label: string` (required), `value: LabelGraphic | null`; Outputs `valueChange: LabelGraphic | null`, `fileChosen: File`; öffentliche Signale `selectedIconKey()`, `currentImage()`
  - `LabelContentForm` (Selektor `app-label-content-form`): Inputs `texts: LabelContentTexts` (required), `errors: LabelContentErrors`, `logo: LabelGraphic | null`, `sellerSymbol: LabelGraphic | null`; Outputs `fieldChange: LabelContentFieldChange`, `logoChange: LabelGraphic | null`, `sellerSymbolChange: LabelGraphic | null`, `imageChosen: ImageChoice`; `interface LabelContentFieldChange { field: LabelContentField; text: string }`, `interface ImageChoice { target: 'logo' | 'sellerSymbol'; file: File }`
  - `StartPositionForm` (Selektor `app-start-position-form`): Inputs `text: string`, `error: string | null`, `perSheet: number | null`; Output `textChange: string`

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { AVERY_16_GEOMETRY } from '../../../../shared/components/label-sheet/label-geometry';
  import { textsFromGeometry } from '../../model/sheet-format-rules';
  import { SheetFormatForm } from './sheet-format-form';

  async function render(inputs: Record<string, unknown> = {}): Promise<ComponentFixture<SheetFormatForm>> {
    const fixture = TestBed.createComponent(SheetFormatForm);
    fixture.componentRef.setInput('texts', textsFromGeometry(AVERY_16_GEOMETRY));
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture;
  }

  function fieldInput(fixture: ComponentFixture<SheetFormatForm>, field: string): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`input[data-field="${field}"]`) as HTMLInputElement;
  }

  function button(fixture: ComponentFixture<SheetFormatForm>, label: string): HTMLButtonElement {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('p-button button'));
    return buttons.find((candidate) => candidate.textContent?.includes(label)) as HTMLButtonElement;
  }

  describe('SheetFormatForm', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [SheetFormatForm] }).compileComponents();
    });

    it('render_avery16Texts_showsAllTwelveFieldsWithTheirValues', async () => {
      // Arrange & Act
      const fixture = await render({ perSheet: 16 });

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelectorAll('input[data-field]')).toHaveLength(12);
      expect(fieldInput(fixture, 'sheetWidth').value).toBe('210');
      expect(fieldInput(fixture, 'marginTop').value).toBe('8,5');
      expect(fieldInput(fixture, 'columns').value).toBe('2');
      expect(fieldInput(fixture, 'rows').value).toBe('8');
    });

    it('render_perSheet16_showsComputedCountAsText', async () => {
      // Arrange & Act
      const fixture = await render({ perSheet: 16 });

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector('.sheet-format-form__per-sheet')?.textContent?.trim()).toBe(
        '16 Etiketten pro Seite',
      );
    });

    it('input_columns3_emitsFieldChange', async () => {
      // Arrange
      const fixture = await render();
      const changes = vi.fn();
      fixture.componentInstance.fieldChange.subscribe(changes);
      const columns = fieldInput(fixture, 'columns');

      // Act
      columns.value = '3';
      columns.dispatchEvent(new Event('input'));

      // Assert
      expect(changes).toHaveBeenCalledWith({ field: 'columns', text: '3' });
    });

    it('render_errorAtColumns_showsErrorAtThatField', async () => {
      // Arrange & Act
      const fixture = await render({ errors: { columns: 'Etiketten passen nicht in die Bogenbreite' } });

      // Assert
      const error = (fixture.nativeElement as HTMLElement).querySelector('[data-error-for="columns"]');
      expect(error?.textContent?.trim()).toBe('Etiketten passen nicht in die Bogenbreite');
    });

    it('render_canSaveFalse_disablesSave', async () => {
      // Arrange & Act
      const fixture = await render({ canSave: false });

      // Assert
      expect(button(fixture, 'Speichern').disabled).toBe(true);
    });

    it('click_saveWhenAllowed_emitsSave', async () => {
      // Arrange
      const fixture = await render({ canSave: true });
      const saves = vi.fn();
      fixture.componentInstance.save.subscribe(saves);

      // Act
      button(fixture, 'Speichern').click();

      // Assert
      expect(saves).toHaveBeenCalledTimes(1);
    });

    it('render_noSelectedFormat_disablesDelete', async () => {
      // Arrange & Act
      const fixture = await render({ selectedFormatId: null });

      // Assert
      expect(button(fixture, 'Löschen').disabled).toBe(true);
    });

    it('render_nameError_showsItBelowName', async () => {
      // Arrange & Act
      const fixture = await render({ nameError: 'Höchstens 50 Zeichen' });

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector('[data-error-for="name"]')?.textContent?.trim()).toBe(
        'Höchstens 50 Zeichen',
      );
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { By } from '@angular/platform-browser';
  import { FileDropzone } from '../../../../shared/components/file-dropzone/file-dropzone';
  import { LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
  import { GraphicPicker } from './graphic-picker';

  async function render(value: LabelGraphic | null): Promise<ComponentFixture<GraphicPicker>> {
    const fixture = TestBed.createComponent(GraphicPicker);
    fixture.componentRef.setInput('label', 'Logo');
    fixture.componentRef.setInput('value', value);
    await fixture.whenStable();
    return fixture;
  }

  function iconButton(fixture: ComponentFixture<GraphicPicker>, key: string): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`button[data-icon="${key}"]`) as HTMLButtonElement;
  }

  describe('GraphicPicker', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [GraphicPicker] }).compileComponents();
    });

    it('click_starIcon_emitsStarIcon', async () => {
      // Arrange
      const fixture = await render(null);
      const changes = vi.fn();
      fixture.componentInstance.valueChange.subscribe(changes);

      // Act
      iconButton(fixture, 'star').click();

      // Assert
      expect(changes).toHaveBeenCalledWith({ kind: 'icon', value: 'star' });
    });

    it('click_none_emitsNull', async () => {
      // Arrange
      const fixture = await render({ kind: 'icon', value: 'star' });
      const changes = vi.fn();
      fixture.componentInstance.valueChange.subscribe(changes);

      // Act
      iconButton(fixture, 'none').click();

      // Assert
      expect(changes).toHaveBeenCalledWith(null);
    });

    it('selectedIconKey_starValue_returnsStar', async () => {
      // Arrange & Act
      const fixture = await render({ kind: 'icon', value: 'star' });

      // Assert
      expect(fixture.componentInstance.selectedIconKey()).toBe('star');
    });

    it('filesChosen_png_emitsFileChosen', async () => {
      // Arrange
      const fixture = await render(null);
      const files = vi.fn();
      fixture.componentInstance.fileChosen.subscribe(files);
      const file = new File(['x'], 'logo.png', { type: 'image/png' });
      const dropzone = fixture.debugElement.query(By.directive(FileDropzone)).componentInstance as FileDropzone;

      // Act
      dropzone.filesChosen.emit([file]);

      // Assert
      expect(files).toHaveBeenCalledWith(file);
    });

    it('render_imageValue_showsCurrentImage', async () => {
      // Arrange & Act
      const fixture = await render({ kind: 'image', value: 'data:image/png;base64,AAAA' });

      // Assert
      const image = (fixture.nativeElement as HTMLElement).querySelector('.graphic-picker__current img');
      expect(image?.getAttribute('src')).toBe('data:image/png;base64,AAAA');
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { By } from '@angular/platform-browser';
  import { INITIAL_CONTENT_TEXTS } from '../../model/label-content-rules';
  import { GraphicPicker } from '../graphic-picker/graphic-picker';
  import { LabelContentForm } from './label-content-form';

  async function render(inputs: Record<string, unknown> = {}): Promise<ComponentFixture<LabelContentForm>> {
    const fixture = TestBed.createComponent(LabelContentForm);
    fixture.componentRef.setInput('texts', INITIAL_CONTENT_TEXTS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture;
  }

  function fieldInput(fixture: ComponentFixture<LabelContentForm>, field: string): HTMLInputElement {
    return (fixture.nativeElement as HTMLElement).querySelector(`input[data-field="${field}"]`) as HTMLInputElement;
  }

  function pickers(fixture: ComponentFixture<LabelContentForm>): GraphicPicker[] {
    return fixture.debugElement.queryAll(By.directive(GraphicPicker)).map((debug) => debug.componentInstance as GraphicPicker);
  }

  describe('LabelContentForm', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [LabelContentForm] }).compileComponents();
    });

    it('render_firstOpen_showsEmptyNumbersEuroAndNoGraphics', async () => {
      // Arrange & Act
      const fixture = await render();

      // Assert
      expect(fieldInput(fixture, 'startNumber').value).toBe('');
      expect(fieldInput(fixture, 'count').value).toBe('');
      expect(fieldInput(fixture, 'currencySymbol').value).toBe('€');
      expect(pickers(fixture).map((picker) => picker.value())).toEqual([null, null]);
    });

    it('render_errorsAtStartNumberAndCount_showsBothErrors', async () => {
      // Arrange & Act
      const fixture = await render({ errors: { startNumber: 'Pflichtfeld', count: 'Pflichtfeld' } });

      // Assert
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('[data-error-for="startNumber"]')?.textContent?.trim()).toBe('Pflichtfeld');
      expect(root.querySelector('[data-error-for="count"]')?.textContent?.trim()).toBe('Pflichtfeld');
    });

    it('input_startNumber1000_emitsFieldChange', async () => {
      // Arrange
      const fixture = await render();
      const changes = vi.fn();
      fixture.componentInstance.fieldChange.subscribe(changes);
      const startNumber = fieldInput(fixture, 'startNumber');

      // Act
      startNumber.value = '1000';
      startNumber.dispatchEvent(new Event('input'));

      // Assert
      expect(changes).toHaveBeenCalledWith({ field: 'startNumber', text: '1000' });
    });

    it('pickIcon_sellerSymbolPicker_emitsSellerSymbolChange', async () => {
      // Arrange
      const fixture = await render();
      const changes = vi.fn();
      fixture.componentInstance.sellerSymbolChange.subscribe(changes);
      const [sellerSymbolPicker] = pickers(fixture);

      // Act
      sellerSymbolPicker.valueChange.emit({ kind: 'icon', value: 'heart' });

      // Assert
      expect(changes).toHaveBeenCalledWith({ kind: 'icon', value: 'heart' });
    });

    it('chooseFile_logoPicker_emitsImageChosenForLogo', async () => {
      // Arrange
      const fixture = await render();
      const choices = vi.fn();
      fixture.componentInstance.imageChosen.subscribe(choices);
      const [, logoPicker] = pickers(fixture);
      const file = new File(['x'], 'logo.png', { type: 'image/png' });

      // Act
      logoPicker.fileChosen.emit(file);

      // Assert
      expect(choices).toHaveBeenCalledWith({ target: 'logo', file });
    });
  });
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/start-position-form/start-position-form.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { StartPositionForm } from './start-position-form';

  async function render(inputs: Record<string, unknown>): Promise<ComponentFixture<StartPositionForm>> {
    const fixture = TestBed.createComponent(StartPositionForm);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await fixture.whenStable();
    return fixture;
  }

  describe('StartPositionForm', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [StartPositionForm] }).compileComponents();
    });

    it('render_perSheet16_showsRangeHelp', async () => {
      // Arrange & Act
      const fixture = await render({ perSheet: 16 });

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector('.start-position-form__help')?.textContent?.trim()).toBe(
        'Platz 1 bis 16, leer = Platz 1',
      );
    });

    it('render_error_showsItAtTheField', async () => {
      // Arrange & Act
      const fixture = await render({ perSheet: 16, text: '17', error: 'Platz 1 bis 16' });

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector('[data-error-for="startPosition"]')?.textContent?.trim()).toBe(
        'Platz 1 bis 16',
      );
    });

    it('input_seven_emitsTextChange', async () => {
      // Arrange
      const fixture = await render({ perSheet: 16 });
      const changes = vi.fn();
      fixture.componentInstance.textChange.subscribe(changes);
      const field = (fixture.nativeElement as HTMLElement).querySelector('#start-position') as HTMLInputElement;

      // Act
      field.value = '7';
      field.dispatchEvent(new Event('input'));

      // Assert
      expect(changes).toHaveBeenCalledWith('7');
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.spec.ts --include src/app/features/blank-labels/components/graphic-picker/graphic-picker.spec.ts --include src/app/features/blank-labels/components/label-content-form/label-content-form.spec.ts --include src/app/features/blank-labels/components/start-position-form/start-position-form.spec.ts` — erwartet: FAIL (Komponenten fehlen)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { ButtonModule } from 'primeng/button';
  import { InputTextModule } from 'primeng/inputtext';
  import { SelectModule } from 'primeng/select';
  import { SheetFormat } from '../../data/blank-labels-api';
  import { SHEET_FORMAT_FIELDS, SheetFormatErrors, SheetFormatField, SheetFormatTexts } from '../../model/sheet-format-rules';

  export interface SheetFormatFieldChange {
    field: SheetFormatField;
    text: string;
  }

  const FIELD_LABELS: Record<SheetFormatField, string> = {
    sheetWidth: 'Bogenbreite (mm)',
    sheetHeight: 'Bogenhöhe (mm)',
    labelWidth: 'Etikettbreite (mm)',
    labelHeight: 'Etiketthöhe (mm)',
    marginTop: 'Rand oben (mm)',
    marginRight: 'Rand rechts (mm)',
    marginBottom: 'Rand unten (mm)',
    marginLeft: 'Rand links (mm)',
    gapHorizontal: 'Abstand waagerecht (mm)',
    gapVertical: 'Abstand senkrecht (mm)',
    columns: 'Spalten',
    rows: 'Zeilen',
  };

  /** Leaf: Eingaben von Bereich A (Bogenformat) samt Auswahl, Name, Speichern und Löschen. */
  @Component({
    selector: 'app-sheet-format-form',
    imports: [FormsModule, ButtonModule, InputTextModule, SelectModule],
    templateUrl: './sheet-format-form.html',
    styleUrl: './sheet-format-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class SheetFormatForm {
    readonly texts = input.required<SheetFormatTexts>();
    readonly errors = input<SheetFormatErrors>({});
    readonly formats = input<SheetFormat[]>([]);
    readonly selectedFormatId = input<string | null>(null);
    readonly name = input<string>('');
    readonly nameError = input<string | null>(null);
    readonly perSheet = input<number | null>(null);
    readonly canSave = input<boolean>(false);

    readonly fieldChange = output<SheetFormatFieldChange>();
    readonly formatSelected = output<string>();
    readonly nameChange = output<string>();
    readonly save = output<void>();
    readonly remove = output<void>();

    readonly fields = SHEET_FORMAT_FIELDS.map((field) => ({ field, label: FIELD_LABELS[field], inputId: `sheet-format-${field}` }));

    readonly perSheetText = computed(() => {
      const perSheet = this.perSheet();
      return perSheet === null ? 'Anzahl pro Seite: –' : `${perSheet} Etiketten pro Seite`;
    });
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.html`:
  ```html
  <div class="sheet-format-form">
    <div class="sheet-format-form__row">
      <label for="sheet-format-select">Gespeichertes Bogenformat</label>
      <p-select
        inputId="sheet-format-select"
        appendTo="body"
        [options]="formats()"
        optionLabel="name"
        optionValue="id"
        placeholder="Bogenformat wählen"
        [ngModel]="selectedFormatId()"
        (ngModelChange)="formatSelected.emit($event)"
      />
    </div>

    <div class="sheet-format-form__row">
      <label for="sheet-format-name">Name</label>
      <input
        pInputText
        id="sheet-format-name"
        [invalid]="nameError() !== null"
        [ngModel]="name()"
        (ngModelChange)="nameChange.emit($event)"
      />
      @if (nameError(); as error) {
        <small class="sheet-format-form__error" data-error-for="name">{{ error }}</small>
      }
    </div>

    <div class="sheet-format-form__actions">
      <p-button label="Speichern" [disabled]="!canSave()" (onClick)="save.emit()" />
      <p-button label="Löschen" severity="secondary" [disabled]="selectedFormatId() === null" (onClick)="remove.emit()" />
    </div>

    <div class="sheet-format-form__fields">
      @for (item of fields; track item.field) {
        <div class="sheet-format-form__field">
          <label [for]="item.inputId">{{ item.label }}</label>
          <input
            pInputText
            [id]="item.inputId"
            [attr.data-field]="item.field"
            [invalid]="!!errors()[item.field]"
            [ngModel]="texts()[item.field]"
            (ngModelChange)="fieldChange.emit({ field: item.field, text: $event })"
          />
          @if (errors()[item.field]; as error) {
            <small class="sheet-format-form__error" [attr.data-error-for]="item.field">{{ error }}</small>
          }
        </div>
      }
    </div>

    <p class="sheet-format-form__per-sheet">{{ perSheetText() }}</p>
  </div>
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.scss`:
  ```scss
  .sheet-format-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .sheet-format-form__row,
  .sheet-format-form__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .sheet-format-form__actions {
    display: flex;
    gap: 0.5rem;
  }

  .sheet-format-form__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .sheet-format-form__error {
    color: var(--p-red-500);
  }

  .sheet-format-form__per-sheet {
    margin: 0;
    font-weight: 600;
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
  import { ButtonModule } from 'primeng/button';
  import { FileDropzone } from '../../../../shared/components/file-dropzone/file-dropzone';
  import { LABEL_ICON_KEYS, LABEL_ICON_TITLES, LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
  import { LabelGraphicView } from '../../../../shared/components/label-sheet/label-graphic-view';
  import { IMAGE_FILE_ACCEPT } from '../../model/image-file';

  interface IconOption {
    key: string;
    title: string;
    graphic: LabelGraphic;
  }

  /**
   * Leaf: Auswahl für Logo oder Verkäufer-Symbol — „Keins", ein Icon der Icon-Liste oder ein
   * eigenes Bild. Die gewählte Datei geht unverändert an den Aufrufer, der Art und Größe prüft.
   */
  @Component({
    selector: 'app-graphic-picker',
    imports: [ButtonModule, FileDropzone, LabelGraphicView],
    templateUrl: './graphic-picker.html',
    styleUrl: './graphic-picker.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class GraphicPicker {
    readonly label = input.required<string>();
    readonly value = input<LabelGraphic | null>(null);

    readonly valueChange = output<LabelGraphic | null>();
    readonly fileChosen = output<File>();

    readonly accept = IMAGE_FILE_ACCEPT;
    readonly icons: IconOption[] = LABEL_ICON_KEYS.map((key) => ({
      key,
      title: LABEL_ICON_TITLES[key],
      graphic: { kind: 'icon', value: key },
    }));

    readonly selectedIconKey = computed(() => {
      const value = this.value();
      return value?.kind === 'icon' ? value.value : null;
    });

    readonly currentImage = computed(() => {
      const value = this.value();
      return value?.kind === 'image' ? value : null;
    });

    /** `FileDropzone` meldet nur nicht leere Auswahlen; übernommen wird die erste Datei. */
    onFilesChosen(files: File[]): void {
      this.fileChosen.emit(files[0]);
    }
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.html`:
  ```html
  <fieldset class="graphic-picker">
    <legend class="graphic-picker__legend">{{ label() }}</legend>
    <div class="graphic-picker__icons">
      <button pButton type="button" label="Keins" data-icon="none" [outlined]="value() !== null" (click)="valueChange.emit(null)"></button>
      @for (icon of icons; track icon.key) {
        <button
          pButton
          type="button"
          class="graphic-picker__icon-button"
          [outlined]="selectedIconKey() !== icon.key"
          [attr.aria-label]="icon.title"
          [attr.title]="icon.title"
          [attr.data-icon]="icon.key"
          (click)="valueChange.emit(icon.graphic)"
        >
          <app-label-graphic class="graphic-picker__icon" [graphic]="icon.graphic" />
        </button>
      }
    </div>
    <app-file-dropzone [accept]="accept" (filesChosen)="onFilesChosen($event)">
      Eigenes Bild (PNG, JPEG oder SVG bis 1 MB)
    </app-file-dropzone>
    @if (currentImage(); as image) {
      <app-label-graphic class="graphic-picker__current" [graphic]="image" />
    }
  </fieldset>
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/graphic-picker/graphic-picker.scss`:
  ```scss
  .graphic-picker {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0.75rem;
    border: 1px solid var(--p-content-border-color);
    border-radius: var(--p-content-border-radius);
  }

  .graphic-picker__icons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .graphic-picker__icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .graphic-picker__current {
    width: 4rem;
    height: 4rem;
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { InputTextModule } from 'primeng/inputtext';
  import { LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
  import { LabelContentErrors, LabelContentField, LabelContentTexts } from '../../model/label-content-rules';
  import { GraphicPicker } from '../graphic-picker/graphic-picker';

  export interface LabelContentFieldChange {
    field: LabelContentField;
    text: string;
  }

  export interface ImageChoice {
    target: 'logo' | 'sellerSymbol';
    file: File;
  }

  type TextField = Exclude<LabelContentField, 'startPosition'>;

  /** Leaf: Eingaben von Bereich B (Etiketten-Inhalt pro Druck). */
  @Component({
    selector: 'app-label-content-form',
    imports: [FormsModule, InputTextModule, GraphicPicker],
    templateUrl: './label-content-form.html',
    styleUrl: './label-content-form.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class LabelContentForm {
    readonly texts = input.required<LabelContentTexts>();
    readonly errors = input<LabelContentErrors>({});
    readonly logo = input<LabelGraphic | null>(null);
    readonly sellerSymbol = input<LabelGraphic | null>(null);

    readonly fieldChange = output<LabelContentFieldChange>();
    readonly logoChange = output<LabelGraphic | null>();
    readonly sellerSymbolChange = output<LabelGraphic | null>();
    readonly imageChosen = output<ImageChoice>();

    readonly fields: { field: TextField; label: string; inputId: string }[] = [
      { field: 'startNumber', label: 'Startnummer', inputId: 'label-content-start-number' },
      { field: 'count', label: 'Anzahl Etiketten', inputId: 'label-content-count' },
      { field: 'currencySymbol', label: 'Währungssymbol', inputId: 'label-content-currency' },
    ];
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.html`:
  ```html
  <div class="label-content-form">
    <div class="label-content-form__fields">
      @for (item of fields; track item.field) {
        <div class="label-content-form__field">
          <label [for]="item.inputId">{{ item.label }}</label>
          <input
            pInputText
            [id]="item.inputId"
            [attr.data-field]="item.field"
            [invalid]="!!errors()[item.field]"
            [ngModel]="texts()[item.field]"
            (ngModelChange)="fieldChange.emit({ field: item.field, text: $event })"
          />
          @if (errors()[item.field]; as error) {
            <small class="label-content-form__error" [attr.data-error-for]="item.field">{{ error }}</small>
          }
        </div>
      }
    </div>
    <app-graphic-picker
      label="Verkäufer-Symbol"
      [value]="sellerSymbol()"
      (valueChange)="sellerSymbolChange.emit($event)"
      (fileChosen)="imageChosen.emit({ target: 'sellerSymbol', file: $event })"
    />
    <app-graphic-picker
      label="Logo"
      [value]="logo()"
      (valueChange)="logoChange.emit($event)"
      (fileChosen)="imageChosen.emit({ target: 'logo', file: $event })"
    />
  </div>
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/label-content-form/label-content-form.scss`:
  ```scss
  .label-content-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .label-content-form__fields {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .label-content-form__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label-content-form__error {
    color: var(--p-red-500);
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/components/start-position-form/start-position-form.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
  import { FormsModule } from '@angular/forms';
  import { InputTextModule } from 'primeng/inputtext';

  /** Leaf: Eingabe von Bereich C (Startposition auf dem ersten, angebrochenen Bogen). */
  @Component({
    selector: 'app-start-position-form',
    imports: [FormsModule, InputTextModule],
    template: `
      <div class="start-position-form">
        <label for="start-position">Startposition</label>
        <input
          pInputText
          id="start-position"
          [invalid]="error() !== null"
          [ngModel]="text()"
          (ngModelChange)="textChange.emit($event)"
        />
        @if (error(); as message) {
          <small class="start-position-form__error" data-error-for="startPosition">{{ message }}</small>
        }
        <p class="start-position-form__help">{{ helpText() }}</p>
      </div>
    `,
    styles: `
      .start-position-form {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .start-position-form__error {
        color: var(--p-red-500);
      }

      .start-position-form__help {
        margin: 0;
      }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class StartPositionForm {
    readonly text = input<string>('');
    readonly error = input<string | null>(null);
    readonly perSheet = input<number | null>(null);

    readonly textChange = output<string>();

    readonly helpText = computed(() => {
      const perSheet = this.perSheet();
      return perSheet === null ? 'Leer = Platz 1' : `Platz 1 bis ${perSheet}, leer = Platz 1`;
    });
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/blank-labels/components/sheet-format-form/sheet-format-form.spec.ts --include src/app/features/blank-labels/components/graphic-picker/graphic-picker.spec.ts --include src/app/features/blank-labels/components/label-content-form/label-content-form.spec.ts --include src/app/features/blank-labels/components/start-position-form/start-position-form.spec.ts` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/features/blank-labels/components && git commit -m "feat(blank-labels): Eingabe-Komponenten für Bogenformat, Inhalt und Startposition" -- src/bazaar-app/frontend/src/app/features/blank-labels/components`

### Task 12: Frontend — Seite „Etiketten-Vordruck", Route und Menüeintrag

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-17, AC-18, AC-25, AC-29, AC-30, AC-31, AC-33, AC-35, AC-37, AC-38

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.html`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.scss`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.spec.ts`
- Create: `src/bazaar-app/frontend/src/app/features/blank-labels/blank-labels.routes.ts`
- Modify: `src/bazaar-app/frontend/src/app/app.routes.ts:30` · `path: 'settings'`
- Test: `src/bazaar-app/frontend/src/app/app.routes.spec.ts` · `settingsRoute_always_isGuardedByAdminGuard`
- Modify: `src/bazaar-app/frontend/src/app/core/shell/sidebar/sidebar.ts:23-103` · `Sidebar.navGroups`, `Sidebar.visibleGroups`, `Sidebar.isSettingsItem`, `interface NavItem`
- Modify: `src/bazaar-app/frontend/src/app/core/shell/sidebar/sidebar.html` · `@case ('/settings')`
- Test: `src/bazaar-app/frontend/src/app/core/shell/sidebar/sidebar.spec.ts` · `shows "Einstellungen" for role admin`

**Interfaces:**
- Consumes: `BlankLabelsStore` mit `formats`, `loadFormats()`, `saveFormat(request)`, `deleteFormat(id)`, `loadDefaults()`, `saveDefaults(defaults)`; `SheetFormat`, `LabelPrintDefaults`, `NAME_TAKEN_ERROR_CODE` (Task 10); `validateSheetFormat`, `textsFromGeometry`, `formatNameError`, `canSaveFormat`, `normalizeFormatName`, `SheetFormatField`, `SheetFormatTexts` (Task 10); `validateLabelContent`, `previewStartNumber`, `previewStartPosition`, `INITIAL_CONTENT_TEXTS`, `LabelContentField`, `LabelContentTexts` (Task 10); `imageFileError`, `readFileAsDataUrl` (Task 10); `SheetFormatForm`, `SheetFormatFieldChange`, `LabelContentForm`, `LabelContentFieldChange`, `ImageChoice`, `StartPositionForm` (Task 11); `LabelSheet`, `LabelCard` (Task 8); `AVERY_16_GEOMETRY`, `labelsPerSheet`, `placeLabels`, `startPositionPreview`, `LabelGraphic`, `LabelContent` (Task 7); `PrintService.printLabelSheets(model)` (Task 9); `Page` (`app-page`, Input `title`, Slot `[pageActions]`); `ConfirmationService.confirm({ key, header, message, acceptLabel, rejectLabel, accept })`, `MessageService.add({ severity, summary, detail })` aus `primeng/api`; `authGuard`, `adminGuard`, `passwordChangeGuard`
- Produces:
  - Route `/blank-labels` (`canActivate: [authGuard, adminGuard, passwordChangeGuard]`), `BLANK_LABELS_ROUTES`
  - `BlankLabelsPage` (Selektor `app-blank-labels-page`) mit öffentlichen Signalen `formatTexts`, `selectedFormatId`, `formatName`, `contentTexts`, `logo`, `sellerSymbol`, `formatValidation`, `geometry`, `perSheet`, `canSave`, `contentValidation`, `canPrint`, `emptySheetSlots`, `startPositionSlots`, `previewLabelSize`, `previewNumber`, `content` und Methoden `onFormatFieldChange(change: SheetFormatFieldChange)`, `onFormatSelected(id: string)`, `onSaveFormat()`, `onDeleteFormat()`, `onContentFieldChange(change: LabelContentFieldChange)`, `onImageChosen(choice: ImageChoice)`, `onPrint()`
  - Sidebar: Gruppe „System" = Statistik, Etiketten-Vordruck (`/blank-labels`, nur Admin), Einstellungen (nur Admin)

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.spec.ts`:
  ```typescript
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { signal } from '@angular/core';
  import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
  import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
  import { Confirmation, ConfirmationService, MessageService } from 'primeng/api';
  import { Observable, of, throwError } from 'rxjs';
  import { PrintService } from '../../../../core/print/print.service';
  import { BlankLabelsStore } from '../../blank-labels-store';
  import { LabelPrintDefaults, NAME_TAKEN_ERROR_CODE, SheetFormat } from '../../data/blank-labels-api';
  import { BlankLabelsPage } from './blank-labels-page';

  const AVERY_12: SheetFormat = {
    id: 'LSF00001',
    name: 'Avery 12er',
    sheetWidth: 210,
    sheetHeight: 297,
    labelWidth: 105,
    labelHeight: 48,
    marginTop: 4.5,
    marginRight: 0,
    marginBottom: 4.5,
    marginLeft: 0,
    gapHorizontal: 0,
    gapVertical: 0,
    columns: 2,
    rows: 6,
  };

  const INITIAL_DEFAULTS: LabelPrintDefaults = { logo: null, sellerSymbol: null, currencySymbol: '€' };

  interface StoreStub {
    formats: ReturnType<typeof signal<SheetFormat[]>>;
    loadFormats: ReturnType<typeof vi.fn>;
    saveFormat: ReturnType<typeof vi.fn>;
    deleteFormat: ReturnType<typeof vi.fn>;
    loadDefaults: ReturnType<typeof vi.fn>;
    saveDefaults: ReturnType<typeof vi.fn>;
  }

  describe('BlankLabelsPage', () => {
    let store: StoreStub;
    let printLabelSheets: ReturnType<typeof vi.fn>;
    let confirm: ReturnType<typeof vi.spyOn>;
    let messageAdd: ReturnType<typeof vi.spyOn>;
    let httpMock: HttpTestingController;

    async function setup(
      options: { defaults?: Observable<LabelPrintDefaults>; formats?: SheetFormat[] } = {},
    ): Promise<{ fixture: ComponentFixture<BlankLabelsPage>; page: BlankLabelsPage }> {
      store = {
        formats: signal(options.formats ?? []),
        loadFormats: vi.fn(),
        saveFormat: vi.fn(),
        deleteFormat: vi.fn(),
        loadDefaults: vi.fn().mockReturnValue(options.defaults ?? of(INITIAL_DEFAULTS)),
        saveDefaults: vi.fn().mockReturnValue(of(undefined)),
      };
      printLabelSheets = vi.fn();
      const confirmationService = new ConfirmationService();
      confirm = vi.spyOn(confirmationService, 'confirm').mockImplementation(() => confirmationService);
      const messageService = new MessageService();
      messageAdd = vi.spyOn(messageService, 'add').mockImplementation(() => undefined);

      await TestBed.configureTestingModule({
        imports: [BlankLabelsPage],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          { provide: BlankLabelsStore, useValue: store },
          { provide: PrintService, useValue: { printLabelSheets } },
          { provide: ConfirmationService, useValue: confirmationService },
          { provide: MessageService, useValue: messageService },
        ],
      }).compileComponents();
      httpMock = TestBed.inject(HttpTestingController);

      const fixture = TestBed.createComponent(BlankLabelsPage);
      await fixture.whenStable();
      return { fixture, page: fixture.componentInstance };
    }

    function lastConfirmation(): Confirmation {
      return confirm.mock.calls.at(-1)?.[0] as Confirmation;
    }

    function enterValidRun(page: BlankLabelsPage, startNumber: string, count: string, startPosition: string): void {
      page.onContentFieldChange({ field: 'startNumber', text: startNumber });
      page.onContentFieldChange({ field: 'count', text: count });
      page.onContentFieldChange({ field: 'startPosition', text: startPosition });
    }

    afterEach(() => {
      httpMock.verify();
    });

    it('constructor_always_loadsFormatsAndDefaults', async () => {
      // Arrange & Act
      await setup();

      // Assert
      expect(store.loadFormats).toHaveBeenCalledTimes(1);
      expect(store.loadDefaults).toHaveBeenCalledTimes(1);
    });

    it('constructor_rememberedDefaults_prefillsGraphicsAndCurrencyButNoNumbers', async () => {
      // Arrange
      const defaults: LabelPrintDefaults = {
        logo: { kind: 'image', value: 'data:image/png;base64,AAAA' },
        sellerSymbol: { kind: 'icon', value: 'star' },
        currencySymbol: '$',
      };

      // Act
      const { page } = await setup({ defaults: of(defaults) });

      // Assert
      expect(page.logo()).toEqual(defaults.logo);
      expect(page.sellerSymbol()).toEqual(defaults.sellerSymbol);
      expect(page.contentTexts()).toEqual({ startNumber: '', count: '', currencySymbol: '$', startPosition: '' });
    });

    it('render_firstOpen_showsAvery16EuroAndDisabledPrintWithErrorsAtNumbers', async () => {
      // Arrange & Act
      const { fixture, page } = await setup();

      // Assert
      expect(page.perSheet()).toBe(16);
      expect(page.formatTexts().marginTop).toBe('8,5');
      expect(page.contentTexts().currencySymbol).toBe('€');
      expect(page.logo()).toBeNull();
      expect(page.contentValidation().errors).toEqual({ startNumber: 'Pflichtfeld', count: 'Pflichtfeld' });
      const printButton = (fixture.nativeElement as HTMLElement).querySelector('p-button[pageActions] button') as HTMLButtonElement;
      expect(printButton.disabled).toBe(true);
    });

    it('render_always_showsThreeAreasWithInputsAndPreviewAndPrintHint', async () => {
      // Arrange & Act
      const { fixture } = await setup();

      // Assert
      const root = fixture.nativeElement as HTMLElement;
      const areas = Array.from(root.querySelectorAll('.blank-labels__area'));
      expect(areas.map((area) => area.getAttribute('data-area'))).toEqual(['sheet-format', 'label-content', 'start-position']);
      for (const area of areas) {
        expect(area.children[0].classList.contains('blank-labels__inputs')).toBe(true);
        expect(area.children[1].classList.contains('blank-labels__preview')).toBe(true);
      }
      expect(root.querySelector('.blank-labels__print-hint')?.textContent).toContain('Skalierung 100 %, keine Seitenränder');
    });

    it('onFormatFieldChange_oneColumn_updatesPreviewGridImmediately', async () => {
      // Arrange
      const { fixture, page } = await setup();

      // Act
      page.onFormatFieldChange({ field: 'columns', text: '1' });

      // Assert
      await fixture.whenStable();
      const preview = (fixture.nativeElement as HTMLElement).querySelector('[data-area="sheet-format"] .blank-labels__preview');
      expect(preview?.querySelectorAll('.label-sheet__slot')).toHaveLength(8);
    });

    it('onFormatFieldChange_threeColumns_errorAtColumnsAndSaveAndPrintBlocked', async () => {
      // Arrange
      const { page } = await setup();
      page.formatName.set('Avery 12er');
      enterValidRun(page, '1000', '4', '');

      // Act
      page.onFormatFieldChange({ field: 'columns', text: '3' });

      // Assert
      expect(page.formatValidation().errors.columns).toBe('Etiketten passen nicht in die Bogenbreite');
      expect(page.canSave()).toBe(false);
      expect(page.canPrint()).toBe(false);
    });

    it('onFormatSelected_savedFormat_fillsAllFieldsAndPreview', async () => {
      // Arrange
      const { page } = await setup({ formats: [AVERY_12] });

      // Act
      page.onFormatSelected('LSF00001');

      // Assert
      expect(page.formatTexts().labelHeight).toBe('48');
      expect(page.formatTexts().marginTop).toBe('4,5');
      expect(page.formatName()).toBe('Avery 12er');
      expect(page.perSheet()).toBe(12);
    });

    it('canSave_emptyName_isFalse', async () => {
      // Arrange
      const { page } = await setup();

      // Act
      page.formatName.set('   ');

      // Assert
      expect(page.canSave()).toBe(false);
    });

    it('onSaveFormat_paddedName_savesTrimmedNameWithoutOverwrite', async () => {
      // Arrange
      const { page } = await setup();
      store.saveFormat.mockReturnValue(of({ ...AVERY_12, labelHeight: 35, rows: 8, marginTop: 8.5, marginBottom: 8.5 }));
      page.formatName.set(' Avery 12er ');

      // Act
      page.onSaveFormat();

      // Assert
      expect(store.saveFormat).toHaveBeenCalledWith(expect.objectContaining({ name: 'Avery 12er', overwrite: false, columns: 2, rows: 8 }));
      expect(page.selectedFormatId()).toBe('LSF00001');
      expect(page.formatName()).toBe('Avery 12er');
    });

    it('onSaveFormat_nameTaken_asksOverwriteAndOverwritesOnAccept', async () => {
      // Arrange
      const { page } = await setup();
      const conflict = new HttpErrorResponse({ status: 409, error: { errorCode: NAME_TAKEN_ERROR_CODE } });
      store.saveFormat.mockReturnValueOnce(throwError(() => conflict)).mockReturnValueOnce(of(AVERY_12));
      page.formatName.set('Avery 12er');
      page.onSaveFormat();

      // Act
      lastConfirmation().accept?.();

      // Assert
      expect(lastConfirmation().message).toBe('Überschreiben?');
      expect(store.saveFormat).toHaveBeenCalledTimes(2);
      expect(store.saveFormat).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Avery 12er', overwrite: true }));
    });

    it('onSaveFormat_nameTakenAndNotConfirmed_doesNotSaveAgain', async () => {
      // Arrange
      const { page } = await setup();
      const conflict = new HttpErrorResponse({ status: 409, error: { errorCode: NAME_TAKEN_ERROR_CODE } });
      store.saveFormat.mockReturnValue(throwError(() => conflict));
      page.formatName.set('Avery 12er');

      // Act
      page.onSaveFormat();

      // Assert
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(store.saveFormat).toHaveBeenCalledTimes(1);
    });

    it('onDeleteFormat_confirmed_deletesSelectedFormat', async () => {
      // Arrange
      const { page } = await setup({ formats: [AVERY_12] });
      store.deleteFormat.mockReturnValue(of(undefined));
      page.onFormatSelected('LSF00001');
      page.onDeleteFormat();

      // Act
      lastConfirmation().accept?.();

      // Assert
      expect(store.deleteFormat).toHaveBeenCalledWith('LSF00001');
      expect(page.selectedFormatId()).toBeNull();
    });

    it('onDeleteFormat_notConfirmed_keepsFormat', async () => {
      // Arrange
      const { page } = await setup({ formats: [AVERY_12] });
      page.onFormatSelected('LSF00001');

      // Act
      page.onDeleteFormat();

      // Assert
      expect(confirm).toHaveBeenCalledTimes(1);
      expect(store.deleteFormat).not.toHaveBeenCalled();
    });

    it('previewNumber_startNumber1000_isShownOnPreviewLabel', async () => {
      // Arrange
      const { fixture, page } = await setup();

      // Act
      page.onContentFieldChange({ field: 'startNumber', text: '1000' });

      // Assert
      await fixture.whenStable();
      const preview = (fixture.nativeElement as HTMLElement).querySelector('[data-area="label-content"] .blank-labels__preview');
      expect(preview?.querySelector('.label-card__number')?.textContent?.trim()).toBe('1000');
      expect(preview?.querySelector('.label-card__fold')).not.toBeNull();
    });

    it('startPositionSlots_position7_greysSixSlotsInPreview', async () => {
      // Arrange
      const { fixture, page } = await setup();

      // Act
      page.onContentFieldChange({ field: 'startPosition', text: '7' });

      // Assert
      await fixture.whenStable();
      const preview = (fixture.nativeElement as HTMLElement).querySelector('[data-area="start-position"] .blank-labels__preview');
      expect(preview?.querySelectorAll('.label-sheet__slot--skipped')).toHaveLength(6);
    });

    it('onPrint_validInput_printsAllSheetsAndRemembersGraphicsAndCurrency', async () => {
      // Arrange
      const { page } = await setup();
      enterValidRun(page, '1000', '12', '7');
      page.logo.set({ kind: 'icon', value: 'star' });

      // Act
      page.onPrint();

      // Assert
      const model = printLabelSheets.mock.calls[0][0];
      expect(model.sheets).toHaveLength(2);
      expect(model.sheets[0][6]).toEqual({ kind: 'label', number: 1000 });
      expect(model.sheets[1][1]).toEqual({ kind: 'label', number: 1011 });
      expect(model.content).toEqual({ logo: { kind: 'icon', value: 'star' }, sellerSymbol: null, currencySymbol: '€' });
      expect(store.saveDefaults).toHaveBeenCalledWith({ logo: { kind: 'icon', value: 'star' }, sellerSymbol: null, currencySymbol: '€' });
    });

    it('onPrint_withoutLogoAndSymbol_printsLabelsWithoutGraphics', async () => {
      // Arrange
      const { page } = await setup();
      enterValidRun(page, '1000', '4', '');

      // Act
      page.onPrint();

      // Assert
      expect(printLabelSheets.mock.calls[0][0].content).toEqual({ logo: null, sellerSymbol: null, currencySymbol: '€' });
    });

    // AC-30: Die Seite kennt keine Artikel. Ob ein Artikel 1000 existiert, kann den Druck nicht beeinflussen,
    // weil weder ein Artikel-Request noch ein anderer Store-Aufruf als das Merken der Druckwerte erfolgt.
    it('onPrint_number1000_printsWithoutArticleRequestOrError', async () => {
      // Arrange
      const { page } = await setup();
      enterValidRun(page, '1000', '1', '');

      // Act
      page.onPrint();

      // Assert
      expect(printLabelSheets).toHaveBeenCalledTimes(1);
      expect(printLabelSheets.mock.calls[0][0].sheets[0][0]).toEqual({ kind: 'label', number: 1000 });
      httpMock.expectNone((req) => req.url.includes('/api/articles'));
      expect(messageAdd).not.toHaveBeenCalled();
      expect(store.saveDefaults).toHaveBeenCalledTimes(1);
      expect(store.saveFormat).not.toHaveBeenCalled();
      expect(store.deleteFormat).not.toHaveBeenCalled();
    });

    it('onPrint_invalidInput_doesNotPrint', async () => {
      // Arrange
      const { page } = await setup();
      enterValidRun(page, '0', '4', '');

      // Act
      page.onPrint();

      // Assert
      expect(printLabelSheets).not.toHaveBeenCalled();
      expect(store.saveDefaults).not.toHaveBeenCalled();
    });

    it('onImageChosen_gifFile_showsErrorAndKeepsLogo', async () => {
      // Arrange
      const { page } = await setup();
      const gif = new File(['x'], 'logo.gif', { type: 'image/gif' });

      // Act
      page.onImageChosen({ target: 'logo', file: gif });

      // Assert
      expect(messageAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', detail: 'Nur PNG, JPEG oder SVG' }));
      expect(page.logo()).toBeNull();
    });

    it('onImageChosen_pngFile_setsSellerSymbolToItsDataUrl', async () => {
      // Arrange
      const { page } = await setup();
      const png = new File([new Uint8Array(3)], 'symbol.png', { type: 'image/png' });

      // Act
      page.onImageChosen({ target: 'sellerSymbol', file: png });

      // Assert
      await vi.waitFor(() => expect(page.sellerSymbol()).toEqual({ kind: 'image', value: 'data:image/png;base64,AAAA' }));
    });
  });
  ```
  In `app.routes.spec.ts` nach dem Test `settingsRoute_always_isGuardedByAdminGuard` (nach dessen schließendem `});`) einfügen:
  ```typescript

    it('blankLabelsRoute_always_isGuardedByAdminGuard', () => {
      // Arrange & Act
      const blankLabelsRoute = findRoute(routes, 'blank-labels');

      // Assert
      expect(blankLabelsRoute?.canActivate).toContain(adminGuard);
    });
  ```
  In `sidebar.spec.ts` direkt vor `it('renders no p-badge since openArticlesCount has no external data source yet'` einfügen:
  ```typescript
    it('visibleGroups_admin_listsEtikettenVordruckDirectlyAboveEinstellungen', async () => {
      // Arrange
      const { fixture } = createSidebar('admin');

      // Act
      await fixture.whenStable();

      // Assert
      const system = fixture.componentInstance.visibleGroups().find((group) => group.label === 'System');
      expect(system?.items.map((item) => item.label)).toEqual(['Statistik', 'Etiketten-Vordruck', 'Einstellungen']);
    });

    it('render_cashier_hidesEtikettenVordruck', async () => {
      // Arrange
      const { fixture } = createSidebar('cashier');

      // Act
      await fixture.whenStable();

      // Assert
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Etiketten-Vordruck');
    });

  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.spec.ts --include src/app/app.routes.spec.ts --include src/app/core/shell/sidebar/sidebar.spec.ts` — erwartet: FAIL (`./blank-labels-page` fehlt; `blankLabelsRoute_always_isGuardedByAdminGuard` und `visibleGroups_admin_listsEtikettenVordruckDirectlyAboveEinstellungen` rot)
- [ ] **Schritt 3: Minimal implementieren**
  `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.ts`:
  ```typescript
  import { ChangeDetectionStrategy, Component, WritableSignal, computed, inject, signal } from '@angular/core';
  import { HttpErrorResponse } from '@angular/common/http';
  import { ConfirmationService, MessageService } from 'primeng/api';
  import { ButtonModule } from 'primeng/button';
  import { ConfirmDialogModule } from 'primeng/confirmdialog';
  import { PrintService } from '../../../../core/print/print.service';
  import { Page } from '../../../../shared/components/page/page';
  import { LabelCard } from '../../../../shared/components/label-sheet/label-card';
  import { LabelContent, LabelGraphic } from '../../../../shared/components/label-sheet/label-graphic';
  import { AVERY_16_GEOMETRY, labelsPerSheet } from '../../../../shared/components/label-sheet/label-geometry';
  import { LabelSheet } from '../../../../shared/components/label-sheet/label-sheet';
  import { LabelSlot, placeLabels, startPositionPreview } from '../../../../shared/components/label-sheet/label-slots';
  import { BlankLabelsStore } from '../../blank-labels-store';
  import { LabelPrintDefaults, NAME_TAKEN_ERROR_CODE, SheetFormat } from '../../data/blank-labels-api';
  import { imageFileError, readFileAsDataUrl } from '../../model/image-file';
  import {
    INITIAL_CONTENT_TEXTS,
    LabelContentField,
    LabelContentTexts,
    previewStartNumber,
    previewStartPosition,
    validateLabelContent,
  } from '../../model/label-content-rules';
  import {
    SheetFormatField,
    SheetFormatTexts,
    canSaveFormat,
    formatNameError,
    normalizeFormatName,
    textsFromGeometry,
    validateSheetFormat,
  } from '../../model/sheet-format-rules';
  import { ImageChoice, LabelContentFieldChange, LabelContentForm } from '../../components/label-content-form/label-content-form';
  import { SheetFormatFieldChange, SheetFormatForm } from '../../components/sheet-format-form/sheet-format-form';
  import { StartPositionForm } from '../../components/start-position-form/start-position-form';

  const CONFIRM_KEY = 'blankLabels';

  interface ProblemDetailsBody {
    errorCode?: string;
  }

  function errorCodeOf(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) return undefined;
    return (error.error as ProblemDetailsBody | null)?.errorCode;
  }

  /**
   * Integration: Seite „Etiketten-Vordruck" (nur Admin). Hält die Eingaben der Bereiche A (Bogenformat),
   * B (Etiketten-Inhalt) und C (Startposition), leitet daraus Prüfungen und Vorschauen ab und verdrahtet
   * Speichern, Löschen und Drucken. Keine Verbindung zu Artikeln: Nummern werden weder geprüft noch angelegt.
   */
  @Component({
    selector: 'app-blank-labels-page',
    imports: [Page, ButtonModule, ConfirmDialogModule, SheetFormatForm, LabelContentForm, StartPositionForm, LabelSheet, LabelCard],
    templateUrl: './blank-labels-page.html',
    styleUrl: './blank-labels-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class BlankLabelsPage {
    private readonly store = inject(BlankLabelsStore);
    private readonly printService = inject(PrintService);
    private readonly confirmationService = inject(ConfirmationService);
    private readonly messageService = inject(MessageService);

    readonly formats = this.store.formats;
    readonly formatTexts = signal<SheetFormatTexts>(textsFromGeometry(AVERY_16_GEOMETRY));
    readonly selectedFormatId = signal<string | null>(null);
    readonly formatName = signal('');
    readonly contentTexts = signal<LabelContentTexts>(INITIAL_CONTENT_TEXTS);
    readonly logo = signal<LabelGraphic | null>(null);
    readonly sellerSymbol = signal<LabelGraphic | null>(null);
    private readonly lastEditedFormatField = signal<SheetFormatField | null>(null);
    private readonly lastEditedContentField = signal<LabelContentField | null>(null);

    readonly formatValidation = computed(() => validateSheetFormat(this.formatTexts(), this.lastEditedFormatField()));
    readonly geometry = computed(() => this.formatValidation().geometry);
    readonly perSheet = computed(() => {
      const geometry = this.geometry();
      return geometry === null ? null : labelsPerSheet(geometry);
    });
    readonly nameError = computed(() => formatNameError(this.formatName()));
    readonly canSave = computed(() => canSaveFormat(this.formatValidation(), this.formatName()));
    readonly contentValidation = computed(() =>
      validateLabelContent(this.contentTexts(), this.perSheet(), this.lastEditedContentField()),
    );
    readonly canPrint = computed(() => this.geometry() !== null && this.contentValidation().run !== null);

    readonly emptySheetSlots = computed<LabelSlot[]>(() => {
      const perSheet = this.perSheet();
      return perSheet === null ? [] : startPositionPreview(1, perSheet);
    });
    readonly startPositionSlots = computed<LabelSlot[]>(() => {
      const perSheet = this.perSheet();
      return perSheet === null ? [] : startPositionPreview(previewStartPosition(this.contentTexts().startPosition, perSheet), perSheet);
    });
    /** Etikett der Vorschau: Maße des gültigen Bogenformats, sonst Avery 16er. */
    readonly previewLabelSize = computed(() => this.geometry() ?? AVERY_16_GEOMETRY);
    readonly previewNumber = computed(() => previewStartNumber(this.contentTexts().startNumber));
    readonly content = computed<LabelContent>(() => ({
      logo: this.logo(),
      sellerSymbol: this.sellerSymbol(),
      currencySymbol: this.contentTexts().currencySymbol,
    }));

    constructor() {
      this.store.loadFormats();
      this.store.loadDefaults().subscribe({
        next: (defaults) => this.applyDefaults(defaults),
        error: () => this.messageService.add({ severity: 'warn', summary: 'Letzte Werte konnten nicht geladen werden' }),
      });
    }

    onFormatFieldChange(change: SheetFormatFieldChange): void {
      this.formatTexts.update((texts) => ({ ...texts, [change.field]: change.text }));
      this.lastEditedFormatField.set(change.field);
    }

    onFormatSelected(id: string): void {
      const format = this.formats().find((candidate) => candidate.id === id);
      if (format === undefined) return;
      this.formatTexts.set(textsFromGeometry(format));
      this.formatName.set(format.name);
      this.selectedFormatId.set(format.id);
      this.lastEditedFormatField.set(null);
    }

    onSaveFormat(): void {
      this.saveFormat(false);
    }

    onDeleteFormat(): void {
      const format = this.formats().find((candidate) => candidate.id === this.selectedFormatId());
      if (format === undefined) return;
      this.confirmationService.confirm({
        key: CONFIRM_KEY,
        header: 'Bogenformat löschen',
        message: `Bogenformat „${format.name}" löschen?`,
        acceptLabel: 'Löschen',
        rejectLabel: 'Abbrechen',
        accept: () => this.deleteFormat(format),
      });
    }

    onContentFieldChange(change: LabelContentFieldChange): void {
      this.contentTexts.update((texts) => ({ ...texts, [change.field]: change.text }));
      this.lastEditedContentField.set(change.field);
    }

    onImageChosen(choice: ImageChoice): void {
      const error = imageFileError(choice.file);
      if (error !== null) {
        this.messageService.add({ severity: 'error', summary: 'Bild nicht übernommen', detail: error });
        return;
      }
      readFileAsDataUrl(choice.file).then(
        (dataUrl) => this.graphicOf(choice.target).set({ kind: 'image', value: dataUrl }),
        () => this.messageService.add({ severity: 'error', summary: 'Bild konnte nicht gelesen werden' }),
      );
    }

    /** Merkt Logo, Symbol und Währung im Backend und öffnet den Druckdialog mit allen Bögen. */
    onPrint(): void {
      const geometry = this.geometry();
      const run = this.contentValidation().run;
      if (geometry === null || run === null) return;
      const content = this.content();
      this.rememberDefaults(content);
      this.printService.printLabelSheets({
        geometry,
        sheets: placeLabels(run.startNumber, run.count, run.startPosition, labelsPerSheet(geometry)),
        content,
      });
    }

    private applyDefaults(defaults: LabelPrintDefaults): void {
      this.logo.set(defaults.logo);
      this.sellerSymbol.set(defaults.sellerSymbol);
      this.contentTexts.update((texts) => ({ ...texts, currencySymbol: defaults.currencySymbol }));
    }

    private saveFormat(overwrite: boolean): void {
      const geometry = this.geometry();
      if (geometry === null || !this.canSave()) return;
      const name = normalizeFormatName(this.formatName());
      this.store.saveFormat({ ...geometry, name, overwrite }).subscribe({
        next: (saved) => this.onFormatSaved(saved),
        error: (error: unknown) => this.onFormatSaveFailed(error, name),
      });
    }

    private onFormatSaved(saved: SheetFormat): void {
      this.selectedFormatId.set(saved.id);
      this.formatName.set(saved.name);
      this.messageService.add({ severity: 'success', summary: `Bogenformat „${saved.name}" gespeichert` });
    }

    /** 409: Den Namen gibt es schon (auch wenn ein anderer Admin ihn inzwischen gespeichert hat). */
    private onFormatSaveFailed(error: unknown, name: string): void {
      if (errorCodeOf(error) === NAME_TAKEN_ERROR_CODE) {
        this.confirmOverwrite(name);
        return;
      }
      this.messageService.add({ severity: 'error', summary: 'Bogenformat konnte nicht gespeichert werden' });
    }

    private confirmOverwrite(name: string): void {
      this.confirmationService.confirm({
        key: CONFIRM_KEY,
        header: `Bogenformat „${name}" existiert bereits`,
        message: 'Überschreiben?',
        acceptLabel: 'Überschreiben',
        rejectLabel: 'Abbrechen',
        accept: () => this.saveFormat(true),
      });
    }

    private deleteFormat(format: SheetFormat): void {
      this.store.deleteFormat(format.id).subscribe({
        next: () => this.selectedFormatId.set(null),
        error: () => this.messageService.add({ severity: 'error', summary: 'Bogenformat konnte nicht gelöscht werden' }),
      });
    }

    private rememberDefaults(content: LabelContent): void {
      this.store.saveDefaults(content).subscribe({
        error: () => this.messageService.add({ severity: 'warn', summary: 'Logo, Symbol und Währung konnten nicht gemerkt werden' }),
      });
    }

    private graphicOf(target: ImageChoice['target']): WritableSignal<LabelGraphic | null> {
      return target === 'logo' ? this.logo : this.sellerSymbol;
    }
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.html`:
  ```html
  <app-page title="Etiketten-Vordruck">
    <p-button pageActions label="Drucken" [disabled]="!canPrint()" (onClick)="onPrint()" />

    <p class="blank-labels__print-hint">Im Druckdialog „Skalierung 100 %, keine Seitenränder" einstellen.</p>

    <section class="blank-labels__area" data-area="sheet-format">
      <div class="blank-labels__inputs">
        <h2 class="blank-labels__title">Bogenformat</h2>
        <app-sheet-format-form
          [texts]="formatTexts()"
          [errors]="formatValidation().errors"
          [formats]="formats()"
          [selectedFormatId]="selectedFormatId()"
          [name]="formatName()"
          [nameError]="nameError()"
          [perSheet]="perSheet()"
          [canSave]="canSave()"
          (fieldChange)="onFormatFieldChange($event)"
          (formatSelected)="onFormatSelected($event)"
          (nameChange)="formatName.set($event)"
          (save)="onSaveFormat()"
          (remove)="onDeleteFormat()"
        />
      </div>
      <div class="blank-labels__preview">
        @if (geometry(); as sheetGeometry) {
          <app-label-sheet [geometry]="sheetGeometry" [slots]="emptySheetSlots()" [outlineSlots]="true" maxHeight="70vh" />
        } @else {
          <p class="blank-labels__preview-hint">Die Vorschau erscheint, sobald das Bogenformat gültig ist.</p>
        }
      </div>
    </section>

    <section class="blank-labels__area" data-area="label-content">
      <div class="blank-labels__inputs">
        <h2 class="blank-labels__title">Etiketten-Inhalt</h2>
        <app-label-content-form
          [texts]="contentTexts()"
          [errors]="contentValidation().errors"
          [logo]="logo()"
          [sellerSymbol]="sellerSymbol()"
          (fieldChange)="onContentFieldChange($event)"
          (logoChange)="logo.set($event)"
          (sellerSymbolChange)="sellerSymbol.set($event)"
          (imageChosen)="onImageChosen($event)"
        />
      </div>
      <div class="blank-labels__preview">
        <app-label-card
          class="blank-labels__label-preview"
          [width]="previewLabelSize().labelWidth"
          [height]="previewLabelSize().labelHeight"
          [number]="previewNumber()"
          [logo]="logo()"
          [sellerSymbol]="sellerSymbol()"
          [currencySymbol]="contentTexts().currencySymbol"
          [showFoldLine]="true"
        />
      </div>
    </section>

    <section class="blank-labels__area" data-area="start-position">
      <div class="blank-labels__inputs">
        <h2 class="blank-labels__title">Angebrochener Bogen</h2>
        <app-start-position-form
          [text]="contentTexts().startPosition"
          [error]="contentValidation().errors.startPosition ?? null"
          [perSheet]="perSheet()"
          (textChange)="onContentFieldChange({ field: 'startPosition', text: $event })"
        />
      </div>
      <div class="blank-labels__preview">
        @if (geometry(); as sheetGeometry) {
          <app-label-sheet [geometry]="sheetGeometry" [slots]="startPositionSlots()" [outlineSlots]="true" maxHeight="70vh" />
        } @else {
          <p class="blank-labels__preview-hint">Die Vorschau erscheint, sobald das Bogenformat gültig ist.</p>
        }
      </div>
    </section>

    <p-confirmdialog key="blankLabels" />
  </app-page>
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.scss`:
  ```scss
  .blank-labels__print-hint {
    margin: 0 0 1rem;
  }

  /* Eingaben ein Drittel, Vorschau zwei Drittel der Breite. */
  .blank-labels__area {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: 1.5rem;
    align-items: start;
    padding-block: 1rem;
    border-bottom: 1px solid var(--p-content-border-color);
  }

  .blank-labels__title {
    margin: 0 0 0.75rem;
    font-size: 1.125rem;
  }

  .blank-labels__preview {
    min-width: 0;
  }

  .blank-labels__label-preview {
    max-width: 100%;
  }
  ```
  `src/bazaar-app/frontend/src/app/features/blank-labels/blank-labels.routes.ts`:
  ```typescript
  import { Routes } from '@angular/router';
  import { BlankLabelsPage } from './pages/blank-labels-page/blank-labels-page';

  export const BLANK_LABELS_ROUTES: Routes = [{ path: '', component: BlankLabelsPage }];
  ```
  `app.routes.ts`: direkt vor der Zeile mit `path: 'settings'` einfügen:
  ```typescript
        { path: 'blank-labels', canActivate: [authGuard, adminGuard, passwordChangeGuard], loadChildren: () => import('./features/blank-labels/blank-labels.routes').then((m) => m.BLANK_LABELS_ROUTES) },
  ```
  `sidebar.ts`:
  1. `interface NavItem` ersetzen durch:
  ```typescript
  interface NavItem {
    label: string;
    route: string;
    /** Nur für Admin sichtbar (Rechte-Matrix, spec.md §4.1). */
    adminOnly?: boolean;
  }
  ```
  2. In der `@lucide/angular`-Importliste und in `imports: [...]` des `@Component` jeweils `LucidePrinter,` nach `LucideBarChart3,` ergänzen.
  3. Die Gruppe `System` in `navGroups` ersetzen durch:
  ```typescript
      { label: 'System', items: [
        { label: 'Statistik', route: '/statistics' },
        { label: 'Etiketten-Vordruck', route: '/blank-labels', adminOnly: true },
        { label: 'Einstellungen', route: '/settings', adminOnly: true },
      ]},
  ```
  4. `visibleGroups` ersetzen durch:
  ```typescript
    readonly visibleGroups = computed(() =>
      this.navGroups.map((group) => ({
        ...group,
        items: group.items.filter((item) => this.isAdmin() || !item.adminOnly),
      })),
    );
  ```
  5. Die nun unbenutzte Methode `isSettingsItem` vollständig löschen.

  `sidebar.html`: direkt vor `@case ('/settings') {` einfügen:
  ```html
                        @case ('/blank-labels') {
                          <svg lucidePrinter></svg>
                        }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/blank-labels/pages/blank-labels-page/blank-labels-page.spec.ts --include src/app/app.routes.spec.ts --include src/app/core/shell/sidebar/sidebar.spec.ts` — erwartet: PASS
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend` — erwartet: PASS (gesamte Frontend-Suite)
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK (keine Verstöße gegen `boundaries/dependencies`)
- [ ] **Schritt 5: Commit**
  `git add -- src/bazaar-app/frontend/src/app/features/blank-labels src/bazaar-app/frontend/src/app/app.routes.ts src/bazaar-app/frontend/src/app/app.routes.spec.ts src/bazaar-app/frontend/src/app/core/shell/sidebar && git commit -m "feat(blank-labels): Seite Etiketten-Vordruck mit Route und Menüeintrag für Admin" -- src/bazaar-app/frontend/src/app/features/blank-labels src/bazaar-app/frontend/src/app/app.routes.ts src/bazaar-app/frontend/src/app/app.routes.spec.ts src/bazaar-app/frontend/src/app/core/shell/sidebar`

### Task 13: Doku-Nachführung — Anforderungen, API, Datenmodell, Komponente, Profile, Glossar

**ACs:** AC-01, AC-02

**Dateien:**
- Modify: `docs/requirements/bazaar-app/spec.md:84-96` · `── System ──`
- Modify: `docs/requirements/bazaar-app/spec.md:115` · `| Einstellungen (inkl. Import und Benutzerverwaltung) | ✅ | ❌ |`
- Modify: `docs/requirements/bazaar-app/api/overview.md:104-117` · `### System`
- Create: `docs/requirements/bazaar-app/api/blank-labels.md`
- Modify: `docs/requirements/bazaar-app/entities/overview.md` · `| Einstellungen | [einstellungen.md](einstellungen.md) |`
- Create: `docs/requirements/bazaar-app/entities/etiketten-vordruck.md`
- Create: `docs/components/label-sheet/component.md`
- Modify: `docs/components/overview.md` · `| **QR-Code** |`
- Create: `docs/knowledge/feature-profile/bazaar-app-blank-labels/feature.md`
- Modify: `docs/knowledge/module-profile/bazaar-api/module.md:13` · `16 endpoint-mapping groups`
- Modify: `docs/knowledge/module-profile/bazaar-app/module.md:11-26` · `Routen-Tabelle`
- Modify: `docs/knowledge/module-profile/bazaar-domain/module.md:11` · `- Entities:`
- Modify: `docs/knowledge/module-profile/bazaar-application/module.md:11` · `One folder per bounded capability area`
- Modify: `docs/knowledge/module-profile/bazaar-infrastructure/module.md:11` · `Persistence/BazaarDbContext`
- Modify: `docs/glossary/frontend-terms.md` · `### Einstellungs-Tabs (Haupt-App)`

**Interfaces:**
- Consumes: Endpoints und JSON-Vertrag aus Task 6; Route `/blank-labels` und Menüeintrag aus Task 12; Komponenten `app-label-card`, `app-label-sheet`, `app-label-sheets-document` aus Task 8 und 9
- Produces: —

- [ ] **Schritt 1: Absicherungstest schreiben oder bestehenden nennen**
  Keine Code-Änderung; abgesichert wird, dass Menü, Rechte und Route der Doku entsprechen, über die bestehenden Tests `visibleGroups_admin_listsEtikettenVordruckDirectlyAboveEinstellungen`, `render_cashier_hidesEtikettenVordruck` (`sidebar.spec.ts`) und `blankLabelsRoute_always_isGuardedByAdminGuard` (`app.routes.spec.ts`) aus Task 12.
- [ ] **Schritt 2: Absicherungstest laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/core/shell/sidebar/sidebar.spec.ts --include src/app/app.routes.spec.ts` — erwartet: PASS `visibleGroups_admin_listsEtikettenVordruckDirectlyAboveEinstellungen`, `render_cashier_hidesEtikettenVordruck`, `blankLabelsRoute_always_isGuardedByAdminGuard`; rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 3: Doku schreiben**
  `docs/requirements/bazaar-app/spec.md`:
  1. Im Menü-Block die Zeile `  Einstellungen              (nur Admin)` ersetzen durch die zwei Zeilen
  ```
    Etiketten-Vordruck         (nur Admin)
    Einstellungen              (nur Admin)
  ```
  2. In der Zeile, die mit `**Routen-Pfade sind englisch**` beginnt, `` `/statistics`, `/settings` `` ersetzen durch `` `/statistics`, `/blank-labels`, `/settings` ``.
  3. Den Satz `Die Sidebar ist **rollenabhängig**: Kassenpersonal sieht den Eintrag **Einstellungen** nicht.` ersetzen durch `Die Sidebar ist **rollenabhängig**: Kassenpersonal sieht die Einträge **Etiketten-Vordruck** und **Einstellungen** nicht.`
  4. In der Rechte-Matrix direkt nach der Zeile `| Einstellungen (inkl. Import und Benutzerverwaltung) | ✅ | ❌ |` einfügen:
  ```
  | Etiketten-Vordruck (Blanko-Etiketten drucken, Bogenformate verwalten) | ✅ | ❌ |
  ```
  `docs/requirements/bazaar-app/api/overview.md`: in der Tabelle unter `### System` direkt nach der Zeile `| `PUT /api/settings` | `admin` | [settings.md](settings.md) |` einfügen:
  ```
  | `GET /api/label-sheet-formats` | `admin` | [blank-labels.md](blank-labels.md) |
  | `POST /api/label-sheet-formats` | `admin` | [blank-labels.md](blank-labels.md) |
  | `DELETE /api/label-sheet-formats/{id}` | `admin` | [blank-labels.md](blank-labels.md) |
  | `GET /api/label-print-defaults` | `admin` | [blank-labels.md](blank-labels.md) |
  | `PUT /api/label-print-defaults` | `admin` | [blank-labels.md](blank-labels.md) |
  ```
  `docs/requirements/bazaar-app/api/blank-labels.md`:
  ```markdown
  ---
  status: draft
  updated: 2026-11-02
  ---

  # API: Etiketten-Vordruck

  Bogenformate und die Werte des letzten Drucks der Seite „Etiketten-Vordruck". Fachliche Quelle →
  [`docs/forge/2026-11-02-etiketten-vordruck/spec.md`](../../../forge/2026-11-02-etiketten-vordruck/spec.md),
  Entitäten → [`entities/etiketten-vordruck.md`](../entities/etiketten-vordruck.md).

  Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

  | Endpoint | Auth |
  |---|---|
  | `GET /api/label-sheet-formats` | `admin` |
  | `POST /api/label-sheet-formats` | `admin` |
  | `DELETE /api/label-sheet-formats/{id}` | `admin` |
  | `GET /api/label-print-defaults` | `admin` |
  | `PUT /api/label-print-defaults` | `admin` |

  Auch das Lesen ist Admin-Sache: Die Seite gibt es für Kassenpersonal nicht.

  ## Bogenformate

  `GET` liefert alle Formate nach Name sortiert:
  `[{ id, name, sheetWidth, sheetHeight, labelWidth, labelHeight, marginTop, marginRight, marginBottom, marginLeft, gapHorizontal, gapVertical, columns, rows }]` (Maße in mm).

  `POST` speichert unter einem Namen; Body wie oben ohne `id`, dazu `overwrite`:

  | Fall | Antwort |
  |---|---|
  | Name neu | `200` mit dem gespeicherten Format |
  | Name vorhanden (exakt gleich, nach Trimmen), `overwrite: false` | `409` `label_sheet_format.name_taken` — die Seite fragt „Überschreiben?" |
  | Name vorhanden, `overwrite: true` | `200`, das vorhandene Format behält seine `id` und bekommt die neuen Maße |
  | Formatfehler (Name leer oder > 50 Zeichen, Maß ≤ 0 bzw. < 0, mehr als eine Nachkommastelle, Spalten/Zeilen < 1, Raster überragt den Bogen um mehr als 0,5 mm) | `400` mit `errors` |

  `DELETE` → `204`; unbekannte `id` → `404` `label_sheet_format.not_found`.

  ## Werte des letzten Drucks

  `GET` → `{ logo, sellerSymbol, currencySymbol }`; `logo` und `sellerSymbol` sind `null` oder
  `{ kind: "icon", value: "<icon-schlüssel>" }` bzw. `{ kind: "image", value: "data:image/png;base64,…" }`.
  Ohne bisherigen Druck: `{ logo: null, sellerSymbol: null, currencySymbol: "€" }`.

  `PUT` mit demselben Body → `204`; die Seite sendet ihn bei jedem Druck. `400`, wenn ein Bild kein
  PNG/JPEG/SVG als Base64-Data-URL oder größer als 1 MB ist, ein Icon-Schlüssel nicht `^[a-z0-9-]{1,30}$`
  entspricht oder das Währungssymbol nicht 1 bis 3 Zeichen hat. Der nginx-Proxy lässt dafür 3000k zu.
  ```
  `docs/requirements/bazaar-app/entities/overview.md`: direkt nach der Zeile `| Einstellungen | [einstellungen.md](einstellungen.md) | Systemparameter, eine Zeile |` einfügen:
  ```
  | Etiketten-Vordruck | [etiketten-vordruck.md](etiketten-vordruck.md) | Bogenformate und Werte des letzten Etikettendrucks |
  ```
  `docs/requirements/bazaar-app/entities/etiketten-vordruck.md`:
  ```markdown
  ---
  status: draft
  updated: 2026-11-02
  ---

  # Entität: Etiketten-Vordruck

  Zwei Tabellen der Seite „Etiketten-Vordruck". Keine Beziehung zu Artikeln.

  ## Bogenformat (`LabelSheetFormats`)

  | Feld | Typ | Beschreibung |
  |---|---|---|
  | `id` | string(8) | ID nach Abschnitt 9.5 der App-Spec |
  | `name` | string(50) | Eindeutig, exakt verglichen, an den Enden getrimmt |
  | `sheetWidth`, `sheetHeight` | decimal(6,1) | Bogengröße in mm, > 0 |
  | `labelWidth`, `labelHeight` | decimal(6,1) | Etikettgröße in mm, > 0 |
  | `marginTop`, `marginRight`, `marginBottom`, `marginLeft` | decimal(6,1) | Leerer Rand in mm, ≥ 0 |
  | `gapHorizontal`, `gapVertical` | decimal(6,1) | Abstand zwischen den Etiketten in mm, ≥ 0 |
  | `columns`, `rows` | int | ≥ 1; Anzahl pro Seite = `columns × rows` |

  Spalten × Etikettbreite + (Spalten − 1) × waagerechter Abstand + Rand links + Rand rechts darf die
  Bogenbreite um höchstens 0,5 mm übersteigen (Höhe analog). Beim Start ist kein Format gespeichert.

  ## Werte des letzten Drucks (`LabelPrintDefaults`, eine Zeile, `id = 1`)

  | Feld | Typ | Beschreibung |
  |---|---|---|
  | `logoKind`, `logoValue` | string?, text? | Logo: `Icon` + Icon-Schlüssel oder `Image` + Data-URL (PNG/JPEG/SVG, ≤ 1 MB); leer = kein Logo |
  | `sellerSymbolKind`, `sellerSymbolValue` | string?, text? | Verkäufer-Symbol, gleiche Regeln |
  | `currencySymbol` | string | 1 bis 3 Zeichen, Standard „€" |

  Startnummer, Anzahl und Startposition werden nie gespeichert.
  ```
  `docs/components/label-sheet/component.md`:
  ```markdown
  ---
  status: draft
  updated: 2026-11-02
  ---

  # Component: Etikett und Etikettenbogen

  **Verwendung:** Haupt-App, Seite „Etiketten-Vordruck" (Vorschau) und deren Druck.
  Ablage: `src/bazaar-app/frontend/src/app/shared/components/label-sheet/`.

  PrimeNG liefert dafür keine Komponente — eigene Leaf-Komponenten (Grundregel → [overview.md](../overview.md)).

  | Komponente | Selektor | Inhalt |
  |---|---|---|
  | Etikett | `app-label-card` | QR-Code (Nummer) mit Klartext darunter, Logo daneben, Preisfeld (Schreiblinie + Währungssymbol) rechts, Verkäufer-Symbol oben rechts und unten links, optional Falzlinie in der Mitte |
  | Etikettenbogen | `app-label-sheet` | Bogen mit Rand und Raster; Plätze leer, ausgegraut (vor der Startposition) oder mit Etikett |
  | Druckdokument | `app-label-sheets-document` | Alle Bögen eines Drucks in Originalgröße, ohne Falzlinie |
  | Logo/Symbol | `app-label-graphic` | Icon der Icon-Liste oder eigenes Bild (Data-URL) |

  ## Skalierung

  Lage in Prozent der Etikett- bzw. Bogengröße, Schrift in `cqw` des Etiketts. Dasselbe Markup
  skaliert in der Vorschau mit der Containerbreite (Seitenverhältnis über `aspect-ratio`) und liegt
  im Druck in mm (Breite `<Bogenbreite>mm`). Der Inhalt eines Etiketts skaliert mit der Etikettgröße:
  105 × 35 mm = Maßstab 1, bei anderem Seitenverhältnis gilt das kleinere Verhältnis.

  ## Schnittstelle

  `app-label-card`: `width`, `height` (mm, Pflicht), `number` (`null` = ohne QR-Code und Klartext),
  `logo`, `sellerSymbol` (`null` = Platz bleibt leer), `currencySymbol`, `showFoldLine`.

  `app-label-sheet`: `geometry` und `slots` (Pflicht), `content`, `width` (CSS-Länge, Standard `100%`),
  `maxHeight` (Vorschau), `outlineSlots`, `showFoldLines`.

  Keine Outputs, kein Service, kein HTTP.
  ```
  `docs/components/overview.md`: direkt nach der Index-Zeile, die mit `| **QR-Code** |` beginnt, einfügen:
  ```
  | **Etikett / Etikettenbogen** | Etikett mit QR-Code, Logo, Preisfeld und Verkäufer-Symbol sowie Bogen mit Raster; skaliert in der Vorschau, druckt in mm | [label-sheet/](label-sheet/component.md) |
  ```
  `docs/knowledge/feature-profile/bazaar-app-blank-labels/feature.md`:
  ```markdown
  # Etiketten-Vordruck (Bazaar-App)

  **Intent:** Admin druckt Blanko-Etiketten (fortlaufende Nummer als QR-Code und Klartext, Logo, Verkäufer-Symbol, Preisfeld) auf frei einstellbare Etikettenbögen, ohne Bezug zu Artikeln.
  **Coverage:** inventoried
  **Last reviewed:** 2026-11-02

  ## Capabilities

  ### Bereich A — Bogenformat (`sheet-format-form`)
  - Admin sieht beim ersten Öffnen Avery 16er (A4, 105 × 35, Ränder oben/unten 8,5, 2 × 8) und „16 Etiketten pro Seite" — `features/blank-labels/model/sheet-format-rules.ts`, `shared/components/label-sheet/label-geometry.ts` (`AVERY_16_GEOMETRY`)
  - Admin ändert Maße, Spalten und Zeilen; Fehler stehen am Feld, ein Raster, das den Bogen um mehr als 0,5 mm überragt, meldet den Fehler am zuletzt geänderten Feld der Achse (sonst Spalten bzw. Zeilen) — `validateSheetFormat()`
  - Admin speichert, lädt, überschreibt („Überschreiben?") und löscht benannte Bogenformate — `pages/blank-labels-page/blank-labels-page.ts`, `blank-labels-store.ts`, Backend `Features/BlankLabels/BlankLabelEndpoints.cs`

  ### Bereich B — Etiketten-Inhalt (`label-content-form`, `graphic-picker`)
  - Admin gibt Startnummer, Anzahl und Währungssymbol ein und wählt Logo und Verkäufer-Symbol aus der Icon-Liste oder lädt ein eigenes Bild (PNG/JPEG/SVG bis 1 MB) — `model/label-content-rules.ts`, `model/image-file.ts`
  - Vorschau eines Etiketts mit Falzlinie — `shared/components/label-sheet/label-card.ts`

  ### Bereich C — Angebrochener Bogen (`start-position-form`)
  - Admin gibt die Startposition ein; Plätze davor erscheinen in der Vorschau grau — `shared/components/label-sheet/label-slots.ts` (`startPositionPreview`)

  ### Drucken
  - „Drucken" öffnet den Browser-Druckdialog mit allen Bögen in Bogengröße, ohne Falzlinie; Hinweis „Skalierung 100 %, keine Seitenränder" — `core/print/print.service.ts` (`printLabelSheets`), `shared/components/label-sheet/label-sheets-document.ts`
  - Logo, Verkäufer-Symbol und Währungssymbol werden bei jedem Druck im Backend gemerkt und beim nächsten Öffnen auf jedem Gerät vorbelegt — `PUT /api/label-print-defaults`

  ## Spans
  - **Frontend:** `features/blank-labels/` (Seite, Store, Api, Prüfregeln, Eingabe-Komponenten), `shared/components/label-sheet/` (Geometrie, Layout, Platzierung, Etikett, Bogen, Druckdokument), `core/print/print.service.ts`, Menüeintrag in `core/shell/sidebar/`
  - **Backend:** `Bazaar.Api/Features/BlankLabels/`, `Bazaar.Application/BlankLabels/`, `Bazaar.Domain/BlankLabels/`, Repositories `LabelSheetFormatRepository`, `LabelPrintDefaultsRepository`, Migration `AddBlankLabels`

  ## Notes
  - Route `/blank-labels` und alle Endpoints nur für Admin; Kassenpersonal sieht den Menüeintrag nicht.
  - Eigene Bilder liegen als Base64-Data-URL in `LabelPrintDefaults`; nginx lässt dafür 3000k je Request zu.
  ```
  Modulprofile (je eine Zeile anpassen):
  - `docs/knowledge/module-profile/bazaar-api/module.md`: in der Zeile mit `16 endpoint-mapping groups` die Zahl auf `17` setzen und in der Klammer `BlankLabels, ` vor `Brands` ergänzen; am Ende der Zeile, die mit `The full HTTP endpoint surface` beginnt, anfügen: `` Seit 2026-11: `/api/label-sheet-formats` und `/api/label-print-defaults` (`Features/BlankLabels`, Policy `admin`). ``
  - `docs/knowledge/module-profile/bazaar-app/module.md`: in der Zeile `- Gesamtes Bedien-UI …` `Statistics, ` durch `Statistics, Etiketten-Vordruck (blank-labels), ` ersetzen; in der Routen-Zeile `` `/statistics`, `/settings` `` durch `` `/statistics`, `/blank-labels`, `/settings` `` ersetzen; in der Feature-Zeile `13 Features: articles, brands,` durch `14 Features: articles, blank-labels, brands,` ersetzen.
  - `docs/knowledge/module-profile/bazaar-domain/module.md`: in der Zeile `- Entities:` nach `` `Article`, `` ergänzen: `` `LabelSheetFormat` (+ `LabelSheetGeometry`), `LabelPrintDefaults` (+ `LabelGraphic`), ``
  - `docs/knowledge/module-profile/bazaar-application/module.md`: in der Zeile `One folder per bounded capability area` `` `Auth` (Login/BootstrapAdmin/ChangePassword/CompleteSetup), `` durch `` `Auth` (Login/BootstrapAdmin/ChangePassword/CompleteSetup), `BlankLabels`, `` ersetzen.
  - `docs/knowledge/module-profile/bazaar-infrastructure/module.md`: in der Zeile `- `Persistence/BazaarDbContext`` `7 `Configurations/`` durch `9 `Configurations/`` ersetzen.

  `docs/glossary/frontend-terms.md`: direkt vor `### Einstellungs-Tabs (Haupt-App)` einfügen:
  ```markdown
  ### Etiketten-Vordruck (Haupt-App)
  - **Maps to:** `src/bazaar-app/frontend/src/app/features/blank-labels/` — Seite „Etiketten-Vordruck" (Route `/blank-labels`, nur Admin) mit den Bereichen Bogenformat, Etiketten-Inhalt und Angebrochener Bogen; Etikett und Etikettenbogen als Komponenten in `shared/components/label-sheet/`, Backend `Features/BlankLabels`.
  - **Confidence:** user-confirmed
  - **First seen:** 2026-11-02

  ```
- [ ] **Schritt 4: Commit**
  `git add -- docs/requirements/bazaar-app/spec.md docs/requirements/bazaar-app/api/overview.md docs/requirements/bazaar-app/api/blank-labels.md docs/requirements/bazaar-app/entities/overview.md docs/requirements/bazaar-app/entities/etiketten-vordruck.md docs/components/label-sheet/component.md docs/components/overview.md docs/knowledge/feature-profile/bazaar-app-blank-labels/feature.md docs/knowledge/module-profile docs/glossary/frontend-terms.md && git commit -m "docs(blank-labels): Anforderungen, API, Datenmodell, Komponente und Profile nachgeführt" -- docs/requirements/bazaar-app/spec.md docs/requirements/bazaar-app/api/overview.md docs/requirements/bazaar-app/api/blank-labels.md docs/requirements/bazaar-app/entities/overview.md docs/requirements/bazaar-app/entities/etiketten-vordruck.md docs/components/label-sheet/component.md docs/components/overview.md docs/knowledge/feature-profile/bazaar-app-blank-labels/feature.md docs/knowledge/module-profile docs/glossary/frontend-terms.md`

## Entscheidungen
- **W · Fehlerort** · Aussage — Feldübergreifende Fehler (Bogenformat passt nicht, AC-06/07; Startnummer + Anzahl zu groß, AC-28) stehen am zuletzt geänderten beteiligten Feld; ohne Änderung (z. B. nach Laden eines Formats) an „Spalten"/„Zeilen" bzw. „Anzahl".
- **E · Speicherform eigener Bilder** · Planer — Eigene Bilder liegen als Base64-Data-URL in `LabelPrintDefaults` (gemerktes Logo/Symbol), keine eigene Bildbibliothek und kein Datei-Endpoint; die Spec verlangt nur, dass die Bilder im Backend liegen und das zuletzt gedruckte auf jedem Gerät vorbelegt ist (AC-17). Hält den JSON-Vertrag einfach und `<img src="data:…">` führt keine SVG-Skripte aus.
- **E · Zeitpunkt des Merkens** · Planer — Logo, Symbol und Währung werden beim Klick auf „Drucken" per `PUT` gespeichert („Werte des letzten Drucks"); scheitert das Speichern, wird trotzdem gedruckt und ein Warn-Toast gezeigt.
- **E · Überschreiben-Ablauf** · Planer — Die Seite sendet immer zuerst `overwrite: false`; 409 `label_sheet_format.name_taken` löst „Überschreiben?" aus, Bestätigen sendet erneut mit `overwrite: true`. Ein Ablauf deckt AC-11 und AC-38 (anderer Admin hat inzwischen gespeichert) ab; ein gleichzeitiger Insert wird über den eindeutigen Index im Repository ebenfalls als 409 gemeldet.
- **E · Skalierung per CSS** · Planer — Etikett und Bogen rendern Positionen in Prozent und Schrift in `cqw`, Höhe über `aspect-ratio`; dieselben Komponenten dienen Vorschau (Breite 100 %) und Druck (Breite in mm), kein JavaScript-Messen. Getestet werden die berechneten Stile und die reinen Layout-Funktionen, weil jsdom kein Layout rechnet.
- **E · Etikett-Layout** · Planer — Maße bei 105 × 35 mm: QR-Code 20 mm (links oben, 4/2 mm), Klartext 3,5 mm darunter, Logo 20 mm daneben (x 26 mm), Verkäufer-Symbol 5 mm oben rechts und unten links, Schreiblinie von 57 bis 91 mm auf 24 mm Höhe, Währungssymbol 6 mm rechts daneben; rechte bzw. untere Elemente hängen an der rechten bzw. unteren Kante.
- **E · Icon-Liste** · Planer — Neun Lucide-Icons (Stern, Herz, Sonne, Mond, Blume, Blatt, Krone, Geschenk, Wolke), weil `@lucide/angular` bereits für die Sidebar eingebunden ist und Icons als SVG druckbar sind; die Spec fordert nur mindestens ein Icon.
- **E · Benennung** · Planer — Route und Feature `blank-labels`, Backend-Namespace `BlankLabels`, Aggregate `LabelSheetFormat` und `LabelPrintDefaults`, Endpoints `/api/label-sheet-formats` und `/api/label-print-defaults` (Sprachregel englisch, Glossar: Etiketten-Vordruck, Bogenformat).
- **E · Leseschutz** · Planer — Auch `GET`-Endpoints sind Admin-only, anders als bei `/api/settings`, weil kein anderer Bildschirm die Daten liest.
- **E · Proxy-Limit** · Planer — nginx `client_max_body_size` von 2100k auf 3000k, weil `PUT /api/label-print-defaults` zwei Bilder bis je 1 MB als Base64 trägt (ca. 2,8 MB).
- **E · Bildfehler-Anzeige** · Planer — Eine abgelehnte Bilddatei (AC-15) meldet ein Fehler-Toast mit Grund, wie die übrigen Upload-Fehler der App (Import); das Bild wird nicht übernommen.
- **E · Mobile-Layout** · Planer — Die Aufteilung ein Drittel / zwei Drittel gilt auf jeder Breite (AC-03 ohne Ausnahme); die Seite ist ein Admin-Werkzeug am Desktop.
- **R1 · AC-30** — geändert — Task 12 erhält den Seitentest `onPrint_number1000_printsWithoutArticleRequestOrError`: Druck der Nummer 1000 liefert Etikett 1000 auf Platz 1, kein Request an `/api/articles` (`httpMock.expectNone`), keine Fehlermeldung und außer dem Merken der Druckwerte kein Store-Aufruf. Festlegung: Da die Seite keine Artikel-Abhängigkeit hat, kann das Vorhandensein eines Artikels 1000 den Druck nicht beeinflussen; der eine Test belegt damit beide Fälle des AC („existiert" und „existiert nicht") sowie „legt keinen Artikel an und ändert keinen".
- **R1 · Global Constraints** — geändert — Drei Soll-Vorgaben der Spec ergänzt: Rückfrage „Überschreiben?" auch bei inzwischen von einem anderen Admin vergebenem Namen (409 `label_sheet_format.name_taken`), Icon-Liste mit mindestens einem wählbaren Icon, und bei leerem Logo/Verkäufer-Symbol entfällt das Element im Etikett, sein Platz bleibt leer.
- **F · Task 10** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; `LabelSheetGeometry`, `fitsSheetWidth`, `fitsSheetHeight` und `LabelGraphic` werden in Task 7 erzeugt, der JSON-Vertrag in Task 6.
- **F · Task 11** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; die Symbole stammen aus Task 7, 8 und 10, `FileDropzone` existiert im Repo unter `shared/components/file-dropzone`.
- **F · Task 12** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; die Symbole stammen aus Task 7 bis 11, `Page`, Guards und PrimeNG-Services existieren im Repo bzw. in `primeng/api`.
- **F · Task 13** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; Endpoints aus Task 6, Route und Menüeintrag aus Task 12, Komponenten aus Task 8 und 9.
- **F · Task 2** — geändert — Vorschlag 1: Global Constraints um die Regel ergänzt, dass eigene Bilder (auch SVG) nur über `<img [src]>` gerendert werden, nie per `innerHTML`, `bypassSecurityTrust*` oder inline-SVG; Task 8 erhält den Test `render_svgImageWithScript_rendersOnlyImgSrcNoScriptElement` (SVG-Data-URL mit `<script>` → im Logo genau ein `img` mit dieser `src`, kein `script`, kein `svg`) und einen Sicherheitskommentar an `LabelGraphicView`.
- **F · Task 3** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; die Domain-Typen entstehen in Task 1 und 2, `ConflictException` existiert in `Bazaar.Domain.Exceptions`.
- **F · Task 4** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; Repository-Port aus Task 3, Domain-Member aus Task 1, `IIdGenerator` und Exceptions existieren im Repo.
- **F · Task 5** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; Repository-Port aus Task 3, `LabelPrintDefaults` und `LabelGraphic` aus Task 2.
- **F · Task 6** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; Handler aus Task 4 und 5, `ValidationFilter<TRequest>` und Policy `"admin"` existieren im Repo.
- **F · Task 8** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; Layout-, Geometrie- und Platzierungssymbole aus Task 7, `QrCode` und Lucide-Komponenten existieren im Repo bzw. in `@lucide/angular`.
- **F · Task 9** — nicht geändert — Vorschlag 1: Fehlalarm der Skript-Prüfung; `LabelSheet` aus Task 8, Geometrie, Platzierung und `LabelContent` aus Task 7.
