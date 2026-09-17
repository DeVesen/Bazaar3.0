using System.Text;
using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.SharedKernel;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ImportArticlesCommandHandlerTests
{
    private static readonly DateTime Now = new(2026, 9, 17, 10, 0, 0, DateTimeKind.Utc);
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();
    private readonly Mock<IClock> _clock = new();

    private ImportArticlesCommandHandler CreateHandler() =>
        new(_articles.Object, _blocks.Object, _masterData.Object, _clock.Object);

    private static byte[] Csv(params string[] dataLines) =>
        Encoding.UTF8.GetBytes("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n" + string.Join("\r\n", dataLines) + "\r\n");

    private void SetUpCommonMocks(string sellerId, IReadOnlyList<NumberBlock> blocks, IReadOnlyList<Article> existing)
    {
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(blocks);
        _articles.Setup(a => a.GetAllForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(existing);
        _masterData.Setup(m => m.GetAllBrandNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Nike"]);
        _masterData.Setup(m => m.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Jacken"]);
        _clock.Setup(c => c.UtcNow).Returns(Now);
    }

    [Fact]
    public async Task HandleAsync_RowError_ReturnsUnsuccessfulResultAndAppliesNothing()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 3, Now);
        SetUpCommonMocks(sellerId, [block], []);
        var command = new ImportArticlesCommand(sellerId, false, Csv("999;A;B;C;;1,00"), "import.csv");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Equal("import.number_not_in_own_range", result.Errors.Single().ErrorCode);
        _articles.Verify(a => a.ApplyImportAsync(
            It.IsAny<IReadOnlyList<Article>>(), It.IsAny<IReadOnlyList<Article>>(), It.IsAny<IReadOnlyList<Article>>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_AllRowsValid_CreatesUpdatesDeletesAndReturnsCounts()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 3, Now);
        var existingAt102 = Article.Create(sellerId, 102, "Alt", "Nike", "Jacken", 1m, null, null, null, Now);
        var existingAt103 = Article.Create(sellerId, 103, "ZuLoeschen", "Nike", "Jacken", 1m, null, null, null, Now);
        SetUpCommonMocks(sellerId, [block], [existingAt102, existingAt103]);
        var command = new ImportArticlesCommand(sellerId, false,
            Csv("101;Neu;Jacken;Nike;;12,50", "102;Update;Jacken;Nike;;9,00", "103;;;;;"), "import.csv");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        Assert.Equal(1, result.Created);
        Assert.Equal(1, result.Updated);
        Assert.Equal(1, result.Deleted);
        _articles.Verify(a => a.ApplyImportAsync(
            It.Is<IReadOnlyList<Article>>(l => l.Count == 1 && l[0].Number == 101),
            It.Is<IReadOnlyList<Article>>(l => l.Count == 1 && l[0].Number == 102 && l[0].Name == "Update"),
            It.Is<IReadOnlyList<Article>>(l => l.Count == 1 && l[0].Number == 103),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownBrandAndCategory_AreAutoCreatedBeforeWriting()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 1, Now);
        SetUpCommonMocks(sellerId, [block], []);
        var command = new ImportArticlesCommand(sellerId, false, Csv("101;Neu;NeueKategorie;NeueMarke;;5,00"), "import.csv");
        var handler = CreateHandler();

        await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        _masterData.Verify(m => m.CreateBrandAsync(
            It.Is<CreateBrandCommand>(c => c.Name == "NeueMarke" && c.IsAdmin == false), It.IsAny<CancellationToken>()), Times.Once);
        _masterData.Verify(m => m.CreateCategoryAsync(
            It.Is<CreateCategoryCommand>(c => c.Name == "NeueKategorie" && c.IsAdmin == false), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_KnownBrand_IsNotRecreated()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 1, Now);
        SetUpCommonMocks(sellerId, [block], []);
        var command = new ImportArticlesCommand(sellerId, false, Csv("101;Neu;Jacken;Nike;;5,00"), "import.csv");
        var handler = CreateHandler();

        await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        _masterData.Verify(m => m.CreateBrandAsync(It.IsAny<CreateBrandCommand>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_UnreadableFile_ThrowsArgumentException()
    {
        SetUpCommonMocks("s1234567", [], []);
        var command = new ImportArticlesCommand("s1234567", false, [1, 2, 3], "import.txt");
        var handler = CreateHandler();

        await Assert.ThrowsAsync<ArgumentException>(() => handler.HandleAsync(command, TestContext.Current.CancellationToken));
    }
}
