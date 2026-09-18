using Bazaar.Domain.Ports;

namespace Bazaar.Infrastructure.Persistence.Repositories;

// TODO(Round-15): reale Zählung gegen die Articles-Tabelle implementieren
public sealed class ArticleCountBySellerQuery : IArticleCountBySellerQuery
{
    public Task<int> CountBySellerId(string sellerId) => Task.FromResult(0);
}
