using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;

namespace BAR.Domain.Ports;

public interface IArticleRepository
{
    Task<Article?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<IReadOnlyList<int>> GetUsedNumbersForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task CreateAsync(Article article, NumberBlock? newBlock, CancellationToken cancellationToken);
    Task UpdateAsync(Article article, CancellationToken cancellationToken);
    Task DeleteAsync(Article article, CancellationToken cancellationToken);
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
