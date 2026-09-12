namespace BAR.Modules.MasterData.Contracts.MasterData;

public sealed record CategoryDto(string Id, string Name, bool Original, int? ArticleCount);

public sealed record CreateCategoryCommand(string Name, bool IsAdmin);

public sealed record UpdateCategoryCommand(string Name, bool Original);
