using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class DeleteLabelImageHandlerTests
{
    private readonly Mock<ILabelImageRepository> _repository = new();

    [Fact]
    public async Task Handle_ExistingImage_RemovesIt()
    {
        // Arrange
        var image = LabelImage.Create("LIM00001", "Logo", "data:image/png;base64,AAAA", DateTimeOffset.UnixEpoch);
        _repository.Setup(r => r.GetById("LIM00001")).ReturnsAsync(image);
        var sut = new DeleteLabelImageHandler(_repository.Object);

        // Act
        await sut.Handle("LIM00001");

        // Assert
        _repository.Verify(r => r.Remove(image), Times.Once);
    }

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFound()
    {
        // Arrange
        _repository.Setup(r => r.GetById("UNKNOWN1")).ReturnsAsync((LabelImage?)null);
        var sut = new DeleteLabelImageHandler(_repository.Object);

        // Act
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("UNKNOWN1"));

        // Assert
        Assert.Equal(LabelImage.NotFoundErrorCode, exception.ErrorCode);
    }
}
