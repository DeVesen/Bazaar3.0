namespace BAR.Application.Sellers;

public sealed record SellerResponse(
    string Id, int? StartNumber, string FirstName, string LastName, string? Address,
    string PostalCode, string City, string Phone, string Email, string SellerTypeId,
    SellerTypeSummary SellerType, bool IsAdmin, int ArticleCount, bool HasPendingInvite);

public sealed record SellerTypeSummary(string Id, string Name, decimal CommissionRate, decimal ItemFee);

public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
