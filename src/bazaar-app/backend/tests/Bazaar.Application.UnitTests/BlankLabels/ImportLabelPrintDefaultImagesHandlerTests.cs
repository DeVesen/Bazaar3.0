using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class ImportLabelPrintDefaultImagesHandlerTests
{
    private const string PngA = "data:image/png;base64,AAAA";
    private const string PngB = "data:image/png;base64,AQID";
    private static readonly DateTimeOffset Now = new(2026, 11, 5, 10, 0, 0, TimeSpan.Zero);

    private readonly Mock<ILabelPrintDefaultsRepository> _defaultsRepository = new();
    private readonly Mock<ILabelImageRepository> _imageRepository = new();
    private readonly List<LabelImage> _library = [];
    private int _nextId;

    public ImportLabelPrintDefaultImagesHandlerTests()
    {
        _imageRepository.Setup(r => r.FindByHash(It.IsAny<string>()))
            .ReturnsAsync((string hash) => _library.SingleOrDefault(i => i.ContentHash == hash));
        _imageRepository.Setup(r => r.Add(It.IsAny<LabelImage>()))
            .Callback((LabelImage image) => _library.Add(image))
            .ReturnsAsync((LabelImage image) => image);
    }

    private ImportLabelPrintDefaultImagesHandler CreateSut()
    {
        var idGenerator = new Mock<IIdGenerator>();
        idGenerator.Setup(g => g.Generate()).Returns(() => $"LIM{++_nextId:00000}");
        return new ImportLabelPrintDefaultImagesHandler(
            _defaultsRepository.Object, _imageRepository.Object, idGenerator.Object, new FixedTimeProvider(Now));
    }

    private void GivenDefaults(LabelGraphic? logo, LabelGraphic? sellerSymbol)
    {
        var defaults = LabelPrintDefaults.CreateInitial();
        defaults.Update(logo, sellerSymbol, "€", LabelElementSizes.Default);
        _defaultsRepository.Setup(r => r.Find()).ReturnsAsync(defaults);
    }

    [Fact]
    public async Task Handle_LogoIsImage_AddsEntryNamedLogo()
    {
        // Arrange
        GivenDefaults(new LabelGraphic(LabelGraphicKind.Image, PngA), null);

        // Act
        await CreateSut().Handle();

        // Assert
        var image = Assert.Single(_library);
        Assert.Equal("Logo", image.Name);
        Assert.Equal(Now, image.CreatedAt);
    }

    [Fact]
    public async Task Handle_SellerSymbolIsImage_AddsEntryNamedSellerSymbol()
    {
        // Arrange
        GivenDefaults(null, new LabelGraphic(LabelGraphicKind.Image, PngB));

        // Act
        await CreateSut().Handle();

        // Assert
        Assert.Equal("Verkäufer-Symbol", Assert.Single(_library).Name);
    }

    [Fact]
    public async Task Handle_OnlyIcons_AddsNothing()
    {
        // Arrange
        GivenDefaults(new LabelGraphic(LabelGraphicKind.Icon, "star"), new LabelGraphic(LabelGraphicKind.Icon, "flower"));

        // Act
        await CreateSut().Handle();

        // Assert
        Assert.Empty(_library);
    }

    [Fact]
    public async Task Handle_NoDefaultsRow_AddsNothing()
    {
        // Arrange
        _defaultsRepository.Setup(r => r.Find()).ReturnsAsync((LabelPrintDefaults?)null);

        // Act
        await CreateSut().Handle();

        // Assert
        Assert.Empty(_library);
    }

    [Fact]
    public async Task Handle_RunTwice_SecondRunChangesNothing()
    {
        // Arrange
        GivenDefaults(new LabelGraphic(LabelGraphicKind.Image, PngA), new LabelGraphic(LabelGraphicKind.Image, PngB));
        var sut = CreateSut();
        await sut.Handle();

        // Act
        await sut.Handle();

        // Assert
        Assert.Equal(2, _library.Count);
        _imageRepository.Verify(r => r.Add(It.IsAny<LabelImage>()), Times.Exactly(2));
    }

    [Fact]
    public async Task Handle_LogoAndSymbolAreSameImage_AddsOneEntry()
    {
        // Arrange
        GivenDefaults(new LabelGraphic(LabelGraphicKind.Image, PngA), new LabelGraphic(LabelGraphicKind.Image, PngA));

        // Act
        await CreateSut().Handle();

        // Assert
        Assert.Equal("Logo", Assert.Single(_library).Name);
    }

    [Fact]
    public async Task Handle_ImageAlreadyInLibrary_AddsNothing()
    {
        // Arrange
        _library.Add(LabelImage.Create("LIM99999", "Eigener Name", PngA, Now));
        GivenDefaults(new LabelGraphic(LabelGraphicKind.Image, PngA), null);

        // Act
        await CreateSut().Handle();

        // Assert
        Assert.Equal("Eigener Name", Assert.Single(_library).Name);
    }
}
