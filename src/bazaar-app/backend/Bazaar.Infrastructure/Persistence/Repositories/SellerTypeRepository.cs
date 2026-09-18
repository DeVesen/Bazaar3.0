using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class SellerTypeRepository(BazaarDbContext dbContext) : ISellerTypeRepository
{
    public async Task Add(SellerType sellerType)
    {
        await dbContext.SellerTypes.AddAsync(sellerType);
        await dbContext.SaveChangesAsync();
    }

    public Task<SellerType?> GetById(string id) =>
        dbContext.SellerTypes.SingleOrDefaultAsync(s => s.Id == id);

    public async Task<IReadOnlyList<SellerType>> GetAll() =>
        await dbContext.SellerTypes.ToListAsync();

    public Task<bool> ExistsByNameIgnoreCase(string name) =>
        dbContext.SellerTypes.AnyAsync(s => s.Name == name);

    public async Task Update(SellerType sellerType)
    {
        dbContext.SellerTypes.Update(sellerType);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(SellerType sellerType)
    {
        dbContext.SellerTypes.Remove(sellerType);
        await dbContext.SaveChangesAsync();
    }
}
