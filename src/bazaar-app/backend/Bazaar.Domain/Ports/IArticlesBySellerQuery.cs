namespace Bazaar.Domain.Ports;

/// <summary>
/// Placeholder port until the Articles table exists (Round-15). Used by
/// GetSellerArticlesHandler (GET /api/sellers/{id}/articles). This Round
/// only provides the port contract (Domain concern) — Infrastructure's
/// placeholder implementation is a separate task.
/// </summary>
public interface IArticlesBySellerQuery
{
    Task<IReadOnlyList<SellerArticleSummary>> GetBySellerId(string sellerId);
}

public sealed record SellerArticleSummary(
    string Id,
    int Number,
    string Name,
    string? Brand,
    string? Category,
    decimal Price,
    string Status,
    bool SoldManually);
