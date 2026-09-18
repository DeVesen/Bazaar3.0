using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class SellerCountBySellerTypeQuery(BazaarDbContext dbContext) : ISellerCountBySellerTypeQuery
{
    public Task<int> CountBySellerTypeId(string id) =>
        dbContext.Sellers.CountAsync(s => s.SellerTypeId == id);
}
