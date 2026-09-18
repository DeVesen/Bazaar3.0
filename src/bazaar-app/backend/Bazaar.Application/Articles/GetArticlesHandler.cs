using Bazaar.Domain.Ports;

namespace Bazaar.Application.Articles;

public sealed class GetArticlesHandler(IArticleListQuery articleListQuery)
{
    public Task<ArticleListPage> Handle(string? q, string? brand, string? category, string? status, string? sort, int page, int pageSize) =>
        articleListQuery.GetArticles(q, brand, category, status, sort, page, pageSize);
}
