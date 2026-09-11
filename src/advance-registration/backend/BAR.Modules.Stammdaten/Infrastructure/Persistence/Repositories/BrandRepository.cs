using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.Modules.Stammdaten.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Stammdaten.Infrastructure.Persistence.Repositories;

public sealed class BrandRepository(StammdatenDbContext dbContext) : IBrandRepository
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

    // Ein umbenannter Markenname auf bestehenden Artikeln wird nicht mehr hier
    // synchron mitgeschrieben (Anmeldung hat ein eigenes Schema) - dbContext
    // dispatcht das von Brand.Rename gesammelte BrandRenamed-Event beim
    // SaveChangesAsync (siehe StammdatenDbContext).
    public async Task UpdateAsync(Brand brand, CancellationToken cancellationToken) =>
        await dbContext.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Brand brand, CancellationToken cancellationToken)
    {
        dbContext.Brands.Remove(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
