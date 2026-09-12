namespace BAR.SharedKernel;

/// <summary>
/// Generates the 8-character alphanumeric ID of all entities in every module
/// (spec.md section 11.5, entities/overview.md).
/// </summary>
/// <remarks>
/// No upfront uniqueness check against the database: check-then-insert is a
/// race condition. The unique index is the source of truth - the calling
/// handler catches the uniqueness violation and rolls again. With 62^8
/// combinations this practically never happens.
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
