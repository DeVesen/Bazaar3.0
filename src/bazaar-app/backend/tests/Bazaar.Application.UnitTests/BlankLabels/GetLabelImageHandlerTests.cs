using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class GetLabelImageHandlerTests
{
    private readonly Mock<ILabelImageRepository> _repository = new();

    [Fact]
    public async Task Handle_ExistingImage_ReturnsIt()
    {
        // Arrange
        var image = LabelImage.Create("LIM00001", "Logo", "data:image/png;base64,AAAA", DateTimeOffset.UnixEpoch);
        _repository.Setup(r => r.GetById("LIM00001")).ReturnsAsync(image);
        var sut = new GetLabelImageHandler(_repository.Object);

        // Act
        var found = await sut.Handle("LIM00001");

        // Assert
        Assert.Same(image, found);
    }

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFound()
    {
        // Arrange
        _repository.Setup(r => r.GetById("UNKNOWN1")).ReturnsAsync((LabelImage?)null);
        var sut = new GetLabelImageHandler(_repository.Object);

        // Act
        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("UNKNOWN1"));

        // Assert
        Assert.Equal(LabelImage.NotFoundErrorCode, exception.ErrorCode);
    }
}
