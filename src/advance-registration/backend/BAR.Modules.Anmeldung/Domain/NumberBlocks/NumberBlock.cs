using BAR.SharedKernel;

namespace BAR.Modules.Anmeldung.Domain.NumberBlocks;

public sealed class NumberBlock
{
    private NumberBlock() { }

    public string Id { get; private init; } = null!;
    public string SellerId { get; private init; } = null!;
    public int FromNumber { get; private init; }
    public int ToNumber { get; private init; }
    public DateTime AssignedAt { get; private init; }

    public static NumberBlock Assign(string sellerId, int fromNumber, int blockSize, DateTime assignedAtUtc) =>
        new()
        {
            Id = EntityId.New(), SellerId = sellerId, FromNumber = fromNumber,
            ToNumber = fromNumber + blockSize - 1, AssignedAt = assignedAtUtc
        };
}
