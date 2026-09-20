using Bazaar.Application.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class UpdateSettingsCommandValidatorTests
{
    private readonly UpdateSettingsCommandValidator _sut = new();

    [Theory]
    [InlineData(499)]
    [InlineData(15001)]
    public void Validate_ScannerPauseMsOutOfRange_HasValidationError(int scannerPauseMs)
    {
        var result = _sut.Validate(new UpdateSettingsCommand { ScannerPauseMs = scannerPauseMs });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSettingsCommand.ScannerPauseMs));
    }

    [Theory]
    [InlineData(500)]
    [InlineData(15000)]
    public void Validate_ScannerPauseMsAtBoundary_IsValid(int scannerPauseMs)
    {
        var result = _sut.Validate(new UpdateSettingsCommand { ScannerPauseMs = scannerPauseMs });

        Assert.True(result.IsValid);
    }
}
