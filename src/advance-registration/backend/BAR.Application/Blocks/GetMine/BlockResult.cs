namespace BAR.Application.Blocks.GetMine;

public sealed record BlockResult(
    string Id, string SellerId, int FromNumber, int ToNumber,
    int NumberCount, int UsedCount, DateTime AssignedAt);
