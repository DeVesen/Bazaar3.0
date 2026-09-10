using BAR.Application.Sellers.Create;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Create;

public class CreateSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();

    private CreateSellerCommandHandler CreateHandler() => new(_sellers.Object, _settings.Object, _blocks.Object);

    private static CreateSellerCommand ValidCommand() =>
        new("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", false, null, null);

    private void SetUpHappyPath()
    {
        var settings = Domain.Settings.Settings.Create(
            DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
            "t0000001", null, startNumber: 1, blockSize: 10, defaultBlockCount: 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
    }

    [Fact]
    public async Task HandleAsync_NewEmail_CreatesSellerWithoutPasswordAndReservesBlocks()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var response = await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("anna@example.com", response.Email);
        Assert.False(response.HasPendingInvite);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x => x.PasswordHash == null), It.IsAny<CancellationToken>()), Times.Once);
        _blocks.Verify(b => b.AddRangeAsync(It.Is<IReadOnlyList<NumberBlock>>(list => list.Count == 1), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.CreateByAdmin("X", "Y", null, "1", "Z", "0", "anna@example.com", "t0000001", false));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }
}
