using BAR.Domain.Articles;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class BrandRepository(BarDbContext dbContext) : IBrandRepository
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

    public async Task UpdateAsync(Brand brand, string? renameArticlesFrom, CancellationToken cancellationToken)
    {
        if (renameArticlesFrom is not null)
        {
            await dbContext.Articles
                .Where(a => a.Brand == renameArticlesFrom)
                .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Brand, brand.Name), cancellationToken);

            await dbContext.SaveChangesAsync(cancellationToken);

            // ExecuteUpdateAsync schreibt direkt in die DB, ohne den ChangeTracker
            // zu aktualisieren. Bereits im Context getrackte Article-Instanzen
            // (z.B. aus einem vorherigen CreateAsync) haetten sonst weiterhin den
            // alten Brand-Namen im Speicher - ein spaeteres GetByIdAsync im selben
            // Scope wuerde die veraltete getrackte Instanz statt der DB liefern.
            // Nur die betroffenen Article-Entries detachen, nicht den gesamten
            // ChangeTracker leeren - ein geteilter DbContext-Scope (EfUnitOfWork)
            // koennte sonst unabhaengige, andere getrackte Entities verlieren.
            foreach (var entry in dbContext.ChangeTracker.Entries<Article>()
                .Where(e => e.Entity.Brand == renameArticlesFrom).ToList())
            {
                entry.State = EntityState.Detached;
            }
        }
        else
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }

    public Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.Brand == name, cancellationToken);

    public async Task DeleteAsync(Brand brand, CancellationToken cancellationToken)
    {
        dbContext.Brands.Remove(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
