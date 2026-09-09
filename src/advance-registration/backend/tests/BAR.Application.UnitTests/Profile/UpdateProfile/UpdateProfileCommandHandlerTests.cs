using BAR.Application.Profile.UpdateProfile;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Profile.UpdateProfile;

public class UpdateProfileCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private UpdateProfileCommandHandler CreateHandler() => new(_sellers.Object, _sellerTypes.Object);

    [Fact]
    public async Task HandleAsync_ValidCommand_UpdatesSellerAndReturnsProfile()
    {
        var seller = Seller.Register("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        var sellerType = SellerType.Create("Standard", 15.0m, 0.5m);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(sellerType);
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
