namespace BAR.Modules.SellerManagement.Contracts.Sellers;

public sealed record SellerTypeSummaryDto(string Id, string Name, decimal CommissionRate, decimal ItemFee);

public sealed record SellerDto(
    string Id, int? StartNumber, string FirstName, string LastName, string? Address,
    string PostalCode, string City, string Phone, string Email, string SellerTypeId,
    SellerTypeSummaryDto SellerType, bool IsAdmin, int ArticleCount, bool HasPendingInvite);

public sealed record SellerSortDto(string Field, bool Descending);

public sealed record GetSellersQuery(string? SellerTypeId, string? Search, int Page, int PageSize, IReadOnlyList<SellerSortDto> Sort);

public sealed record CreateSellerCommand(
    string FirstName, string LastName, string? Address, string PostalCode, string City,
    string Phone, string Email, string SellerTypeId, bool IsAdmin, int? StartNumber, int? BlockCount);

public sealed record UpdateSellerCommand(
    string SellerId, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, string SellerTypeId, bool IsAdmin);

public sealed record DeleteSellerCommand(string SellerId, string RequestingSellerId);

public sealed record InviteResultDto(string Token, DateTime ExpiresAt);
