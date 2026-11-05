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
            Sizes = new LabelElementSizes(QrCode: 25m, SellerSymbol: 6m, NumberHeight: 9.5m, CurrencyHeight: 11m),
        });

        // Assert
        _repository.Verify(r => r.Add(It.Is<LabelPrintDefaults>(d =>
            d.Logo == PngLogo && d.SellerSymbol == StarIcon && d.CurrencySymbol == "$"
            && d.Sizes == new LabelElementSizes(25m, 6m, 9.5m, 11m))), Times.Once);
        _repository.Verify(r => r.Update(It.IsAny<LabelPrintDefaults>()), Times.Never);
    }

    [Fact]
    public async Task Handle_StoredDefaults_UpdatesThemWithoutGraphics()
    {
        // Arrange
        var stored = LabelPrintDefaults.CreateInitial();
        stored.Update(PngLogo, StarIcon, "$", LabelElementSizes.Default);
        _repository.Setup(r => r.Find()).ReturnsAsync(stored);
        var sut = new UpdateLabelPrintDefaultsHandler(_repository.Object);

        // Act
        await sut.Handle(new UpdateLabelPrintDefaultsCommand
        {
            Logo = null,
            SellerSymbol = null,
            CurrencySymbol = "€",
            Sizes = new LabelElementSizes(QrCode: 30m, SellerSymbol: 4.5m, NumberHeight: 8m, CurrencyHeight: 10.5m),
        });

        // Assert
        Assert.Null(stored.Logo);
        Assert.Null(stored.SellerSymbol);
        Assert.Equal("€", stored.CurrencySymbol);
        Assert.Equal(new LabelElementSizes(30m, 4.5m, 8m, 10.5m), stored.Sizes);
        _repository.Verify(r => r.Update(stored), Times.Once);
    }
}
