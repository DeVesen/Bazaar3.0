using BAR.Application.Public.GetInfo;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Public.GetInfo;

public class GetPublicInfoQueryHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private GetPublicInfoQueryHandler CreateHandler() => new(_settings.Object, _sellerTypes.Object);

    [Fact]
    public async Task HandleAsync_SettingsConfigured_ReturnsResolvedConditions()
    {
        var deadline = DateTime.UtcNow;
        var settings = Domain.Settings.Settings.Create(
            deadline, deadline, deadline, deadline, deadline, "t0000001", "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        _sellerTypes.Setup(t => t.GetByIdAsync("t0000001", It.IsAny<CancellationToken>())).ReturnsAsync(SellerType.Create("Standard", 15.0m, 0.5m));

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(deadline, result.RegistrationDeadline);
        Assert.Equal(15.0m, result.DefaultConditions!.CommissionRate);
        Assert.Equal("Hinweis", result.InfoText);
    }

    [Fact]
    public async Task HandleAsync_NoSettingsRow_ReturnsAllNull()
    {
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Settings.Settings?)null);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Null(result.RegistrationDeadline);
        Assert.Null(result.DefaultConditions);
        Assert.Null(result.InfoText);
    }

    [Fact]
    public async Task HandleAsync_SettingsRowWithNullDefaultTypeId_ReturnsNullConditionsWithoutLookup()
    {
        var deadline = DateTime.UtcNow;
        var settings = Domain.Settings.Settings.Create(
            deadline, deadline, deadline, deadline, deadline, null, "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Null(result.DefaultConditions);
        _sellerTypes.Verify(t => t.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
