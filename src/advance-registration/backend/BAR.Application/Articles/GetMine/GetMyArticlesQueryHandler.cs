using BAR.Domain.Ports.Queries;

namespace BAR.Application.Articles.GetMine;

public sealed class GetMyArticlesQueryHandler(IArticleQueries queries)
{
    public async Task<ArticleListResult> HandleAsync(GetMyArticlesQuery query, CancellationToken cancellationToken)
    {
        var page = await queries.SearchMineAsync(
            query.SellerId, query.Brand, query.Category, query.Search, query.Page, query.PageSize, query.Sort, cancellationToken);

        var items = page.Items.Select(a => new ArticleResult(
            a.Id, a.Number, a.SellerId, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description, a.CreatedAt, a.UpdatedAt)).ToList();

        return new ArticleListResult(items, page.TotalCount, query.Page, query.PageSize);
    }
}
