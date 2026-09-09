namespace BAR.Application.Articles.GetAll;

public sealed record GetAllArticlesQuery(
    string? Brand, string? Category, string? Search, string? SellerId, int Page, int PageSize, string? Sort);
