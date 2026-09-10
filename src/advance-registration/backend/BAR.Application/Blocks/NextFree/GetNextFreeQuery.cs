namespace BAR.Application.Blocks.NextFree;

public sealed record GetNextFreeQuery(int BlockCount);

public sealed record NextFreeResult(int StartNumber);
