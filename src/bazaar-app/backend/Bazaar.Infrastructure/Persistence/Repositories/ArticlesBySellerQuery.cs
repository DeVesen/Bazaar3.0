using Bazaar.Domain.Ports;

namespace Bazaar.Infrastructure.Persistence.Repositories;

// TODO(Round-15): reale Artikeldaten gegen die Articles-Tabelle liefern
public sealed class ArticlesBySellerQuery : IArticlesBySellerQuery
{
    public Task<IReadOnlyList<SellerArticleSummary>> GetBySellerId(string sellerId) =>
        Task.FromResult<IReadOnlyList<SellerArticleSummary>>(new List<SellerArticleSummary>());
}
