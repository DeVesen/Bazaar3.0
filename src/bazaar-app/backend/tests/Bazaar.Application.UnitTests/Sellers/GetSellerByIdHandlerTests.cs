using Bazaar.Application.Sellers;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class GetSellerByIdHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private GetSellerByIdHandler CreateSut() => new(_sellerRepository.Object);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", "Hauptstr. 1", "76133", "Karlsruhe", "0123456789", "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLER001"));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_KnownId_ReturnsSeller()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var result = await sut.Handle("SELLER001");

        Assert.Same(seller, result);
    }
}
