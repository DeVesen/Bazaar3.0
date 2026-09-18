using Bazaar.Application.Sellers;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class GetSellerCardsHandlerTests
{
    private readonly Mock<ISellerCardsQuery> _sellerCardsQuery = new();

    private GetSellerCardsHandler CreateSut() => new(_sellerCardsQuery.Object);

    [Fact]
    public async Task Handle_DelegatesParamsAndReturnsQueryResultUnchanged()
    {
        var page = new SellerCardsPage(
            [new SellerCard("SELLER001", "Anna", "Meier", "76133", "Karlsruhe", "Privat", "open", 0, 0, 0, 0, 0m, 0m, 0m, null)],
            1, 1, 60);
        _sellerCardsQuery.Setup(q => q.GetCards("meier", "selling", "revenue:desc", 1, 60)).ReturnsAsync(page);
        var sut = CreateSut();

        var result = await sut.Handle("meier", "selling", "revenue:desc", 1, 60);

        Assert.Same(page, result);
    }
}
