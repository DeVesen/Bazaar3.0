using BAR.Application.Abstractions;
using BAR.Application.Auth.Register;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Auth.Register;

public class RegisterCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public RegisterCommandHandlerTests()
    {
        // Die Transaktionsklammer selbst gehoert zur Infrastruktur; hier wird der
        // uebergebene Delegat einfach direkt ausgefuehrt, damit die Asserts auf
        // die Repository-Aufrufe unveraendert greifen.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private RegisterCommandHandler CreateHandler() => new(
        _sellers.Object, _settings.Object, _refreshTokens.Object,
        _blocks.Object, _hasher.Object, _tokenIssuer.Object, _clock.Object, _unitOfWork.Object);

    private void SetUpHappyPath()
    {
        var settings = Domain.Settings.Settings.Create(
            DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
            "t0000001", null, startNumber: 1, blockSize: 10, defaultBlockCount: 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _hasher.Setup(h => h.Hash("geheim123")).Returns("hashed");
        // Seller.Id ist eine zufaellige 8-stellige EntityId (EntityId.New()), darum
        // hier It.IsAny statt eines festen Literals - der Handler gibt die tatsaechlich
        // erzeugte Id weiter, deren konkreter Wert fuer diesen Test irrelevant ist.
        _tokenIssuer.Setup(t => t.IssueAccessToken(It.IsAny<string>(), "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
    }

    private static RegisterCommand ValidCommand(string email = "anna@example.com") =>
        new(email, "geheim123", "Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 12345");

    [Fact]
    public async Task HandleAsync_NewEmail_CreatesSellerAndReturnsTokenPair()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-plain", result.RefreshToken);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x =>
            x.Email == "anna@example.com" && x.SellerTypeId == "t0000001" &&
            x.FirstName == "Anna" && x.LastName == "Beispiel" && x.PostalCode == "76133" &&
            x.City == "Karlsruhe" && x.Phone == "0721 12345"), It.IsAny<CancellationToken>()), Times.Once);
        _blocks.Verify(b => b.AddRangeAsync(It.Is<IReadOnlyList<NumberBlock>>(list => list.Count == 1), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "x"));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_WholeRegistration_RunsInsideOneTransaction()
    {
        SetUpHappyPath();

        await CreateHandler().HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        _unitOfWork.Verify(u => u.ExecuteInTransactionAsync(
            It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_BlockRangeTakenConcurrently_RetriesAllocationOnceAndSucceeds()
    {
        SetUpHappyPath();
        var attempts = 0;
        _blocks
            .Setup(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()))
            .Returns(() =>
            {
                attempts++;
                return attempts == 1
                    ? throw new BAR.Domain.Exceptions.NumberBlockOverlapException("belegt")
                    : Task.CompletedTask;
            });

        var result = await CreateHandler().HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal(2, attempts);
        // Der zweite Versuch liest den Bestand neu, statt die veraltete Liste
        // ein zweites Mal zu verwenden.
        _blocks.Verify(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<BAR.Domain.Auth.RefreshToken>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_BlockRangeTakenTwice_ThrowsConflictInsteadOfBubblingUp()
    {
        SetUpHappyPath();
        _blocks
            .Setup(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new BAR.Domain.Exceptions.NumberBlockOverlapException("belegt"));

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => CreateHandler().HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("block.overlap", ex.ErrorCode);
        _blocks.Verify(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<BAR.Domain.Auth.RefreshToken>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_NoDefaultTypeConfigured_ThrowsRegistrationNotEnabled()
    {
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Settings.Settings?)null);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("registration.not_enabled", ex.ErrorCode);
    }
}
