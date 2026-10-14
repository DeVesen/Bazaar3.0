using Bazaar.Application.Settings;
using Bazaar.Domain.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class UpdatePrintTextsCommandValidatorTests
{
    private readonly UpdatePrintTextsCommandValidator _sut = new();

    private static PrintTextsDto Texts(string text3 = "") => new("", "", text3, "", "");

    [Fact]
    public void Validate_AllTextsEmpty_IsValid()
    {
        // Arrange
        var command = new UpdatePrintTextsCommand { AbgabeBeleg = Texts(), VerkaeuferUebersicht = Texts() };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_TextAboveMaxLength_HasValidationErrorOnThatField()
    {
        // Arrange
        var command = new UpdatePrintTextsCommand
        {
            AbgabeBeleg = Texts(new string('x', PrintTexts.MaxLength + 1)),
            VerkaeuferUebersicht = Texts()
        };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == "AbgabeBeleg.Text3");
    }

    [Fact]
    public void Validate_MissingTextSet_HasValidationError()
    {
        // Arrange
        var command = new UpdatePrintTextsCommand { AbgabeBeleg = null!, VerkaeuferUebersicht = Texts() };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdatePrintTextsCommand.AbgabeBeleg));
    }
}
