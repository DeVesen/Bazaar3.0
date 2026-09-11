namespace BAR.Modules.Export.Application;

public sealed record ExportArticleResponse(
    string Id, int Number, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description);

public sealed record ExportSellerResponse(
    string Id, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, string SellerType, IReadOnlyList<ExportArticleResponse> Articles);

public sealed record ExportResponse(
    DateTime GeneratedAt, IReadOnlyList<ExportSellerResponse> Sellers,
    IReadOnlyList<string> Brands, IReadOnlyList<string> Categories);

public sealed record GetExportQuery(bool IncludeBrands, bool IncludeCategories);
