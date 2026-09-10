using BAR.Application.Abstractions;
using BAR.Application.Sellers.Invite;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Invite;

public class InviteSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IClock> _clock = new();

    [Fact]
    public async Task HandleAsync_ExistingSeller_GeneratesTokenAndPersists()
    {
        var seller = Seller.CreateByAdmin("Anna", "Beispiel", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        var now = new DateTime(2026, 8, 17, 12, 0, 0, DateTimeKind.Utc);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var handler = new InviteSellerCommandHandler(_sellers.Object, _clock.Object);

        var result = await handler.HandleAsync(new InviteSellerCommand(seller.Id), TestContext.Current.CancellationToken);

        Assert.Equal(now.AddDays(7), result.ExpiresAt);
        Assert.False(string.IsNullOrWhiteSpace(result.Token));
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("missing", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var handler = new InviteSellerCommandHandler(_sellers.Object, _clock.Object);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.NotFoundException>(
            () => handler.HandleAsync(new InviteSellerCommand("missing"), TestContext.Current.CancellationToken));
    }
}
