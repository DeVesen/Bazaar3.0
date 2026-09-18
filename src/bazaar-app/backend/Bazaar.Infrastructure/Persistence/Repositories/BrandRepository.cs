using Bazaar.Domain.Brands;
using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class BrandRepository(BazaarDbContext dbContext) : IBrandRepository
{
    public async Task Add(Brand brand)
    {
        await dbContext.Brands.AddAsync(brand);
        await dbContext.SaveChangesAsync();
    }

    public Task<Brand?> GetById(string id) =>
        dbContext.Brands.SingleOrDefaultAsync(b => b.Id == id);

    public async Task<IReadOnlyList<Brand>> GetAll() =>
        await dbContext.Brands.ToListAsync();

    public Task<bool> ExistsByNameIgnoreCase(string name) =>
        dbContext.Brands.AnyAsync(b => b.Name == name);

    public async Task Update(Brand brand)
    {
        dbContext.Brands.Update(brand);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(Brand brand)
    {
        dbContext.Brands.Remove(brand);
        await dbContext.SaveChangesAsync();
    }
}
