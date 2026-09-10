namespace BAR.Domain.Settings;

public sealed class Settings
{
    public const string SingletonId = "settings";
    private const int InfoTextMaxLength = 4000;

    private Settings() { }

    public string Id { get; private init; } = SingletonId;
    public DateTime? RegistrationDeadline { get; private set; }
    public DateTime? DropOffFrom { get; private set; }
    public DateTime? DropOffUntil { get; private set; }
    public DateTime? BazaarFrom { get; private set; }
    public DateTime? BazaarUntil { get; private set; }
    public string? DefaultTypeId { get; private set; }
    public string? InfoText { get; private set; }
    public int StartNumber { get; private set; }
    public int BlockSize { get; private set; }
    public int DefaultBlockCount { get; private set; }

    public static Settings Create(
        DateTime? registrationDeadline, DateTime? dropOffFrom, DateTime? dropOffUntil,
        DateTime? bazaarFrom, DateTime? bazaarUntil, string? defaultTypeId, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        Validate(registrationDeadline, dropOffFrom, dropOffUntil, bazaarFrom, bazaarUntil, infoText, startNumber, blockSize, defaultBlockCount);

        return new Settings
        {
            RegistrationDeadline = registrationDeadline, DropOffFrom = dropOffFrom,
            DropOffUntil = dropOffUntil, BazaarFrom = bazaarFrom, BazaarUntil = bazaarUntil,
            DefaultTypeId = defaultTypeId, InfoText = infoText, StartNumber = startNumber,
            BlockSize = blockSize, DefaultBlockCount = defaultBlockCount
        };
    }

    public void Update(
        DateTime? registrationDeadline, DateTime? dropOffFrom, DateTime? dropOffUntil,
        DateTime? bazaarFrom, DateTime? bazaarUntil, string? defaultTypeId, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        Validate(registrationDeadline, dropOffFrom, dropOffUntil, bazaarFrom, bazaarUntil, infoText, startNumber, blockSize, defaultBlockCount);

        RegistrationDeadline = registrationDeadline; DropOffFrom = dropOffFrom;
        DropOffUntil = dropOffUntil; BazaarFrom = bazaarFrom; BazaarUntil = bazaarUntil;
        DefaultTypeId = defaultTypeId; InfoText = infoText; StartNumber = startNumber;
        BlockSize = blockSize; DefaultBlockCount = defaultBlockCount;
    }

    private static void Validate(
        DateTime? registrationDeadline, DateTime? dropOffFrom, DateTime? dropOffUntil,
        DateTime? bazaarFrom, DateTime? bazaarUntil, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        if (infoText is { Length: > InfoTextMaxLength })
        {
            throw new ArgumentException($"infoText darf maximal {InfoTextMaxLength} Zeichen haben.", nameof(infoText));
        }

        if (startNumber <= 0) throw new ArgumentException("startNumber muss > 0 sein.", nameof(startNumber));
        if (blockSize <= 0) throw new ArgumentException("blockSize muss > 0 sein.", nameof(blockSize));
        if (defaultBlockCount <= 0) throw new ArgumentException("defaultBlockCount muss > 0 sein.", nameof(defaultBlockCount));

        DateTime? previous = null;
        foreach (var value in new[] { registrationDeadline, dropOffFrom, dropOffUntil, bazaarFrom, bazaarUntil })
        {
            if (value is null) continue;
            if (previous is not null && value < previous)
            {
                throw new ArgumentException("Termine müssen aufsteigend sein.");
            }
            previous = value;
        }
    }
}
