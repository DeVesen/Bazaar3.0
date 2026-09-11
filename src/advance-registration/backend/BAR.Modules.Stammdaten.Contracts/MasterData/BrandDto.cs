namespace BAR.Modules.Stammdaten.Contracts.MasterData;

public sealed record BrandDto(string Id, string Name, bool Original, int? ArticleCount);

public sealed record CreateBrandCommand(string Name, bool IsAdmin);

public sealed record UpdateBrandCommand(string Name, bool Original);
