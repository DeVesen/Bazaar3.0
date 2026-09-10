namespace BAR.Application.Export;

public sealed record ExportResponse(
    DateTime ExportedAt,
    IReadOnlyList<ExportSellerResponse> Sellers,
    IReadOnlyList<string> Brands,
    IReadOnlyList<string> Categories);

public sealed record ExportSellerResponse(
    string Id,
    string FirstName,
    string LastName,
    string? Address,
    string PostalCode,
    string City,
    string Phone,
    string Email,
    string SellerType,
    IReadOnlyList<ExportArticleResponse> Articles);

public sealed record ExportArticleResponse(
    string Id,
    int Number,
    string Name,
    string Brand,
    string Category,
    decimal Price,
    string? Size,
    string? Color,
    string? Description);
