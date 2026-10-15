using Bazaar.Application.Sellers;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class GetSellerArticlesHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IArticlesBySellerQuery> _articlesBySellerQuery = new();

    private GetSellerArticlesHandler CreateSut() =>
        new(_sellerRepository.Object, _articlesBySellerQuery.Object);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLER001"));

        Assert.Equal("seller.not_found", exception.ErrorCode);
        _articlesBySellerQuery.Verify(q => q.GetBySellerId(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_KnownId_DelegatesToArticlesBySellerQuery()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var articles = new List<SellerArticleSummary>
        {
            new("ART001", 1043, "Winterjacke", "Nike", "Jacken", "M", "Rot", 12.00m, "sold", false)
        };
        _articlesBySellerQuery.Setup(q => q.GetBySellerId("SELLER001")).ReturnsAsync(articles);
        var sut = CreateSut();

        var result = await sut.Handle("SELLER001");

        Assert.Same(articles, result);
    }
}
