using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class UploadLabelImageHandlerTests
{
    private const string DataUrl = "data:image/png;base64,AAAA";
    private static readonly DateTimeOffset Now = new(2026, 11, 5, 10, 0, 0, TimeSpan.Zero);

    private readonly Mock<ILabelImageRepository> _repository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();
    private readonly UploadLabelImageHandler _sut;

    public UploadLabelImageHandlerTests()
    {
        _idGenerator.Setup(g => g.Generate()).Returns("LIM00001");
        _repository.Setup(r => r.Add(It.IsAny<LabelImage>())).ReturnsAsync((LabelImage image) => image);
        _sut = new UploadLabelImageHandler(_repository.Object, _idGenerator.Object, new FixedTimeProvider(Now));
    }

    [Fact]
    public async Task Handle_NewImage_AddsAndReportsCreated()
    {
        // Arrange
        var command = new UploadLabelImageCommand { Name = " Logo ", DataUrl = DataUrl };

        // Act
        var result = await _sut.Handle(command);

        // Assert
        Assert.True(result.Created);
        Assert.Equal("Logo", result.Image.Name);
        Assert.Equal("LIM00001", result.Image.Id);
        Assert.Equal(Now, result.Image.CreatedAt);
        _repository.Verify(r => r.Add(result.Image), Times.Once);
    }

    [Fact]
    public async Task Handle_SameHashAlreadyInLibrary_ReturnsExistingWithoutAdd()
    {
        // Arrange
        var existing = LabelImage.Create("LIM00009", "Alt", DataUrl, Now.AddDays(-1));
        _repository.Setup(r => r.FindByHash(existing.ContentHash)).ReturnsAsync(existing);

        // Act
        var result = await _sut.Handle(new UploadLabelImageCommand { Name = "Neu", DataUrl = DataUrl });

        // Assert
        Assert.False(result.Created);
        Assert.Same(existing, result.Image);
        _repository.Verify(r => r.Add(It.IsAny<LabelImage>()), Times.Never);
    }

    [Fact]
    public async Task Handle_LibraryFull_ThrowsConflictLibraryFull()
    {
        // Arrange
        _repository.Setup(r => r.Count()).ReturnsAsync(LabelImage.MaxCount);

        // Act
        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => _sut.Handle(new UploadLabelImageCommand { Name = "Logo", DataUrl = DataUrl }));

        // Assert
        Assert.Equal(LabelImage.LibraryFullErrorCode, exception.ErrorCode);
        _repository.Verify(r => r.Add(It.IsAny<LabelImage>()), Times.Never);
    }

    [Fact]
    public async Task Handle_LibraryFullButImageIsDuplicate_ReturnsExisting()
    {
        // Arrange
        var existing = LabelImage.Create("LIM00009", "Alt", DataUrl, Now);
        _repository.Setup(r => r.FindByHash(existing.ContentHash)).ReturnsAsync(existing);
        _repository.Setup(r => r.Count()).ReturnsAsync(LabelImage.MaxCount);

        // Act
        var result = await _sut.Handle(new UploadLabelImageCommand { Name = "Neu", DataUrl = DataUrl });

        // Assert
        Assert.Same(existing, result.Image);
    }

    [Fact]
    public async Task Handle_ParallelUploadWonByOther_ReportsNotCreated()
    {
        // Arrange
        var winner = LabelImage.Create("LIM00009", "Anderer", DataUrl, Now);
        _repository.Setup(r => r.Add(It.IsAny<LabelImage>())).ReturnsAsync(winner);

        // Act
        var result = await _sut.Handle(new UploadLabelImageCommand { Name = "Logo", DataUrl = DataUrl });

        // Assert
        Assert.False(result.Created);
        Assert.Same(winner, result.Image);
    }
}
