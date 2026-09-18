using Bazaar.Domain.Articles;

namespace Bazaar.Domain.Ports;

public interface IArticleRepository
{
    Task Add(Article article);

    Task<Article?> GetById(string id);

    Task Update(Article article);

    Task Remove(Article article);

    Task<IReadOnlyList<Article>> GetAllBySellerId(string sellerId);
}
