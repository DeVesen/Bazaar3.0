using Bazaar.Domain.Ports;

namespace Bazaar.Application.Articles;

public sealed class GetArticlesForPrintHandler(IArticleListQuery articleListQuery)
{
    public Task<IReadOnlyList<ArticlePrintItem>> Handle(string? q, string? brand, string? category, string? status) =>
        articleListQuery.GetArticlesForPrint(q, brand, category, status);
}
