using BAR.Modules.Anmeldung.Application.Blocks.NextFree;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Betrieb.Contracts;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Blocks.NextFree;

public class GetNextFreeQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_NoExistingBlocks_ReturnsNumberingStartNumber()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var betrieb = new Mock<IBetriebModuleApi>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        betrieb.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NumberingConfigDto(StartNumber: 101, BlockSize: 10, DefaultBlockCount: 1));
        var handler = new GetNextFreeQueryHandler(blocks.Object, betrieb.Object);

        var result = await handler.HandleAsync(2, TestContext.Current.CancellationToken);

        Assert.Equal(101, result.StartNumber);
    }
}
