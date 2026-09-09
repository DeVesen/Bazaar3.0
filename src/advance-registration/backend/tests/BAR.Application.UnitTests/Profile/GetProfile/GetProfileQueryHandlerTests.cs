using BAR.Application.Profile.GetProfile;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Profile.GetProfile;

public class GetProfileQueryHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private GetProfileQueryHandler CreateHandler() => new(_sellers.Object, _sellerTypes.Object);

    [Fact]
    public async Task HandleAsync_ExistingSeller_ReturnsProfileWithResolvedSellerType()
    {
        var seller = Seller.Register("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        var sellerType = SellerType.Create("Standard", 15.0m, 0.5m);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(sellerType);

        var result = await CreateHandler().HandleAsync(seller.Id, TestContext.Current.CancellationToken);

        Assert.Equal("Anna", result.FirstName);
        Assert.Equal("anna@example.com", result.Email);
        Assert.Equal("Standard", result.SellerType.Name);
        Assert.Equal(15.0m, result.SellerType.CommissionRate);
    }

    [Fact]
    public async Task HandleAsync_UnknownSeller_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.NotFoundException>(
            () => CreateHandler().HandleAsync("unknown", TestContext.Current.CancellationToken));
        Assert.Equal("seller.not_found", ex.ErrorCode);
    }
}
