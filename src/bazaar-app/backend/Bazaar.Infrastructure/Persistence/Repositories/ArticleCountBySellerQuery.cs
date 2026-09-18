using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class ArticleCountBySellerQuery(BazaarDbContext dbContext) : IArticleCountBySellerQuery
{
    public Task<int> CountBySellerId(string sellerId) =>
        dbContext.Articles.CountAsync(a => a.SellerId == sellerId);
}
