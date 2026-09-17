using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class GetArticleTemplateCsvQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ExistingArticle_StillOnlyNumberInTemplate()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 1, DateTime.UtcNow);
        var blocks = new Mock<INumberBlockRepository>();
        blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        var handler = new GetArticleTemplateCsvQueryHandler(blocks.Object);

        var csv = await handler.HandleAsync(sellerId, TestContext.Current.CancellationToken);

        Assert.Contains("101;;;;;\r\n", csv);
    }
}
