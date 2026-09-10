using BAR.Domain.Exceptions;
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Home.GetSellerHome;

public sealed class GetSellerHomeQueryHandler(IHomeQueries homeQueries)
{
    public async Task<SellerHomeResult> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var data = await homeQueries.GetSellerHomeAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        return new SellerHomeResult(data.ArticleCount, new TypeConditionsResult(data.CommissionRate, data.ItemFee));
    }
}
