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
