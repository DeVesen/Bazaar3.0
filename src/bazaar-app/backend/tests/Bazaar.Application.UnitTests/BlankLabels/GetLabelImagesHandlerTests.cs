using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class GetLabelImagesHandlerTests
{
    [Fact]
    public async Task Handle_RepositoryHasSummaries_ReturnsThemUnchanged()
    {
        // Arrange
        var summaries = new List<LabelImageSummary>
        {
            new("LIM00002", "Neu", "image/png", 10, DateTimeOffset.UnixEpoch.AddDays(1)),
            new("LIM00001", "Alt", "image/png", 10, DateTimeOffset.UnixEpoch),
        };
        var repository = new Mock<ILabelImageRepository>();
        repository.Setup(r => r.GetSummaries()).ReturnsAsync(summaries);
        var sut = new GetLabelImagesHandler(repository.Object);

        // Act
        var result = await sut.Handle();

        // Assert
        Assert.Equal(summaries, result);
    }
}
