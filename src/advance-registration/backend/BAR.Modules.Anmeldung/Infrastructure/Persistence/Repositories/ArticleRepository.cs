using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Anmeldung.Infrastructure.Persistence.Repositories;

public sealed class ArticleRepository(AnmeldungDbContext dbContext) : IArticleRepository
{
    public Task<Article?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Articles.SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<IReadOnlyList<int>> GetUsedNumbersForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        await dbContext.Articles.Where(a => a.SellerId == sellerId).Select(a => a.Number).ToListAsync(cancellationToken);

    public Task<int> CountInRangeForSellerAsync(string sellerId, int fromNumber, int toNumber, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.SellerId == sellerId && a.Number >= fromNumber && a.Number <= toNumber, cancellationToken);

    public Task<int> CountForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.SellerId == sellerId, cancellationToken);

    public Task<bool> ExistsNumberBelowAsync(int number, CancellationToken cancellationToken) =>
        dbContext.Articles.AnyAsync(a => a.Number < number, cancellationToken);

    public Task<int> CountWithBrandNameAsync(string brandName, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.Brand == brandName, cancellationToken);

    public Task<int> CountWithCategoryNameAsync(string categoryName, CancellationToken cancellationToken) =>
        dbContext.Articles.CountAsync(a => a.Category == categoryName, cancellationToken);

    public async Task RenameBrandAsync(string oldName, string newName, CancellationToken cancellationToken)
    {
        await dbContext.Articles
            .Where(a => a.Brand == oldName)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Brand, newName), cancellationToken);

        DetachTracked(a => a.Brand == newName);
    }

    public async Task RenameCategoryAsync(string oldName, string newName, CancellationToken cancellationToken)
    {
        await dbContext.Articles
            .Where(a => a.Category == oldName)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Category, newName), cancellationToken);

        DetachTracked(a => a.Category == newName);
    }

    // ExecuteUpdateAsync schreibt direkt in die DB, ohne den ChangeTracker zu
    // aktualisieren - bereits getrackte Article-Instanzen haetten sonst
    // weiterhin den alten Namen im Speicher.
    private void DetachTracked(Func<Article, bool> predicate)
    {
        foreach (var entry in dbContext.ChangeTracker.Entries<Article>().Where(e => predicate(e.Entity)).ToList())
        {
            entry.State = EntityState.Detached;
        }
    }

    public async Task<IReadOnlyList<Article>> GetAllForExportAsync(CancellationToken cancellationToken) =>
        await dbContext.Articles.ToListAsync(cancellationToken);

    public async Task CreateAsync(Article article, NumberBlock? newBlock, CancellationToken cancellationToken)
    {
        if (newBlock is not null)
        {
            dbContext.NumberBlocks.Add(newBlock);
        }

        dbContext.Articles.Add(article);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Article article, CancellationToken cancellationToken) =>
        await dbContext.SaveChangesAsync(cancellationToken);

    public async Task DeleteAsync(Article article, CancellationToken cancellationToken)
    {
        dbContext.Articles.Remove(article);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        await dbContext.Articles.Where(a => a.SellerId == sellerId).ExecuteDeleteAsync(cancellationToken);
    }
}
