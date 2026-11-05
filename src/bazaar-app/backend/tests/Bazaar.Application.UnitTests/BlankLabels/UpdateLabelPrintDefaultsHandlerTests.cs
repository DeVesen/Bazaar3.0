using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class UpdateLabelPrintDefaultsHandlerTests
{
    private static readonly LabelGraphic StarIcon = new(LabelGraphicKind.Icon, "star");
    private static readonly LabelGraphic PngLogo = new(LabelGraphicKind.Image, "data:image/png;base64,AAAA");

    private readonly Mock<ILabelPrintDefaultsRepository> _repository = new();

    [Fact]
    public async Task Handle_NothingStoredYet_AddsDefaults()
    {
        // Arrange
        _repository.Setup(r => r.Find()).ReturnsAsync((LabelPrintDefaults?)null);
        var sut = new UpdateLabelPrintDefaultsHandler(_repository.Object);

        // Act
        await sut.Handle(new UpdateLabelPrintDefaultsCommand
        {
            Logo = PngLogo,
            SellerSymbol = StarIcon,
            CurrencySymbol = "$",
            QrCodeSize = 25m,
            SellerSymbolSize = 6m,
            NumberHeight = 9.5m,
            CurrencyHeight = 11m,
        });

        // Assert
        _repository.Verify(r => r.Add(It.Is<LabelPrintDefaults>(d =>
            d.Logo == PngLogo && d.SellerSymbol == StarIcon && d.CurrencySymbol == "$"
            && d.QrCodeSize == 25m && d.SellerSymbolSize == 6m && d.NumberHeight == 9.5m && d.CurrencyHeight == 11m)), Times.Once);
        _repository.Verify(r => r.Update(It.IsAny<LabelPrintDefaults>()), Times.Never);
    }

    [Fact]
    public async Task Handle_StoredDefaults_UpdatesThemWithoutGraphics()
    {
        // Arrange
        var stored = LabelPrintDefaults.CreateInitial();
        stored.Update(PngLogo, StarIcon, "$", 21.5m, 5m, 10.5m, 12m);
        _repository.Setup(r => r.Find()).ReturnsAsync(stored);
        var sut = new UpdateLabelPrintDefaultsHandler(_repository.Object);

        // Act
        await sut.Handle(new UpdateLabelPrintDefaultsCommand
        {
            Logo = null,
            SellerSymbol = null,
            CurrencySymbol = "€",
            QrCodeSize = 30m,
            SellerSymbolSize = 4.5m,
            NumberHeight = 8m,
            CurrencyHeight = 10.5m,
        });

        // Assert
        Assert.Null(stored.Logo);
        Assert.Null(stored.SellerSymbol);
        Assert.Equal("€", stored.CurrencySymbol);
        Assert.Equal(30m, stored.QrCodeSize);
        Assert.Equal(4.5m, stored.SellerSymbolSize);
        Assert.Equal(8m, stored.NumberHeight);
        Assert.Equal(10.5m, stored.CurrencyHeight);
        _repository.Verify(r => r.Update(stored), Times.Once);
    }
}
