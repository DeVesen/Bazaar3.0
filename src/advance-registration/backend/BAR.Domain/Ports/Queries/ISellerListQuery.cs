namespace BAR.Domain.Ports.Queries;

public interface ISellerListQuery
{
    Task<(IReadOnlyList<SellerListItem> Items, int TotalCount)> ExecuteAsync(
        string? search, int page, int pageSize, IReadOnlyList<SellerSort> sort, CancellationToken cancellationToken);
}

public sealed record SellerListItem(
    string Id, int? StartNumber, string FirstName, string LastName, string? Address,
    string PostalCode, string City, string Phone, string Email, string SellerTypeId,
    string SellerTypeName, decimal CommissionRate, decimal ItemFee, bool IsAdmin,
    int ArticleCount, bool HasPendingInvite);

public sealed record SellerSort(string Field, bool Descending);
