using Bazaar.Application.Settings;
using Bazaar.Domain.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class UpdatePrintTextsCommandValidatorTests
{
    private readonly UpdatePrintTextsCommandValidator _sut = new();

    private static PrintTextsDto Texts(string text3 = "") => new("", "", text3, "", "");

    private static AushangTextsDto Aushang(string text1 = "", string text2 = "", string text3 = "", string text4 = "") =>
        new(text1, text2, text3, text4);

    [Fact]
    public void Validate_AllTextsEmpty_IsValid()
    {
        // Arrange
        var command = new UpdatePrintTextsCommand { AbgabeBeleg = Texts(), VerkaeuferUebersicht = Texts(), ArticleAushang = Aushang() };

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
            VerkaeuferUebersicht = Texts(),
            ArticleAushang = Aushang()
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
        var command = new UpdatePrintTextsCommand { AbgabeBeleg = null!, VerkaeuferUebersicht = Texts(), ArticleAushang = Aushang() };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdatePrintTextsCommand.AbgabeBeleg));
    }

    [Fact]
    public void Validate_MissingAushangSet_HasValidationError()
    {
        // Arrange
        var command = new UpdatePrintTextsCommand { AbgabeBeleg = Texts(), VerkaeuferUebersicht = Texts(), ArticleAushang = null! };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdatePrintTextsCommand.ArticleAushang));
    }

    [Theory]
    [InlineData("Text1")]
    [InlineData("Text2")]
    [InlineData("Text3")]
    [InlineData("Text4")]
    public void Validate_AushangTextAboveMaxLength_HasValidationErrorOnThatField(string field)
    {
        // Arrange
        var tooLong = new string('x', AushangTexts.MaxLength + 1);
        var aushang = field switch
        {
            "Text1" => Aushang(text1: tooLong),
            "Text2" => Aushang(text2: tooLong),
            "Text3" => Aushang(text3: tooLong),
            _ => Aushang(text4: tooLong)
        };
        var command = new UpdatePrintTextsCommand { AbgabeBeleg = Texts(), VerkaeuferUebersicht = Texts(), ArticleAushang = aushang };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == $"ArticleAushang.{field}");
    }

    [Fact]
    public void Validate_AushangTextNull_HasValidationError()
    {
        // Arrange
        var command = new UpdatePrintTextsCommand { AbgabeBeleg = Texts(), VerkaeuferUebersicht = Texts(), ArticleAushang = new AushangTextsDto("", null!, "", "") };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == "ArticleAushang.Text2");
    }
}
