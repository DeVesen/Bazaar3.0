using BAR.Application.Sellers;
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Sellers.List;

public sealed class GetSellersQueryHandler(ISellerListQuery query)
{
    public async Task<PagedResult<SellerResponse>> HandleAsync(GetSellersQuery request, CancellationToken cancellationToken)
    {
        var (items, totalCount) = await query.ExecuteAsync(request.Search, request.Page, request.PageSize, request.Sort, cancellationToken);

        var responses = items.Select(x => new SellerResponse(
            x.Id, x.StartNumber, x.FirstName, x.LastName, x.Address, x.PostalCode, x.City, x.Phone, x.Email,
            x.SellerTypeId, new SellerTypeSummary(x.SellerTypeId, x.SellerTypeName, x.CommissionRate, x.ItemFee),
            x.IsAdmin, x.ArticleCount, x.HasPendingInvite)).ToList();

        return new PagedResult<SellerResponse>(responses, totalCount, request.Page, request.PageSize);
    }
}
