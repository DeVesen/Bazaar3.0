using BAR.Domain.Ports.Queries;

namespace BAR.Application.Articles.GetAll;

public sealed class GetAllArticlesQueryHandler(IArticleQueries queries)
{
    public async Task<AdminArticleListResult> HandleAsync(GetAllArticlesQuery query, CancellationToken cancellationToken)
    {
        var page = await queries.SearchAllAsync(
            query.Brand, query.Category, query.Search, query.SellerId, query.Page, query.PageSize, query.Sort, cancellationToken);

        var items = page.Items.Select(x => new AdminArticleResult(
            x.Article.Id, x.Article.Number, x.Article.Name, x.Article.Brand, x.Article.Category, x.Article.Price,
            x.Article.Size, x.Article.Color, x.Article.Description, x.Article.CreatedAt, x.Article.UpdatedAt,
            new SellerSummary(x.SellerId, x.SellerStartNumber, x.SellerFirstName, x.SellerLastName))).ToList();

        return new AdminArticleListResult(items, page.TotalCount, query.Page, query.PageSize);
    }
}
