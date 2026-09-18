using Bazaar.Domain.Ports;

namespace Bazaar.Infrastructure.Persistence.Repositories;

// TODO(Round-14): reale Zählung gegen Sellers.SellerTypeId implementieren
public sealed class SellerCountBySellerTypeQuery : ISellerCountBySellerTypeQuery
{
    public Task<int> CountBySellerTypeId(string id) => Task.FromResult(0);
}
