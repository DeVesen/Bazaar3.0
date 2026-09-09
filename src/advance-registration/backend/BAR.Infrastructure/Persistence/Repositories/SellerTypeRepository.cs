using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SellerTypeRepository(BarDbContext dbContext) : ISellerTypeRepository
{
    public Task<SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.SellerTypes.SingleOrDefaultAsync(t => t.Id == id, cancellationToken);
}
