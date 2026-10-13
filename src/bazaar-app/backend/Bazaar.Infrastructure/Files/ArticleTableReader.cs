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
                .TrimStart('\uFEFF');
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
