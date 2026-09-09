using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SellerTypeRepository(BarDbContext dbContext) : ISellerTypeRepository
{
    public async Task<IReadOnlyList<SellerType>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.SellerTypes.OrderBy(t => t.Name).ToListAsync(cancellationToken);

    public Task<SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.SellerTypes.SingleOrDefaultAsync(t => t.Id == id, cancellationToken);

    public Task<bool> ExistsByNameAsync(string name, string? excludeId, CancellationToken cancellationToken) =>
        dbContext.SellerTypes
            .Where(t => excludeId == null || t.Id != excludeId)
            .AnyAsync(t => t.Name == name, cancellationToken);

    public async Task AddAsync(SellerType sellerType, CancellationToken cancellationToken)
    {
        dbContext.SellerTypes.Add(sellerType);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(SellerType sellerType, CancellationToken cancellationToken) =>
        await dbContext.SaveChangesAsync(cancellationToken);

    public Task<int> CountSellersAsync(string sellerTypeId, CancellationToken cancellationToken) =>
        dbContext.Sellers.CountAsync(s => s.SellerTypeId == sellerTypeId, cancellationToken);

    public async Task DeleteAsync(SellerType sellerType, CancellationToken cancellationToken)
    {
        dbContext.SellerTypes.Remove(sellerType);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
