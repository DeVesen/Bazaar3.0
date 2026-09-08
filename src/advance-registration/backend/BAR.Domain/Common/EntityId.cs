namespace BAR.Domain.Common;

/// <summary>
/// Erzeugt die 8-stellige alphanumerische ID aller Entitaeten
/// (spec.md Abschnitt 11.5, entities/overview.md).
/// </summary>
/// <remarks>
/// Kein Vorab-Unique-Check gegen die Datenbank: Check-dann-Insert ist eine Race
/// Condition. Die Wahrheit ist der Unique-Index - der aufrufende Handler faengt
/// den Unique-Verstoss ab und wuerfelt erneut. Bei 62^8 Kombinationen tritt das
/// praktisch nie ein.
/// </remarks>
public static class EntityId
{
    public const int Length = 8;

    private const string Alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public static string New()
    {
        var chars = new char[Length];
        for (var i = 0; i < Length; i++)
        {
            chars[i] = Alphabet[System.Security.Cryptography.RandomNumberGenerator.GetInt32(Alphabet.Length)];
        }

        return new string(chars);
    }

    public static bool IsValid(string? value) =>
        value is { Length: Length } && value.All(Alphabet.Contains);
}
