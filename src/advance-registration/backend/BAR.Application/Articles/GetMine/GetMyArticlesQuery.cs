namespace BAR.Application.Articles.GetMine;

public sealed record GetMyArticlesQuery(
    string SellerId, string? Brand, string? Category, string? Search, int Page, int PageSize, string? Sort);
