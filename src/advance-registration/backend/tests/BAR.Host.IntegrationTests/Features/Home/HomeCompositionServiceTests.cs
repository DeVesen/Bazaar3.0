using BAR.Host.Features.Home;
using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Host.IntegrationTests.Features.Home;

/// <summary>
/// A pure view composition with no DB access (see the HomeCompositionService
/// comment) - all three facades are mocked, hence a fast, unit-like test
/// instead of a real WebApplicationFactory. Lives here (instead of in
/// BAR.Application.UnitTests) because BAR.Host.Features.Home is only
/// reachable from here. Formerly BAR.Application.UnitTests.Home.*
/// (GetAdminHomeQueryHandlerTests/GetSellerHomeQueryHandlerTests) against the
/// BAR.Application.Home.* handlers that have since been deleted.
/// </summary>
public class HomeCompositionServiceTests
{
    private readonly Mock<ISellerManagementModuleApi> _sellerManagement = new();
    private readonly Mock<IRegistrationModuleApi> _registration = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();
    private readonly Mock<IClock> _clock = new();

    private HomeCompositionService CreateService() =>
        new(_sellerManagement.Object, _registration.Object, _masterData.Object, _clock.Object);

    [Fact]
    public async Task GetAdminHomeAsync_ReturnsCountsAndHeatmapFromFacades()
    {
        var now = new DateTime(2026, 9, 10, 8, 0, 0, DateTimeKind.Utc);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var expectedSince = now.Date.AddDays(-84);
        _sellerManagement.Setup(v => v.GetSellerCountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(84);
        _registration.Setup(a => a.GetDashboardStatsAsync(expectedSince, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new RegistrationDashboardStatsDto(1372, [new HeatmapEntryDto(new DateOnly(2026, 9, 9), 7)]));
        _masterData.Setup(s => s.GetAllBrandNamesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Enumerable.Range(1, 63).Select(i => $"Brand{i}").ToList());
        _masterData.Setup(s => s.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Enumerable.Range(1, 14).Select(i => $"Category{i}").ToList());

        var result = await CreateService().GetAdminHomeAsync(TestContext.Current.CancellationToken);

        Assert.Equal(84, result.SellerCount);
        Assert.Equal(1372, result.ArticleCount);
        Assert.Equal(14, result.CategoryCount);
        Assert.Equal(63, result.BrandCount);
        Assert.Single(result.HeatmapData);
        Assert.Equal(new DateOnly(2026, 9, 9), result.HeatmapData[0].Date);
        Assert.Equal(7, result.HeatmapData[0].Count);
    }

    [Fact]
    public async Task GetSellerHomeAsync_KnownSeller_ReturnsArticleCountAndTypeConditions()
    {
        _sellerManagement.Setup(v => v.GetSellerConditionsAsync("s0000001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerConditionsDto(15.0m, 0.5m));
        _registration.Setup(a => a.CountArticlesForSellerAsync("s0000001", It.IsAny<CancellationToken>())).ReturnsAsync(12);

        var result = await CreateService().GetSellerHomeAsync("s0000001", TestContext.Current.CancellationToken);

        Assert.Equal(12, result.ArticleCount);
        Assert.Equal(15.0m, result.TypeConditions.CommissionRate);
        Assert.Equal(0.5m, result.TypeConditions.ItemFee);
    }

    [Fact]
    public async Task GetSellerHomeAsync_UnknownSeller_ThrowsNotFound()
    {
        _sellerManagement.Setup(v => v.GetSellerConditionsAsync("unknown1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SellerConditionsDto?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateService().GetSellerHomeAsync("unknown1", TestContext.Current.CancellationToken));
    }
}
