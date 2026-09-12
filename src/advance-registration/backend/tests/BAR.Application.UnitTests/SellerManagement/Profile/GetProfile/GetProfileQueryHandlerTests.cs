using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.SellerManagement.Application.Profile.GetProfile;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Profile.GetProfile;

public class GetProfileQueryHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();

    private GetProfileQueryHandler CreateHandler() => new(_sellers.Object, _masterData.Object);

    [Fact]
    public async Task HandleAsync_ExistingSeller_ReturnsProfileWithResolvedSellerType()
    {
        var seller = Seller.Register("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _masterData.Setup(t => t.GetSellerTypeConditionsAsync("t1b2c3d4", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerTypeConditionsDto("t1b2c3d4", "Standard", 15.0m, 0.5m));

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

        var ex = await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().HandleAsync("unknown", TestContext.Current.CancellationToken));
        Assert.Equal("seller.not_found", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_UnknownSellerType_ThrowsNotFound()
    {
        var seller = Seller.Register("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _masterData.Setup(t => t.GetSellerTypeConditionsAsync("t1b2c3d4", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SellerTypeConditionsDto?)null);

        var ex = await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().HandleAsync(seller.Id, TestContext.Current.CancellationToken));
        Assert.Equal("seller_type.not_found", ex.ErrorCode);
    }
}
