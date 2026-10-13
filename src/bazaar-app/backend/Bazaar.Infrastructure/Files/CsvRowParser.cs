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
