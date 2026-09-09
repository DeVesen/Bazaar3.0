namespace BAR.Application.MasterData.Brands.Update;

public sealed record UpdateBrandCommand(string Id, string Name, bool Original);
