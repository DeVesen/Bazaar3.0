using BAR.Application.Blocks.NextFree;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Blocks.NextFree;

public class GetNextFreeQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_NoExistingBlocks_ReturnsSettingsStartNumber()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var settings = new Mock<ISettingsRepository>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, "t1", null, 101, 10, 1));
        var handler = new GetNextFreeQueryHandler(blocks.Object, settings.Object);

        var result = await handler.HandleAsync(new GetNextFreeQuery(2), TestContext.Current.CancellationToken);

        Assert.Equal(101, result.StartNumber);
    }
}
