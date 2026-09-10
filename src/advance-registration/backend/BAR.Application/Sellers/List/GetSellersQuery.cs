using BAR.Domain.Ports.Queries;

namespace BAR.Application.Sellers.List;

public sealed record GetSellersQuery(string? Search, int Page, int PageSize, IReadOnlyList<SellerSort> Sort);
