namespace BAR.Application.Blocks.GetMine;

public sealed record BlockResult(string Id, string SellerId, int FromNumber, int ToNumber, DateTime AssignedAt);
