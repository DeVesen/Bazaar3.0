using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class GetLabelPrintDefaultsHandlerTests
{
    private readonly Mock<ILabelPrintDefaultsRepository> _repository = new();

    [Fact]
    public async Task Handle_NothingStored_ReturnsEuroWithoutGraphics()
    {
        // Arrange
        _repository.Setup(r => r.Find()).ReturnsAsync((LabelPrintDefaults?)null);
        var sut = new GetLabelPrintDefaultsHandler(_repository.Object);

        // Act
        var defaults = await sut.Handle();

        // Assert
        Assert.Equal("€", defaults.CurrencySymbol);
        Assert.Null(defaults.Logo);
        Assert.Null(defaults.SellerSymbol);
        Assert.Equal(LabelElementSizes.Default, defaults.Sizes);
    }

    [Fact]
    public async Task Handle_StoredDefaults_ReturnsThem()
    {
        // Arrange
        var stored = LabelPrintDefaults.CreateInitial();
        stored.Update(new LabelGraphic(LabelGraphicKind.Icon, "star"), null, "$", LabelElementSizes.Default);
        _repository.Setup(r => r.Find()).ReturnsAsync(stored);
        var sut = new GetLabelPrintDefaultsHandler(_repository.Object);

        // Act
        var defaults = await sut.Handle();

        // Assert
        Assert.Same(stored, defaults);
    }
}
