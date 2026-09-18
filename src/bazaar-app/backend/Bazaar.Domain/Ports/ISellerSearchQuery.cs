namespace Bazaar.Domain.Ports;

/// <summary>
/// Backs GET /api/sellers/search — the narrow, non-paginated seller
/// lookup used by Artikelannahme and Abrechnung. This task only defines
/// the port contract; the real implementation lands in Infrastructure in
/// a later task.
/// </summary>
public interface ISellerSearchQuery
{
    Task<IReadOnlyList<SellerSearchResult>> Search(string? q);
}

public sealed record SellerSearchResult(
    string Id,
    string FirstName,
    string LastName,
    string? City,
    string SellerType);
