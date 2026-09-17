using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class GetArticleExportCsvQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_GapInNumberBlock_ExportsFullRangeWithBlankGap()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 3, DateTime.UtcNow);
        var article = Article.Create(sellerId, 101, "Jacke", "Nike", "Jacken", 25m, null, null, null, DateTime.UtcNow);
        var blocks = new Mock<INumberBlockRepository>();
        blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        var articles = new Mock<IArticleRepository>();
        articles.Setup(a => a.GetAllForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([article]);
        var handler = new GetArticleExportCsvQueryHandler(articles.Object, blocks.Object);

        var csv = await handler.HandleAsync(sellerId, TestContext.Current.CancellationToken);

        Assert.Contains("101;Jacke;Jacken;Nike;;25,00\r\n", csv);
        Assert.Contains("102;;;;;\r\n", csv);
        Assert.Contains("103;;;;;\r\n", csv);
    }
}
