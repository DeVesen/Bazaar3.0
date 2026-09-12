using BAR.Modules.Operations.Application.PublicInfo;
using BAR.Modules.Operations.Domain.Ports;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using DomainSettings = BAR.Modules.Operations.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Operations.Public.GetInfo;

public class GetPublicInfoQueryHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();

    private GetPublicInfoQueryHandler CreateHandler() => new(_settings.Object, _masterData.Object);

    [Fact]
    public async Task HandleAsync_SettingsConfigured_ReturnsResolvedConditions()
    {
        var deadline = DateTime.UtcNow;
        var settings = DomainSettings.Create(
            deadline, deadline, deadline, deadline, deadline, "t0000001", "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        _masterData.Setup(t => t.GetSellerTypeConditionsAsync("t0000001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerTypeConditionsDto("t0000001", "Standard", 15.0m, 0.5m));

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(deadline, result.RegistrationDeadline);
        Assert.Equal(15.0m, result.DefaultConditions!.CommissionRate);
        Assert.Equal("Hinweis", result.InfoText);
    }

    [Fact]
    public async Task HandleAsync_NoSettingsRow_ReturnsAllNull()
    {
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((DomainSettings?)null);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Null(result.RegistrationDeadline);
        Assert.Null(result.DefaultConditions);
        Assert.Null(result.InfoText);
    }

    [Fact]
    public async Task HandleAsync_SettingsRowWithNullDefaultTypeId_ReturnsNullConditionsWithoutLookup()
    {
        var deadline = DateTime.UtcNow;
        var settings = DomainSettings.Create(
            deadline, deadline, deadline, deadline, deadline, null, "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Null(result.DefaultConditions);
        _masterData.Verify(t => t.GetSellerTypeConditionsAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
