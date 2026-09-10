using BAR.Application.Abstractions;
using BAR.Application.Home.GetAdminHome;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Home.GetAdminHome;

public class GetAdminHomeQueryHandlerTests
{
    private readonly Mock<IHomeQueries> _homeQueries = new();
    private readonly Mock<IClock> _clock = new();

    private GetAdminHomeQueryHandler CreateHandler() => new(_homeQueries.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_ReturnsCountsAndHeatmapFromQueries()
    {
        var now = new DateTime(2026, 9, 10, 8, 0, 0, DateTimeKind.Utc);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var expectedSince = now.Date.AddDays(-84);
        _homeQueries.Setup(q => q.GetAdminHomeAsync(expectedSince, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminHomeData(84, 1372, 14, 63,
                [new HeatmapDay(new DateOnly(2026, 9, 9), 7)]));

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(84, result.SellerCount);
        Assert.Equal(1372, result.ArticleCount);
        Assert.Equal(14, result.CategoryCount);
        Assert.Equal(63, result.BrandCount);
        Assert.Single(result.HeatmapData);
        Assert.Equal(new DateOnly(2026, 9, 9), result.HeatmapData[0].Date);
        Assert.Equal(7, result.HeatmapData[0].Count);
    }
}
