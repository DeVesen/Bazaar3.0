using BAR.Host.Features.Home;
using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Host.IntegrationTests.Features.Home;

/// <summary>
/// Reine Sichtkomposition ohne DB-Zugriff (siehe HomeCompositionService-
/// Kommentar) - alle drei Facaden sind gemockt, darum ein schneller
/// unit-artiger Test statt einer echten WebApplicationFactory. Sitzt hier
/// (statt in BAR.Application.UnitTests), weil BAR.Host.Features.Home nur von
/// hier aus erreichbar ist. Vormals BAR.Application.UnitTests.Home.*
/// (GetAdminHomeQueryHandlerTests/GetSellerHomeQueryHandlerTests) gegen die
/// mittlerweile geloeschten BAR.Application.Home.*-Handler.
/// </summary>
public class HomeCompositionServiceTests
{
    private readonly Mock<IVerkaeuferverwaltungModuleApi> _verkaeuferverwaltung = new();
    private readonly Mock<IAnmeldungModuleApi> _anmeldung = new();
    private readonly Mock<IStammdatenModuleApi> _stammdaten = new();
    private readonly Mock<IClock> _clock = new();

    private HomeCompositionService CreateService() =>
        new(_verkaeuferverwaltung.Object, _anmeldung.Object, _stammdaten.Object, _clock.Object);

    [Fact]
    public async Task GetAdminHomeAsync_ReturnsCountsAndHeatmapFromFacades()
    {
        var now = new DateTime(2026, 9, 10, 8, 0, 0, DateTimeKind.Utc);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var expectedSince = now.Date.AddDays(-84);
        _verkaeuferverwaltung.Setup(v => v.GetSellerCountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(84);
        _anmeldung.Setup(a => a.GetDashboardStatsAsync(expectedSince, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AnmeldungDashboardStatsDto(1372, [new HeatmapEntryDto(new DateOnly(2026, 9, 9), 7)]));
        _stammdaten.Setup(s => s.GetAllBrandNamesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(Enumerable.Range(1, 63).Select(i => $"Brand{i}").ToList());
        _stammdaten.Setup(s => s.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>()))
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
        _verkaeuferverwaltung.Setup(v => v.GetSellerConditionsAsync("s0000001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerConditionsDto(15.0m, 0.5m));
        _anmeldung.Setup(a => a.CountArticlesForSellerAsync("s0000001", It.IsAny<CancellationToken>())).ReturnsAsync(12);

        var result = await CreateService().GetSellerHomeAsync("s0000001", TestContext.Current.CancellationToken);

        Assert.Equal(12, result.ArticleCount);
        Assert.Equal(15.0m, result.TypeConditions.CommissionRate);
        Assert.Equal(0.5m, result.TypeConditions.ItemFee);
    }

    [Fact]
    public async Task GetSellerHomeAsync_UnknownSeller_ThrowsNotFound()
    {
        _verkaeuferverwaltung.Setup(v => v.GetSellerConditionsAsync("unknown1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SellerConditionsDto?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateService().GetSellerHomeAsync("unknown1", TestContext.Current.CancellationToken));
    }
}
