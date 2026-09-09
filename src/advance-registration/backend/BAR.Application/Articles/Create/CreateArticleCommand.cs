namespace BAR.Application.Articles.Create;

public sealed record CreateArticleCommand(
    string SellerId, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description, int? ExpectedNumber);
