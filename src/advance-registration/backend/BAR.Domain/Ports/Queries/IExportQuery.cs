namespace BAR.Domain.Ports.Queries;

public interface IExportQuery
{
    Task<ExportResult> ExecuteAsync(bool includeBrands, bool includeCategories, CancellationToken cancellationToken);
}

public sealed record ExportResult(
    IReadOnlyList<ExportSeller> Sellers,
    IReadOnlyList<string> Brands,
    IReadOnlyList<string> Categories);

public sealed record ExportSeller(
    string Id,
    string FirstName,
    string LastName,
    string? Address,
    string PostalCode,
    string City,
    string Phone,
    string Email,
    string SellerType,
    IReadOnlyList<ExportArticle> Articles);

public sealed record ExportArticle(
    string Id,
    int Number,
    string Name,
    string Brand,
    string Category,
    decimal Price,
    string? Size,
    string? Color,
    string? Description);
