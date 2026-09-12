using BAR.Modules.Registration.Application.Blocks.NextFree;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Operations.Contracts;
using Moq;

namespace BAR.Application.UnitTests.Registration.Blocks.NextFree;

public class GetNextFreeQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_NoExistingBlocks_ReturnsNumberingStartNumber()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var operations = new Mock<IOperationsModuleApi>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        operations.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NumberingConfigDto(StartNumber: 101, BlockSize: 10, DefaultBlockCount: 1));
        var handler = new GetNextFreeQueryHandler(blocks.Object, operations.Object);

        var result = await handler.HandleAsync(2, TestContext.Current.CancellationToken);

        Assert.Equal(101, result.StartNumber);
    }
}
