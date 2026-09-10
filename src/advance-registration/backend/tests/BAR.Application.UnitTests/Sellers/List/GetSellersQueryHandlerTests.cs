using BAR.Application.Sellers.List;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Sellers.List;

public class GetSellersQueryHandlerTests
{
    private readonly Mock<ISellerListQuery> _query = new();

    [Fact]
    public async Task HandleAsync_MapsQueryResultToPagedSellerResponses()
    {
        _query.Setup(q => q.ExecuteAsync("anna", 1, 25, It.IsAny<IReadOnlyList<SellerSort>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(([
                new SellerListItem("s1", 101, "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com",
                    "t1", "Standard", 15m, 0.5m, false, 3, false)
            ], 1));
        var handler = new GetSellersQueryHandler(_query.Object);

        var result = await handler.HandleAsync(new GetSellersQuery("anna", 1, 25, []), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Anna", result.Items[0].FirstName);
        Assert.Equal(101, result.Items[0].StartNumber);
        Assert.Equal("Standard", result.Items[0].SellerType.Name);
    }
}
