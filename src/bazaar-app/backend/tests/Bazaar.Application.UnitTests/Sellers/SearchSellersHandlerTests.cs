using Bazaar.Application.Sellers;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class SearchSellersHandlerTests
{
    private readonly Mock<ISellerSearchQuery> _sellerSearchQuery = new();

    private SearchSellersHandler CreateSut() => new(_sellerSearchQuery.Object);

    [Fact]
    public async Task Handle_WithQuery_DelegatesToSellerSearchQueryAndReturnsItsResult()
    {
        var results = new List<SellerSearchResult> { new("SELLER001", "Anna", "Meier", "Karlsruhe", "Privat", null) };
        _sellerSearchQuery.Setup(q => q.Search("mei")).ReturnsAsync(results);
        var sut = CreateSut();

        var result = await sut.Handle("mei");

        Assert.Same(results, result);
    }

    [Fact]
    public async Task Handle_NullQuery_DelegatesNullThrough()
    {
        var results = new List<SellerSearchResult>();
        _sellerSearchQuery.Setup(q => q.Search(null)).ReturnsAsync(results);
        var sut = CreateSut();

        var result = await sut.Handle(null);

        Assert.Same(results, result);
    }
}
