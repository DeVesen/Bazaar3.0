using BAR.Modules.Registration.Domain.Articles;

namespace BAR.Modules.Registration.Domain.Ports.Queries;

public sealed record ArticleSearchPage(IReadOnlyList<Article> Items, int TotalCount);

public interface IArticleQueries
{
    Task<ArticleSearchPage> SearchMineAsync(
        string sellerId, string? brand, string? category, string? search,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);

    /// <summary>
    /// <paramref name="searchMatchingSellerIds"/>: sellers whose name matches
    /// <paramref name="search"/>, determined up front (via a Contracts call to
    /// SellerManagement) - a replacement for the former SQL join against the
    /// Seller table, which has lived in a different schema since the modulith
    /// cut. <c>sort: "seller"</c> is treated like no sort at all in this
    /// schema, for lack of a name field (falls back to number) - the same
    /// fallback rule as for any unknown sort value.
    /// </summary>
    Task<ArticleSearchPage> SearchAllAsync(
        string? brand, string? category, string? search, string? sellerId,
        IReadOnlyCollection<string>? searchMatchingSellerIds,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);
}
