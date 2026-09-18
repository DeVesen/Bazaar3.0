using Bazaar.Application.Sellers;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class ResetSellerSettlementHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private ResetSellerSettlementHandler CreateSut() => new(_sellerRepository.Object);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLER001"));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_SellerNotSettled_ThrowsNotFoundWithSettlementNotSettledCode()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLER001"));

        Assert.Equal("settlement.not_settled", exception.ErrorCode);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerSettled_ResetsSettlementAndUpdates()
    {
        var seller = CreateSeller();
        seller.Settle(332.94m, DateTimeOffset.UtcNow);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        await sut.Handle("SELLER001");

        Assert.Null(seller.SettledAt);
        Assert.Null(seller.PayoutAmount);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
    }
}
