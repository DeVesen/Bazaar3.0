namespace Bazaar.Domain.Ports;

/// <summary>
/// Placeholder port until the Seller table exists (Round-14). The real
/// implementation lands in Round-14; this Round only provides the port
/// contract (Domain concern) — Infrastructure's placeholder implementation
/// is a separate task.
/// </summary>
public interface ISellerCountBySellerTypeQuery
{
    Task<int> CountBySellerTypeId(string id);
}
