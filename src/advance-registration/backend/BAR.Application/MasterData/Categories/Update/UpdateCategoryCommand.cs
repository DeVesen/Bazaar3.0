namespace BAR.Application.MasterData.Categories.Update;

public sealed record UpdateCategoryCommand(string Id, string Name, bool Original);
