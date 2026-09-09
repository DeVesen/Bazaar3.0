using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class ArticleRepository(BarDbContext dbContext) : IArticleRepository
{
    public Task<Article?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.Articles.SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

    public async Task<IReadOnlyList<int>> GetUsedNumbersForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        await dbContext.Articles.Where(a => a.SellerId == sellerId).Select(a => a.Number).ToListAsync(cancellationToken);

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
}
