using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Export.Application;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts;
using Moq;

namespace BAR.Application.UnitTests.Export;

/// <summary>
/// IExportQuery (a SQL join against Sellers/SellerTypes/Articles) is gone -
/// GetExportQueryHandler now composes itself across three facades, see the
/// handler's comment. These tests mock the three facades instead of a
/// single query port.
/// </summary>
public class GetExportQueryHandlerTests
{
    private readonly Mock<ISellerManagementModuleApi> _sellerManagement = new();
    private readonly Mock<IRegistrationModuleApi> _registration = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();

    private GetExportQueryHandler CreateHandler() => new(_sellerManagement.Object, _registration.Object, _masterData.Object);

    [Fact]
    public async Task HandleAsync_MapsSellersAndArticlesIntoResponseWithGeneratedAtTimestamp()
    {
        _sellerManagement.Setup(v => v.GetAllSellersForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            [new ExportSellerDto("s1", "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "Standard")]);
        _registration.Setup(a => a.GetArticlesForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            [new ExportArticleDto("s1", "a1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null)]);
        _masterData.Setup(s => s.GetAllBrandNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Nike"]);
        _masterData.Setup(s => s.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Jacken"]);
        var before = DateTime.UtcNow;

        var result = await CreateHandler().HandleAsync(new GetExportQuery(true, true), TestContext.Current.CancellationToken);

        Assert.True(result.GeneratedAt >= before);
        Assert.Single(result.Sellers);
        Assert.Equal("Standard", result.Sellers[0].SellerType);
        Assert.Equal("Nike", result.Sellers[0].Articles[0].Brand);
        Assert.Equal(["Nike"], result.Brands);
        Assert.Equal(["Jacken"], result.Categories);
    }

    [Fact]
    public async Task HandleAsync_SellerWithoutArticles_IsExcludedFromResult()
    {
        _sellerManagement.Setup(v => v.GetAllSellersForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
        [
            new ExportSellerDto("s1", "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "Standard"),
            new ExportSellerDto("s2", "Ben", "Muster", null, "76133", "Karlsruhe", "0721 2", "ben@example.com", "Standard")
        ]);
        _registration.Setup(a => a.GetArticlesForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            [new ExportArticleDto("s1", "a1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null)]);

        var result = await CreateHandler().HandleAsync(new GetExportQuery(false, false), TestContext.Current.CancellationToken);

        Assert.Single(result.Sellers);
        Assert.Equal("s1", result.Sellers[0].Id);
    }

    [Fact]
    public async Task HandleAsync_IncludeBrandsAndCategoriesFalse_DoesNotCallMasterData()
    {
        _sellerManagement.Setup(v => v.GetAllSellersForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _registration.Setup(a => a.GetArticlesForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);

        var result = await CreateHandler().HandleAsync(new GetExportQuery(false, false), TestContext.Current.CancellationToken);

        Assert.Empty(result.Brands);
        Assert.Empty(result.Categories);
        _masterData.Verify(s => s.GetAllBrandNamesAsync(It.IsAny<CancellationToken>()), Times.Never);
        _masterData.Verify(s => s.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
