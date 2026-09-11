using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Stammdaten.Infrastructure.Persistence.Repositories;

public sealed class CategoryRepository(StammdatenDbContext dbContext) : ICategoryRepository
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

    public async Task UpdateAsync(Category category, CancellationToken cancellationToken) =>
        await dbContext.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Category category, CancellationToken cancellationToken)
    {
        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
