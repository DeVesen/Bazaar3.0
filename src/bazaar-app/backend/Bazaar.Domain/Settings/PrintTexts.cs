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
