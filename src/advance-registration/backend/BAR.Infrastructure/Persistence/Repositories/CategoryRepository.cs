using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class CategoryRepository(BarDbContext dbContext) : ICategoryRepository
{
    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken) =>
        await dbContext.Categories.OrderBy(c => c.Name).ToListAsync(cancellationToken);

    public Task<Category?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Categories.SingleOrDefaultAsync(c => c.Id == id, cancellationToken);

    public Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken)
    {
        var normalized = name.Trim().ToLower();
        return dbContext.Categories
            .Where(c => excludeId == null || c.Id != excludeId)
            .AnyAsync(c => c.Name.Trim().ToLower() == normalized, cancellationToken);
    }

    public async Task AddAsync(Category category, CancellationToken cancellationToken)
    {
        dbContext.Categories.Add(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Category category, string? renameArticlesFrom, CancellationToken cancellationToken)
    {
        if (renameArticlesFrom is not null)
        {
            await dbContext.Articles
                .Where(a => a.Category == renameArticlesFrom)
                .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Category, category.Name), cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        if (renameArticlesFrom is not null)
        {
            // ExecuteUpdateAsync schreibt direkt in die DB, ohne den ChangeTracker
            // zu aktualisieren. Bereits im Context getrackte Article-Instanzen
            // (z.B. aus einem vorherigen CreateAsync) haetten sonst weiterhin den
            // alten Category-Namen im Speicher - ein spaeteres GetByIdAsync im
            // selben Scope wuerde die veraltete getrackte Instanz statt der DB
            // liefern.
            dbContext.ChangeTracker.Clear();
        }
    }

    public Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.Category == name, cancellationToken);

    public async Task DeleteAsync(Category category, CancellationToken cancellationToken)
    {
        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
