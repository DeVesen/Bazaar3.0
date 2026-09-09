namespace BAR.Application.Articles.GetAll;

public sealed record AdminArticleResult(
    string Id, int Number, string Name, string Brand, string Category, decimal Price,
    string? Size, string? Color, string? Description, DateTime CreatedAt, DateTime UpdatedAt, SellerSummary Seller);
