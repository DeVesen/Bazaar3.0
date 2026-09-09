namespace BAR.Domain.Settings;

public sealed class Settings
{
    public const string SingletonId = "settings";
    private const int InfoTextMaxLength = 4000;

    private Settings() { }

    public string Id { get; private init; } = SingletonId;
    public DateTime RegistrationDeadline { get; private init; }
    public DateTime DropOffFrom { get; private init; }
    public DateTime DropOffUntil { get; private init; }
    public DateTime BazaarFrom { get; private init; }
    public DateTime BazaarUntil { get; private init; }
    public string DefaultTypeId { get; private init; } = null!;
    public string? InfoText { get; private init; }
    public int StartNumber { get; private init; }
    public int BlockSize { get; private init; }
    public int DefaultBlockCount { get; private init; }

    public static Settings Create(
        DateTime registrationDeadline, DateTime dropOffFrom, DateTime dropOffUntil,
        DateTime bazaarFrom, DateTime bazaarUntil, string defaultTypeId, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        if (infoText is { Length: > InfoTextMaxLength })
        {
            throw new ArgumentException($"infoText darf maximal {InfoTextMaxLength} Zeichen haben.", nameof(infoText));
        }

        return new Settings
        {
            RegistrationDeadline = registrationDeadline, DropOffFrom = dropOffFrom,
            DropOffUntil = dropOffUntil, BazaarFrom = bazaarFrom, BazaarUntil = bazaarUntil,
            DefaultTypeId = defaultTypeId, InfoText = infoText, StartNumber = startNumber,
            BlockSize = blockSize, DefaultBlockCount = defaultBlockCount
        };
    }
}
