using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Export.Application;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using Moq;

namespace BAR.Application.UnitTests.Export;

/// <summary>
/// IExportQuery (SQL-Join gegen Sellers/SellerTypes/Articles) ist weg -
/// GetExportQueryHandler komponiert jetzt selbst ueber drei Facaden, siehe
/// Handler-Kommentar. Diese Tests mocken die drei Facaden statt eines
/// einzigen Query-Ports.
/// </summary>
public class GetExportQueryHandlerTests
{
    private readonly Mock<IVerkaeuferverwaltungModuleApi> _verkaeuferverwaltung = new();
    private readonly Mock<IAnmeldungModuleApi> _anmeldung = new();
    private readonly Mock<IStammdatenModuleApi> _stammdaten = new();

    private GetExportQueryHandler CreateHandler() => new(_verkaeuferverwaltung.Object, _anmeldung.Object, _stammdaten.Object);

    [Fact]
    public async Task HandleAsync_MapsSellersAndArticlesIntoResponseWithGeneratedAtTimestamp()
    {
        _verkaeuferverwaltung.Setup(v => v.GetAllSellersForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            [new ExportSellerDto("s1", "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "Standard")]);
        _anmeldung.Setup(a => a.GetArticlesForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            [new ExportArticleDto("s1", "a1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null)]);
        _stammdaten.Setup(s => s.GetAllBrandNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Nike"]);
        _stammdaten.Setup(s => s.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Jacken"]);
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
        _verkaeuferverwaltung.Setup(v => v.GetAllSellersForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
        [
            new ExportSellerDto("s1", "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "Standard"),
            new ExportSellerDto("s2", "Ben", "Muster", null, "76133", "Karlsruhe", "0721 2", "ben@example.com", "Standard")
        ]);
        _anmeldung.Setup(a => a.GetArticlesForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            [new ExportArticleDto("s1", "a1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null)]);

        var result = await CreateHandler().HandleAsync(new GetExportQuery(false, false), TestContext.Current.CancellationToken);

        Assert.Single(result.Sellers);
        Assert.Equal("s1", result.Sellers[0].Id);
    }

    [Fact]
    public async Task HandleAsync_IncludeBrandsAndCategoriesFalse_DoesNotCallStammdaten()
    {
        _verkaeuferverwaltung.Setup(v => v.GetAllSellersForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _anmeldung.Setup(a => a.GetArticlesForExportAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);

        var result = await CreateHandler().HandleAsync(new GetExportQuery(false, false), TestContext.Current.CancellationToken);

        Assert.Empty(result.Brands);
        Assert.Empty(result.Categories);
        _stammdaten.Verify(s => s.GetAllBrandNamesAsync(It.IsAny<CancellationToken>()), Times.Never);
        _stammdaten.Verify(s => s.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
