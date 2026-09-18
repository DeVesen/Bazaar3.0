namespace Bazaar.Domain.Ports;

/// <summary>
/// Placeholder port until the Articles table exists (Round-15). Used by
/// DeleteSellerHandler's delete-lock check (a seller can only be deleted
/// while it has no articles). This Round only provides the port contract
/// (Domain concern) — Infrastructure's placeholder implementation is a
/// separate task.
/// </summary>
public interface IArticleCountBySellerQuery
{
    Task<int> CountBySellerId(string sellerId);
}
