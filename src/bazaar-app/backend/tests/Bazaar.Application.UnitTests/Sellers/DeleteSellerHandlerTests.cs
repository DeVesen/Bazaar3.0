using Bazaar.Application.Sellers;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class DeleteSellerHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IArticleCountBySellerQuery> _articleCountBySellerQuery = new();

    private DeleteSellerHandler CreateSut() =>
        new(_sellerRepository.Object, _articleCountBySellerQuery.Object);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLER001"));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_NoArticles_RemovesSeller()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _articleCountBySellerQuery.Setup(q => q.CountBySellerId("SELLER001")).ReturnsAsync(0);
        var sut = CreateSut();

        await sut.Handle("SELLER001");

        _sellerRepository.Verify(r => r.Remove(seller), Times.Once);
    }

    /// <summary>
    /// This branch is structurally correct but unreachable in Round-14 via the real
    /// (placeholder) IArticleCountBySellerQuery, which always returns 0 — Round-15 wires
    /// the real Articles table and makes this branch reachable. The mock here proves the
    /// handler logic ahead of that.
    /// </summary>
    [Fact]
    public async Task Handle_SellerHasArticles_ThrowsConflictAndDoesNotRemove_UnreachableUntilRound15()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _articleCountBySellerQuery.Setup(q => q.CountBySellerId("SELLER001")).ReturnsAsync(12);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("SELLER001"));

        Assert.Equal("seller.has_articles", exception.ErrorCode);
        Assert.Equal("Verkäufer hat noch 12 Artikel", exception.Message);
        _sellerRepository.Verify(r => r.Remove(It.IsAny<Seller>()), Times.Never);
    }
}
