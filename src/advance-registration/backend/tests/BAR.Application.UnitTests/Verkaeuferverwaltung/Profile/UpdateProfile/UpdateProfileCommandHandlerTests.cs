using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.UpdateProfile;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Verkaeuferverwaltung.Profile.UpdateProfile;

public class UpdateProfileCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IStammdatenModuleApi> _stammdaten = new();

    private UpdateProfileCommandHandler CreateHandler() => new(_sellers.Object, _stammdaten.Object);

    [Fact]
    public async Task HandleAsync_ValidCommand_UpdatesSellerAndReturnsProfile()
    {
        var seller = Seller.Register("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _stammdaten.Setup(t => t.GetSellerTypeConditionsAsync("t1b2c3d4", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerTypeConditionsDto("t1b2c3d4", "Standard", 15.0m, 0.5m));
        var command = new UpdateProfileCommand("Anna-Maria", "Muster", "Neue Str. 2", "76135", "Ettlingen", "0721 99999");

        var result = await CreateHandler().HandleAsync(seller.Id, command, TestContext.Current.CancellationToken);

        Assert.Equal("Anna-Maria", result.FirstName);
        Assert.Equal("Ettlingen", result.City);
        Assert.Equal("anna@example.com", result.Email);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownSeller_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var command = new UpdateProfileCommand("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345");

        var ex = await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().HandleAsync("unknown", command, TestContext.Current.CancellationToken));
        Assert.Equal("seller.not_found", ex.ErrorCode);
    }
}
