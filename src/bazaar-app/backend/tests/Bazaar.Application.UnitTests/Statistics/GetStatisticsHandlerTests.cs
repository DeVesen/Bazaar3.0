using Bazaar.Application.Statistics;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Statistics;

public class GetStatisticsHandlerTests
{
    private readonly Mock<IStatisticsQuery> _statisticsQuery = new();

    private GetStatisticsHandler CreateSut() => new(_statisticsQuery.Object);

    private static StatisticsReadModel CreateReadModel(
        int acceptedCount = 0,
        int soldCount = 0,
        decimal commission = 0m,
        decimal fees = 0m) =>
        new(
            TotalCount: acceptedCount,
            AcceptedCount: acceptedCount,
            SellingCount: 0,
            SoldCount: soldCount,
            ReturnedCount: 0,
            AcceptedValue: 0m,
            ReturnedValue: 0m,
            OpenValue: 0m,
            GrossIncome: 0m,
            GrossIncomeManual: 0m,
            Commission: commission,
            Fees: fees,
            PayoutExpected: 0m,
            PayoutSettled: 0m,
            Leaderboard: []);

    [Fact]
    public async Task Handle_AcceptedCountZero_ReturnsNullSellRate()
    {
        var readModel = CreateReadModel(acceptedCount: 0, soldCount: 0);
        _statisticsQuery.Setup(q => q.Get(null)).ReturnsAsync(readModel);
        var sut = CreateSut();

        var result = await sut.Handle(null);

        Assert.Null(result.SellRate);
    }

    [Fact]
    public async Task Handle_AcceptedCountNonZero_ComputesSellRate()
    {
        var readModel = CreateReadModel(acceptedCount: 780, soldCount: 640);
        _statisticsQuery.Setup(q => q.Get(null)).ReturnsAsync(readModel);
        var sut = CreateSut();

        var result = await sut.Handle(null);

        Assert.Equal(82.05m, result.SellRate);
    }

    [Fact]
    public async Task Handle_ComputesEarningsTotal()
    {
        var readModel = CreateReadModel(commission: 1102.68m, fees: 390.00m);
        _statisticsQuery.Setup(q => q.Get(null)).ReturnsAsync(readModel);
        var sut = CreateSut();

        var result = await sut.Handle(null);

        Assert.Equal(1492.68m, result.EarningsTotal);
    }

    [Fact]
    public async Task Handle_PassesSellerTypeIdThrough()
    {
        var readModel = CreateReadModel();
        _statisticsQuery.Setup(q => q.Get("SLT00001")).ReturnsAsync(readModel);
        var sut = CreateSut();

        await sut.Handle("SLT00001");

        _statisticsQuery.Verify(q => q.Get("SLT00001"), Times.Once);
    }

    [Fact]
    public async Task Handle_NullSellerTypeId_PassesNullThrough()
    {
        var readModel = CreateReadModel();
        _statisticsQuery.Setup(q => q.Get(null)).ReturnsAsync(readModel);
        var sut = CreateSut();

        await sut.Handle(null);

        _statisticsQuery.Verify(q => q.Get(null), Times.Once);
    }
}
