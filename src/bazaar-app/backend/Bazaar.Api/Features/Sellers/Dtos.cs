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
    string SellerType,
    DateTimeOffset? SettledAt);

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
    string? Email,
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

/// <summary>
/// Response shape for GET /api/sellers/{id} — the full Stammdaten of one seller,
/// as needed to seed the edit dialog (see Round-14 Task 10 fix). Deliberately
/// leaves out the card-level aggregates (Status/ArticleCount/…) that
/// <see cref="SellerDetailDto"/> carries — those come from
/// <c>ISellerCardsQuery</c>, not from the <c>Seller</c> aggregate itself, and the
/// edit dialog never displays or edits them.
/// </summary>
public sealed record SellerDto(
    string Id,
    string FirstName,
    string LastName,
    string? Address,
    string? PostalCode,
    string? City,
    string? Phone,
    string? Email,
    string SellerTypeId,
    decimal SalesCommission,
    decimal FeePerItem,
    decimal IntakeFeePaid,
    DateTimeOffset? SettledAt,
    decimal? PayoutAmount);

public sealed record ArticleSummaryDto(
    string Id,
    int Number,
    string Name,
    string? Brand,
    string? Category,
    string? Size,
    string? Color,
    decimal Price,
    string Status,
    bool SoldManually);
