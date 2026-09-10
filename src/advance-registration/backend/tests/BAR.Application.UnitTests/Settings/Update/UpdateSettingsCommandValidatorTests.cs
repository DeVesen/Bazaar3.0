using BAR.Application.Settings.Update;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Settings.Update;

public class UpdateSettingsCommandValidatorTests
{
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private UpdateSettingsCommandValidator CreateValidator() => new(_sellerTypes.Object);

    private static UpdateSettingsCommand ValidCommand(DateTime now) =>
        new(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

    [Fact]
    public async Task Validate_ValidCommand_NoErrors()
    {
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(SellerType.Create("Standard", 15m, 0.5m));

        var result = await CreateValidator().ValidateAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validate_UnknownDefaultTypeId_HasError()
    {
        _sellerTypes.Setup(t => t.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((SellerType?)null);
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

    [Fact]
    public async Task Validate_InfoTextOverLimit_HasError()
    {
        var command = ValidCommand(DateTime.UtcNow) with { InfoText = new string('a', 4001) };

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task Validate_DescendingDates_MarksBothAffectedFields()
    {
        var now = DateTime.UtcNow;
        var command = ValidCommand(now) with { DropOffFrom = now.AddDays(-1) };
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(SellerType.Create("Standard", 15m, 0.5m));

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSettingsCommand.RegistrationDeadline));
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSettingsCommand.DropOffFrom));
    }

    [Fact]
    public async Task Validate_PartialDatesWithNullsSkipped_NoDateError()
    {
        var now = DateTime.UtcNow;
        var command = ValidCommand(now) with { DropOffFrom = null, DropOffUntil = null };
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(SellerType.Create("Standard", 15m, 0.5m));

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.True(result.IsValid);
    }
}
