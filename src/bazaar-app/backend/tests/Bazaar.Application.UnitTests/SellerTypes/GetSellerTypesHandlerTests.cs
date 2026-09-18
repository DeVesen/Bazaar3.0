using Bazaar.Application.SellerTypes;
using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;
using Moq;

namespace Bazaar.Application.UnitTests.SellerTypes;

public class GetSellerTypesHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();
    private readonly Mock<ISellerCountBySellerTypeQuery> _sellerCountQuery = new();

    private GetSellerTypesHandler CreateSut() =>
        new(_sellerTypeRepository.Object, _sellerCountQuery.Object);

    [Fact]
    public async Task Handle_ReturnsSellerTypesSortedByNameWithSellerCountPopulated()
    {
        var standard = SellerType.Create("SELLERTYPE002", "Standard", 10m, 0.5m);
        var premium = SellerType.Create("SELLERTYPE001", "Premium", 15m, 1m);
        _sellerTypeRepository.Setup(r => r.GetAll()).ReturnsAsync([standard, premium]);
        _sellerCountQuery.Setup(q => q.CountBySellerTypeId("SELLERTYPE001")).ReturnsAsync(3);
        _sellerCountQuery.Setup(q => q.CountBySellerTypeId("SELLERTYPE002")).ReturnsAsync(5);
        var sut = CreateSut();

        var result = await sut.Handle();

        Assert.Equal(2, result.Count);
        Assert.Equal(new SellerTypeListItem("SELLERTYPE001", "Premium", 15m, 1m, 3), result[0]);
        Assert.Equal(new SellerTypeListItem("SELLERTYPE002", "Standard", 10m, 0.5m, 5), result[1]);
    }
}
