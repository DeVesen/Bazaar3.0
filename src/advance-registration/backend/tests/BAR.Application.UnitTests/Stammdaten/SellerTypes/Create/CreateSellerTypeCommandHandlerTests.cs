using BAR.Modules.Stammdaten.Application.SellerTypes.Create;
using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.Modules.Stammdaten.Domain.SellerTypes;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.SellerTypes.Create;

public class CreateSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();

    [Fact]
    public async Task HandleAsync_ValidData_CreatesType()
    {
        _types.Setup(t => t.ExistsByNameAsync("Standard", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateSellerTypeCommandHandler(_types.Object);

        var result = await handler.HandleAsync(new CreateSellerTypeCommand("Standard", 12.5m, 0.50m), TestContext.Current.CancellationToken);

        Assert.Equal("Standard", result.Name);
        Assert.Equal(12.5m, result.CommissionRate);
        Assert.Equal(0, result.SellerCount);
        _types.Verify(t => t.AddAsync(It.IsAny<SellerType>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_NameTaken_ThrowsConflict()
    {
        _types.Setup(t => t.ExistsByNameAsync("Standard", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new CreateSellerTypeCommandHandler(_types.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new CreateSellerTypeCommand("Standard", 12.5m, 0.50m), TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.name_taken", ex.ErrorCode);
    }
}
