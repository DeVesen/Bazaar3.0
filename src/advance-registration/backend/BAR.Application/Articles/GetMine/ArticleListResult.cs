namespace BAR.Application.Articles.GetMine;

public sealed record ArticleListResult(IReadOnlyList<ArticleResult> Items, int TotalCount, int Page, int PageSize);
