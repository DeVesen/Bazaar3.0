using BAR.Application.Home.GetSellerHome;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Home.GetSellerHome;

public class GetSellerHomeQueryHandlerTests
{
    private readonly Mock<IHomeQueries> _homeQueries = new();

    private GetSellerHomeQueryHandler CreateHandler() => new(_homeQueries.Object);

    [Fact]
    public async Task HandleAsync_KnownSeller_ReturnsArticleCountAndTypeConditions()
    {
        _homeQueries.Setup(q => q.GetSellerHomeAsync("s0000001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerHomeData(12, 15.0m, 0.5m));

        var result = await CreateHandler().HandleAsync("s0000001", TestContext.Current.CancellationToken);

        Assert.Equal(12, result.ArticleCount);
        Assert.Equal(15.0m, result.TypeConditions.CommissionRate);
        Assert.Equal(0.5m, result.TypeConditions.ItemFee);
    }

    [Fact]
    public async Task HandleAsync_UnknownSeller_ThrowsNotFound()
    {
        _homeQueries.Setup(q => q.GetSellerHomeAsync("unknown1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SellerHomeData?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().HandleAsync("unknown1", TestContext.Current.CancellationToken));
    }
}
