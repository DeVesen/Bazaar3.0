# Artikel-Import an der Verkäufer-Kachel — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-13-seller-article-import/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Ein Admin lädt an der Verkäufer-Kachel eine XLSX-, XLS- oder CSV-Datei hoch, und das Backend legt deren Zeilen alles-oder-nichts als Artikel im Status „Registriert" für diesen Verkäufer an.
**Architektur:** Neuer Endpoint `POST /api/sellers/{id}/articles/import` (multipart: `file`, `locale`) ruft den neuen `ImportSellerArticlesHandler` (Application). Das Einlesen der Datei steht hinter dem neuen Port `IArticleTableReader` (Domain.Ports, Implementierung in Infrastructure); Zeilenprüfung (`ArticleTableParser`) und Fehlertext (`ArticleImportErrorMessage`) sind reine Funktionen in Application. Im Frontend kommen ein Icon-Button an `seller-card`, ein Modal `article-import-dialog` und ein `article-import-api` im Feature `sellers` sowie der wiederverwendbare Wrapper `file-dropzone` unter `app/shared/components/` hinzu; der Proxy (`nginx/nginx.conf.template`) erlaubt Request-Bodies bis 2100k (2 MB Datei plus multipart-Overhead) und 3 Minuten.
**Tech-Stack:** .NET 10, ASP.NET Core Minimal API, EF Core (Npgsql), xUnit v3 + Moq, ExcelDataReader (nur XLSX/XLS), Angular 22 (Signals, zoneless), PrimeNG 22, Vitest.
**Spec:** docs/forge/2026-10-13-seller-article-import/spec.md
**Basis:** 0e3015b6

## Global Constraints
- Datei: genau eine Datei, Endungen .xlsx, .xls und .csv; andere Typen werden im Modal vor dem Upload abgelehnt (Spec, Soll-Vorgaben).
- Maximale Dateigröße 2 MB.
- Sechs Spalten in fester Reihenfolge: Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Preis; Kopfzeilen-Beschriftungen frei, weitere Spalten werden ignoriert; bei XLSX nur das erste Blatt.
- Kopfzeile = Zeile 1 der Datei; „Zeilennummer" in Meldungen meint die Zeile in der Datei.
- Pflichtfelder je Artikelzeile: Artikelnummer, Bezeichnung, Kategorie, Marke, Preis; die Größe ist optional.
- Eine Zeile, die außer der Artikelnummer nur leere Felder hat, und eine Zeile ohne jeden Inhalt werden ohne Meldung übersprungen.
- Fehlt einer Zeile ein anderes Pflichtfeld, bricht der Import ab; Werte aus der Zeile darüber werden nicht übernommen.
- Artikelnummer: Ganzzahl größer als 0, in der Datei einmalig; ist sie schon vergeben (gleich welcher Verkäufer, gleich welcher Status), bricht der Import ab; der Import überschreibt nie.
- Preis: Ganzzahl größer als 0; das Dezimalzeichen beim Lesen einer CSV richtet sich nach der Browser-Sprache, die mit dem Import ans Backend übermittelt wird.
- CSV-Trennzeichen ist das Semikolon.
- Unbekannte Kategorien und Marken werden als „Neu" (`Original = false`) angelegt, unabhängig von der Rolle; Leerzeichen am Rand werden entfernt, sonst ungeprüft; eine vorhandene Kategorie oder Marke wird bei abweichender Groß-/Kleinschreibung wiederverwendet.
- Neue Artikel sind „Registriert"; das Freigeben ist ein manueller Folgeschritt, nicht Teil des Imports.
- Der Import ist alles oder nichts; er läuft synchron; das Frontend wartet höchstens 3 Minuten.
- Fehlermeldung: alle Fehler mit Zeilennummer, Artikelnummer und Grund, höchstens 10, danach „und n weitere"; bei vergebener Nummer der Name des Verkäufers, dem die Nummer gehört.
- Nur Admins sehen den Import-Button (Icon, ohne Beschriftung, ariaLabel „Importieren"); bei abgerechnetem Verkäufer ist er deaktiviert, und das Backend lehnt den Import für einen abgerechneten Verkäufer zusätzlich mit `409 settlement.locked` ab; ein Klick öffnet nur das Modal, nicht die Detailansicht.
- Während des Imports ist das Modal nicht schließbar und der Import-Button deaktiviert; bei Erfolg wechselt der Spinner animiert in ein Check-Icon, das Modal schließt nach etwa 1,5 Sekunden; bei Fehler bleibt das Modal mit Meldung offen und die Datei gewählt.
- Proxy: 2 MB Upload und 3 Minuten Antwortzeit (aktuell 1 MB und 60 Sekunden).
- Projekt-CLAUDE.md: Code, Routen und JSON-Contract englisch, Doku und Nutzertexte deutsch; Ports liegen in `Bazaar.Domain.Ports`; jeder `*Handler` aus `Bazaar.Application` wird in `Bazaar.Api/Program.cs` per `AddScoped<XHandler>()` registriert (`DiRegistrationTests`); Application kennt Infrastructure nicht; Commits als Conventional Commits mit deutschem Text; bauen/testen nur über `dv-dotnet-test`/`dv-angular-test` (Skills `dv-dotnet:toolchain`, `dv-angular:toolchain`), nie über `dotnet test`/`ng test`.
- craft-design-principles: kleine Funktionen mit einer Aufgabe; Guard Clauses statt Verschachtelung; ein `if`/`switch` ist ein Integrationssignal, der Branch delegiert; Komponenten sind entweder Integration (orchestriert) oder Leaf (rendert); kein `bool`-Flag, das Verhalten umschaltet.
- craft-unit-testing: Testname `<Methode>_<Situation>_<Erwartung>`, AAA mit Kommentaren `// Arrange` / `// Act` / `// Assert`, Act ist eine Zeile, ein Test prüft ein Verhalten.
- dotnet-xunit-conventions: Bestand respektieren — xUnit v3 mit `Assert`, Moq, Testklasse `<Klasse>Tests` im spiegelnden Ordner; kein FluentAssertions (im Bestand nicht vorhanden).
- angular-testing-vitest-conventions: Specs neben der Quelle, `describe('<Klasse>')`, `it('<methode>_<situation>_<erwartung>')`, `vi.fn()`, zoneless Act → `await fixture.whenStable()` → Assert, kein `jasmine`/`jest`.
- primeng-component-implementation: nur PrimeNG-Komponenten (Wrapper nur für Fehlendes); Verwendung wurde mit `validate_usage` geprüft; Standalone-Komponenten mit `OnPush`, Signal-Inputs/-Outputs.
- dotnet-ef-migrations: nicht betroffen (keine Schemaänderung).

---

### Task 1: Artikel nach Nummern laden (Port + Repository)

**ACs:** AC-19

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Ports/IArticleRepository.cs` · `IArticleRepository`
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/ArticleRepository.cs` · `ArticleRepository.GetMaxNumber`
- Test: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticleRepositoryTests.cs` · `ArticleRepositoryTests`

**Interfaces:**
- Consumes: bestehende `Article.Create(...)`, `BazaarDbContext`.
- Produces: `Task<IReadOnlyList<Article>> IArticleRepository.GetByNumbers(IReadOnlyCollection<int> numbers, CancellationToken cancellationToken)` — liefert nur die existierenden Artikel zu den Nummern, beliebiger Verkäufer, beliebiger Status.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `ArticleRepositoryTests` am Ende der Klasse (vor der schließenden Klammer) einfügen:
  ```csharp
  [Fact]
  public async Task GetByNumbers_KnownAndUnknownNumbers_ReturnsOnlyExistingArticles()
  {
      // Arrange
      await using var dbContext = CreateContext();
      var sut = new ArticleRepository(dbContext);
      await sut.Add(CreateArticle(id: "ART00001", number: 3001, sellerId: "SEL00001"));
      await sut.Add(CreateArticle(id: "ART00002", number: 3002, sellerId: "SEL00002"));
      await sut.Add(CreateArticle(id: "ART00003", number: 3003, sellerId: "SEL00001"));

      // Act
      var found = await sut.GetByNumbers([3001, 3002, 9999], TestContext.Current.CancellationToken);

      // Assert
      Assert.Equal(new[] { 3001, 3002 }, found.Select(a => a.Number).Order().ToArray());
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-method "*GetByNumbers*"` — erwartet: FAIL (Compile-Fehler: `GetByNumbers` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  In `IArticleRepository` nach `Task<int?> GetMaxNumber();` ergänzen:
  ```csharp
      Task<IReadOnlyList<Article>> GetByNumbers(IReadOnlyCollection<int> numbers, CancellationToken cancellationToken);
  ```
  In `ArticleRepository` nach `GetMaxNumber` ergänzen:
  ```csharp
      public async Task<IReadOnlyList<Article>> GetByNumbers(
          IReadOnlyCollection<int> numbers,
          CancellationToken cancellationToken) =>
          await dbContext.Articles.Where(a => numbers.Contains(a.Number)).ToListAsync(cancellationToken);
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*ArticleRepositoryTests"` — erwartet: PASS `GetByNumbers_KnownAndUnknownNumbers_ReturnsOnlyExistingArticles`
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/backend/Bazaar.Domain/Ports/IArticleRepository.cs src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/ArticleRepository.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticleRepositoryTests.cs` · `git commit -m "feat(article-import): Artikel nach Nummern laden"`

---

### Task 2: Tabellen-Leser für XLSX, XLS und CSV

**ACs:** AC-12, AC-25, AC-26

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Domain/Ports/IArticleTableReader.cs`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Files/ArticleTableReader.cs`
- Create: `src/bazaar-app/backend/Bazaar.Infrastructure/Files/CsvRowParser.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Bazaar.Infrastructure.csproj` · `<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL"`
- Modify: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Bazaar.Infrastructure.UnitTests.csproj` · `<PackageReference Include="Moq"`
- Create: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Files/ArticleTableReaderTests.cs`

**Interfaces:**
- Consumes: `Bazaar.Domain.Exceptions.BadRequestException(string message, string errorCode)`.
- Produces: `IReadOnlyList<IReadOnlyList<object?>> IArticleTableReader.ReadRows(Stream content, string fileName)` (Namespace `Bazaar.Domain.Ports`). `rows[0]` ist Zeile 1 der Datei; leere Zeilen bleiben erhalten, damit Index + 1 die Zeilennummer in der Datei ist. Zellwerte: `string`, `double` (numerische Excel-Zelle) oder `null` (leer). Wirft `BadRequestException` mit `import.invalid_file_type` (Endung nicht .xlsx/.xls/.csv) oder `import.unreadable_file` (Datei nicht lesbar, auch wenn eine XLSX/XLS mehr als `ArticleTableReader.MaxRows` = 100.000 Zeilen liefert). Implementierung: `Bazaar.Infrastructure.Files.ArticleTableReader` mit `public const int MaxRows = 100_000`; interner Helfer `CsvRowParser.Parse(string text, char separator)` mit gleichem Rückgabetyp.

- [ ] **Schritt 1: Pakete eintragen und fehlschlagende Tests schreiben**
  In `Bazaar.Infrastructure.csproj` in die `ItemGroup` mit den `PackageReference`-Einträgen ergänzen:
  ```xml
      <PackageReference Include="ExcelDataReader" Version="3.8.0" />
  ```
  In `Bazaar.Infrastructure.UnitTests.csproj` in dieselbe `ItemGroup` wie `Moq` ergänzen:
  ```xml
      <PackageReference Include="ClosedXML" Version="0.105.0" />
  ```
  Die Datei `tests/Bazaar.Infrastructure.UnitTests/Files/ArticleTableReaderTests.cs` anlegen (die Tests brauchen die Produktionstypen noch nicht zu kennen; sie scheitern an der fehlenden Klasse):
  ```csharp
  using System.Text;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Infrastructure.Files;
  using ClosedXML.Excel;

  namespace Bazaar.Infrastructure.UnitTests.Files;

  public class ArticleTableReaderTests
  {
      private static MemoryStream Utf8(string text) => new(Encoding.UTF8.GetBytes(text));

      private static MemoryStream Workbook(Action<IXLWorkbook> build)
      {
          using var workbook = new XLWorkbook();
          build(workbook);
          var stream = new MemoryStream();
          workbook.SaveAs(stream);
          stream.Position = 0;
          return stream;
      }

      [Fact]
      public void ReadRows_CsvWithBlankLine_KeepsBlankRowAtItsPosition()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Utf8("Nr;Name\n1;Jacke\n\n2;Hose\n");

          // Act
          var rows = sut.ReadRows(stream, "artikel.csv");

          // Assert
          Assert.Equal(4, rows.Count);
          Assert.Empty(rows[2]);
          Assert.Equal("2", rows[3][0]);
      }

      [Fact]
      public void ReadRows_CsvWithQuotedSeparatorAndEscapedQuote_ReturnsUnquotedText()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Utf8("1;\"Ski; Jacke \"\"XL\"\"\"\n");

          // Act
          var rows = sut.ReadRows(stream, "artikel.csv");

          // Assert
          Assert.Equal("Ski; Jacke \"XL\"", rows[0][1]);
      }

      [Fact]
      public void ReadRows_CsvWithEmptyField_ReturnsNullForThatCell()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Utf8("1;Jacke;;Icepeak\n");

          // Act
          var rows = sut.ReadRows(stream, "artikel.csv");

          // Assert
          Assert.Null(rows[0][2]);
      }

      [Fact]
      public void ReadRows_CsvInLatin1_DecodesUmlauts()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = new MemoryStream(Encoding.Latin1.GetBytes("1;Größe\n"));

          // Act
          var rows = sut.ReadRows(stream, "artikel.csv");

          // Assert
          Assert.Equal("Größe", rows[0][1]);
      }

      [Fact]
      public void ReadRows_CsvWithUtf8Bom_IgnoresBom()
      {
          // Arrange
          var sut = new ArticleTableReader();
          var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes("Nr;Name\n")).ToArray();
          using var stream = new MemoryStream(bytes);

          // Act
          var rows = sut.ReadRows(stream, "artikel.csv");

          // Assert
          Assert.Equal("Nr", rows[0][0]);
      }

      [Fact]
      public void ReadRows_XlsxWithGapRow_KeepsRowPositionsAndReturnsNumbersAsDouble()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Workbook(book =>
          {
              var sheet = book.AddWorksheet("Artikel");
              sheet.Cell(1, 1).Value = "Nr";
              sheet.Cell(2, 1).Value = 3001;
              sheet.Cell(2, 2).Value = "Jacke";
              sheet.Cell(4, 1).Value = 3002;
          });

          // Act
          var rows = sut.ReadRows(stream, "artikel.xlsx");

          // Assert
          Assert.Equal(4, rows.Count);
          Assert.Equal(3001d, rows[1][0]);
          Assert.Equal("Jacke", rows[1][1]);
          Assert.Equal(3002d, rows[3][0]);
      }

      [Fact]
      public void ReadRows_XlsxWithGapRow_ReturnsNullCellsForGapRow()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Workbook(book =>
          {
              var sheet = book.AddWorksheet("Artikel");
              sheet.Cell(1, 1).Value = "Nr";
              sheet.Cell(4, 1).Value = 3002;
          });

          // Act
          var rows = sut.ReadRows(stream, "artikel.xlsx");

          // Assert
          Assert.All(rows[2], cell => Assert.Null(cell));
      }

      [Fact]
      public void ReadRows_XlsxWithTwoSheets_ReadsOnlyFirstSheet()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Workbook(book =>
          {
              book.AddWorksheet("Erstes").Cell(1, 1).Value = "Nr";
              book.AddWorksheet("Zweites").Cell(1, 1).Value = "nie gelesen";
          });

          // Act
          var rows = sut.ReadRows(stream, "artikel.xlsx");

          // Assert
          Assert.Single(rows);
      }

      [Fact]
      public void ReadRows_XlsxCorruptContent_ThrowsUnreadableFile()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Utf8("das ist keine Tabelle");

          // Act & Assert
          var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.xlsx"));
          Assert.Equal("import.unreadable_file", exception.ErrorCode);
      }

      [Fact]
      public void ReadRows_XlsCorruptContent_ThrowsUnreadableFile()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Utf8("das ist keine Tabelle");

          // Act & Assert
          var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.xls"));
          Assert.Equal("import.unreadable_file", exception.ErrorCode);
      }

      [Fact]
      public void ReadRows_XlsxWithMoreRowsThanLimit_ThrowsUnreadableFile()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Workbook(book =>
          {
              var sheet = book.AddWorksheet("Artikel");
              sheet.Cell(1, 1).Value = "Nr";
              sheet.Cell(ArticleTableReader.MaxRows + 1, 1).Value = 3001;
          });

          // Act & Assert
          var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.xlsx"));
          Assert.Equal("import.unreadable_file", exception.ErrorCode);
      }

      [Fact]
      public void ReadRows_PdfExtension_ThrowsInvalidFileType()
      {
          // Arrange
          var sut = new ArticleTableReader();
          using var stream = Utf8("%PDF");

          // Act & Assert
          var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.pdf"));
          Assert.Equal("import.invalid_file_type", exception.ErrorCode);
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*ArticleTableReaderTests"` — erwartet: FAIL (Compile-Fehler: `ArticleTableReader` und `Bazaar.Infrastructure.Files` existieren nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `Bazaar.Domain/Ports/IArticleTableReader.cs`:
  ```csharp
  namespace Bazaar.Domain.Ports;

  /// <summary>
  /// Liest die Zeilen der ersten Tabelle einer Artikel-Importdatei (.xlsx, .xls oder .csv).
  /// Der Rückgabewert enthält jede Zeile der Datei in Dateireihenfolge, auch leere Zeilen,
  /// sodass „Index + 1" die Zeilennummer in der Datei ist (Zeile 1 = Kopfzeile).
  /// Zellwerte sind <see cref="string"/>, <see cref="double"/> (numerische Excel-Zelle) oder
  /// <c>null</c> (leere Zelle). Wirft <c>BadRequestException</c> mit <c>import.invalid_file_type</c>
  /// (Endung nicht erlaubt) oder <c>import.unreadable_file</c> (Datei nicht lesbar).
  /// </summary>
  public interface IArticleTableReader
  {
      IReadOnlyList<IReadOnlyList<object?>> ReadRows(Stream content, string fileName);
  }
  ```
  `Bazaar.Infrastructure/Files/CsvRowParser.cs`:
  ```csharp
  using System.Text;

  namespace Bazaar.Infrastructure.Files;

  /// <summary>
  /// Zerlegt CSV-Text in Zeilen und Zellen. Leere Zeilen bleiben als Zeile ohne Zellen erhalten
  /// (Zeilennummern der Datei bleiben stimmig); leere Felder werden zu <c>null</c>.
  /// Felder in Anführungszeichen dürfen Trennzeichen und Zeilenumbrüche enthalten, <c>""</c> ist ein Anführungszeichen.
  /// </summary>
  internal static class CsvRowParser
  {
      public static IReadOnlyList<IReadOnlyList<object?>> Parse(string text, char separator)
      {
          var state = new ParserState();
          for (var index = 0; index < text.Length; index++)
          {
              index = Consume(text, index, separator, state);
          }

          state.FinishInput();
          return state.Rows;
      }

      private static int Consume(string text, int index, char separator, ParserState state)
      {
          var character = text[index];
          if (state.InQuotes) return ConsumeQuoted(text, index, state);
          if (character == '"') return StartQuotes(index, state);
          if (character == separator) return EndField(index, state);
          if (character == '\r' || character == '\n') return ConsumeLineBreak(text, index, state);

          state.Append(character);
          return index;
      }

      private static int StartQuotes(int index, ParserState state)
      {
          state.InQuotes = true;
          state.RowTouched = true;
          return index;
      }

      private static int EndField(int index, ParserState state)
      {
          state.EndField();
          return index;
      }

      private static int ConsumeQuoted(string text, int index, ParserState state)
      {
          var character = text[index];
          if (character != '"')
          {
              state.Append(character);
              return index;
          }

          var escapedQuote = index + 1 < text.Length && text[index + 1] == '"';
          if (escapedQuote)
          {
              state.Append('"');
              return index + 1;
          }

          state.InQuotes = false;
          return index;
      }

      private static int ConsumeLineBreak(string text, int index, ParserState state)
      {
          state.EndRow();
          var windowsLineBreak = text[index] == '\r' && index + 1 < text.Length && text[index + 1] == '\n';
          return windowsLineBreak ? index + 1 : index;
      }

      private sealed class ParserState
      {
          private readonly List<object?> _cells = [];
          private readonly StringBuilder _field = new();

          public List<IReadOnlyList<object?>> Rows { get; } = [];

          public bool InQuotes { get; set; }

          public bool RowTouched { get; set; }

          public void Append(char character)
          {
              _field.Append(character);
              RowTouched = true;
          }

          public void EndField()
          {
              _cells.Add(_field.Length == 0 ? null : _field.ToString());
              _field.Clear();
              RowTouched = true;
          }

          public void EndRow()
          {
              if (RowTouched) EndField();

              Rows.Add(_cells.ToArray());
              _cells.Clear();
              RowTouched = false;
          }

          /// <summary>Textende ohne abschließenden Zeilenumbruch: die letzte Zeile gilt noch; ein Umbruch am Ende erzeugt keine Leerzeile.</summary>
          public void FinishInput()
          {
              if (RowTouched) EndRow();
          }
      }
  }
  ```

  `Bazaar.Infrastructure/Files/ArticleTableReader.cs`:
  ```csharp
  using System.Globalization;
  using System.Text;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;
  using ExcelDataReader;

  namespace Bazaar.Infrastructure.Files;

  public sealed class ArticleTableReader : IArticleTableReader
  {
      /// <summary>
      /// Obergrenze für gelesene Zeilen einer XLSX/XLS (inklusive Kopf- und Leerzeilen). Die 2-MB-Grenze gilt nur
      /// für die gepackte Datei; eine stark komprimierte Mappe oder eine bis Zeile 1.048.576 formatierte Spalte
      /// würde sonst Millionen Zeilen in den Speicher legen. 100.000 liegt weit über jeder realen Verkäuferliste
      /// und über der Datenzeilen-Grenze des Handlers (20.000), sodass reguläre Dateien dort mit einer
      /// verständlichen Meldung scheitern; der Leser fängt nur aufgeblähte Mappen ab.
      /// </summary>
      public const int MaxRows = 100_000;

      private const char CsvSeparator = ';';

      static ArticleTableReader()
      {
          // .xls (BIFF) speichert Text teils in Windows-Codepages; .NET kennt sie erst nach der Registrierung.
          Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
      }

      public IReadOnlyList<IReadOnlyList<object?>> ReadRows(Stream content, string fileName)
      {
          var extension = Path.GetExtension(fileName).ToLowerInvariant();
          return extension switch
          {
              ".csv" => ReadCsv(content),
              ".xlsx" => ReadWorkbook(content, stream => ExcelReaderFactory.CreateOpenXmlReader(stream)),
              ".xls" => ReadWorkbook(content, stream => ExcelReaderFactory.CreateBinaryReader(stream)),
              _ => throw new BadRequestException(
                  "Es sind nur Dateien im Format XLSX, XLS oder CSV erlaubt",
                  "import.invalid_file_type"),
          };
      }

      private static IReadOnlyList<IReadOnlyList<object?>> ReadCsv(Stream content)
      {
          using var buffer = new MemoryStream();
          content.CopyTo(buffer);
          return CsvRowParser.Parse(DecodeText(buffer.ToArray()), CsvSeparator);
      }

      private static string DecodeText(byte[] bytes)
      {
          try
          {
              return new UTF8Encoding(encoderShouldEmitUTF8Identifier: false, throwOnInvalidBytes: true)
                  .GetString(bytes)
                  .TrimStart('﻿');
          }
          catch (DecoderFallbackException)
          {
              // Excel speichert „CSV (Trennzeichen-getrennt)" unter Windows in einer ANSI-Codepage.
              return Encoding.Latin1.GetString(bytes);
          }
      }

      private static IReadOnlyList<IReadOnlyList<object?>> ReadWorkbook(
          Stream content,
          Func<Stream, IExcelDataReader> createReader)
      {
          try
          {
              using var buffer = new MemoryStream();
              content.CopyTo(buffer);
              buffer.Position = 0;

              using var reader = createReader(buffer);
              return ReadFirstSheet(reader);
          }
          catch (Exception exception) when (exception is not DomainException)
          {
              // Die Bibliothek wirft je nach Beschädigung verschiedene Typen (Header-, Zip-, XML-Fehler).
              throw new BadRequestException("Die Datei konnte nicht gelesen werden", "import.unreadable_file");
          }
      }

      private static List<IReadOnlyList<object?>> ReadFirstSheet(IExcelDataReader reader)
      {
          var rows = new List<IReadOnlyList<object?>>();
          while (reader.Read())
          {
              EnsureBelowRowLimit(rows.Count);
              rows.Add(ReadCurrentRow(reader));
          }

          return rows;
      }

      private static void EnsureBelowRowLimit(int rowsRead)
      {
          if (rowsRead < MaxRows) return;

          throw new BadRequestException(
              "Die Datei konnte nicht gelesen werden (mehr als 100.000 Zeilen)",
              "import.unreadable_file");
      }

      private static object?[] ReadCurrentRow(IExcelDataReader reader)
      {
          var cells = new object?[reader.FieldCount];
          for (var column = 0; column < cells.Length; column++)
          {
              cells[column] = NormalizeCell(reader.GetValue(column));
          }

          return cells;
      }

      private static object? NormalizeCell(object? value) => value switch
      {
          null or DBNull => null,
          string or double => value,
          _ => Convert.ToString(value, CultureInfo.InvariantCulture),
      };
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter-class "*ArticleTableReaderTests"` — erwartet: PASS aller zwölf Tests; ein Befund zu `ReadRows_XlsxWithGapRow_*` (Leerzeilen fehlen im Ergebnis) ist ein Plan-Befund und wird gemeldet, nicht umgangen.
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/backend/Bazaar.Domain/Ports/IArticleTableReader.cs src/bazaar-app/backend/Bazaar.Infrastructure/Files src/bazaar-app/backend/Bazaar.Infrastructure/Bazaar.Infrastructure.csproj src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Bazaar.Infrastructure.UnitTests.csproj src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Files` · `git commit -m "feat(article-import): Tabellen-Leser für XLSX, XLS und CSV"`

---

### Task 3: Zeilenprüfung (Parser)

**ACs:** AC-11, AC-12, AC-14, AC-15, AC-16, AC-17, AC-18, AC-20, AC-21

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Application/ArticleImport/ParsedArticleTable.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/ArticleImport/ArticleTableParser.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/ArticleImport/ArticleTableParserTests.cs`

**Interfaces:**
- Consumes: Zeilen im Format von `IArticleTableReader.ReadRows` (`IReadOnlyList<IReadOnlyList<object?>>`, Zeile 1 = Kopfzeile).
- Produces (Namespace `Bazaar.Application.ArticleImport`):
  - `public sealed record ImportArticleLine(int RowNumber, int Number, string Name, string Category, string Brand, string? Size, int Price)`
  - `public sealed record ImportRowError(int RowNumber, string? ArticleNumber, string Reason)`
  - `public sealed record NumberedRow(int RowNumber, int Number)` — Zeile mit gültiger, erstmals vorkommender Artikelnummer (auch wenn andere Felder der Zeile fehlerhaft sind)
  - `public sealed record ParsedArticleTable(IReadOnlyList<ImportArticleLine> Lines, IReadOnlyList<ImportRowError> Errors, IReadOnlyList<NumberedRow> NumberedRows)`
  - `public static ParsedArticleTable ArticleTableParser.Parse(IReadOnlyList<IReadOnlyList<object?>> rows, CultureInfo culture)`
  - Fehlergründe (wörtlich): `Pflichtfeld „<Name>" fehlt` (Namen: Artikelnummer, Bezeichnung, Kategorie, Marke, Preis), `Artikelnummer ist keine Ganzzahl`, `Artikelnummer muss größer als 0 sein`, `Artikelnummer kommt in der Datei doppelt vor`, `Preis muss eine Ganzzahl größer als 0 sein`.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `tests/Bazaar.Application.UnitTests/ArticleImport/ArticleTableParserTests.cs`:
  ```csharp
  using System.Globalization;
  using Bazaar.Application.ArticleImport;

  namespace Bazaar.Application.UnitTests.ArticleImport;

  public class ArticleTableParserTests
  {
      private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");
      private static readonly object?[] Header = Row("Nr", "Bezeichnung", "Kategorie", "Marke", "Größe", "Preis");

      private static object?[] Row(params object?[] cells) => cells;

      private static object?[] Valid(string number) =>
          Row(number, "Jacke", "Ski Jacke", "Icepeak", "128", "25");

      private static IReadOnlyList<IReadOnlyList<object?>> Table(params object?[][] rows) => rows;

      [Fact]
      public void Parse_HeaderAndThreeValidRows_ReturnsThreeLinesWithoutErrors()
      {
          // Arrange
          var rows = Table(
              Header,
              Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "25"),
              Row("3002", "Hose", "Skihose", "Killtec", "134", "30"),
              Row("3003", "Helm", "Helm", "Uvex", null, "40"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Empty(result.Errors);
          Assert.Equal(new[] { 3001, 3002, 3003 }, result.Lines.Select(line => line.Number).ToArray());
      }

      [Fact]
      public void Parse_ValidRow_MapsColumnsInFixedOrderWithFileRowNumber()
      {
          // Arrange
          var rows = Table(Header, Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "25"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", "128", 25), result.Lines[0]);
      }

      [Fact]
      public void Parse_OtherHeaderLabelsAndSeventhColumn_MapsFirstSixColumnsByOrder()
      {
          // Arrange
          var rows = Table(
              Row("Nummer", "Titel", "Typ", "Hersteller", "Maß", "VK", "min. Preis"),
              Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "25", "20"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", "128", 25), result.Lines.Single());
      }

      [Fact]
      public void Parse_RowsWithOnlyNumberOrNoContent_SkipsThemWithoutMessage()
      {
          // Arrange
          var rows = Table(
              Header,
              Valid("3001"),
              Row("3002", null, null, null, null, null),
              Row("3003"),
              Row(),
              Row(null, null, null, null, null, null),
              Valid("3004"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Empty(result.Errors);
          Assert.Equal(new[] { 3001, 3004 }, result.Lines.Select(line => line.Number).ToArray());
      }

      [Fact]
      public void Parse_RowWithoutName_ReportsFileRowAndMissingField()
      {
          // Arrange
          var rows = Table(
              Header,
              Valid("3001"),
              Valid("3002"),
              Row("3003", null, "Ski Jacke", "Icepeak", "128", "25"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          var error = Assert.Single(result.Errors);
          Assert.Equal(4, error.RowNumber);
          Assert.Equal("3003", error.ArticleNumber);
          Assert.Contains("Bezeichnung", error.Reason);
      }

      [Fact]
      public void Parse_RowWithMissingFieldAmongValidRows_ReturnsOnlyValidRowsAsLines()
      {
          // Arrange
          var rows = Table(
              Header,
              Valid("3001"),
              Row("3002", null, "Ski Jacke", "Icepeak", "128", "25"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Equal(new[] { 3001 }, result.Lines.Select(line => line.Number).ToArray());
      }

      [Fact]
      public void Parse_NonIntegerArticleNumber_ReportsRowAndReason()
      {
          // Arrange
          var rows = Table(Header, Valid("3001"), Valid("A12"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          var error = Assert.Single(result.Errors);
          Assert.Equal(3, error.RowNumber);
          Assert.Equal("Artikelnummer ist keine Ganzzahl", error.Reason);
      }

      [Theory]
      [InlineData("0")]
      [InlineData("-3")]
      public void Parse_ArticleNumberNotGreaterThanZero_ReportsRowAndReason(string number)
      {
          // Arrange
          var rows = Table(Header, Valid("3001"), Valid("3002"), Valid("3003"), Valid(number));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          var error = Assert.Single(result.Errors);
          Assert.Equal(5, error.RowNumber);
          Assert.Equal("Artikelnummer muss größer als 0 sein", error.Reason);
      }

      [Fact]
      public void Parse_NumberRepeatedInFile_ReportsLaterRowAsDuplicate()
      {
          // Arrange
          var rows = new List<object?[]> { Header, Valid("3000"), Valid("3001") };
          for (var offset = 0; offset < 5; offset++)
          {
              rows.Add(Valid((3100 + offset).ToString(CultureInfo.InvariantCulture)));
          }

          rows.Add(Valid("3001"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          var error = Assert.Single(result.Errors);
          Assert.Equal(9, error.RowNumber);
          Assert.Equal("Artikelnummer kommt in der Datei doppelt vor", error.Reason);
      }

      [Theory]
      [InlineData("199,95")]
      [InlineData("0")]
      [InlineData("-5")]
      public void Parse_PriceNotWholeNumberGreaterThanZero_ReportsRowAndReason(string price)
      {
          // Arrange
          var rows = Table(
              Header,
              Valid("3001"),
              Valid("3002"),
              Row("3003", "Jacke", "Ski Jacke", "Icepeak", "128", price));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          var error = Assert.Single(result.Errors);
          Assert.Equal(4, error.RowNumber);
          Assert.Equal("Preis muss eine Ganzzahl größer als 0 sein", error.Reason);
      }

      [Theory]
      [InlineData("de-DE", "199,00")]
      [InlineData("en-US", "199.00")]
      public void Parse_PriceWithZeroDecimalsInBrowserLanguageFormat_AcceptsWholePrice(string locale, string price)
      {
          // Arrange
          var rows = Table(Header, Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", price));

          // Act
          var result = ArticleTableParser.Parse(rows, CultureInfo.GetCultureInfo(locale));

          // Assert
          Assert.Equal(199, result.Lines.Single().Price);
      }

      [Fact]
      public void Parse_NumericCellsFromWorkbook_AcceptsNumbersAsText()
      {
          // Arrange
          var rows = Table(Header, Row(3001.0, "Jacke", "Ski Jacke", "Icepeak", 128.0, 25.0));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", "128", 25), result.Lines.Single());
      }

      [Fact]
      public void Parse_ValuesWithSurroundingSpaces_TrimsValues()
      {
          // Arrange
          var rows = Table(Header, Row(" 3001 ", " Jacke ", " Ski Jacke", " Icepeak ", null, " 25 "));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", null, 25), result.Lines.Single());
      }

      [Fact]
      public void Parse_RowWithValidNumberButInvalidPrice_ListsNumberInNumberedRows()
      {
          // Arrange
          var rows = Table(Header, Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "0"));

          // Act
          var result = ArticleTableParser.Parse(rows, German);

          // Assert
          Assert.Equal(new NumberedRow(2, 3001), result.NumberedRows.Single());
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*ArticleTableParserTests"` — erwartet: FAIL (Compile-Fehler: `ArticleTableParser`, `ImportArticleLine`, `NumberedRow` existieren nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `Bazaar.Application/ArticleImport/ParsedArticleTable.cs`:
  ```csharp
  namespace Bazaar.Application.ArticleImport;

  public sealed record ImportArticleLine(
      int RowNumber,
      int Number,
      string Name,
      string Category,
      string Brand,
      string? Size,
      int Price);

  public sealed record ImportRowError(int RowNumber, string? ArticleNumber, string Reason);

  public sealed record NumberedRow(int RowNumber, int Number);

  public sealed record ParsedArticleTable(
      IReadOnlyList<ImportArticleLine> Lines,
      IReadOnlyList<ImportRowError> Errors,
      IReadOnlyList<NumberedRow> NumberedRows);
  ```
  `Bazaar.Application/ArticleImport/ArticleTableParser.cs`:
  ```csharp
  using System.Globalization;

  namespace Bazaar.Application.ArticleImport;

  /// <summary>
  /// Prüft die Zeilen einer Artikel-Importdatei (Zeile 1 = Kopfzeile, danach ein Artikel je Zeile) gegen die
  /// Soll-Vorgaben der Spec und liefert gültige Zeilen und alle Fehler. Reine Funktion, kein Zugriff auf Ports.
  /// Spalten in fester Reihenfolge: Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Preis.
  /// </summary>
  public static class ArticleTableParser
  {
      private const int NumberColumn = 0;
      private const int NameColumn = 1;
      private const int CategoryColumn = 2;
      private const int BrandColumn = 3;
      private const int SizeColumn = 4;
      private const int PriceColumn = 5;
      private const int ColumnCount = 6;
      private const int FirstDataRowIndex = 1;

      private static readonly (int Column, string Label)[] RequiredColumns =
      [
          (NumberColumn, "Artikelnummer"),
          (NameColumn, "Bezeichnung"),
          (CategoryColumn, "Kategorie"),
          (BrandColumn, "Marke"),
          (PriceColumn, "Preis"),
      ];

      public static ParsedArticleTable Parse(IReadOnlyList<IReadOnlyList<object?>> rows, CultureInfo culture)
      {
          var lines = new List<ImportArticleLine>();
          var errors = new List<ImportRowError>();
          var numberedRows = new List<NumberedRow>();
          var seenNumbers = new HashSet<int>();

          for (var index = FirstDataRowIndex; index < rows.Count; index++)
          {
              var cells = ReadCells(rows[index]);
              if (IsSkippable(cells)) continue;

              var rowNumber = index + 1;
              var result = ParseRow(rowNumber, cells, culture, seenNumbers);
              errors.AddRange(result.Errors);
              if (result.Line is not null) lines.Add(result.Line);
              if (result.Number is { } number) numberedRows.Add(new NumberedRow(rowNumber, number));
          }

          return new ParsedArticleTable(lines, errors, numberedRows);
      }

      private static string?[] ReadCells(IReadOnlyList<object?> row) =>
          Enumerable.Range(0, ColumnCount)
              .Select(column => column < row.Count ? TextOf(row[column]) : null)
              .ToArray();

      private static string? TextOf(object? cell)
      {
          var text = cell switch
          {
              null => null,
              string value => value,
              double number => number.ToString(CultureInfo.InvariantCulture),
              _ => Convert.ToString(cell, CultureInfo.InvariantCulture),
          };

          return string.IsNullOrWhiteSpace(text) ? null : text.Trim();
      }

      /// <summary>
      /// Eine Zeile, die außer der Artikelnummer nur leere Felder hat, gilt als leer — das schließt eine Zeile
      /// ohne jeden Inhalt ein.
      /// </summary>
      private static bool IsSkippable(string?[] cells) => cells.Skip(1).All(cell => cell is null);

      private static RowResult ParseRow(int rowNumber, string?[] cells, CultureInfo culture, HashSet<int> seenNumbers)
      {
          var reasons = MissingFieldReasons(cells);
          var number = ParseNumber(cells[NumberColumn], seenNumbers, reasons);
          var price = ParsePrice(cells[PriceColumn], culture, reasons);

          if (reasons.Count > 0)
          {
              var errors = reasons.Select(reason => new ImportRowError(rowNumber, cells[NumberColumn], reason)).ToList();
              return new RowResult(null, errors, number);
          }

          var line = new ImportArticleLine(
              rowNumber,
              number!.Value,
              cells[NameColumn]!,
              cells[CategoryColumn]!,
              cells[BrandColumn]!,
              cells[SizeColumn],
              price!.Value);
          return new RowResult(line, [], number);
      }

      private static List<string> MissingFieldReasons(string?[] cells) =>
          RequiredColumns
              .Where(required => cells[required.Column] is null)
              .Select(required => $"Pflichtfeld „{required.Label}“ fehlt")
              .ToList();

      private static int? ParseNumber(string? text, HashSet<int> seenNumbers, List<string> reasons)
      {
          if (text is null) return null;

          if (!int.TryParse(text, NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var number))
          {
              reasons.Add("Artikelnummer ist keine Ganzzahl");
              return null;
          }

          if (number <= 0)
          {
              reasons.Add("Artikelnummer muss größer als 0 sein");
              return null;
          }

          if (!seenNumbers.Add(number))
          {
              reasons.Add("Artikelnummer kommt in der Datei doppelt vor");
              return null;
          }

          return number;
      }

      private static int? ParsePrice(string? text, CultureInfo culture, List<string> reasons)
      {
          if (text is null) return null;

          var isWholePrice = decimal.TryParse(text, NumberStyles.AllowDecimalPoint, culture, out var price)
              && price == decimal.Truncate(price)
              && price > 0
              && price <= int.MaxValue;
          if (!isWholePrice)
          {
              reasons.Add("Preis muss eine Ganzzahl größer als 0 sein");
              return null;
          }

          return (int)price;
      }

      private sealed record RowResult(ImportArticleLine? Line, IReadOnlyList<ImportRowError> Errors, int? Number);
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-class "*ArticleTableParserTests"` — erwartet: PASS aller Tests der Klasse
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/backend/Bazaar.Application/ArticleImport src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/ArticleImport` · `git commit -m "feat(article-import): Zeilenprüfung für Artikel-Importdateien"`

---

### Task 4: Fehlertext und Import-Handler

**ACs:** AC-11, AC-19, AC-22, AC-23, AC-24, AC-27, AC-30

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Application/ArticleImport/ArticleImportErrorMessage.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/ArticleImport/ImportSellerArticlesHandler.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/ArticleImport/ImportSellerArticlesResult.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs` · `builder.Services.AddScoped<RunImportHandler>();`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/ArticleImport/ArticleImportErrorMessageTests.cs`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/ArticleImport/ImportSellerArticlesHandlerTests.cs`

**Interfaces:**
- Consumes: `ArticleTableParser.Parse`, `ImportArticleLine`, `ImportRowError`, `NumberedRow`, `ParsedArticleTable` (Task 3); `IArticleTableReader.ReadRows` (Task 2); `IArticleRepository.GetByNumbers(numbers, cancellationToken)` (Task 1), `IArticleRepository.Add` (bestehend, ohne Token); `ISellerRepository.GetById`; `IBrandRepository.GetAll/Add`; `ICategoryRepository.GetAll/Add`; `IIdGenerator.Generate()`; `IUnitOfWork.ExecuteInTransactionAsync`; `Article.Create(id, number, sellerId, name, brand, category, price, size, color, description, createdAt, updatedAt)`; `Brand.Create(id, name, original)`; `Category.Create(id, name, original)`.
- Produces (Namespace `Bazaar.Application.ArticleImport`):
  - `public static string ArticleImportErrorMessage.Format(IReadOnlyList<ImportRowError> errors)` — höchstens 10 Zeilen `Zeile <n>, Artikelnummer <x>: <Grund>` (ohne Artikelnummer: `Zeile <n>: <Grund>`), durch `\n` getrennt, danach `und <k> weitere`.
  - `public sealed record ImportSellerArticlesResult(int ImportedCount)`
  - `public sealed class ImportSellerArticlesHandler(ISellerRepository, IArticleRepository, IBrandRepository, ICategoryRepository, IArticleTableReader, IIdGenerator, IUnitOfWork)` mit `Task<ImportSellerArticlesResult> Handle(string sellerId, Stream content, string fileName, string? locale, CancellationToken cancellationToken)`. Wirft `NotFoundException("seller.not_found")`; `ConflictException("Verkäufer ist bereits abgerechnet", "settlement.locked")`, wenn `Seller.SettledAt` gesetzt ist (wie `UpdateArticleHandler`/`ReturnArticleHandler`), jeweils vor dem Lesen der Datei; `BadRequestException` mit `import.invalid_rows` (Message = `ArticleImportErrorMessage.Format(...)`, `Extensions["errorCount"]` = Gesamtzahl der Fehler) oder `import.no_articles` (Message `Datei enthält keine Artikel`) oder `import.too_many_rows` (Message `Die Datei enthält mehr als 20.000 Zeilen nach der Kopfzeile`, wenn die gelesenen Zeilen ohne Kopfzeile `ImportSellerArticlesHandler.MaxDataRows` = 20.000 übersteigen; geprüft vor dem Zeilenprüfen und vor der Transaktion); Reader-Exceptions laufen unverändert durch. Der `CancellationToken` geht an `ExecuteInTransactionAsync` und `GetByNumbers`; vor jedem `Add` prüft `SaveLines` den Token (`ThrowIfCancellationRequested`), sodass ein Client-Abbruch die Transaktion mit `OperationCanceledException` zurückrollt. Datei lesen und Zeilen prüfen laufen vor der Transaktion; `GetByNumbers` (vergebene Nummern), die Fehlerentscheidung und alle `Add`-Aufrufe laufen gemeinsam in einem `IUnitOfWork.ExecuteInTransactionAsync`-Block (Muster `IntakeHandler`).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  `ArticleImportErrorMessageTests.cs`:
  ```csharp
  using Bazaar.Application.ArticleImport;

  namespace Bazaar.Application.UnitTests.ArticleImport;

  public class ArticleImportErrorMessageTests
  {
      private static List<ImportRowError> Errors(int count) =>
          Enumerable.Range(0, count)
              .Select(index => new ImportRowError(index + 2, (3000 + index).ToString(), "Preis muss eine Ganzzahl größer als 0 sein"))
              .ToList();

      [Fact]
      public void Format_TwelveErrors_ListsTenAndRemainder()
      {
          // Arrange
          var errors = Errors(12);

          // Act
          var lines = ArticleImportErrorMessage.Format(errors).Split('\n');

          // Assert
          Assert.Equal(11, lines.Length);
          Assert.Equal("und 2 weitere", lines[^1]);
      }

      [Fact]
      public void Format_ErrorWithArticleNumber_ContainsRowNumberArticleNumberAndReason()
      {
          // Arrange
          var errors = Errors(1);

          // Act
          var message = ArticleImportErrorMessage.Format(errors);

          // Assert
          Assert.Equal("Zeile 2, Artikelnummer 3000: Preis muss eine Ganzzahl größer als 0 sein", message);
      }

      [Fact]
      public void Format_ErrorWithoutArticleNumber_OmitsArticleNumber()
      {
          // Arrange
          var errors = new List<ImportRowError> { new(4, null, "Pflichtfeld „Artikelnummer“ fehlt") };

          // Act
          var message = ArticleImportErrorMessage.Format(errors);

          // Assert
          Assert.Equal("Zeile 4: Pflichtfeld „Artikelnummer“ fehlt", message);
      }

      [Fact]
      public void Format_TenErrors_HasNoRemainderLine()
      {
          // Arrange
          var errors = Errors(10);

          // Act
          var lines = ArticleImportErrorMessage.Format(errors).Split('\n');

          // Assert
          Assert.Equal(10, lines.Length);
      }
  }
  ```
  `ImportSellerArticlesHandlerTests.cs`:
  ```csharp
  using Bazaar.Application.ArticleImport;
  using Bazaar.Domain.Articles;
  using Bazaar.Domain.Brands;
  using Bazaar.Domain.Categories;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;
  using Bazaar.Domain.Sellers;
  using Moq;

  namespace Bazaar.Application.UnitTests.ArticleImport;

  public class ImportSellerArticlesHandlerTests
  {
      private const string SellerId = "SELLER001";
      private const string OtherSellerId = "SELLER002";

      private static readonly object?[] Header = ["Nr", "Bezeichnung", "Kategorie", "Marke", "Größe", "Preis"];

      private readonly Mock<ISellerRepository> _sellerRepository = new();
      private readonly Mock<IArticleRepository> _articleRepository = new();
      private readonly Mock<IBrandRepository> _brandRepository = new();
      private readonly Mock<ICategoryRepository> _categoryRepository = new();
      private readonly Mock<IArticleTableReader> _tableReader = new();
      private readonly Mock<IIdGenerator> _idGenerator = new();
      private readonly Mock<IUnitOfWork> _unitOfWork = new();
      private int _idCounter;

      public ImportSellerArticlesHandlerTests()
      {
          _unitOfWork
              .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
              .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
          _idGenerator.Setup(g => g.Generate()).Returns(() => $"ID{++_idCounter:000}");
          _sellerRepository.Setup(r => r.GetById(SellerId)).ReturnsAsync(CreateSeller(SellerId, "Anna", "Meier"));
          _sellerRepository.Setup(r => r.GetById(OtherSellerId)).ReturnsAsync(CreateSeller(OtherSellerId, "Bernd", "Kraus"));
          _articleRepository.Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Article>());
          _brandRepository.Setup(r => r.GetAll()).ReturnsAsync(Array.Empty<Brand>());
          _categoryRepository.Setup(r => r.GetAll()).ReturnsAsync(Array.Empty<Category>());
      }

      private static Seller CreateSeller(string id, string firstName, string lastName) =>
          Seller.Create(id, firstName, lastName, null, null, null, null, "mail@example.org", "SELLERTYPE001", 10m, 3m);

      private static Article CreateArticle(int number, string sellerId)
      {
          var now = DateTimeOffset.UtcNow;
          return Article.Create($"ART{number}", number, sellerId, "Mütze", "Nike", "Mützen", 5m, null, null, null, now, now);
      }

      private static object?[] Valid(int number, string category = "Ski Jacke", string brand = "Icepeak") =>
          [number.ToString(), "Jacke", category, brand, "128", "25"];

      private void SetupRows(params object?[][] rows) =>
          _tableReader
              .Setup(r => r.ReadRows(It.IsAny<Stream>(), It.IsAny<string>()))
              .Returns(rows);

      private ImportSellerArticlesHandler CreateSut() => new(
          _sellerRepository.Object,
          _articleRepository.Object,
          _brandRepository.Object,
          _categoryRepository.Object,
          _tableReader.Object,
          _idGenerator.Object,
          _unitOfWork.Object);

      private static Task<ImportSellerArticlesResult> Run(ImportSellerArticlesHandler sut, string? locale = "de-DE") =>
          sut.Handle(SellerId, Stream.Null, "artikel.csv", locale, CancellationToken.None);

      [Fact]
      public async Task Handle_ThreeValidRows_CreatesRegisteredArticlesForTileSeller()
      {
          // Arrange
          SetupRows(Header, Valid(3001), Valid(3002), Valid(3003));
          var sut = CreateSut();

          // Act
          var result = await Run(sut);

          // Assert
          Assert.Equal(3, result.ImportedCount);
          _articleRepository.Verify(
              r => r.Add(It.Is<Article>(a => a.SellerId == SellerId
                  && a.Status == ArticleStatus.Registered
                  && a.Name == "Jacke"
                  && a.Size == "128"
                  && a.Price == 25m)),
              Times.Exactly(3));
      }

      [Fact]
      public async Task Handle_NumberOwnedByOtherSeller_ThrowsWithRowNumberAndOwnerName()
      {
          // Arrange
          SetupRows(Header, Valid(3101), Valid(3102), Valid(3103), Valid(3104), Valid(3001));
          _articleRepository
              .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
              .ReturnsAsync(new[] { CreateArticle(3001, OtherSellerId) });
          var sut = CreateSut();

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
          Assert.Equal("import.invalid_rows", exception.ErrorCode);
          Assert.Contains("Zeile 6, Artikelnummer 3001", exception.Message);
          Assert.Contains("Bernd Kraus", exception.Message);
      }

      [Fact]
      public async Task Handle_NumberOwnedByTileSeller_ThrowsAndOverwritesNothing()
      {
          // Arrange
          SetupRows(Header, Valid(3001));
          _articleRepository
              .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
              .ReturnsAsync(new[] { CreateArticle(3001, SellerId) });
          var sut = CreateSut();

          // Act
          await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

          // Assert
          _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
          _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
      }

      [Fact]
      public async Task Handle_NumberOwnedByTileSeller_NamesTileSellerInMessage()
      {
          // Arrange
          SetupRows(Header, Valid(3001));
          _articleRepository
              .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
              .ReturnsAsync(new[] { CreateArticle(3001, SellerId) });
          var sut = CreateSut();

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
          Assert.Contains("Anna Meier", exception.Message);
      }

      [Fact]
      public async Task Handle_RowWithMissingField_ThrowsAndSavesNothing()
      {
          // Arrange
          SetupRows(Header, Valid(3001), ["3002", null, "Ski Jacke", "Icepeak", "128", "25"]);
          var sut = CreateSut();

          // Act
          await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

          // Assert
          _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
          _brandRepository.Verify(r => r.Add(It.IsAny<Brand>()), Times.Never);
          _categoryRepository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
      }

      [Fact]
      public async Task Handle_TwelveInvalidRows_ReportsErrorCountInExtensions()
      {
          // Arrange
          var rows = new List<object?[]> { Header };
          rows.AddRange(Enumerable.Range(0, 12).Select(index => new object?[] { (3000 + index).ToString(), "Jacke", "Ski Jacke", "Icepeak", "128", "0" }));
          SetupRows([.. rows]);
          var sut = CreateSut();

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
          Assert.Equal(12, exception.Extensions["errorCount"]);
      }

      [Fact]
      public async Task Handle_UnknownBrandAndCategoryWithSpaces_CreatesThemAsNewTrimmed()
      {
          // Arrange
          SetupRows(Header, ["3001", "Jacke", "Ski Jacke", " Icepeak ", "128", "25"]);
          var sut = CreateSut();

          // Act
          await Run(sut);

          // Assert
          _brandRepository.Verify(r => r.Add(It.Is<Brand>(b => b.Name == "Icepeak" && !b.Original)), Times.Once);
          _categoryRepository.Verify(r => r.Add(It.Is<Category>(c => c.Name == "Ski Jacke" && !c.Original)), Times.Once);
      }

      [Fact]
      public async Task Handle_UnknownBrandAndCategory_ArticleCarriesTheNewNames()
      {
          // Arrange
          SetupRows(Header, ["3001", "Jacke", "Ski Jacke", " Icepeak ", "128", "25"]);
          var sut = CreateSut();

          // Act
          await Run(sut);

          // Assert
          _articleRepository.Verify(
              r => r.Add(It.Is<Article>(a => a.Brand == "Icepeak" && a.Category == "Ski Jacke")),
              Times.Once);
      }

      [Fact]
      public async Task Handle_BrandAndCategoryInOtherCase_ReusesExistingEntries()
      {
          // Arrange
          _brandRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Brand.Create("B1", "Icepeak", original: true) });
          _categoryRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Category.Create("C1", "Ski Jacke", original: true) });
          SetupRows(Header, Valid(3001, category: "ski jacke", brand: "ICEPEAK"));
          var sut = CreateSut();

          // Act
          await Run(sut);

          // Assert
          _articleRepository.Verify(
              r => r.Add(It.Is<Article>(a => a.Brand == "Icepeak" && a.Category == "Ski Jacke")),
              Times.Once);
      }

      [Fact]
      public async Task Handle_BrandAndCategoryInOtherCase_CreatesNoNewEntries()
      {
          // Arrange
          _brandRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Brand.Create("B1", "Icepeak", original: true) });
          _categoryRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Category.Create("C1", "Ski Jacke", original: true) });
          SetupRows(Header, Valid(3001, category: "ski jacke", brand: "ICEPEAK"));
          var sut = CreateSut();

          // Act
          await Run(sut);

          // Assert
          _brandRepository.Verify(r => r.Add(It.IsAny<Brand>()), Times.Never);
          _categoryRepository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
      }

      [Fact]
      public async Task Handle_OnlyHeaderRow_ThrowsNoArticles()
      {
          // Arrange
          SetupRows(Header);
          var sut = CreateSut();

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
          Assert.Equal("import.no_articles", exception.ErrorCode);
      }

      [Fact]
      public async Task Handle_OnlyNumberRowsAndBlankRows_ThrowsNoArticles()
      {
          // Arrange
          SetupRows(Header, ["3001"], [], [null, null, null, null, null, null]);
          var sut = CreateSut();

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
          Assert.Equal("import.no_articles", exception.ErrorCode);
      }

      [Fact]
      public async Task Handle_UnknownSeller_ThrowsNotFoundWithoutReadingFile()
      {
          // Arrange
          _sellerRepository.Setup(r => r.GetById(SellerId)).ReturnsAsync((Seller?)null);
          var sut = CreateSut();

          // Act
          await Assert.ThrowsAsync<NotFoundException>(() => Run(sut));

          // Assert
          _tableReader.Verify(r => r.ReadRows(It.IsAny<Stream>(), It.IsAny<string>()), Times.Never);
      }

      [Fact]
      public async Task Handle_SettledSeller_ThrowsSettlementLockedWithoutReadingFile()
      {
          // Arrange
          var settledSeller = CreateSeller(SellerId, "Anna", "Meier");
          settledSeller.Settle(0m, DateTimeOffset.UtcNow);
          _sellerRepository.Setup(r => r.GetById(SellerId)).ReturnsAsync(settledSeller);
          var sut = CreateSut();

          // Act
          var exception = await Assert.ThrowsAsync<ConflictException>(() => Run(sut));

          // Assert
          Assert.Equal("settlement.locked", exception.ErrorCode);
          _tableReader.Verify(r => r.ReadRows(It.IsAny<Stream>(), It.IsAny<string>()), Times.Never);
      }

      [Fact]
      public async Task Handle_GermanLocaleAndCommaPrice_ImportsWholePrice()
      {
          // Arrange
          SetupRows(Header, ["3001", "Jacke", "Ski Jacke", "Icepeak", "128", "199,00"]);
          var sut = CreateSut();

          // Act
          await Run(sut, locale: "de-DE");

          // Assert
          _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Price == 199m)), Times.Once);
      }

      [Fact]
      public async Task Handle_EnglishLocaleAndDotPrice_ImportsWholePrice()
      {
          // Arrange
          SetupRows(Header, ["3001", "Jacke", "Ski Jacke", "Icepeak", "128", "199.00"]);
          var sut = CreateSut();

          // Act
          await Run(sut, locale: "en-US");

          // Assert
          _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Price == 199m)), Times.Once);
      }

      [Fact]
      public async Task Handle_TakenNumberCheck_RunsInsideTransaction()
      {
          // Arrange
          var inTransaction = false;
          var checkedInTransaction = false;
          _unitOfWork
              .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
              .Returns<Func<CancellationToken, Task>, CancellationToken>(async (action, ct) =>
              {
                  inTransaction = true;
                  await action(ct);
                  inTransaction = false;
              });
          _articleRepository
              .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
              .Callback(() => checkedInTransaction = inTransaction)
              .ReturnsAsync(Array.Empty<Article>());
          SetupRows(Header, Valid(3001));
          var sut = CreateSut();

          // Act
          await Run(sut);

          // Assert
          Assert.True(checkedInTransaction);
      }

      [Fact]
      public async Task Handle_NumberTakenAtCheckInsideTransaction_ThrowsInvalidRowsAndAddsNothing()
      {
          // Arrange
          SetupRows(Header, Valid(3001), Valid(3002));
          _articleRepository
              .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
              .ReturnsAsync(new[] { CreateArticle(3002, OtherSellerId) });
          var sut = CreateSut();

          // Act
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

          // Assert
          Assert.Equal("import.invalid_rows", exception.ErrorCode);
          _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
      }

      [Fact]
      public async Task Handle_MoreDataRowsThanLimit_ThrowsTooManyRowsWithoutTransaction()
      {
          // Arrange
          var rows = new List<object?[]> { Header };
          rows.AddRange(Enumerable.Range(1, ImportSellerArticlesHandler.MaxDataRows + 1).Select(number => Valid(number)));
          SetupRows([.. rows]);
          var sut = CreateSut();

          // Act
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

          // Assert
          Assert.Equal("import.too_many_rows", exception.ErrorCode);
          _unitOfWork.Verify(
              u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()),
              Times.Never);
      }

      [Fact]
      public async Task Handle_ExactlyLimitDataRows_ImportsAllRows()
      {
          // Arrange
          var rows = new List<object?[]> { Header };
          rows.AddRange(Enumerable.Range(1, ImportSellerArticlesHandler.MaxDataRows).Select(number => Valid(number)));
          SetupRows([.. rows]);
          var sut = CreateSut();

          // Act
          var result = await Run(sut);

          // Assert
          Assert.Equal(ImportSellerArticlesHandler.MaxDataRows, result.ImportedCount);
      }

      [Fact]
      public async Task Handle_CancelledDuringSave_StopsAddingAndThrowsCancellation()
      {
          // Arrange
          using var cancellation = new CancellationTokenSource();
          _articleRepository
              .Setup(r => r.Add(It.IsAny<Article>()))
              .Callback(() => cancellation.Cancel())
              .Returns(Task.CompletedTask);
          SetupRows(Header, Valid(3001), Valid(3002), Valid(3003));
          var sut = CreateSut();

          // Act
          await Assert.ThrowsAnyAsync<OperationCanceledException>(
              () => sut.Handle(SellerId, Stream.Null, "artikel.csv", "de-DE", cancellation.Token));

          // Assert
          _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Once);
      }

      [Fact]
      public async Task Handle_TakenNumberCheck_PassesRequestTokenToRepository()
      {
          // Arrange
          using var cancellation = new CancellationTokenSource();
          SetupRows(Header, Valid(3001));
          var sut = CreateSut();

          // Act
          await sut.Handle(SellerId, Stream.Null, "artikel.csv", "de-DE", cancellation.Token);

          // Assert
          _articleRepository.Verify(
              r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), cancellation.Token),
              Times.Once);
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-namespace "*ArticleImport*"` — erwartet: FAIL (Compile-Fehler: `ArticleImportErrorMessage`, `ImportSellerArticlesHandler`, `ImportSellerArticlesResult` existieren nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `ArticleImportErrorMessage.cs`:
  ```csharp
  namespace Bazaar.Application.ArticleImport;

  public static class ArticleImportErrorMessage
  {
      private const int MaxListedErrors = 10;

      public static string Format(IReadOnlyList<ImportRowError> errors)
      {
          var lines = errors.Take(MaxListedErrors).Select(FormatError).ToList();

          var remaining = errors.Count - lines.Count;
          if (remaining > 0) lines.Add($"und {remaining} weitere");

          return string.Join('\n', lines);
      }

      private static string FormatError(ImportRowError error) =>
          error.ArticleNumber is null
              ? $"Zeile {error.RowNumber}: {error.Reason}"
              : $"Zeile {error.RowNumber}, Artikelnummer {error.ArticleNumber}: {error.Reason}";
  }
  ```
  `ImportSellerArticlesResult.cs`:
  ```csharp
  namespace Bazaar.Application.ArticleImport;

  public sealed record ImportSellerArticlesResult(int ImportedCount);
  ```
  `ImportSellerArticlesHandler.cs`:
  ```csharp
  using System.Globalization;
  using Bazaar.Domain.Articles;
  using Bazaar.Domain.Brands;
  using Bazaar.Domain.Categories;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.ArticleImport;

  /// <summary>
  /// Importiert die Zeilen einer Artikel-Datei als Artikel „Registriert" für einen Verkäufer — alles oder nichts:
  /// Datei lesen und Zeilen prüfen außerhalb der Transaktion (das kann bei großen Dateien dauern); die Prüfung auf
  /// vergebene Artikelnummern, die Fehlerentscheidung und das Schreiben laufen gemeinsam in einer Transaktion
  /// (Muster <c>IntakeHandler</c>), damit zwischen Prüfung und Insert kein langes Zeitfenster für eine parallele
  /// Anlage derselben Nummer liegt. Der Import überschreibt nie; jede vergebene Nummer ist ein Fehler.
  /// Restrisiko: Legt ein paralleler Vorgang dieselbe Nummer innerhalb der Transaktion an, verletzt der Insert den
  /// Unique-Index auf <c>Article.Number</c>; die Transaktion rollt zurück (nichts gespeichert), der Admin sieht 500.
  /// </summary>
  public sealed class ImportSellerArticlesHandler(
      ISellerRepository sellerRepository,
      IArticleRepository articleRepository,
      IBrandRepository brandRepository,
      ICategoryRepository categoryRepository,
      IArticleTableReader tableReader,
      IIdGenerator idGenerator,
      IUnitOfWork unitOfWork)
  {
      /// <summary>
      /// Höchstzahl der Zeilen nach der Kopfzeile. Jedes <c>Add</c> speichert im Bestand einzeln; 20.000 Zeilen
      /// liegen weit über jeder realen Verkäuferliste und bleiben innerhalb der 3 Minuten, die Proxy und Frontend
      /// warten. Leerzeilen zählen mit, weil die Grenze vor dem Zeilenprüfen greift.
      /// </summary>
      public const int MaxDataRows = 20_000;

      public async Task<ImportSellerArticlesResult> Handle(
          string sellerId,
          Stream content,
          string fileName,
          string? locale,
          CancellationToken cancellationToken)
      {
          await EnsureSellerOpen(sellerId);

          var rows = tableReader.ReadRows(content, fileName);
          EnsureRowLimit(rows);
          var parsed = ArticleTableParser.Parse(rows, ResolveCulture(locale));

          await unitOfWork.ExecuteInTransactionAsync(async transactionToken =>
          {
              var takenNumberErrors = await FindTakenNumberErrors(parsed.NumberedRows, transactionToken);
              var errors = parsed.Errors.Concat(takenNumberErrors).OrderBy(error => error.RowNumber).ToList();
              ThrowIfInvalid(errors, parsed.Lines);

              await SaveLines(sellerId, parsed.Lines, transactionToken);
          }, cancellationToken);

          return new ImportSellerArticlesResult(parsed.Lines.Count);
      }

      private static void EnsureRowLimit(IReadOnlyList<IReadOnlyList<object?>> rows)
      {
          if (rows.Count - 1 <= MaxDataRows) return;

          throw new BadRequestException(
              "Die Datei enthält mehr als 20.000 Zeilen nach der Kopfzeile",
              "import.too_many_rows");
      }

      /// <summary>
      /// Der Verkäufer muss existieren und darf nicht abgerechnet sein; der deaktivierte Button im Frontend
      /// allein schützt einen direkten API-Aufruf nicht.
      /// </summary>
      private async Task EnsureSellerOpen(string sellerId)
      {
          var seller = await sellerRepository.GetById(sellerId)
              ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

          if (seller.SettledAt is not null)
          {
              throw new ConflictException("Verkäufer ist bereits abgerechnet", "settlement.locked");
          }
      }

      /// <summary>
      /// Die Browser-Sprache bestimmt das Dezimalzeichen; eine unbekannte oder fehlende Sprache liest wie die invariante Kultur.
      /// </summary>
      private static CultureInfo ResolveCulture(string? locale)
      {
          if (string.IsNullOrWhiteSpace(locale)) return CultureInfo.InvariantCulture;

          try
          {
              return CultureInfo.GetCultureInfo(locale);
          }
          catch (CultureNotFoundException)
          {
              return CultureInfo.InvariantCulture;
          }
      }

      private async Task<IReadOnlyList<ImportRowError>> FindTakenNumberErrors(
          IReadOnlyList<NumberedRow> numberedRows,
          CancellationToken cancellationToken)
      {
          var existing = await articleRepository.GetByNumbers(
              numberedRows.Select(row => row.Number).ToList(),
              cancellationToken);
          var ownerNames = await LoadOwnerNames(existing);
          var ownerByNumber = existing.ToDictionary(article => article.Number, article => ownerNames[article.SellerId]);

          return numberedRows
              .Where(row => ownerByNumber.ContainsKey(row.Number))
              .Select(row => new ImportRowError(
                  row.RowNumber,
                  row.Number.ToString(CultureInfo.InvariantCulture),
                  $"Artikelnummer ist bereits vergeben (Verkäufer: {ownerByNumber[row.Number]})"))
              .ToList();
      }

      private async Task<Dictionary<string, string>> LoadOwnerNames(IReadOnlyList<Article> articles)
      {
          var names = new Dictionary<string, string>();
          foreach (var ownerId in articles.Select(article => article.SellerId).Distinct())
          {
              var owner = await sellerRepository.GetById(ownerId);
              names[ownerId] = owner is null ? "unbekannt" : $"{owner.FirstName} {owner.LastName}";
          }

          return names;
      }

      private static void ThrowIfInvalid(IReadOnlyList<ImportRowError> errors, IReadOnlyList<ImportArticleLine> lines)
      {
          if (errors.Count > 0)
          {
              throw new BadRequestException(ArticleImportErrorMessage.Format(errors), "import.invalid_rows")
              {
                  Extensions = { ["errorCount"] = errors.Count },
              };
          }

          if (lines.Count == 0)
          {
              throw new BadRequestException("Datei enthält keine Artikel", "import.no_articles");
          }
      }

      /// <summary>
      /// Schreibt Kategorien, Marken und Artikel; läuft nur innerhalb der Transaktion aus <see cref="Handle"/>.
      /// Die Bestands-Repositories nehmen keinen Token; darum prüft die Schleife ihn vor jedem Artikel, und ein
      /// Client-Abbruch rollt die Transaktion zurück.
      /// </summary>
      private async Task SaveLines(string sellerId, IReadOnlyList<ImportArticleLine> lines, CancellationToken cancellationToken)
      {
          var categories = await EnsureNames(
              (await categoryRepository.GetAll()).Select(category => category.Name),
              lines.Select(line => line.Category),
              name => categoryRepository.Add(Category.Create(idGenerator.Generate(), name, original: false)));
          var brands = await EnsureNames(
              (await brandRepository.GetAll()).Select(brand => brand.Name),
              lines.Select(line => line.Brand),
              name => brandRepository.Add(Brand.Create(idGenerator.Generate(), name, original: false)));

          var now = DateTimeOffset.UtcNow;
          foreach (var line in lines)
          {
              cancellationToken.ThrowIfCancellationRequested();
              var article = Article.Create(
                  idGenerator.Generate(),
                  line.Number,
                  sellerId,
                  line.Name,
                  brands[line.Brand],
                  categories[line.Category],
                  line.Price,
                  line.Size,
                  null,
                  null,
                  now,
                  now);
              await articleRepository.Add(article);
          }
      }

      /// <summary>
      /// Liefert zu jedem gewünschten Namen den vorhandenen Namen (Groß-/Kleinschreibung egal) und legt unbekannte
      /// über <paramref name="createNew"/> an; bei mehreren Schreibweisen in der Datei gewinnt die erste.
      /// </summary>
      private static async Task<Dictionary<string, string>> EnsureNames(
          IEnumerable<string> existingNames,
          IEnumerable<string> wantedNames,
          Func<string, Task> createNew)
      {
          var known = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
          foreach (var name in existingNames)
          {
              known[name] = name;
          }

          foreach (var name in wantedNames)
          {
              if (known.ContainsKey(name)) continue;

              await createNew(name);
              known[name] = name;
          }

          return known;
      }
  }
  ```
  In `Bazaar.Api/Program.cs`: oben bei den Usings (alphabetisch, vor `using Bazaar.Application.Articles;`) `using Bazaar.Application.ArticleImport;` und `using Bazaar.Infrastructure.Files;` (nach `using Bazaar.Infrastructure.Persistence.Repositories;`) ergänzen; nach `builder.Services.AddScoped<IArticleListQuery, ArticleListQuery>();` die Zeile `builder.Services.AddScoped<IArticleTableReader, ArticleTableReader>();`; nach `builder.Services.AddScoped<RunImportHandler>();` die Zeile `builder.Services.AddScoped<ImportSellerArticlesHandler>();`.
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter-namespace "*ArticleImport*"` — erwartet: PASS aller Tests der Namespaces. Danach `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests` — erwartet: PASS `AllApplicationHandlers_AreRegisteredInProgram`
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/backend/Bazaar.Application/ArticleImport src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/ArticleImport` · `git commit -m "feat(article-import): Import-Handler mit Fehlertext für Artikel-Dateien"`

---

### Task 5: Import-Endpoint

**ACs:** AC-09, AC-26

**Dateien:**
- Create: `src/bazaar-app/backend/Bazaar.Api/Features/ArticleImport/ArticleImportEndpoints.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs` · `app.MapImportEndpoints();`
- Create: `src/bazaar-app/backend/tests/Bazaar.Api.UnitTests/Features/ArticleImport/ArticleImportEndpointsTests.cs`

**Interfaces:**
- Consumes: `ImportSellerArticlesHandler.Handle(string sellerId, Stream content, string fileName, string? locale, CancellationToken)` und `ImportSellerArticlesResult.ImportedCount` (Task 4).
- Produces: `POST /api/sellers/{id}/articles/import` (nur Rolle `admin`), multipart-Felder `file` und `locale`; Antwort 200 `{ "importedCount": <int> }`; Fehler als ProblemDetails (`errorCode`, `detail`). `internal static Task<(IFormFile File, string? Locale)> ArticleImportEndpoints.ParseImportRequest(HttpRequest request)`; `internal const long ArticleImportEndpoints.MaxFileBytes = 2 * 1024 * 1024`. Fehler: `import.invalid_format` (kein Multipart oder Datei fehlt/leer), `import.file_too_large` (> 2 MB). Die Multipart-Prüfung ist bewusst getrennt von `ImportEndpoints.ParseRunImportRequest` (Einstellungs-Import): dort ist zusätzlich das JSON-Feld `options` Pflicht und es gibt keine Größenprüfung, hier gilt das Textfeld `locale` (optional) und die 2-MB-Grenze; ein gemeinsamer Helfer müsste beide Varianten per Flag umschalten. Der Fehlercode `import.invalid_format` ist absichtlich gleich, der Text („Es wurde keine Datei übermittelt") datei-spezifisch statt „Datei entspricht nicht dem erwarteten Schema".

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `tests/Bazaar.Api.UnitTests/Features/ArticleImport/ArticleImportEndpointsTests.cs`:
  ```csharp
  using Bazaar.Api.Features.ArticleImport;
  using Bazaar.Domain.Exceptions;
  using Microsoft.AspNetCore.Http;
  using Microsoft.Extensions.Primitives;

  namespace Bazaar.Api.UnitTests.Features.ArticleImport;

  public class ArticleImportEndpointsTests
  {
      private static HttpRequest BuildRequest(IFormFile? file, string? locale, bool multipart = true)
      {
          var files = new FormFileCollection();
          if (file is not null) files.Add(file);

          var fields = new Dictionary<string, StringValues>();
          if (locale is not null) fields["locale"] = locale;

          var httpContext = new DefaultHttpContext();
          if (multipart) httpContext.Request.ContentType = "multipart/form-data; boundary=----irrelevant";
          httpContext.Request.Form = new FormCollection(fields, files);
          return httpContext.Request;
      }

      private static IFormFile BuildFile(long length, string fileName = "artikel.csv") =>
          new FormFile(new MemoryStream(new byte[length]), 0, length, "file", fileName);

      [Fact]
      public async Task ParseImportRequest_FileAndLocale_ReturnsBoth()
      {
          // Arrange
          var request = BuildRequest(BuildFile(10), "de-DE");

          // Act
          var (file, locale) = await ArticleImportEndpoints.ParseImportRequest(request);

          // Assert
          Assert.Equal("artikel.csv", file.FileName);
          Assert.Equal("de-DE", locale);
      }

      [Fact]
      public async Task ParseImportRequest_FileOfExactlyTwoMegabytes_IsAccepted()
      {
          // Arrange
          var request = BuildRequest(BuildFile(ArticleImportEndpoints.MaxFileBytes), "de-DE");

          // Act
          var (file, _) = await ArticleImportEndpoints.ParseImportRequest(request);

          // Assert
          Assert.Equal(ArticleImportEndpoints.MaxFileBytes, file.Length);
      }

      [Fact]
      public async Task ParseImportRequest_FileLargerThanTwoMegabytes_ThrowsFileTooLarge()
      {
          // Arrange
          var request = BuildRequest(BuildFile(ArticleImportEndpoints.MaxFileBytes + 1), "de-DE");

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => ArticleImportEndpoints.ParseImportRequest(request));
          Assert.Equal("import.file_too_large", exception.ErrorCode);
      }

      [Fact]
      public async Task ParseImportRequest_MissingFile_ThrowsInvalidFormat()
      {
          // Arrange
          var request = BuildRequest(null, "de-DE");

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => ArticleImportEndpoints.ParseImportRequest(request));
          Assert.Equal("import.invalid_format", exception.ErrorCode);
      }

      [Fact]
      public async Task ParseImportRequest_NotMultipart_ThrowsInvalidFormat()
      {
          // Arrange
          var request = BuildRequest(BuildFile(10), "de-DE", multipart: false);

          // Act & Assert
          var exception = await Assert.ThrowsAsync<BadRequestException>(() => ArticleImportEndpoints.ParseImportRequest(request));
          Assert.Equal("import.invalid_format", exception.ErrorCode);
      }

      [Fact]
      public async Task ParseImportRequest_MissingLocale_ReturnsEmptyLocale()
      {
          // Arrange
          var request = BuildRequest(BuildFile(10), null);

          // Act
          var (_, locale) = await ArticleImportEndpoints.ParseImportRequest(request);

          // Assert
          Assert.True(string.IsNullOrEmpty(locale));
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Api.UnitTests -- --filter-class "*ArticleImportEndpointsTests"` — erwartet: FAIL (Compile-Fehler: `ArticleImportEndpoints` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `Bazaar.Api/Features/ArticleImport/ArticleImportEndpoints.cs`:
  ```csharp
  using Bazaar.Application.ArticleImport;
  using Bazaar.Domain.Exceptions;

  namespace Bazaar.Api.Features.ArticleImport;

  public static class ArticleImportEndpoints
  {
      internal const long MaxFileBytes = 2 * 1024 * 1024;

      public static IEndpointRouteBuilder MapArticleImportEndpoints(this IEndpointRouteBuilder app)
      {
          // Wie POST /api/import wird der multipart-Body von Hand gelesen: eine Datei plus ein Textfeld
          // ("locale") lassen sich mit einfacher Parameterbindung nicht ausdrücken.
          app.MapPost("/api/sellers/{id}/articles/import", async (
              string id,
              HttpRequest request,
              ImportSellerArticlesHandler handler,
              CancellationToken cancellationToken) =>
          {
              var (file, locale) = await ParseImportRequest(request);

              await using var stream = file.OpenReadStream();
              var result = await handler.Handle(id, stream, file.FileName, locale, cancellationToken);
              return Results.Ok(new ArticleImportResponseDto(result.ImportedCount));
          })
          .RequireAuthorization("admin");

          return app;
      }

      /// <summary>
      /// Liest die multipart-Felder <c>file</c> und <c>locale</c> und prüft Datei und Größe, bevor etwas
      /// verarbeitet wird.
      /// </summary>
      internal static async Task<(IFormFile File, string? Locale)> ParseImportRequest(HttpRequest request)
      {
          if (!request.HasFormContentType)
          {
              throw InvalidFormat();
          }

          var form = await request.ReadFormAsync();
          var file = form.Files["file"];
          if (file is null || file.Length == 0)
          {
              throw InvalidFormat();
          }

          if (file.Length > MaxFileBytes)
          {
              throw new BadRequestException("Die Datei ist größer als 2 MB", "import.file_too_large");
          }

          return (file, form["locale"].ToString());
      }

      private static BadRequestException InvalidFormat() =>
          new("Es wurde keine Datei übermittelt", "import.invalid_format");
  }

  public sealed record ArticleImportResponseDto(int ImportedCount);
  ```
  In `Program.cs`: `using Bazaar.Api.Features.ArticleImport;` vor `using Bazaar.Api.Features.Articles;` ergänzen und nach `app.MapImportEndpoints();` die Zeile `app.MapArticleImportEndpoints();` einfügen.
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Api.UnitTests -- --filter-class "*ArticleImportEndpointsTests"` — erwartet: PASS aller sechs Tests. Danach `dv-dotnet-build --path <R>/src/bazaar-app/backend/Bazaar.slnx` — erwartet: OK ohne Warnungen (Warnungen sind Fehler).
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/backend/Bazaar.Api/Features/ArticleImport src/bazaar-app/backend/Bazaar.Api/Program.cs src/bazaar-app/backend/tests/Bazaar.Api.UnitTests/Features/ArticleImport` · `git commit -m "feat(article-import): Endpoint für den Artikel-Import je Verkäufer"`

---

### Task 6: Proxy auf 2 MB Upload (2100k Body) und 3 Minuten

**ACs:** AC-29

**Dateien:**
- Modify: `nginx/nginx.conf.template` · `location /api/`
- Create: `src/bazaar-app/backend/tests/Bazaar.Architecture.Tests/NginxProxyLimitsTests.cs`

**Interfaces:**
- Consumes: keine.
- Produces: `location /api/` erlaubt Request-Bodies bis 2100k (`client_max_body_size 2100k;` — die Datei darf 2 MB groß sein, multipart-Grenzen, Feldköpfe und das Feld `locale` kommen hinzu; so greift die Größenprüfung in Modal und Endpoint und nicht ein 413 des Proxys) und wartet bis 180 s auf Backend-Antwort; `NginxProxyLimitsTests` (Namespace `Bazaar.Architecture.Tests`) sichert die drei Direktiven in der Test-Suite ab.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  Der Test liegt im bestehenden Projekt `Bazaar.Architecture.Tests` und liest die nginx-Vorlage per Dateipfad — nach demselben Muster wie `ProgramJsonOptionsRegistrationTests` (Aufstieg ab `AppContext.BaseDirectory` bis zur Datei, kein Docker nötig). Datei `src/bazaar-app/backend/tests/Bazaar.Architecture.Tests/NginxProxyLimitsTests.cs` anlegen:
  ```csharp
  using System.IO;
  using System.Text.RegularExpressions;

  namespace Bazaar.Architecture.Tests;

  /// <summary>
  /// Sichert die Proxy-Grenzen für den Artikel-Import ab: Der Block <c>location /api/</c> in
  /// <c>nginx/nginx.conf.template</c> muss Uploads einer 2-MB-Datei samt multipart-Overhead (2100k) und
  /// Antwortzeiten bis 3 Minuten zulassen (nginx-Standard: 1 MB und 60 Sekunden). Quelltext-Scan der echten Vorlage, ohne nginx-Start.
  /// </summary>
  public class NginxProxyLimitsTests
  {
      private static readonly Regex ApiLocationBlock = new(@"location\s+/api/\s*\{(?<body>[^}]*)\}", RegexOptions.Compiled);

      [Theory]
      [InlineData(@"^\s*client_max_body_size\s+2100k;")]
      [InlineData(@"^\s*proxy_read_timeout\s+180s;")]
      [InlineData(@"^\s*proxy_send_timeout\s+180s;")]
      public void ApiLocation_ArticleImportLimits_ContainsDirective(string directivePattern)
      {
          // Arrange
          var apiBlock = ReadApiLocationBlock();

          // Act
          var found = Regex.IsMatch(apiBlock, directivePattern, RegexOptions.Multiline);

          // Assert
          Assert.True(found, $"Direktive '{directivePattern}' fehlt im Block 'location /api/' von nginx/nginx.conf.template.");
      }

      private static string ReadApiLocationBlock()
      {
          var template = File.ReadAllText(FindNginxTemplatePath());
          var match = ApiLocationBlock.Match(template);
          Assert.True(match.Success, "Block 'location /api/' fehlt in nginx/nginx.conf.template.");
          return match.Groups["body"].Value;
      }

      private static string FindNginxTemplatePath()
      {
          var directory = new DirectoryInfo(AppContext.BaseDirectory);
          while (directory is not null)
          {
              var candidate = Path.Combine(directory.FullName, "nginx", "nginx.conf.template");
              if (File.Exists(candidate))
              {
                  return candidate;
              }

              directory = directory.Parent;
          }

          throw new FileNotFoundException("nginx/nginx.conf.template konnte ausgehend vom Testverzeichnis nicht gefunden werden.");
      }
  }
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests -- --filter-class "*NginxProxyLimitsTests"` — erwartet: FAIL aller drei Fälle von `ApiLocation_ArticleImportLimits_ContainsDirective` (Direktiven fehlen noch)
- [ ] **Schritt 3: Minimal implementieren**
  In `nginx/nginx.conf.template` im Block `location /api/ {` direkt nach `proxy_http_version 1.1;` einfügen:
  ```nginx
          # Artikel-Import: Datei bis 2 MB plus multipart-Overhead (2100k) und Antwortzeit bis 3 Minuten
          # (nginx-Standard: 1 MB / 60 s). Die genaue 2-MB-Grenze prüfen Modal und Endpoint.
          client_max_body_size 2100k;
          proxy_read_timeout 180s;
          proxy_send_timeout 180s;
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Architecture.Tests -- --filter-class "*NginxProxyLimitsTests"` — erwartet: PASS aller drei Fälle von `ApiLocation_ArticleImportLimits_ContainsDirective`.
  Zusatzprüfung im Bash-Tool aus `<R>`: `awk '/location \/api\//,/}/' nginx/nginx.conf.template | grep -c -E 'client_max_body_size 2100k;|proxy_read_timeout 180s;|proxy_send_timeout 180s;'` — erwartet: Ausgabe `3`
- [ ] **Schritt 5: Commit**
  `git add nginx/nginx.conf.template src/bazaar-app/backend/tests/Bazaar.Architecture.Tests/NginxProxyLimitsTests.cs` · `git commit -m "chore(nginx): 2 MB Upload und 3 Minuten Antwortzeit für den Artikel-Import"`

---

### Task 7: Frontend-API für den Import

**ACs:** AC-10, AC-21, AC-28

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/sellers/data/article-import-api.ts`
- Create: `src/bazaar-app/frontend/src/app/features/sellers/data/article-import-api.spec.ts`

**Interfaces:**
- Consumes: `POST /api/sellers/{id}/articles/import` (Task 5), Antwort `{ importedCount: number }`.
- Produces:
  - `export interface ArticleImportResult { importedCount: number; }`
  - `export const IMPORT_TIMEOUT_MS = 180_000;`
  - `ArticleImportApi.importArticles(sellerId: string, file: File, locale: string): Observable<ArticleImportResult>` — sendet genau einen multipart-Request (`file`, `locale`) und bricht nach `IMPORT_TIMEOUT_MS` mit `TimeoutError` (rxjs) ab.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `article-import-api.spec.ts`:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { provideHttpClient } from '@angular/common/http';
  import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
  import { TimeoutError } from 'rxjs';
  import { ArticleImportApi, IMPORT_TIMEOUT_MS } from './article-import-api';

  const IMPORT_URL = '/api/sellers/s1/articles/import';

  describe('ArticleImportApi', () => {
    let api: ArticleImportApi;
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      api = TestBed.inject(ArticleImportApi);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      httpMock.verify();
      vi.useRealTimers();
    });

    it('importArticles_FileAndLocale_PostsOneMultipartRequestToSellerRoute', () => {
      // Arrange
      const file = new File(['1;Jacke'], 'artikel.csv');

      // Act
      api.importArticles('s1', file, 'de-DE').subscribe();

      // Assert
      const request = httpMock.expectOne(IMPORT_URL);
      expect(request.request.method).toBe('POST');
      request.flush({ importedCount: 1 });
    });

    it('importArticles_FileAndLocale_SendsFileAndBrowserLocaleAsFormFields', () => {
      // Arrange
      const file = new File(['1;Jacke'], 'artikel.csv');

      // Act
      api.importArticles('s1', file, 'de-DE').subscribe();

      // Assert
      const request = httpMock.expectOne(IMPORT_URL);
      const body = request.request.body as FormData;
      expect((body.get('file') as File).name).toBe('artikel.csv');
      expect(body.get('locale')).toBe('de-DE');
      request.flush({ importedCount: 1 });
    });

    it('importArticles_Success_EmitsImportedCount', () => {
      // Arrange
      const next = vi.fn();
      api.importArticles('s1', new File(['x'], 'a.csv'), 'de-DE').subscribe(next);

      // Act
      httpMock.expectOne(IMPORT_URL).flush({ importedCount: 3 });

      // Assert
      expect(next).toHaveBeenCalledWith({ importedCount: 3 });
    });

    it('importArticles_NoResponseWithinThreeMinutes_ErrorsWithTimeoutAndCancelsRequest', async () => {
      // Arrange
      vi.useFakeTimers();
      const error = vi.fn();
      api.importArticles('s1', new File(['x'], 'a.csv'), 'de-DE').subscribe({ error });
      const request = httpMock.expectOne(IMPORT_URL);

      // Act
      await vi.advanceTimersByTimeAsync(IMPORT_TIMEOUT_MS);

      // Assert
      expect(error).toHaveBeenCalledWith(expect.any(TimeoutError));
      expect(request.cancelled).toBe(true);
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/data/article-import-api.spec.ts` — erwartet: FAIL (Modul `./article-import-api` nicht gefunden)
- [ ] **Schritt 3: Minimal implementieren**
  `article-import-api.ts`:
  ```ts
  import { Injectable, inject } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, timeout } from 'rxjs';

  export interface ArticleImportResult {
    importedCount: number;
  }

  /** Längste Wartezeit auf die Antwort des synchronen Imports (Spec: 3 Minuten). */
  export const IMPORT_TIMEOUT_MS = 180_000;

  @Injectable({ providedIn: 'root' })
  export class ArticleImportApi {
    private readonly http = inject(HttpClient);

    /** Sendet die Datei und die Browser-Sprache (bestimmt das Dezimalzeichen einer CSV) als multipart-Request. */
    importArticles(sellerId: string, file: File, locale: string): Observable<ArticleImportResult> {
      const body = new FormData();
      body.append('file', file, file.name);
      body.append('locale', locale);
      return this.http
        .post<ArticleImportResult>(`/api/sellers/${sellerId}/articles/import`, body)
        .pipe(timeout(IMPORT_TIMEOUT_MS));
    }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/data/article-import-api.spec.ts` — erwartet: PASS aller vier Tests
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/data/article-import-api.ts src/bazaar-app/frontend/src/app/features/sellers/data/article-import-api.spec.ts` · `git commit -m "feat(article-import): Frontend-API für den Artikel-Import"`

---

### Task 8: Datei-Dropzone (Wrapper)

**ACs:** AC-05, AC-08

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/shared/components/file-dropzone/file-dropzone.ts`
- Create: `src/bazaar-app/frontend/src/app/shared/components/file-dropzone/file-dropzone.html`
- Create: `src/bazaar-app/frontend/src/app/shared/components/file-dropzone/file-dropzone.scss`
- Create: `src/bazaar-app/frontend/src/app/shared/components/file-dropzone/file-dropzone.spec.ts`
- Create: `docs/components/file-dropzone/component.md`
- Modify: `docs/components/overview.md` · `| **Typ-Popup** |`

**Interfaces:**
- Consumes: keine.
- Produces: Komponente `FileDropzone` (Selector `app-file-dropzone`, Leaf): `accept = input<string>('')`, `disabled = input<boolean>(false)`, `filesChosen = output<File[]>()` — meldet die per Drag & Drop abgelegten oder per Dateidialog gewählten Dateien (mindestens eine); Inhalt per `<ng-content />` als Beschriftung. Reine Auswahl, keine Typ-/Mengenprüfung (die liegt im Modal). Warum kein `p-fileupload`: geprüft gegen PrimeNG 22.1.1 (`node_modules/primeng/fesm2022/primeng-fileupload.mjs`) — Drop nur in `mode="advanced"`; ohne `multiple` verwirft `onDrop` zwei oder mehr Dateien still (kein `onSelect`, AC-07 nicht auslösbar); mit `multiple` meldet `onSelect` zwar alle Dateien, führt aber eine eigene, sich ansammelnde Dateiliste mit Buttons und Meldungen, gegen die das Modal „genau eine Datei, ersetzen" (AC-08) per `clear()` und Template-Überschreibung durchsetzen müsste. Ablage unter `app/shared/components/` wie die übrigen featureunabhängigen Wrapper (`boolean-input`, `input`, `scan-dialog` …), damit z. B. das Import-Panel der Einstellungen sie ohne Feature-übergreifenden Import nutzen kann; Doku `docs/components/file-dropzone/component.md`, verlinkt im Komponenten-Index.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `file-dropzone.spec.ts`:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { FileDropzone } from './file-dropzone';

  function createFile(name: string): File {
    return new File(['x'], name);
  }

  function dropEvent(files: File[]): Event {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    return event;
  }

  describe('FileDropzone', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [FileDropzone] }).compileComponents();
    });

    async function createZone() {
      const fixture = TestBed.createComponent(FileDropzone);
      await fixture.whenStable();
      const host = fixture.nativeElement as HTMLElement;
      const chosen = vi.fn();
      fixture.componentInstance.filesChosen.subscribe(chosen);
      return { fixture, host, chosen };
    }

    it('onDrop_OneFile_EmitsFilesChosenWithThatFile', async () => {
      // Arrange
      const { host, chosen } = await createZone();
      const file = createFile('artikel.csv');

      // Act
      host.querySelector('.file-dropzone')!.dispatchEvent(dropEvent([file]));

      // Assert
      expect(chosen).toHaveBeenCalledWith([file]);
    });

    it('onDrop_TwoFiles_EmitsBothFiles', async () => {
      // Arrange
      const { host, chosen } = await createZone();
      const files = [createFile('a.csv'), createFile('b.csv')];

      // Act
      host.querySelector('.file-dropzone')!.dispatchEvent(dropEvent(files));

      // Assert
      expect(chosen).toHaveBeenCalledWith(files);
    });

    it('onDrop_WhileDisabled_EmitsNothing', async () => {
      // Arrange
      const { fixture, host, chosen } = await createZone();
      fixture.componentRef.setInput('disabled', true);
      await fixture.whenStable();

      // Act
      host.querySelector('.file-dropzone')!.dispatchEvent(dropEvent([createFile('a.csv')]));

      // Assert
      expect(chosen).not.toHaveBeenCalled();
    });

    it('onInputChange_FileSelectedInDialog_EmitsFilesChosen', async () => {
      // Arrange
      const { host, chosen } = await createZone();
      const file = createFile('artikel.xlsx');
      const input = host.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', { value: [file], configurable: true });

      // Act
      input.dispatchEvent(new Event('change'));

      // Assert
      expect(chosen).toHaveBeenCalledWith([file]);
    });

    it('onInputChange_NoFileSelected_EmitsNothing', async () => {
      // Arrange
      const { host, chosen } = await createZone();
      const input = host.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, 'files', { value: [], configurable: true });

      // Act
      input.dispatchEvent(new Event('change'));

      // Assert
      expect(chosen).not.toHaveBeenCalled();
    });

    it('render_AcceptInput_SetsAcceptAttributeOnFileInput', async () => {
      // Arrange
      const { fixture, host } = await createZone();

      // Act
      fixture.componentRef.setInput('accept', '.xlsx,.xls,.csv');
      await fixture.whenStable();

      // Assert
      expect(host.querySelector('input[type="file"]')?.getAttribute('accept')).toBe('.xlsx,.xls,.csv');
    });

    it('onDragOver_FileOverZone_MarksZoneActive', async () => {
      // Arrange
      const { fixture, host } = await createZone();

      // Act
      host.querySelector('.file-dropzone')!.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
      await fixture.whenStable();

      // Assert
      expect(host.querySelector('.file-dropzone--active')).not.toBeNull();
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/file-dropzone/file-dropzone.spec.ts` — erwartet: FAIL (Modul `./file-dropzone` nicht gefunden)
- [ ] **Schritt 3: Minimal implementieren**
  `file-dropzone.ts`:
  ```ts
  import { ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

  /**
   * Leaf-Wrapper: Ablagefläche für Drag & Drop und Klick mit Dateidialog. Meldet nur die gewählten Dateien —
   * Typ und Anzahl prüft der Aufrufer, damit er eigene Hinweise zeigen kann (PrimeNG `p-fileupload` filtert
   * ungültige Auswahl selbst und kennt diese Hinweise nicht).
   */
  @Component({
    selector: 'app-file-dropzone',
    templateUrl: './file-dropzone.html',
    styleUrl: './file-dropzone.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class FileDropzone {
    readonly accept = input<string>('');
    readonly disabled = input<boolean>(false);

    readonly filesChosen = output<File[]>();

    readonly dragOver = signal(false);

    private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

    openFileDialog(): void {
      if (this.disabled()) return;
      this.fileInput().nativeElement.click();
    }

    onInputChange(event: Event): void {
      const input = event.target as HTMLInputElement;
      const files = Array.from(input.files ?? []);
      // Dieselbe Datei muss nach einer Ablehnung erneut wählbar sein.
      input.value = '';
      this.emitIfAny(files);
    }

    onDragOver(event: Event): void {
      event.preventDefault();
      if (this.disabled()) return;
      this.dragOver.set(true);
    }

    onDragLeave(): void {
      this.dragOver.set(false);
    }

    onDrop(event: DragEvent): void {
      event.preventDefault();
      this.dragOver.set(false);
      if (this.disabled()) return;
      this.emitIfAny(Array.from(event.dataTransfer?.files ?? []));
    }

    private emitIfAny(files: File[]): void {
      if (files.length === 0) return;
      this.filesChosen.emit(files);
    }
  }
  ```
  `file-dropzone.html`:
  ```html
  <div
    class="file-dropzone"
    [class.file-dropzone--active]="dragOver()"
    [class.file-dropzone--disabled]="disabled()"
    role="button"
    tabindex="0"
    [attr.aria-disabled]="disabled()"
    (click)="openFileDialog()"
    (keydown.enter)="openFileDialog()"
    (keydown.space)="openFileDialog(); $event.preventDefault()"
    (dragover)="onDragOver($event)"
    (dragleave)="onDragLeave()"
    (drop)="onDrop($event)"
  >
    <i class="pi pi-upload file-dropzone__icon" aria-hidden="true"></i>
    <ng-content />
    <input
      #fileInput
      class="file-dropzone__input"
      type="file"
      tabindex="-1"
      [accept]="accept()"
      [disabled]="disabled()"
      (click)="$event.stopPropagation()"
      (change)="onInputChange($event)"
    />
  </div>
  ```
  `file-dropzone.scss`:
  ```scss
  .file-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    border: 2px dashed var(--p-content-border-color);
    border-radius: var(--p-content-border-radius);
    cursor: pointer;
    text-align: center;
  }

  .file-dropzone--active {
    border-color: var(--p-primary-color);
  }

  .file-dropzone--disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .file-dropzone__icon {
    font-size: 2rem;
  }

  .file-dropzone__input {
    display: none;
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/file-dropzone/file-dropzone.spec.ts` — erwartet: PASS aller sieben Tests
- [ ] **Schritt 5: Komponenten-Doku anlegen und im Index verlinken**
  `docs/components/file-dropzone/component.md` anlegen:
  ````markdown
  ---
  id: C-026
  status: draft
  updated: 2026-10-13
  ---

  # Component: File-Dropzone

  ## Index

  - Überblick — Konzept
  - 1. ASCII-Darstellung — Layoutskizze
  - 2. Input- / Output-Schnittstelle — Events
  - 3. PrimeNG-Basis — Warum ein Wrapper
  - Akzeptanzkriterien — EARS-Kriterien
  - Tags & Piles — Ablage

  **Bibliothek:** eigener Wrapper (Ablagefläche mit verstecktem `<input type="file">`, Icon `pi pi-upload`)  
  **Verwendung:** Überall dort, wo genau eine Datei per Drag & Drop oder Dateidialog gewählt wird und der Aufrufer Typ, Anzahl und Größe selbst prüft — erste Verwendung: Artikel-Import-Modal an der Verkäufer-Kachel.  
  **Code:** `src/bazaar-app/frontend/src/app/shared/components/file-dropzone/` (Selector `app-file-dropzone`)

  ---

  ## Überblick

  Die File-Dropzone ist eine **Leaf-Komponente**: Sie nimmt Dateien per Drag & Drop oder per Klick
  (Dateidialog, auch per Enter/Leertaste) entgegen und meldet sie unverändert über `filesChosen`.
  Sie prüft weder Dateityp noch Anzahl noch Größe — der Aufrufer entscheidet und zeigt eigene Hinweise.
  Nach jeder Auswahl setzt sie das Datei-Feld zurück, damit dieselbe Datei erneut wählbar ist.

  ---

  ## 1. ASCII-Darstellung

  ```
  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
            ⇪  (pi pi-upload)
     <ng-content>: Beschriftung des Aufrufers
  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
  ```

  Gestrichelter Rahmen (`--p-content-border-color`); beim Ziehen einer Datei über die Fläche
  Rahmen in `--p-primary-color`; deaktiviert mit 60 % Deckkraft und Cursor `not-allowed`.

  ---

  ## 2. Input- / Output-Schnittstelle

  | Input | Typ | Default | Wirkung |
  |---|---|---|---|
  | `accept` | `string` | `''` | Wird als `accept`-Attribut an den Dateidialog gegeben (Vorfilter, keine Prüfung) |
  | `disabled` | `boolean` | `false` | Sperrt Klick, Tastatur und Drop; keine Events |

  | Output | Typ | Beschreibung |
  |---|---|---|
  | `filesChosen` | `File[]` | Gewählte oder abgelegte Dateien, mindestens eine |

  ---

  ## 3. PrimeNG-Basis

  Geprüft gegen PrimeNG 22.1.1 (`primeng/fesm2022/primeng-fileupload.mjs`):
  - Drag & Drop gibt es nur in `mode="advanced"` (`(drop)` am Inhaltsbereich); `mode="basic"` hat keine Ablagefläche.
  - Ohne `multiple` verwirft `onDrop` eine Ablage von zwei oder mehr Dateien still
    (`allowDrop = multiple() || files.length === 1`); `onSelect` feuert dann nicht, der Hinweis
    „Bitte genau eine Datei wählen" ist nicht auslösbar.
  - Mit `multiple` und ohne `accept` meldet `onSelect` zwar alle Dateien (`files`), sammelt sie aber in einer
    eigenen Liste (`currentFiles`, kein Zurücksetzen bei `multiple`), rendert dazu Dateiliste,
    Auswählen-/Hochladen-/Abbrechen-Buttons und eigene Meldungen (`msgs`) und gibt dem Dateidialog
    `multiple` mit. Die Regel „genau eine Datei, eine neue gültige ersetzt die alte" müsste der Aufrufer
    nach jeder Auswahl per `clear()` über eine View-Referenz und mit überschriebenen Templates gegen
    diesen inneren Zustand durchsetzen.
  Es fehlt also eine zustandslose Ablagefläche, die jede Auswahl nur meldet. Darum gilt die Grundregel
  „Wrapper für Fehlendes": Die Dropzone liefert nur die Auswahl, alle Meldungen zeigt der Aufrufer mit
  PrimeNG-Komponenten (`p-message`). Der JSON-Import der Einstellungen nutzt weiterhin
  `p-fileupload mode="basic"` (dort reicht ein Dateidialog ohne Ablage).

  ---

  ## Akzeptanzkriterien

  1. **AC-1** — WHEN eine oder mehrere Dateien auf der Fläche abgelegt werden, THEN SHALL das System `filesChosen` mit genau diesen Dateien emittieren.
  2. **AC-2** — WHEN im Dateidialog eine Datei gewählt wird, THEN SHALL das System `filesChosen` mit dieser Datei emittieren.
  3. **AC-3** — WHEN der Dateidialog ohne Auswahl geschlossen wird, THEN SHALL das System kein Event emittieren.
  4. **AC-4** — WHILE `disabled` gesetzt ist, SHALL das System bei Drop, Klick und Tastatur kein Event emittieren.
  5. **AC-5** — WHILE eine Datei über die Fläche gezogen wird, SHALL das System die Fläche als aktiv markieren.

  ## Tags & Piles

  **Piles:** #pile/shared-components
  **Tags:** #file-dropzone #upload #drag-and-drop #wrapper #primeng
  ````
  In `docs/components/overview.md` im Abschnitt `## Komponenten-Index` direkt nach der Zeile `| **Typ-Popup** | … |` einfügen:
  ```markdown
  | **File-Dropzone** | Ablagefläche für Drag & Drop und Dateidialog; meldet nur die Auswahl, Typ/Anzahl/Größe prüft der Aufrufer (Wrapper, weil `p-fileupload` Mehrfach-Ablagen ohne `multiple` still verwirft und mit `multiple` eine eigene Dateiliste führt) | [file-dropzone/](file-dropzone/component.md) |
  ```
  und in der Tabelle `### Form & Eingaben` direkt nach der Zeile, die mit `| Datei-Upload |` beginnt, einfügen:
  ```markdown
  | Datei-Ablage mit eigenen Hinweisen | `app-file-dropzone` (Wrapper, [File-Dropzone](file-dropzone/component.md)) | Nur Haupt-App (Artikel-Import an der Verkäufer-Kachel) |
  ```
  Prüfung im Bash-Tool aus `<R>`: `grep -c 'file-dropzone/component.md' docs/components/overview.md` — erwartet: Ausgabe `2`
- [ ] **Schritt 6: Commit**
  `git add src/bazaar-app/frontend/src/app/shared/components/file-dropzone docs/components/file-dropzone docs/components/overview.md` · `git commit -m "feat(article-import): Datei-Dropzone für Drag & Drop und Dateidialog"`

---

### Task 9: Import-Modal

**ACs:** AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-13, AC-24, AC-26, AC-27, AC-28

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/article-import-dialog/article-import-dialog.ts`
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/article-import-dialog/article-import-dialog.html`
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/article-import-dialog/article-import-dialog.scss`
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/article-import-dialog/article-import-dialog.spec.ts`

**Interfaces:**
- Consumes: `ArticleImportApi.importArticles(sellerId: string, file: File, locale: string): Observable<ArticleImportResult>` (Task 7); `FileDropzone` mit `accept`, `disabled`, `(filesChosen)` (Task 8).
- Produces: Komponente `ArticleImportDialog` (Selector `app-article-import-dialog`): `visible = input<boolean>(false)`, `sellerId = input.required<string>()`, `visibleChange = output<boolean>()`, `imported = output<number>()` (Anzahl; wird nach dem Erfolgsanzeige-Zeitraum direkt vor `visibleChange(false)` gemeldet). Öffentliche Signale: `file: WritableSignal<File | null>`, `phase: WritableSignal<'idle' | 'importing' | 'success'>`, `message: WritableSignal<string | null>`, `busy`, `canImport` (Computed); Methoden `onFilesChosen(files: File[])`, `startImport()`, `onVisibleChange(visible: boolean)`. Exporte: `SUCCESS_CLOSE_DELAY_MS = 1500`, `MAX_FILE_BYTES = 2 * 1024 * 1024`.
- Meldungstexte (wörtlich): `Erlaubt sind nur Dateien im Format XLSX, XLS oder CSV.` · `Bitte genau eine Datei wählen` · `Die Datei ist größer als 2 MB.` · `Zeitüberschreitung: Der Server hat nicht innerhalb von 3 Minuten geantwortet.` · `Der Import ist fehlgeschlagen.`; Serverfehler zeigen `error.detail` des ProblemDetails.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `article-import-dialog.spec.ts`:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { HttpErrorResponse } from '@angular/common/http';
  import { Subject, TimeoutError } from 'rxjs';
  import {
    ArticleImportDialog,
    MAX_FILE_BYTES,
    SUCCESS_CLOSE_DELAY_MS,
  } from './article-import-dialog';
  import { ArticleImportApi, ArticleImportResult } from '../../data/article-import-api';

  function createFile(name: string, size = 100): File {
    const file = new File(['x'], name);
    Object.defineProperty(file, 'size', { value: size });
    return file;
  }

  describe('ArticleImportDialog', () => {
    let importArticles: ReturnType<typeof vi.fn>;
    let response: Subject<ArticleImportResult>;

    beforeEach(async () => {
      response = new Subject<ArticleImportResult>();
      importArticles = vi.fn().mockReturnValue(response);
      await TestBed.configureTestingModule({
        imports: [ArticleImportDialog],
        providers: [{ provide: ArticleImportApi, useValue: { importArticles } }],
      }).compileComponents();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    async function createDialog() {
      const fixture = TestBed.createComponent(ArticleImportDialog);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('sellerId', 's1');
      await fixture.whenStable();
      const component = fixture.componentInstance;
      const imported = vi.fn();
      const visibleChange = vi.fn();
      component.imported.subscribe(imported);
      component.visibleChange.subscribe(visibleChange);
      return { fixture, component, imported, visibleChange };
    }

    describe('onFilesChosen', () => {
      it.each(['artikel.xlsx', 'artikel.xls', 'artikel.csv', 'ARTIKEL.CSV'])(
        'onFilesChosen_AllowedFile_%s_TakesFileAndEnablesImport',
        async (name) => {
          // Arrange
          const { component } = await createDialog();
          const file = createFile(name);

          // Act
          component.onFilesChosen([file]);

          // Assert
          expect(component.file()).toBe(file);
          expect(component.canImport()).toBe(true);
        },
      );

      it('onFilesChosen_PdfFile_ShowsFormatHintAndKeepsImportDisabled', async () => {
        // Arrange
        const { component } = await createDialog();

        // Act
        component.onFilesChosen([createFile('artikel.pdf')]);

        // Assert
        expect(component.message()).toBe('Erlaubt sind nur Dateien im Format XLSX, XLS oder CSV.');
        expect(component.canImport()).toBe(false);
      });

      it('onFilesChosen_PdfFile_UploadsNothing', async () => {
        // Arrange
        const { component } = await createDialog();

        // Act
        component.onFilesChosen([createFile('artikel.pdf')]);

        // Assert
        expect(importArticles).not.toHaveBeenCalled();
      });

      it('onFilesChosen_TwoFiles_ShowsHintAndTakesNeither', async () => {
        // Arrange
        const { component } = await createDialog();

        // Act
        component.onFilesChosen([createFile('a.csv'), createFile('b.csv')]);

        // Assert
        expect(component.message()).toBe('Bitte genau eine Datei wählen');
        expect(component.file()).toBeNull();
      });

      it('onFilesChosen_OtherValidFile_ReplacesPreviousFile', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('alt.csv')]);
        const replacement = createFile('neu.xlsx');

        // Act
        component.onFilesChosen([replacement]);

        // Assert
        expect(component.file()?.name).toBe('neu.xlsx');
      });

      it('onFilesChosen_ValidFileAfterHint_ClearsHint', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('artikel.pdf')]);

        // Act
        component.onFilesChosen([createFile('artikel.csv')]);

        // Assert
        expect(component.message()).toBeNull();
      });

      it('onFilesChosen_WhileImporting_IgnoresSelection', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('alt.csv')]);
        component.startImport();

        // Act
        component.onFilesChosen([createFile('neu.csv')]);

        // Assert
        expect(component.file()?.name).toBe('alt.csv');
      });
    });

    describe('startImport', () => {
      it('startImport_FileOverTwoMegabytes_ShowsSizeMessageAndSendsNothing', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('gross.csv', MAX_FILE_BYTES + 1)]);

        // Act
        component.startImport();

        // Assert
        expect(component.message()).toBe('Die Datei ist größer als 2 MB.');
        expect(importArticles).not.toHaveBeenCalled();
      });

      it('startImport_ValidFile_SendsExactlyOneRequestWithSellerFileAndBrowserLocale', async () => {
        // Arrange
        const { component } = await createDialog();
        const file = createFile('artikel.csv');
        component.onFilesChosen([file]);

        // Act
        component.startImport();
        component.startImport();

        // Assert
        expect(importArticles).toHaveBeenCalledTimes(1);
        expect(importArticles).toHaveBeenCalledWith('s1', file, navigator.language);
      });

      it('startImport_ValidFile_ShowsSpinnerPhaseAndDisablesImport', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);

        // Act
        component.startImport();

        // Assert
        expect(component.phase()).toBe('importing');
        expect(component.canImport()).toBe(false);
      });

      it('onVisibleChange_WhileImporting_DoesNotClose', async () => {
        // Arrange
        const { component, visibleChange } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();

        // Act
        component.onVisibleChange(false);

        // Assert
        expect(visibleChange).not.toHaveBeenCalled();
      });

      it('onVisibleChange_Idle_EmitsVisibleChange', async () => {
        // Arrange
        const { component, visibleChange } = await createDialog();

        // Act
        component.onVisibleChange(false);

        // Assert
        expect(visibleChange).toHaveBeenCalledWith(false);
      });
    });

    describe('success', () => {
      it('startImport_ServerAnswersSuccess_SwitchesToSuccessPhase', async () => {
        // Arrange
        vi.useFakeTimers();
        const { component } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();

        // Act
        response.next({ importedCount: 3 });

        // Assert
        expect(component.phase()).toBe('success');
      });

      it('startImport_ServerAnswersSuccess_ClosesAfterDelayAndReportsCount', async () => {
        // Arrange
        vi.useFakeTimers();
        const { component, imported, visibleChange } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();
        response.next({ importedCount: 3 });

        // Act
        await vi.advanceTimersByTimeAsync(SUCCESS_CLOSE_DELAY_MS);

        // Assert
        expect(imported).toHaveBeenCalledWith(3);
        expect(visibleChange).toHaveBeenCalledWith(false);
      });

      it('startImport_ServerAnswersSuccess_StaysOpenBeforeDelayElapsed', async () => {
        // Arrange
        vi.useFakeTimers();
        const { component, visibleChange } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();
        response.next({ importedCount: 3 });

        // Act
        await vi.advanceTimersByTimeAsync(SUCCESS_CLOSE_DELAY_MS - 1);

        // Assert
        expect(visibleChange).not.toHaveBeenCalled();
      });
    });

    describe('errors', () => {
      it('startImport_ServerRejectsWithDetail_ShowsDetailAndKeepsFileAndDialogOpen', async () => {
        // Arrange
        const { component, visibleChange } = await createDialog();
        const file = createFile('artikel.csv');
        component.onFilesChosen([file]);
        component.startImport();

        // Act
        response.error(
          new HttpErrorResponse({
            status: 400,
            error: { detail: 'Zeile 4, Artikelnummer 3003: Pflichtfeld „Bezeichnung“ fehlt' },
          }),
        );

        // Assert
        expect(component.message()).toBe('Zeile 4, Artikelnummer 3003: Pflichtfeld „Bezeichnung“ fehlt');
        expect(component.file()).toBe(file);
        expect(visibleChange).not.toHaveBeenCalled();
      });

      it('startImport_ServerRejects_EndsSpinnerAndEnablesImportAgain', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();

        // Act
        response.error(new HttpErrorResponse({ status: 400, error: { detail: 'Datei enthält keine Artikel' } }));

        // Assert
        expect(component.phase()).toBe('idle');
        expect(component.canImport()).toBe(true);
      });

      it('startImport_NoAnswerWithinThreeMinutes_ShowsTimeoutMessage', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();

        // Act
        response.error(new TimeoutError());

        // Assert
        expect(component.message()).toBe(
          'Zeitüberschreitung: Der Server hat nicht innerhalb von 3 Minuten geantwortet.',
        );
      });

      it('startImport_ProxyRejectsWithPayloadTooLarge_ShowsSizeMessage', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();

        // Act
        response.error(new HttpErrorResponse({ status: 413, error: '<html>' }));

        // Assert
        expect(component.message()).toBe('Die Datei ist größer als 2 MB.');
      });

      it('startImport_UnexpectedError_ShowsGenericMessage', async () => {
        // Arrange
        const { component } = await createDialog();
        component.onFilesChosen([createFile('artikel.csv')]);
        component.startImport();

        // Act
        response.error(new HttpErrorResponse({ status: 500 }));

        // Assert
        expect(component.message()).toBe('Der Import ist fehlgeschlagen.');
      });
    });

    describe('reopen', () => {
      it('visible_ReopenedAfterClose_ResetsFileMessageAndPhase', async () => {
        // Arrange
        const { fixture, component } = await createDialog();
        component.onFilesChosen([createFile('artikel.pdf')]);
        component.onFilesChosen([createFile('artikel.csv')]);
        fixture.componentRef.setInput('visible', false);
        await fixture.whenStable();

        // Act
        fixture.componentRef.setInput('visible', true);
        await fixture.whenStable();

        // Assert
        expect(component.file()).toBeNull();
        expect(component.message()).toBeNull();
        expect(component.phase()).toBe('idle');
      });
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/article-import-dialog/article-import-dialog.spec.ts` — erwartet: FAIL (Modul `./article-import-dialog` nicht gefunden)
- [ ] **Schritt 3: Minimal implementieren**
  `article-import-dialog.ts`:
  ```ts
  import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    computed,
    effect,
    inject,
    input,
    output,
    signal,
  } from '@angular/core';
  import { HttpErrorResponse } from '@angular/common/http';
  import { TimeoutError } from 'rxjs';
  import { ButtonModule } from 'primeng/button';
  import { DialogModule } from 'primeng/dialog';
  import { MessageModule } from 'primeng/message';
  import { ProgressSpinnerModule } from 'primeng/progressspinner';
  import { ArticleImportApi } from '../../data/article-import-api';
  import { FileDropzone } from '../../../../shared/components/file-dropzone/file-dropzone';

  export const SUCCESS_CLOSE_DELAY_MS = 1500;
  export const MAX_FILE_BYTES = 2 * 1024 * 1024;

  const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

  const MESSAGE_FORMATS = 'Erlaubt sind nur Dateien im Format XLSX, XLS oder CSV.';
  const MESSAGE_ONE_FILE = 'Bitte genau eine Datei wählen';
  const MESSAGE_TOO_LARGE = 'Die Datei ist größer als 2 MB.';
  const MESSAGE_TIMEOUT = 'Zeitüberschreitung: Der Server hat nicht innerhalb von 3 Minuten geantwortet.';
  const MESSAGE_GENERIC = 'Der Import ist fehlgeschlagen.';

  const HTTP_PAYLOAD_TOO_LARGE = 413;

  type ImportPhase = 'idle' | 'importing' | 'success';

  function hasAcceptedExtension(fileName: string): boolean {
    const lowerCaseName = fileName.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension));
  }

  /** Der Server liefert die Fehlerliste als `detail` (ProblemDetails); ein Proxy-Abbruch trägt keinen. */
  function messageOfError(error: unknown): string {
    if (error instanceof TimeoutError) return MESSAGE_TIMEOUT;
    if (!(error instanceof HttpErrorResponse)) return MESSAGE_GENERIC;

    const detail = (error.error as { detail?: string } | null)?.detail;
    if (detail) return detail;
    if (error.status === HTTP_PAYLOAD_TOO_LARGE) return MESSAGE_TOO_LARGE;
    return MESSAGE_GENERIC;
  }

  /**
   * Modal „Artikel importieren" an der Verkäufer-Kachel: eine Datei wählen (Drag & Drop oder Dateidialog),
   * „Import" startet den synchronen Import. Während des Imports ist das Modal gesperrt; bei Erfolg zeigt es
   * kurz ein Check-Icon und schließt dann selbst, bei Fehler bleibt es mit Meldung und gewählter Datei offen.
   */
  @Component({
    selector: 'app-article-import-dialog',
    imports: [DialogModule, ButtonModule, MessageModule, ProgressSpinnerModule, FileDropzone],
    templateUrl: './article-import-dialog.html',
    styleUrl: './article-import-dialog.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class ArticleImportDialog {
    private readonly importApi = inject(ArticleImportApi);

    readonly visible = input<boolean>(false);
    readonly sellerId = input.required<string>();

    readonly visibleChange = output<boolean>();
    /** Anzahl importierter Artikel; kommt nach der Erfolgsanzeige, direkt vor `visibleChange(false)`. */
    readonly imported = output<number>();

    readonly file = signal<File | null>(null);
    readonly phase = signal<ImportPhase>('idle');
    readonly message = signal<string | null>(null);

    readonly busy = computed(() => this.phase() !== 'idle');
    readonly canImport = computed(() => this.file() !== null && this.phase() === 'idle');

    readonly acceptAttribute = ACCEPTED_EXTENSIONS.join(',');

    private closeTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
      inject(DestroyRef).onDestroy(() => clearTimeout(this.closeTimer));

      // Jedes Öffnen beginnt leer.
      effect(() => {
        if (this.visible()) this.reset();
      });
    }

    onFilesChosen(files: File[]): void {
      if (this.busy()) return;
      if (files.length !== 1) {
        this.message.set(MESSAGE_ONE_FILE);
        return;
      }

      const [chosen] = files;
      if (!hasAcceptedExtension(chosen.name)) {
        this.message.set(MESSAGE_FORMATS);
        return;
      }

      this.file.set(chosen);
      this.message.set(null);
    }

    startImport(): void {
      const chosen = this.file();
      if (chosen === null || this.phase() !== 'idle') return;
      if (chosen.size > MAX_FILE_BYTES) {
        this.message.set(MESSAGE_TOO_LARGE);
        return;
      }

      this.message.set(null);
      this.phase.set('importing');
      this.importApi.importArticles(this.sellerId(), chosen, navigator.language).subscribe({
        next: (result) => this.showSuccessThenClose(result.importedCount),
        error: (error: unknown) => this.showError(error),
      });
    }

    onVisibleChange(visible: boolean): void {
      if (this.busy()) return;
      this.visibleChange.emit(visible);
    }

    private showSuccessThenClose(importedCount: number): void {
      this.phase.set('success');
      this.closeTimer = setTimeout(() => {
        this.imported.emit(importedCount);
        this.visibleChange.emit(false);
      }, SUCCESS_CLOSE_DELAY_MS);
    }

    private showError(error: unknown): void {
      this.phase.set('idle');
      this.message.set(messageOfError(error));
    }

    private reset(): void {
      clearTimeout(this.closeTimer);
      this.file.set(null);
      this.message.set(null);
      this.phase.set('idle');
    }
  }
  ```
  `article-import-dialog.html`:
  ```html
  <p-dialog
    header="Artikel importieren"
    [modal]="true"
    [visible]="visible()"
    [closable]="!busy()"
    [closeOnEscape]="!busy()"
    [style]="{ width: '32rem' }"
    (visibleChange)="onVisibleChange($event)"
  >
    <div class="article-import-dialog__body">
      <app-file-dropzone [accept]="acceptAttribute" [disabled]="busy()" (filesChosen)="onFilesChosen($event)">
        <span>Datei hierher ziehen oder klicken (XLSX, XLS oder CSV)</span>
      </app-file-dropzone>

      @if (file(); as chosen) {
        <p class="article-import-dialog__file-name">{{ chosen.name }}</p>
      }

      @if (message(); as text) {
        <p-message severity="error">
          <span class="article-import-dialog__message">{{ text }}</span>
        </p-message>
      }

      @switch (phase()) {
        @case ('importing') {
          <div class="article-import-dialog__status" role="status">
            <p-progress-spinner ariaLabel="Import läuft" strokeWidth="4" />
          </div>
        }
        @case ('success') {
          <div class="article-import-dialog__status" role="status">
            <i class="pi pi-check article-import-dialog__check" aria-label="Import erfolgreich"></i>
          </div>
        }
      }
    </div>

    <ng-template #footer>
      <p-button label="Import" [disabled]="!canImport()" (onClick)="startImport()" />
    </ng-template>
  </p-dialog>
  ```
  `article-import-dialog.scss`:
  ```scss
  .article-import-dialog__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .article-import-dialog__file-name {
    margin: 0;
    font-weight: 600;
    word-break: break-all;
  }

  .article-import-dialog__message {
    white-space: pre-line;
  }

  .article-import-dialog__status {
    display: flex;
    justify-content: center;
  }

  .article-import-dialog__check {
    font-size: 3rem;
    color: var(--p-green-500);
    animation: article-import-check-in 300ms ease-out;
  }

  @keyframes article-import-check-in {
    from {
      opacity: 0;
      transform: scale(0.2);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  ```
  Danach je PrimeNG-Komponente des Templates einen eigenen Tool-Aufruf `mcp__primeng__validate_usage`; Parameternamen laut dem beim Aufruf geladenen Tool-Schema (Komponentenname und Code-Ausschnitt), jeweils nur der Ausschnitt dieser Komponente:
  1. Komponente `dialog`, Code: das öffnende `<p-dialog …>`-Tag mit allen Bindungen (`header`, `[modal]`, `[visible]`, `[closable]`, `[closeOnEscape]`, `[style]`, `(visibleChange)`) samt `<ng-template #footer>…</ng-template>` und `</p-dialog>` — erwartet: `valid: true`.
  2. Komponente `message`, Code: `<p-message severity="error"><span class="article-import-dialog__message">{{ text }}</span></p-message>` — erwartet: `valid: true`.
  3. Komponente `progressspinner`, Code: `<p-progress-spinner ariaLabel="Import läuft" strokeWidth="4" />` — erwartet: `valid: true`.
  4. Komponente `button`, Code: `<p-button label="Import" [disabled]="!canImport()" (onClick)="startImport()" />` — erwartet: `valid: true`.
  Meldet ein Aufruf einen Befund, wird das Template an dieser Stelle laut Befund korrigiert und der Aufruf wiederholt, bis alle vier `valid: true` liefern.
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/article-import-dialog/article-import-dialog.spec.ts` — erwartet: PASS aller Tests
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/components/article-import-dialog` · `git commit -m "feat(article-import): Import-Modal mit Dateiwahl, Spinner und Fehleranzeige"`

---

### Task 10: Import-Button an der Verkäufer-Kachel

**ACs:** AC-01, AC-02, AC-03, AC-04

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card/seller-card.ts` · `SellerCard`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card/seller-card.html` · `ariaLabel="Scannen"`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card/seller-card.spec.ts` · `describe('SellerCard'`

**Interfaces:**
- Consumes: bestehendes `SellerCard`-Model (`status: string`, `settledAt: string | null`).
- Produces: an `SellerCard` neu `importVisible = input<boolean>(false)` und `importArticles = output<SellerCardModel>()`; Methode `onImportArticles(): void`. Der Button (`aria-label="Importieren"`) existiert nur bei `importVisible() === true`, ist bei `card().status === 'settled'` deaktiviert und löst `cardClick` nicht aus.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `seller-card.spec.ts` am Ende des `describe('SellerCard', …)`-Blocks (vor dessen schließendem `});`) einfügen:
  ```ts
    describe('import button', () => {
      const IMPORT_BUTTON = 'button[aria-label="Importieren"]';

      it('render_ImportVisibleAndNotSettled_ShowsEnabledIconOnlyButtonAfterCameraButton', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', buildCard());
        fixture.componentRef.setInput('importVisible', true);

        // Act
        await fixture.whenStable();

        // Assert
        const buttons = Array.from(
          (fixture.nativeElement as HTMLElement).querySelectorAll('.seller-card__actions button'),
        );
        expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
          'Bearbeiten',
          'Scannen',
          'Importieren',
        ]);
      });

      it('render_ImportButton_HasNoTextLabel', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', buildCard());
        fixture.componentRef.setInput('importVisible', true);

        // Act
        await fixture.whenStable();

        // Assert
        const button = (fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON);
        expect(button?.textContent?.trim()).toBe('');
      });

      it('render_ImportNotVisible_HasNoImportButton', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', buildCard());

        // Act
        await fixture.whenStable();

        // Assert
        expect((fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON)).toBeNull();
      });

      it('render_SettledSeller_DisablesImportButton', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', buildCard({ status: 'settled' }));
        fixture.componentRef.setInput('importVisible', true);

        // Act
        await fixture.whenStable();

        // Assert
        const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(IMPORT_BUTTON);
        expect(button?.disabled).toBe(true);
      });

      it('render_OpenSeller_KeepsImportButtonEnabled', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        fixture.componentRef.setInput('card', buildCard({ status: 'open' }));
        fixture.componentRef.setInput('importVisible', true);

        // Act
        await fixture.whenStable();

        // Assert
        const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(IMPORT_BUTTON);
        expect(button?.disabled).toBe(false);
      });

      it('onImportArticles_ButtonClick_EmitsCardWithoutEmittingCardClick', async () => {
        // Arrange
        const fixture = TestBed.createComponent(SellerCard);
        const card = buildCard();
        fixture.componentRef.setInput('card', card);
        fixture.componentRef.setInput('importVisible', true);
        const importSpy = vi.fn();
        const cardClickSpy = vi.fn();
        fixture.componentInstance.importArticles.subscribe(importSpy);
        fixture.componentInstance.cardClick.subscribe(cardClickSpy);
        await fixture.whenStable();
        const button = (fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON) as HTMLButtonElement;

        // Act
        button.click();

        // Assert
        expect(importSpy).toHaveBeenCalledWith(card);
        expect(cardClickSpy).not.toHaveBeenCalled();
      });
    });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/seller-card/seller-card.spec.ts` — erwartet: FAIL `importVisible`/`importArticles` unbekannt (Compile-Fehler) bzw. fehlender Button
- [ ] **Schritt 3: Minimal implementieren**
  In `seller-card.ts` nach `readonly card = input.required<SellerCardModel>();` einfügen:
  ```ts
    /** Nur Admins sehen den Artikel-Import (Entscheidung trifft die Seite, die Kachel rendert nur). */
    readonly importVisible = input<boolean>(false);
  ```
  nach `readonly scan = output<SellerCardModel>();` einfügen:
  ```ts
    readonly importArticles = output<SellerCardModel>();
  ```
  und nach `onScan(): void { … }` die Methode:
  ```ts
    onImportArticles(): void {
      this.importArticles.emit(this.card());
    }
  ```
  In `seller-card.html` direkt nach dem Kamera-`<p-button … ariaLabel="Scannen" … />` (innerhalb `seller-card__actions`) einfügen:
  ```html
      @if (importVisible()) {
        <p-button
          icon="pi pi-upload"
          [text]="true"
          [rounded]="true"
          severity="secondary"
          ariaLabel="Importieren"
          [disabled]="card().status === 'settled'"
          (click)="$event.stopPropagation()"
          (onClick)="onImportArticles(); $event.stopPropagation()"
        />
      }
  ```
  Danach Tool-Aufruf `mcp__primeng__validate_usage` mit `component: "button"` und `code:` dem eingefügten `<p-button …/>` — erwartet: `valid: true`.
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/seller-card/seller-card.spec.ts` — erwartet: PASS aller Tests der Datei (alte und neue)
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/components/seller-card` · `git commit -m "feat(article-import): Import-Button an der Verkäufer-Kachel"`

---

### Task 11: Verdrahtung auf der Verkäufer-Seite

**ACs:** AC-02, AC-04, AC-13

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts` · `SellersPage`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html` · `<app-release-dialog`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `describe('SellersPage'`

**Interfaces:**
- Consumes: `SellerCard` mit `importVisible`/`(importArticles)` (Task 10); `ArticleImportDialog` mit `visible`, `sellerId`, `(visibleChange)`, `(imported)` (Task 9); bestehend `SellersStore.load()`, `MessageService.add`, `RoleService.isAdmin`.
- Produces: an `SellersPage` neu `articleImportVisible = signal(false)`, `articleImportSellerId = signal<string | null>(null)`, `onImportArticles(card: SellerCardModel): void`, `onArticleImportVisibleChange(visible: boolean): void`, `onArticlesImported(count: number): void` (lädt die Liste neu und zeigt Toast `✓ <count> Artikel importiert`).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `sellers-page.spec.ts` im `providers`-Array der `beforeEach` nach `{ provide: ReleaseApi, useValue: { bookRelease: vi.fn() } },` ergänzen:
  ```ts
          { provide: ArticleImportApi, useValue: { importArticles: vi.fn() } },
  ```
  und bei den Imports oben nach `import { ReleaseApi } from '../../data/release-api';`:
  ```ts
  import { ArticleImportApi } from '../../data/article-import-api';
  ```
  Direkt nach dem schließenden `});` des Blocks `describe('scan', …)` und vor `describe('cardClick', …)` einfügen:
  ```ts
    describe('article import', () => {
      const IMPORT_BUTTON = 'button[aria-label="Importieren"]';

      it('render_AdminWithCard_ShowsImportButtonOnCard', async () => {
        // Arrange
        isAdminSignal.set(true);
        itemsSignal.set([buildCard()]);

        // Act
        const { fixture } = await createPage();

        // Assert
        expect((fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON)).not.toBeNull();
      });

      it('render_NonAdminWithCard_ShowsNoImportButton', async () => {
        // Arrange
        isAdminSignal.set(false);
        itemsSignal.set([buildCard()]);

        // Act
        const { fixture } = await createPage();

        // Assert
        expect((fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON)).toBeNull();
      });

      it('onImportArticles_Card_OpensImportDialogForThatSellerWithoutOpeningDetailModal', async () => {
        // Arrange
        const { component } = await createPage();

        // Act
        component.onImportArticles(buildCard({ id: 's1' }));

        // Assert
        expect(component.articleImportVisible()).toBe(true);
        expect(component.articleImportSellerId()).toBe('s1');
        expect(component.detailModalVisible()).toBe(false);
      });

      it('onArticleImportVisibleChange_False_ClosesDialogAndClearsSellerId', async () => {
        // Arrange
        const { component } = await createPage();
        component.onImportArticles(buildCard({ id: 's1' }));

        // Act
        component.onArticleImportVisibleChange(false);

        // Assert
        expect(component.articleImportVisible()).toBe(false);
        expect(component.articleImportSellerId()).toBeNull();
      });

      it('onArticlesImported_Count_ReloadsListAndShowsCountInToast', async () => {
        // Arrange
        const { component } = await createPage();
        load.mockClear();

        // Act
        component.onArticlesImported(3);

        // Assert
        expect(load).toHaveBeenCalled();
        expect(messageServiceAdd).toHaveBeenCalledWith(
          expect.objectContaining({ severity: 'success', summary: '✓ 3 Artikel importiert' }),
        );
      });
    });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL (Compile-Fehler: `onImportArticles`, `articleImportVisible` unbekannt)
- [ ] **Schritt 3: Minimal implementieren**
  In `sellers-page.ts`: Import ergänzen (bei den Komponenten-Imports nach `import { ReleaseDialog } from '../../components/release-dialog/release-dialog';`):
  ```ts
  import { ArticleImportDialog } from '../../components/article-import-dialog/article-import-dialog';
  ```
  im `imports`-Array des `@Component` nach `ReleaseDialog,` einfügen: `ArticleImportDialog,`. Nach dem Block `// Freigeben-Popup (Round-18 Task 4).` (nach `releaseDialogSellerId`) einfügen:
  ```ts
    // Artikel-Import-Modal.
    readonly articleImportVisible = signal(false);
    readonly articleImportSellerId = signal<string | null>(null);
  ```
  und nach der Methode `onReleased()` einfügen:
  ```ts
    onImportArticles(card: SellerCardModel): void {
      this.articleImportSellerId.set(card.id);
      this.articleImportVisible.set(true);
    }

    onArticleImportVisibleChange(visible: boolean): void {
      this.articleImportVisible.set(visible);
      if (!visible) {
        this.articleImportSellerId.set(null);
      }
    }

    onArticlesImported(count: number): void {
      this.sellersStore.load();
      this.messageService.add({ severity: 'success', summary: `✓ ${count} Artikel importiert` });
    }
  ```
  In `sellers-page.html` an `<app-seller-card …>` nach `(scan)="onScan($event)"` ergänzen:
  ```html
                  [importVisible]="isAdmin()"
                  (importArticles)="onImportArticles($event)"
  ```
  und nach dem `<app-release-dialog … />`-Element einfügen:
  ```html
  <app-article-import-dialog
    [visible]="articleImportVisible()"
    [sellerId]="articleImportSellerId() ?? ''"
    (visibleChange)="onArticleImportVisibleChange($event)"
    (imported)="onArticlesImported($event)"
  />
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS aller Tests der Datei. Danach `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK ohne Fehler, und `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK.
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page` · `git commit -m "feat(article-import): Import-Modal auf der Verkäufer-Seite verdrahten"`

---

### Task 12: Badge „Neu" in den Admin-Listen für Marken und Kategorien absichern

**ACs:** AC-23

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.spec.ts` · `describe('BrandsPage'`
- Test: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.spec.ts` · `describe('CategoriesPage'`

**Interfaces:**
- Consumes: bestehend `BrandsPage.rows()`/`BrandsPage.columns` (`brands-page.ts`: `originalLabel: brand.original ? '✓ Original' : 'Neu'`, Spalte `originalLabel` vom Typ `badge` mit `badgeSeverity` → `'warn'` für alles außer `'✓ Original'`), `CategoriesPage.rows()`/`CategoriesPage.columns` (gleiche Ableitung in `categories-page.ts`); bestehend `GET /api/brands` bzw. `GET /api/categories` liefern `original` aus `Brand.Original`/`Category.Original` (`BrandEndpoints`, `CategoryEndpoints`). Die Anlage mit `Original = false` durch den Import belegt Task 4 (`Handle_UnknownBrandAndCategoryWithSpaces_CreatesThemAsNewTrimmed`).
- Produces: keine Produktionsänderung; je ein Test, der das Bestandsverhalten „`original = false` → Badge „Neu"" für die Admin-Listen festschreibt, damit die zweite Teilaussage von AC-23 belegt ist.

- [ ] **Schritt 1: Tests schreiben**
  In `brands-page.spec.ts` vor dem schließenden `});` von `describe('BrandsPage', …)` (nach dem Block `describe('filter toolbar', …)`) einfügen:
  ```ts
    describe('badge Neu', () => {
      it('rows_brandNotOriginal_labelsRowNeuWithWarnBadge', () => {
        // Arrange
        brandsSignal.set([brand({ id: 'b9', name: 'Icepeak', original: false })]);
        const { component } = createPage();
        const badgeColumn = component.columns.find((column) => column.field === 'originalLabel');

        // Act
        const label = component.rows()[0].originalLabel;

        // Assert
        expect(label).toBe('Neu');
        expect(badgeColumn?.type).toBe('badge');
        expect(badgeColumn?.badgeSeverity?.(label)).toBe('warn');
      });
    });
  ```
  In `categories-page.spec.ts` vor dem schließenden `});` von `describe('CategoriesPage', …)` (letzte Zeile der Datei) einfügen:
  ```ts
    describe('badge Neu', () => {
      it('rows_categoryNotOriginal_labelsRowNeuWithWarnBadge', () => {
        // Arrange
        categoriesSignal.set([category({ id: 'c9', name: 'Ski Jacke', original: false })]);
        const { component } = createPage();
        const badgeColumn = component.columns.find((column) => column.field === 'originalLabel');

        // Act
        const label = component.rows()[0].originalLabel;

        // Assert
        expect(label).toBe('Neu');
        expect(badgeColumn?.type).toBe('badge');
        expect(badgeColumn?.badgeSeverity?.(label)).toBe('warn');
      });
    });
  ```
- [ ] **Schritt 2: Tests laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/brands/pages/brands-page/brands-page.spec.ts` — erwartet: PASS aller Tests der Datei inklusive `rows_brandNotOriginal_labelsRowNeuWithWarnBadge`. Danach `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/categories/pages/categories-page/categories-page.spec.ts` — erwartet: PASS aller Tests der Datei inklusive `rows_categoryNotOriginal_labelsRowNeuWithWarnBadge`. Die Tests sichern Bestandsverhalten ab und sind sofort grün; ein FAIL ist ein Plan-Befund (Admin-Listen leiten den Badge nicht aus `original` ab) und wird gemeldet, nicht umgangen.
- [ ] **Schritt 3: Commit**
  `git add src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.spec.ts src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.spec.ts` · `git commit -m "test(article-import): Badge „Neu“ in den Admin-Listen für Marken und Kategorien absichern"`

## Entscheidungen
- Keine Fragen an den Menschen.
- **E · Port für das Einlesen** · Planer — `IArticleTableReader` liegt in `Bazaar.Domain.Ports`, die Implementierung in Infrastructure; Application darf Infrastructure nicht kennen (`DependencyDirectionTests`), und so bleibt der Handler ohne Datei-Bibliothek testbar.
- **E · Bibliotheken** · Planer — XLSX/XLS über ExcelDataReader (liest beide Formate, ohne Office), CSV über einen eigenen kleinen Parser (feste Semikolon-Trennung, garantiert erhaltene Leerzeilen für stimmige Zeilennummern, keine Fremd-API zu raten); ClosedXML nur im Testprojekt, um XLSX-Dateien zu erzeugen.
- **E · Reader je Endung** · Planer — `.xlsx` → `CreateOpenXmlReader`, `.xls` → `CreateBinaryReader` statt der automatischen `CreateReader`, weil diese bei unbekanntem Inhalt stillschweigend als CSV liest und eine beschädigte Datei (AC-26) nicht als Fehler erkennen würde.
- **E · Kein automatisierter .xls-Test** · Planer — Im Testprojekt gibt es keinen Schreiber für das alte BIFF-Format; der `.xls`-Pfad teilt den Code mit `.xlsx` und ist nur über den Fehlerfall (beschädigte Datei) abgedeckt. Ein manueller Test mit einer echten .xls-Datei steht vor Abnahme aus.
- **E · Zeilenzahlen mit Leerzeilen** · Planer — Der Reader liefert Leerzeilen mit, damit „Index + 1" die Zeilennummer der Datei ist; schlägt `ReadRows_XlsxWithGapRow_*` fehl, ist das ein Befund zur Bibliothek, kein Anlass zur Umgehung.
- **E · Zellwerte als Text parsen** · Planer — Numerische Excel-Zellen werden invariant zu Text und dann wie CSV-Zellen geprüft; so gelten Artikelnummer und Preis in allen drei Formaten gleich, und ein Excel-Preis wie 199,95 scheitert zuverlässig als „keine Ganzzahl".
- **E · Sprache über CultureInfo** · Planer — Die Browser-Sprache (`navigator.language`) wird über `CultureInfo.GetCultureInfo` gelesen, unbekannt oder fehlend → invariante Kultur. Der Backend-Container (`mcr.microsoft.com/dotnet/aspnet:10.0`, Debian) bringt die dafür nötigen Kulturdaten mit; mit `InvariantGlobalization` würde das Komma nicht erkannt.
- **E · Vergeben-Prüfung auch bei sonst fehlerhaften Zeilen** · Planer — Der Parser meldet jede Zeile mit gültiger, erstmals vorkommender Nummer (`NumberedRows`), damit „alle Fehler" auch eine vergebene Nummer in einer Zeile mit weiterem Fehler enthält.
- **E · Fehlerantwort** · Planer — Zeilenfehler kommen als `400` mit `errorCode = import.invalid_rows`, mehrzeiligem `detail` (genau der Text für das Modal) und `errorCount`; das Modal zeigt `detail` unverändert an. `import.no_articles` trägt „Datei enthält keine Artikel" (AC-24).
- **E · Backend-Größenprüfung** · Planer — Zusätzlich zur Modalprüfung (AC-09) lehnt der Endpoint Dateien über 2 MB ab; der Proxy (Task 6) fängt vorher alles über 2100k mit 413 ab, das Modal übersetzt auch diesen Fall.
- **E · Wrapper statt `p-fileupload`** · Planer — Die Grundregel erlaubt einen eigenen Wrapper für Fehlendes: `p-fileupload` filtert unzulässige Typen und Mehrfachauswahl selbst und kennt die geforderten Hinweise (AC-06, AC-07) nicht. `FileDropzone` meldet nur die Auswahl, das Modal prüft Typ, Anzahl und Größe.
- **E · Ungültige Auswahl behält die bisherige Datei** · Planer — Eine abgelehnte Datei (falscher Typ, zwei Dateien) zeigt den Hinweis, ersetzt aber nicht die bereits gewählte gültige Datei; AC-08 verlangt Ersetzen nur durch eine andere gültige Datei.
- **E · Erfolgsablauf** · Planer — Das Modal meldet `imported(count)` und `visibleChange(false)` erst nach 1,5 s Erfolgsanzeige; die Seite lädt dann die Kacheln neu und zeigt den Hinweis „✓ n Artikel importiert". Das Modal setzt sich bei jedem Öffnen zurück.
- **E · Proxy-Datei** · Planer — Der Reverse-Proxy des Betriebs ist `nginx/nginx.conf.template` (eingebunden über `docker-compose.local.yml`); die Dev-Proxy-Datei `proxy.conf.json` des Angular-Servers hat keine Grenzen und bleibt unverändert.
- **R1 · Global Constraints** — geändert — AC-29 hatte nur einen Shell-Befehl als Nachweis. Task 6 legt jetzt im bestehenden Projekt `Bazaar.Architecture.Tests` den Testfall `NginxProxyLimitsTests.ApiLocation_ArticleImportLimits_ContainsDirective` an (Theory über die drei Direktiven `client_max_body_size 2m;`, `proxy_read_timeout 180s;`, `proxy_send_timeout 180s;`), der `nginx/nginx.conf.template` per Aufstieg ab `AppContext.BaseDirectory` liest (Muster `ProgramJsonOptionsRegistrationTests`) und den Block `location /api/` per Regex prüft; Rot/Grün über `dv-dotnet-test`, der awk-Befehl bleibt Zusatzprüfung. Restliches AC-29 geprüft: Upload-Grenze und Antwortzeit sind mit den drei Direktiven abgedeckt, das Frontend-Timeout liegt bei AC-28.
- **F · Task 4** — geändert — Vorschlag 2: `ImportSellerArticlesHandler.EnsureSellerExists` heißt jetzt `EnsureSellerOpen` und wirft nach der Existenzprüfung `ConflictException("Verkäufer ist bereits abgerechnet", "settlement.locked")`, wenn `Seller.SettledAt` gesetzt ist — vor dem Lesen der Datei, nach dem Muster von `UpdateArticleHandler`/`ReturnArticleHandler` (409 über `DomainExceptionHandler`). Neuer Test `Handle_SettledSeller_ThrowsSettlementLockedWithoutReadingFile` (Verkäufer per `Seller.Settle` abgerechnet); Interfaces und Global Constraints nennen die Ablehnung. Die Spec nennt nur den deaktivierten Button und lässt die Serverseite offen; die Festlegung trifft der Plan, die Spec bleibt unverändert. Diese Festlegung ersetzt den Eintrag „E · Kein Backend-Zustandscheck für abgerechnete Verkäufer". Die Doppelung der Marken-/Kategorie-Anlage mit `RunImportHandler` und das Zeitfenster zwischen Nummernprüfung und Speichern bleiben bewusst bestehen (nicht Teil des gewählten Vorschlags; Transaktion wahrt alles-oder-nichts).
- **F · Task 6** — geändert — Vorschlag 1: `client_max_body_size` steht jetzt auf `2100k` statt `2m`, weil nginx den ganzen multipart-Body zählt (Grenzen, Feldköpfe, Feld `locale`); eine Datei von knapp oder genau 2 MB (AC-29) kommt so beim Backend an, die genaue 2-MB-Grenze prüfen Modal (`MAX_FILE_BYTES`) und Endpoint (`MaxFileBytes`). Regex in `NginxProxyLimitsTests`, nginx-Snippet, Produces, Architektur-Zeile und awk-Zusatzprüfung sind nachgezogen. Damit gilt im Eintrag „E · Backend-Größenprüfung" der Proxy-413 nur noch oberhalb von 2100k.
- **F · Task 8** — geändert — Vorschlag 1: `FileDropzone` liegt jetzt unter `src/bazaar-app/frontend/src/app/shared/components/file-dropzone/` (ts, html, scss, spec) wie die übrigen featureunabhängigen Wrapper; Test- und Commit-Pfade sind angepasst, Task 9 importiert sie über `../../../../shared/components/file-dropzone/file-dropzone`. Neuer Schritt 5 legt `docs/components/file-dropzone/component.md` (C-026) an und verlinkt sie im Komponenten-Index und im PrimeNG-Mapping (`Form & Eingaben`) von `docs/components/overview.md`; der Commit ist Schritt 6.
- **F · Task 9** — geändert — Vorschlag 1: Die PrimeNG-Prüfung ruft `mcp__primeng__validate_usage` jetzt je Komponente des Templates auf (`dialog`, `message`, `progressspinner`, `button`), jeweils mit dem eigenen Template-Ausschnitt und Parameternamen laut geladenem Tool-Schema; erwartet ist je Aufruf `valid: true`, Befunde werden im Template korrigiert und erneut geprüft.
- **R2 · AC-23** — geändert — Ganzes AC-23 gegen den Plan geprüft: Anlage von „Icepeak" (getrimmt) und „Ski Jacke" mit `Original = false` und der Artikel mit diesen Namen sind in Task 4 belegt (`Handle_UnknownBrandAndCategoryWithSpaces_CreatesThemAsNewTrimmed`, `Handle_UnknownBrandAndCategory_ArticleCarriesTheNewNames`); der Handler kennt keine Rolle und setzt immer `original: false`, damit gilt das auch bei Auslösung durch einen Admin. Für die Teilaussage „Badge „Neu" in den Admin-Listen" neuer Task 12 (angehängt, keine Umnummerierung): Charakterisierungstests in `brands-page.spec.ts` und `categories-page.spec.ts` schreiben fest, dass `original = false` als `originalLabel` „Neu" mit Badge-Severity `warn` erscheint; im Code geprüft, dass beide Seiten das bereits so ableiten und `GET /api/brands`/`/api/categories` `original` aus dem Domänenobjekt liefern. Keine Produktionsänderung; die bestehenden Specs hatten keinen solchen Test.
- **R2 · Task 4** — geändert — Die Prüfung auf vergebene Nummern (`FindTakenNumberErrors` → `GetByNumbers`), die Fehlerentscheidung (`ThrowIfInvalid`) und das Schreiben (`SaveLines`, vormals `Save` mit eigener Transaktion) laufen jetzt gemeinsam in einem `ExecuteInTransactionAsync`-Block in `Handle` (Muster `IntakeHandler`); nur Datei lesen und Zeilen prüfen bleiben davor. Damit schrumpft das Zeitfenster zwischen Prüfung und Insert von der gesamten Lese-/Prüfdauer (bis zu Minuten) auf die Dauer innerhalb der Transaktion, und eine Nummer, die bis zum Transaktionsbeginn vergeben wurde, endet als `import.invalid_rows` mit Zeilenmeldung statt als 500. Neue Tests `Handle_TakenNumberCheck_RunsInsideTransaction` und `Handle_NumberTakenAtCheckInsideTransaction_ThrowsInvalidRowsAndAddsNothing`; Interfaces nachgezogen. Festlegung: Die Rest-Race innerhalb der Transaktion (Read Committed, keine Sperre) wird wie im `IntakeHandler` hingenommen — der Unique-Index auf `Article.Number` verhindert Doppelnummern, die Transaktion rollt zurück, alles-oder-nichts bleibt erhalten; eine zentrale Abbildung von Postgres-23505 in `EfUnitOfWork` gibt es im Backend noch nicht und bleibt außerhalb dieses Auftrags.
- **F · Task 11** — geändert — Vorschlag 1: Die Einfügestelle des Blocks `describe('article import', …)` lautet jetzt „direkt nach dem schließenden `});` des Blocks `describe('scan', …)` und vor `describe('cardClick', …)`"; der widersprüchliche Zusatz „vor dem schließenden `});` der Datei" ist gestrichen (im Code geprüft: `scan` steht vor `cardClick`, `edit`, `statusClick`, `onResetSettlement` und dem Layout-Block).
- **F · Task 2** — geändert — Vorschlag 1: `ArticleTableReader` hat die Konstante `MaxRows = 100_000`; `ReadFirstSheet` bricht beim Lesen der 100.001. Zeile mit `BadRequestException("Die Datei konnte nicht gelesen werden (mehr als 100.000 Zeilen)", "import.unreadable_file")` ab (Guard `EnsureBelowRowLimit`), neuer Test `ReadRows_XlsxWithMoreRowsThanLimit_ThrowsUnreadableFile` (Schritt 4 erwartet zwölf Tests). Festlegung des Grenzwerts: 100.000 statt der beispielhaften 20.000, weil der Leser nur gegen aufgeblähte Mappen schützt (2 MB gepackt, Dimension bis Zeile 1.048.576) und reguläre große Dateien vorher an der verständlicheren Datenzeilen-Grenze des Handlers (20.000, siehe F · Task 4 dieses Laufs) scheitern sollen; CSV ist durch die 2-MB-Grenze bereits begrenzt und bleibt ohne Leser-Grenze.
- **F · Task 4** — geändert — Vorschlag 1: Der Handler hat `MaxDataRows = 20_000` und wirft nach dem Lesen, vor Zeilenprüfung und Transaktion, `import.too_many_rows` („Die Datei enthält mehr als 20.000 Zeilen nach der Kopfzeile", Leerzeilen zählen mit); Begründung im Code: ein `Add` je Zeile mit eigenem `SaveChanges` muss innerhalb von 3 Minuten bleiben, 20.000 liegt weit über jeder Verkäuferliste. Der Token geht an `ExecuteInTransactionAsync` und an `GetByNumbers` (Signatur in Task 1 um `CancellationToken` erweitert, `ToListAsync(cancellationToken)`, Test nutzt `TestContext.Current.CancellationToken`); weil die Bestands-Ports `Add` ohne Token anbieten, prüft `SaveLines` den Token vor jedem Artikel (`ThrowIfCancellationRequested`), ein Client-Abbruch rollt die Transaktion zurück. Neue Tests `Handle_MoreDataRowsThanLimit_ThrowsTooManyRowsWithoutTransaction`, `Handle_ExactlyLimitDataRows_ImportsAllRows`, `Handle_CancelledDuringSave_StopsAddingAndThrowsCancellation`, `Handle_TakenNumberCheck_PassesRequestTokenToRepository`; alle `GetByNumbers`-Mocks nehmen `It.IsAny<CancellationToken>()`. Der Parallelfall (gleiche Nummer innerhalb der Transaktion angelegt) bleibt dokumentiertes Restrisiko im Handler-Kommentar: Unique-Index greift, nichts gespeichert, Antwort 500.
- **F · Task 5** — geändert — Vorschlag 1: Die Interfaces nennen jetzt, warum `ParseImportRequest` bewusst getrennt von `ImportEndpoints.ParseRunImportRequest` bleibt: dort sind das JSON-Feld `options` Pflicht und keine Größenprüfung, hier das optionale Feld `locale` und die 2-MB-Grenze; ein gemeinsamer Helfer bräuchte ein umschaltendes Flag. Der Fehlercode `import.invalid_format` ist absichtlich gleich, der Text „Es wurde keine Datei übermittelt" datei-spezifisch.
- **F · Task 8** — geändert — Vorschlag 1: Die Prüfung erfolgte gegen den installierten Quelltext von PrimeNG 22.1.1 (`node_modules/primeng/fesm2022/primeng-fileupload.mjs`) statt per `validate_usage`, weil die Dropzone `p-fileupload` nicht verwendet und `validate_usage` nur eine vorhandene Verwendung prüft. Ergebnis: Drop nur in `mode="advanced"`; ohne `multiple` verwirft `onDrop` zwei oder mehr Dateien still (kein `onSelect`, AC-07 nicht erfüllbar); mit `multiple` meldet `onSelect` alle Dateien, führt aber eine sich ansammelnde eigene Dateiliste mit Buttons und Meldungen, gegen die AC-08 per `clear()` und Template-Überschreibung durchgesetzt werden müsste. Es bleibt beim Wrapper; die Begründung steht geschärft in den Interfaces von Task 8, in Abschnitt 3 der `component.md` und in der Index-Zeile von `docs/components/overview.md`. Sie präzisiert den Eintrag „E · Wrapper statt `p-fileupload`".
