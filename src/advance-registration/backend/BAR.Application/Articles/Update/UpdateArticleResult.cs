namespace BAR.Application.Articles.Update;

public sealed record UpdateArticleResult(
    string Id, int Number, string SellerId, string Name, string Brand, string Category,
    decimal Price, string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt);
