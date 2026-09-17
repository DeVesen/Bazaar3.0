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
        var records = SplitIntoRecords(text);
        var rows = new List<ImportRawRow>();

        for (var i = 1; i < records.Count; i++)
        {
            var (lineNumber, cells) = records[i];
            if (cells.Count < 6)
            {
                throw new FormatException($"Zeile {lineNumber}: erwartet 6 Spalten, gefunden {cells.Count}.");
            }
            rows.Add(new ImportRawRow(lineNumber, cells[0], cells[1], cells[2], cells[3], cells[4], cells[5]));
        }
        return rows;
    }

    /// <summary>
    /// RFC-4180-aware CSV record splitting: a naive Split(["\r\n","\n"]) on
    /// the whole file, followed by Split(';') per line, breaks the moment a
    /// quoted field (written by ArticleCsvWriter for values containing ';',
    /// '"' or a line break) itself contains a literal '\r'/'\n' - that
    /// embedded newline would wrongly end the record early. This single pass
    /// tracks quote state character-by-character, so both the line-splitting
    /// and the cell-splitting stay quote-aware. Only ';' is a delimiter and
    /// only '"' is the quote character (6-column fixed-shape format; no
    /// external CSV library is warranted for this).
    /// </summary>
    private static List<(int LineNumber, List<string> Fields)> SplitIntoRecords(string text)
    {
        var records = new List<(int, List<string>)>();
        var currentFields = new List<string>();
        var field = new StringBuilder();
        var inQuotes = false;
        var lineNumber = 1;
        var recordStartLine = 1;

        void EndField()
        {
            currentFields.Add(field.ToString());
            field.Clear();
        }

        void EndRecord()
        {
            EndField();
            records.Add((recordStartLine, currentFields));
            currentFields = [];
        }

        var i = 0;
        while (i < text.Length)
        {
            var c = text[i];

            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < text.Length && text[i + 1] == '"')
                    {
                        field.Append('"');
                        i += 2;
                        continue;
                    }
                    inQuotes = false;
                    i++;
                    continue;
                }
                if (c == '\n')
                {
                    lineNumber++;
                }
                field.Append(c);
                i++;
                continue;
            }

            if (c == '"' && field.Length == 0)
            {
                inQuotes = true;
                i++;
                continue;
            }
            if (c == ';')
            {
                EndField();
                i++;
                continue;
            }
            if (c == '\r' || c == '\n')
            {
                var hasContent = field.Length > 0 || currentFields.Count > 0;
                if (hasContent)
                {
                    EndRecord();
                }
                lineNumber++;
                recordStartLine = lineNumber;
                i++;
                if (c == '\r' && i < text.Length && text[i] == '\n')
                {
                    i++;
                }
                continue;
            }

            field.Append(c);
            i++;
        }

        if (field.Length > 0 || currentFields.Count > 0)
        {
            EndRecord();
        }

        return records;
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
