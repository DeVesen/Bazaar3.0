using BAR.Modules.Operations.Application.Settings.Update;
using BAR.Modules.Operations.Contracts;
using BAR.Modules.MasterData.Contracts;
using Moq;

namespace BAR.Application.UnitTests.Operations.Settings.Update;

public class UpdateSettingsCommandValidatorTests
{
    private readonly Mock<IMasterDataModuleApi> _masterData = new();

    private UpdateSettingsCommandValidator CreateValidator() => new(_masterData.Object);

    private static UpdateSettingsCommand ValidCommand(DateTime now) =>
        new(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

    [Fact]
    public async Task Validate_ValidCommand_NoErrors()
    {
        _masterData.Setup(t => t.SellerTypeExistsAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await CreateValidator().ValidateAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validate_UnknownDefaultTypeId_HasError()
    {
        _masterData.Setup(t => t.SellerTypeExistsAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var command = ValidCommand(DateTime.UtcNow) with { DefaultTypeId = "unknown" };

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSettingsCommand.DefaultTypeId));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task Validate_NonPositiveStartNumber_HasError(int startNumber)
    {
        var command = ValidCommand(DateTime.UtcNow) with { StartNumber = startNumber };

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
    }

    // The InfoText length limit and "dates must be ascending" are no longer
    // FluentValidation rules on this validator - both are enforced by
    // Settings.Create/Update itself (BAR.Modules.Operations.Domain.Settings.Validate,
    // which throws ArgumentException). Coverage for this therefore lives in
    // UpdateSettingsCommandHandlerTests, not here.
}
