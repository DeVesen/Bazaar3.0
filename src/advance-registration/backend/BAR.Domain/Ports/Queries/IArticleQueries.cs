using BAR.Domain.Articles;

namespace BAR.Domain.Ports.Queries;

public sealed record ArticleSearchPage(IReadOnlyList<Article> Items, int TotalCount);
public sealed record ArticleWithSeller(Article Article, string SellerId, int SellerStartNumber, string SellerFirstName, string SellerLastName);
public sealed record ArticleAdminSearchPage(IReadOnlyList<ArticleWithSeller> Items, int TotalCount);

public interface IArticleQueries
{
    Task<ArticleSearchPage> SearchMineAsync(
        string sellerId, string? brand, string? category, string? search,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);

    Task<ArticleAdminSearchPage> SearchAllAsync(
        string? brand, string? category, string? search, string? sellerId,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);
}
