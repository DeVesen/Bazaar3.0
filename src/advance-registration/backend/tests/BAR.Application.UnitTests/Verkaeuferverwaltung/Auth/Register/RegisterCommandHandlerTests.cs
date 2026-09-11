using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.Register;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Verkaeuferverwaltung.Auth.Register;

public class RegisterCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IBetriebModuleApi> _betrieb = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    // AllocateInitialBlocksAsync (Retry-bei-Overlap etc.) lebt und wird getestet
    // in Anmeldung.Application.Blocks.AllocateInitialBlocksService - hier reicht
    // ein Mock der Fassade, ueber die der echte SellerBlockAllocationCoordinator
    // (keine Schnittstelle, darum real instanziiert statt gemockt) sie aufruft.
    private readonly Mock<IAnmeldungModuleApi> _anmeldung = new();
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
        _sellers.Object, _refreshTokens.Object, _betrieb.Object,
        new SellerBlockAllocationCoordinator(_sellers.Object, _refreshTokens.Object, _anmeldung.Object),
        _hasher.Object, _tokenIssuer.Object, _clock.Object, _unitOfWork.Object);

    private void SetUpHappyPath()
    {
        _betrieb.Setup(s => s.GetSettingsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            new SettingsDto(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
                "t0000001", null, StartNumber: 1, BlockSize: 10, DefaultBlockCount: 1));
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _anmeldung.Setup(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync([new BlockDto("b1", "s1", 1, 10, 10, 0, DateTime.UtcNow)]);
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
        _anmeldung.Verify(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), null, null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "x"));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
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
    public async Task HandleAsync_BlockAllocationFails_CompensatesByDeletingSellerAndRethrows()
    {
        SetUpHappyPath();
        _anmeldung.Setup(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), null, null, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ConflictException("block.overlap", "Nummernvergabe momentan ueberlastet"));
        // Kompensation liest den gerade angelegten Seller per Id neu, um ihn zu
        // loeschen - dessen konkrete Id ist fuer diesen Test irrelevant.
        _sellers.Setup(s => s.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345", "anna@example.com", "t0000001", "hashed"));

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => CreateHandler().HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("block.overlap", ex.ErrorCode);
        _sellers.Verify(s => s.DeleteAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_NoDefaultTypeConfigured_ThrowsRegistrationNotEnabled()
    {
        _betrieb.Setup(s => s.GetSettingsAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SettingsDto?)null);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("registration.not_enabled", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_SettingsExistButDefaultTypeIdIsNull_ThrowsRegistrationNotEnabled()
    {
        var settings = new SettingsDto(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
            DefaultTypeId: null, null, StartNumber: 1, BlockSize: 10, DefaultBlockCount: 1);
        _betrieb.Setup(s => s.GetSettingsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("registration.not_enabled", ex.ErrorCode);
    }
}
