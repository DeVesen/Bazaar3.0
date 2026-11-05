using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class SaveLabelSheetFormatHandlerTests
{
    private readonly Mock<ILabelSheetFormatRepository> _repository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();

    private SaveLabelSheetFormatHandler CreateSut() => new(_repository.Object, _idGenerator.Object);

    private static SaveLabelSheetFormatCommand Avery12Command(string name, bool overwrite) => new()
    {
        Name = name,
        SheetWidth = 210m,
        SheetHeight = 297m,
        LabelWidth = 105m,
        LabelHeight = 48m,
        MarginTop = 4.5m,
        MarginRight = 0m,
        MarginBottom = 4.5m,
        MarginLeft = 0m,
        GapHorizontal = 0m,
        GapVertical = 0m,
        Columns = 2,
        Rows = 6,
        Overwrite = overwrite,
    };

    private static LabelSheetFormat StoredAvery16(string name) =>
        LabelSheetFormat.Create("LSF00001", name, new LabelSheetGeometry(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8, 0m, 0m));

    [Fact]
    public async Task Handle_NewPaddedName_AddsFormatWithTrimmedName()
    {
        // Arrange
        _repository.Setup(r => r.FindByName("Avery 12er")).ReturnsAsync((LabelSheetFormat?)null);
        _idGenerator.Setup(g => g.Generate()).Returns("LSF00002");
        var sut = CreateSut();

        // Act
        var saved = await sut.Handle(Avery12Command(" Avery 12er ", overwrite: false));

        // Assert
        Assert.Equal("LSF00002", saved.Id);
        Assert.Equal("Avery 12er", saved.Name);
        Assert.Equal(6, saved.Geometry.Rows);
        _repository.Verify(r => r.Add(It.Is<LabelSheetFormat>(f => f.Name == "Avery 12er")), Times.Once);
    }

    [Fact]
    public async Task Handle_ExistingNameWithoutOverwrite_ThrowsNameTakenAndChangesNothing()
    {
        // Arrange
        var stored = StoredAvery16("Avery 12er");
        _repository.Setup(r => r.FindByName("Avery 12er")).ReturnsAsync(stored);
        var sut = CreateSut();

        // Act
        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(Avery12Command("Avery 12er", overwrite: false)));

        // Assert
        Assert.Equal(LabelSheetFormat.NameTakenErrorCode, exception.ErrorCode);
        Assert.Equal(8, stored.Geometry.Rows);
        _repository.Verify(r => r.Update(It.IsAny<LabelSheetFormat>()), Times.Never);
        _repository.Verify(r => r.Add(It.IsAny<LabelSheetFormat>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ExistingNameWithOverwrite_ReplacesGeometryOfStoredFormat()
    {
        // Arrange
        var stored = StoredAvery16("Avery 12er");
        _repository.Setup(r => r.FindByName("Avery 12er")).ReturnsAsync(stored);
        var sut = CreateSut();

        // Act
        var saved = await sut.Handle(Avery12Command("Avery 12er", overwrite: true));

        // Assert
        Assert.Equal("LSF00001", saved.Id);
        Assert.Equal(6, saved.Geometry.Rows);
        _repository.Verify(r => r.Update(stored), Times.Once);
        _repository.Verify(r => r.Add(It.IsAny<LabelSheetFormat>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CommandWithOffset_SavesOffsetInGeometry()
    {
        // Arrange
        _repository.Setup(r => r.FindByName("Avery 12er")).ReturnsAsync((LabelSheetFormat?)null);
        _idGenerator.Setup(g => g.Generate()).Returns("LSF00002");
        var command = Avery12Command("Avery 12er", overwrite: false);
        command.OffsetX = -2.5m;
        command.OffsetY = 3m;
        var sut = CreateSut();

        // Act
        await sut.Handle(command);

        // Assert
        _repository.Verify(
            r => r.Add(It.Is<LabelSheetFormat>(f => f.Geometry.OffsetX == -2.5m && f.Geometry.OffsetY == 3m)),
            Times.Once);
    }
}
