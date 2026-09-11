using BAR.Modules.Betrieb.Application.Settings.Update;
using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Stammdaten.Contracts;
using Moq;

namespace BAR.Application.UnitTests.Betrieb.Settings.Update;

public class UpdateSettingsCommandValidatorTests
{
    private readonly Mock<IStammdatenModuleApi> _stammdaten = new();

    private UpdateSettingsCommandValidator CreateValidator() => new(_stammdaten.Object);

    private static UpdateSettingsCommand ValidCommand(DateTime now) =>
        new(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

    [Fact]
    public async Task Validate_ValidCommand_NoErrors()
    {
        _stammdaten.Setup(t => t.SellerTypeExistsAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var result = await CreateValidator().ValidateAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validate_UnknownDefaultTypeId_HasError()
    {
        _stammdaten.Setup(t => t.SellerTypeExistsAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync(false);
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

    // InfoText-Laengenlimit und "Termine muessen aufsteigend sein" sind keine
    // FluentValidation-Regeln (mehr) auf diesem Validator - beide werden von
    // Settings.Create/Update selbst durchgesetzt (BAR.Modules.Betrieb.Domain.Settings.Validate,
    // wirft ArgumentException). Coverage dafuer liegt darum in
    // UpdateSettingsCommandHandlerTests, nicht hier.
}
