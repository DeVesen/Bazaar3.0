using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Update;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Verkaeuferverwaltung.Sellers.Update;

public class UpdateSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IStammdatenModuleApi> _stammdaten = new();
    private readonly Mock<IAnmeldungModuleApi> _anmeldung = new();
    private readonly Mock<IClock> _clock = new();

    private UpdateSellerCommandHandler CreateHandler()
    {
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
        return new(_sellers.Object, _stammdaten.Object, _anmeldung.Object, _clock.Object);
    }

    private void SetUpSellerType(string id = "t1") =>
        _stammdaten.Setup(t => t.GetSellerTypeConditionsAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerTypeConditionsDto(id, "Standard", 0.1m, 0.5m));

    private void SetUpBlockSummary(string sellerId, int? startNumber = null, int articleCount = 0) =>
        _anmeldung.Setup(a => a.GetBlockSummariesForSellersAsync(
                It.Is<IReadOnlyCollection<string>>(ids => ids.Contains(sellerId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, SellerBlockSummaryDto> { [sellerId] = new(startNumber, articleCount) });

    [Fact]
    public async Task HandleAsync_ExistingSeller_UpdatesProfile()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        SetUpSellerType();
        SetUpBlockSummary(seller.Id);
        var handler = CreateHandler();

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Neu", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", true);
        var response = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.Equal("Neu", response.LastName);
        Assert.True(response.IsAdmin);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_SellerHasArticles_ReturnsRealArticleCountInsteadOfZero()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        SetUpSellerType();
        SetUpBlockSummary(seller.Id, articleCount: 7);
        var handler = CreateHandler();

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var response = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.Equal(7, response.ArticleCount);
    }

    [Fact]
    public async Task HandleAsync_ExpiredInviteToken_HasPendingInviteIsFalse()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var now = DateTime.UtcNow;
        seller.GenerateInviteToken(now.AddDays(-30)); // laengst abgelaufen
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        SetUpSellerType();
        SetUpBlockSummary(seller.Id);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var handler = new UpdateSellerCommandHandler(_sellers.Object, _stammdaten.Object, _anmeldung.Object, _clock.Object);

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var response = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.False(response.HasPendingInvite);
    }

    [Fact]
    public async Task HandleAsync_ActiveInviteToken_HasPendingInviteIsTrue()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var now = DateTime.UtcNow;
        seller.GenerateInviteToken(now);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        SetUpSellerType();
        SetUpBlockSummary(seller.Id);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var handler = new UpdateSellerCommandHandler(_sellers.Object, _stammdaten.Object, _anmeldung.Object, _clock.Object);

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var response = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.True(response.HasPendingInvite);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("missing", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var handler = CreateHandler();

        await Assert.ThrowsAsync<NotFoundException>(() => handler.HandleAsync(
            new UpdateSellerCommand("missing", "A", "B", null, "1", "C", "0", "a@b.de", "t1", false),
            TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_EmailTakenByAnotherSeller_ThrowsConflict()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var other = Seller.CreateByAdmin("Ben", "X", null, "1", "Berlin", "0", "ben@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("ben@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(other);
        var handler = CreateHandler();

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Alt", null, "1", "Karlsruhe", "0", "ben@example.com", "t1", false);
        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(command, TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_UnknownSellerTypeId_ThrowsNotFoundAndDoesNotUpdateSeller()
    {
        var seller = Seller.CreateByAdmin("Anna", "Alt", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _stammdaten.Setup(t => t.GetSellerTypeConditionsAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((SellerTypeConditionsDto?)null);
        var handler = CreateHandler();

        var command = new UpdateSellerCommand(seller.Id, "Anna", "Neu", null, "1", "Karlsruhe", "0", "anna@example.com", "unknown", true);
        var ex = await Assert.ThrowsAsync<NotFoundException>(
            () => handler.HandleAsync(command, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.not_found", ex.ErrorCode);
        _sellers.Verify(s => s.UpdateAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
