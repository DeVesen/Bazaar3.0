namespace Bazaar.Domain.Ports;

/// <summary>
/// Backs GET /api/articles (api/articles.md §1) and GET /api/articles/print. Paginated 50/page.
/// </summary>
public interface IArticleListQuery
{
    Task<ArticleListPage> GetArticles(string? q, string? brand, string? category, string? status, string? sort, int page, int pageSize);

    /// <summary>
    /// Backs GET /api/articles/print (api/articles.md §1a): all articles matching the same
    /// filters as <see cref="GetArticles"/>, unpaginated and unsorted, reduced to the fields
    /// of the Artikel-Aushang.
    /// </summary>
    Task<IReadOnlyList<ArticlePrintItem>> GetArticlesForPrint(string? q, string? brand, string? category, string? status);
}

public sealed record ArticlePrintItem(
    string Name,
    string Brand,
    string Category,
    string? Size,
    string? Color,
    decimal Price);

public sealed record ArticleListPage(
    IReadOnlyList<ArticleListItem> Items,
    int TotalCount,
    int Page,
    int PageSize);

public sealed record ArticleListItem(
    string Id,
    int Number,
    string Name,
    string Brand,
    string Category,
    decimal Price,
    string Status,
    bool SoldManually,
    string SellerId,
    string SellerName);
