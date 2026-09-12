namespace BAR.Modules.Registration.Contracts.Articles;

public sealed record ArticleDto(
    string Id, int Number, string SellerId, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt);

public sealed record ArticleListResultDto(IReadOnlyList<ArticleDto> Items, int TotalCount, int Page, int PageSize);

public sealed record GetMyArticlesQuery(string SellerId, string? Brand, string? Category, string? Search, int Page, int PageSize, string? Sort);

public sealed record CreateArticleCommand(
    string SellerId, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description, int? ExpectedNumber);

public sealed record CreateArticleResultDto(
    string Id, int Number, string SellerId, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description,
    DateTime CreatedAt, DateTime UpdatedAt, int? NextNumber);

public sealed record UpdateArticleCommand(
    string Id, string SellerId, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description);

public sealed record DeleteArticleCommand(string Id, string SellerId);

public sealed record NextNumberResultDto(int Number);

public sealed record SellerSummaryDto(string Id, int StartNumber, string FirstName, string LastName);

public sealed record AdminArticleDto(
    string Id, int Number, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt, SellerSummaryDto Seller);

public sealed record AdminArticleListResultDto(IReadOnlyList<AdminArticleDto> Items, int TotalCount, int Page, int PageSize);

public sealed record GetAllArticlesQuery(string? Brand, string? Category, string? Search, string? SellerId, int Page, int PageSize, string? Sort);

/// <summary>Fuer Export: Artikel je Verkaeufer, ohne Kenntnis von dessen Aggregat.</summary>
public sealed record ExportArticleDto(
    string SellerId, string Id, int Number, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description);
