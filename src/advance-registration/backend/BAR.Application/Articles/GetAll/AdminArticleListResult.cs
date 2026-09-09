namespace BAR.Application.Articles.GetAll;

public sealed record AdminArticleListResult(IReadOnlyList<AdminArticleResult> Items, int TotalCount, int Page, int PageSize);
