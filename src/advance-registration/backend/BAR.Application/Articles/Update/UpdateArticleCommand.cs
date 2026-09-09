namespace BAR.Application.Articles.Update;

public sealed record UpdateArticleCommand(
    string Id, string SellerId, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description);
