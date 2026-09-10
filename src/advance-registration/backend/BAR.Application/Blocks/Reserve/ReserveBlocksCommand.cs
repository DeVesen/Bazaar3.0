namespace BAR.Application.Blocks.Reserve;

public sealed record ReserveBlocksCommand(string SellerId, int? StartNumber, int? BlockCount);

public sealed record BlockResponse(string Id, string SellerId, int FromNumber, int ToNumber, int NumberCount, int UsedCount, DateTime AssignedAt);
