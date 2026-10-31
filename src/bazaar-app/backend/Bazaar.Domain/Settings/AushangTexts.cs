namespace Bazaar.Domain.Settings;

/// <summary>
/// Die vier Freitexte des Artikel-Aushangs (Kopfzeile links/Mitte, Fußzeile links/Mitte).
/// Das rechte Drittel von Kopf- und Fußzeile belegen feste Werte (Datum/Uhrzeit bzw.
/// „Seite x von y"). Markdown, Darstellung und Sanitizing sind Sache des Frontends.
/// </summary>
public sealed record AushangTexts(string Text1, string Text2, string Text3, string Text4)
{
    public const int MaxLength = PrintTexts.MaxLength;

    /// <summary>
    /// Immer eine neue Instanz: EF Core erlaubt nicht, dieselbe Complex-Type-Instanz
    /// in mehreren Properties oder Entities zu teilen.
    /// </summary>
    public static AushangTexts CreateEmpty() =>
        new(string.Empty, string.Empty, string.Empty, string.Empty);

    public IEnumerable<string> All()
    {
        yield return Text1;
        yield return Text2;
        yield return Text3;
        yield return Text4;
    }
}
