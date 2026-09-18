namespace Bazaar.Domain.Ports;

/// <summary>
/// Backs GET /api/articles (api/articles.md §1). Paginated 50/page.
/// </summary>
public interface IArticleListQuery
{
    Task<ArticleListPage> GetArticles(string? q, string? brand, string? category, string? status, string? sort, int page, int pageSize);
}

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
