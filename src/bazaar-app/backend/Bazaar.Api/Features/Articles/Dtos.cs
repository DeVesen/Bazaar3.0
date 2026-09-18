namespace Bazaar.Api.Features.Articles;

public sealed record ArticleListItemDto(
    string Id,
    int Number,
    string Name,
    string Brand,
    string Category,
    decimal Price,
    string Status,
    bool SoldManually,
    string SellerId,
    string SellerName);
