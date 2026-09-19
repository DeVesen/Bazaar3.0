using Bazaar.Application.Settlement;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Settlement;

public class GetSellerSettlementHandlerTests
{
    private readonly Mock<ISellerSettlementQuery> _sellerSettlementQuery = new();

    private GetSellerSettlementHandler CreateSut() => new(_sellerSettlementQuery.Object);

    private static SellerSettlementReadModel CreateReadModel(
        int openCount = 0,
        int soldCount = 0,
        int returnedCount = 0,
        decimal revenue = 0m,
        decimal commissionRate = 12.5m) =>
        new(
            "SELLER001",
            "Anna",
            "Meier",
            null,
            null,
            null,
            openCount,
            soldCount,
            returnedCount,
            revenue,
            commissionRate,
            20.00m,
            10,
            null,
            null);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerSettlementQuery.Setup(q => q.GetSettlement("SELLER001")).ReturnsAsync((SellerSettlementReadModel?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLER001"));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_NoArticleReleased_CanSettleIsFalse()
    {
        var readModel = CreateReadModel(openCount: 0, soldCount: 0, returnedCount: 0);
        _sellerSettlementQuery.Setup(q => q.GetSettlement("SELLER001")).ReturnsAsync(readModel);
        var sut = CreateSut();

        var result = await sut.Handle("SELLER001");

        Assert.False(result.CanSettle);
    }

    [Fact]
    public async Task Handle_OneArticleSelling_CanSettleIsFalse()
    {
        var readModel = CreateReadModel(openCount: 1, soldCount: 0, returnedCount: 0);
        _sellerSettlementQuery.Setup(q => q.GetSettlement("SELLER001")).ReturnsAsync(readModel);
        var sut = CreateSut();

        var result = await sut.Handle("SELLER001");

        Assert.False(result.CanSettle);
    }

    [Fact]
    public async Task Handle_AllArticlesSoldOrReturnedNoneSelling_CanSettleIsTrue()
    {
        var readModel = CreateReadModel(openCount: 0, soldCount: 31, returnedCount: 9);
        _sellerSettlementQuery.Setup(q => q.GetSettlement("SELLER001")).ReturnsAsync(readModel);
        var sut = CreateSut();

        var result = await sut.Handle("SELLER001");

        Assert.True(result.CanSettle);
    }

    [Fact]
    public async Task Handle_NonZeroRevenue_ComputesCommissionAndPayoutViaSettlementCalculation()
    {
        var readModel = CreateReadModel(openCount: 0, soldCount: 31, returnedCount: 9, revenue: 380.50m, commissionRate: 12.5m);
        _sellerSettlementQuery.Setup(q => q.GetSettlement("SELLER001")).ReturnsAsync(readModel);
        var sut = CreateSut();

        var result = await sut.Handle("SELLER001");

        Assert.Equal(47.56m, result.Commission);
        Assert.Equal(332.94m, result.Payout);
    }
}
