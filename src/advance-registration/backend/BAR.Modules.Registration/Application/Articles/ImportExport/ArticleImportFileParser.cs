using System.Text;
using ClosedXML.Excel;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

/// <summary>
/// Both CSV and .xlsx map onto the same ImportRawRow shape so
/// ArticleImportValidator (Task 7) never has to know which one was
/// uploaded. Values stay raw strings here - number/price parsing and
/// blank-vs-missing distinction is the validator's job, not the parser's.
/// </summary>
public static class ArticleImportFileParser
{
    public static IReadOnlyList<ImportRawRow> Parse(byte[] fileContent, string fileName)
    {
        if (fileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return ParseXlsx(fileContent);
        }
        if (fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        {
            return ParseCsv(fileContent);
        }
        throw new FormatException("Nur .csv oder .xlsx werden unterstützt.");
    }

    private static IReadOnlyList<ImportRawRow> ParseCsv(byte[] fileContent)
    {
        var text = Encoding.UTF8.GetString(StripBom(fileContent));
        var lines = text.Split(["\r\n", "\n"], StringSplitOptions.None).Where(l => l.Length > 0).ToList();
        var rows = new List<ImportRawRow>();

        for (var i = 1; i < lines.Count; i++)
        {
            var cells = lines[i].Split(';');
            if (cells.Length < 6)
            {
                throw new FormatException($"Zeile {i + 1}: erwartet 6 Spalten, gefunden {cells.Length}.");
            }
            rows.Add(new ImportRawRow(i + 1, cells[0], cells[1], cells[2], cells[3], cells[4], cells[5]));
        }
        return rows;
    }

    private static byte[] StripBom(byte[] content) =>
        content.Length >= 3 && content[0] == 0xEF && content[1] == 0xBB && content[2] == 0xBF
            ? content[3..]
            : content;

    private static IReadOnlyList<ImportRawRow> ParseXlsx(byte[] fileContent)
    {
        try
        {
            using var stream = new MemoryStream(fileContent);
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);

            return worksheet.RowsUsed().Skip(1)
                .Select(row => new ImportRawRow(
                    row.RowNumber(),
                    row.Cell(1).GetString(), row.Cell(2).GetString(), row.Cell(3).GetString(),
                    row.Cell(4).GetString(), row.Cell(5).GetString(), row.Cell(6).GetString()))
                .ToList();
        }
        catch (Exception ex)
        {
            throw new FormatException("Datei konnte nicht als XLSX gelesen werden.", ex);
        }
    }
}
