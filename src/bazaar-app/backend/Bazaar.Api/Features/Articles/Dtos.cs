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

/// <summary>
/// Response shape for GET /api/articles/{id} (Round-15 review fix) — the full Stammdaten plus
/// raw status timestamps, as needed to seed `artikel-dialog` and `article-status-popup`. See
/// `GetArticleByIdHandler`'s doc comment for why the list DTO above isn't enough.
/// </summary>
public sealed record ArticleDetailDto(
    string Id,
    int Number,
    string Name,
    string Brand,
    string Category,
    decimal Price,
    string? Size,
    string? Color,
    string? Description,
    string Status,
    bool SoldManually,
    string SellerId,
    string SellerName,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ReleasedAt,
    DateTimeOffset? SoldAt,
    DateTimeOffset? ReturnedAt,
    DateTimeOffset? SellerSettledAt);
