namespace Bazaar.Domain.Ports;

/// <summary>
/// Placeholder port until the Articles table exists (Round-15/16).
/// Used by GetSellerCardsHandler (GET /api/sellers) for the seller-page
/// card grid. Infrastructure's implementation derives Status "settled" for
/// real (from SettledAt) but still returns "open" as a placeholder for
/// everything else (a real "selling" split needs released articles); the
/// six numeric fields stay placeholder-constant 0 until real article data
/// exists. See SellerCardsQuery's class summary for the full breakdown.
/// </summary>
public interface ISellerCardsQuery
{
    Task<SellerCardsPage> GetCards(string? q, string? status, string? sort, int page, int pageSize);
}

public sealed record SellerCardsPage(
    IReadOnlyList<SellerCard> Items,
    int TotalCount,
    int Page,
    int PageSize);

public sealed record SellerCard(
    string Id,
    string FirstName,
    string LastName,
    string? PostalCode,
    string? City,
    string SellerType,
    string Status,
    int ArticleCount,
    int ReleasedCount,
    int SoldCount,
    int ReturnedCount,
    decimal AcceptedValue,
    decimal OpenValue,
    decimal Revenue,
    DateTimeOffset? SettledAt);
