using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class SellerRepository(BazaarDbContext dbContext) : ISellerRepository
{
    public async Task Add(Seller seller)
    {
        await dbContext.Sellers.AddAsync(seller);
        await dbContext.SaveChangesAsync();
    }

    public Task<Seller?> GetById(string id) =>
        dbContext.Sellers.SingleOrDefaultAsync(s => s.Id == id);

    public async Task Update(Seller seller)
    {
        dbContext.Sellers.Update(seller);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(Seller seller)
    {
        dbContext.Sellers.Remove(seller);
        await dbContext.SaveChangesAsync();
    }
}
