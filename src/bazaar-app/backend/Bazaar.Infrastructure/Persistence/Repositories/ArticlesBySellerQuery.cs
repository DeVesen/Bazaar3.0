using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class ArticlesBySellerQuery(BazaarDbContext dbContext) : IArticlesBySellerQuery
{
    public async Task<IReadOnlyList<SellerArticleSummary>> GetBySellerId(string sellerId)
    {
        var articles = await dbContext.Articles
            .Where(a => a.SellerId == sellerId)
            .ToListAsync();

        return articles
            .Select(a => new SellerArticleSummary(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Size, a.Color, a.Price,
                a.Status.ToString().ToLowerInvariant(),
                a.SoldManually))
            .ToList();
    }
}
