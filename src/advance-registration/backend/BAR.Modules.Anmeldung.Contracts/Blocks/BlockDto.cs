namespace BAR.Modules.Anmeldung.Contracts.Blocks;

public sealed record BlockDto(string Id, string SellerId, int FromNumber, int ToNumber, int NumberCount, int UsedCount, DateTime AssignedAt);

public sealed record NextFreeResultDto(int StartNumber);

public sealed record ReserveBlocksCommand(string SellerId, int? StartNumber, int? BlockCount);

public sealed record DeleteBlockCommand(string SellerId, string BlockId);
