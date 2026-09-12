using BAR.Modules.MasterData.Domain.Catalog;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.MasterData.Infrastructure.Persistence.Repositories;

public sealed class BrandRepository(MasterDataDbContext dbContext) : IBrandRepository
{
    public async Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Brands.OrderBy(b => b.Name).ToListAsync(cancellationToken);

    public Task<Brand?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Brands.SingleOrDefaultAsync(b => b.Id == id, cancellationToken);

    public Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken)
    {
        var normalized = name.Trim().ToLower();
        return dbContext.Brands
            .Where(b => excludeId == null || b.Id != excludeId)
            .AnyAsync(b => b.Name.Trim().ToLower() == normalized, cancellationToken);
    }

    public async Task AddAsync(Brand brand, CancellationToken cancellationToken)
    {
        dbContext.Brands.Add(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    // A renamed brand name is no longer written synchronously to existing
    // articles here (Registration has its own schema) - dbContext dispatches
    // the BrandRenamed event raised by Brand.Rename during SaveChangesAsync
    // (see MasterDataDbContext).
    public async Task UpdateAsync(Brand brand, CancellationToken cancellationToken) =>
        await dbContext.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Brand brand, CancellationToken cancellationToken)
    {
        dbContext.Brands.Remove(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
