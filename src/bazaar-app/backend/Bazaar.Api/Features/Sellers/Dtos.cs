namespace Bazaar.Api.Features.Sellers;

public sealed record SellerCardDto(
    string Id,
    string FirstName,
    string LastName,
    string? PostalCode,
    string? City,
    string SellerType,
    string Status,
    int ArticleCount,
    int ReleasedCount,
    int SoldCount,
    int ReturnedCount,
    decimal AcceptedValue,
    decimal OpenValue,
    decimal Revenue,
    DateTimeOffset? SettledAt);

public sealed record SellerSearchResultDto(
    string Id,
    string FirstName,
    string LastName,
    string? City,
    string SellerType);

/// <summary>
/// Response shape for POST /api/sellers (201 Created). Mirrors BrandDto's
/// convention of returning the created aggregate's own fields plus
/// zeroed placeholder aggregates — a brand-new seller genuinely has zero
/// articles, so Status is always "open" and every numeric aggregate 0.
/// </summary>
public sealed record SellerDetailDto(
    string Id,
    string FirstName,
    string LastName,
    string? Address,
    string? PostalCode,
    string? City,
    string? Phone,
    string Email,
    string SellerTypeId,
    decimal SalesCommission,
    decimal FeePerItem,
    string Status,
    int ArticleCount,
    int ReleasedCount,
    int SoldCount,
    int ReturnedCount,
    decimal AcceptedValue,
    decimal OpenValue,
    decimal Revenue,
    DateTimeOffset? SettledAt);

// No separate CreateSellerRequest/UpdateSellerRequest DTOs: mirroring
// BrandEndpoints.cs/SellerTypeEndpoints.cs, POST and PUT bind
// CreateSellerCommand/UpdateSellerCommand directly from the JSON body —
// both commands' own doc comments already state their properties are
// bound directly from the wire contract, with Id/CallerIsAdmin (not part
// of the wire contract) set by the endpoint after validation runs.

public sealed record ArticleSummaryDto(
    string Id,
    int Number,
    string Name,
    string? Brand,
    string? Category,
    decimal Price,
    string Status,
    bool SoldManually);
