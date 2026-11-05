using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class DeleteLabelSheetFormatHandlerTests
{
    private readonly Mock<ILabelSheetFormatRepository> _repository = new();

    [Fact]
    public async Task Handle_ExistingFormat_RemovesIt()
    {
        // Arrange
        var format = LabelSheetFormat.Create("LSF00001", "Avery 12er",
            new LabelSheetGeometry(210m, 297m, 105m, 48m, 4.5m, 0m, 4.5m, 0m, 0m, 0m, 2, 6, 0m, 0m));
        _repository.Setup(r => r.GetById("LSF00001")).ReturnsAsync(format);
        var sut = new DeleteLabelSheetFormatHandler(_repository.Object);

        // Act
        await sut.Handle("LSF00001");

        // Assert
        _repository.Verify(r => r.Remove(format), Times.Once);
    }

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFound()
    {
        // Arrange
        _repository.Setup(r => r.GetById("UNKNOWN1")).ReturnsAsync((LabelSheetFormat?)null);
        var sut = new DeleteLabelSheetFormatHandler(_repository.Object);

        // Act
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("UNKNOWN1"));

        // Assert
        Assert.Equal(LabelSheetFormat.NotFoundErrorCode, exception.ErrorCode);
    }
}
