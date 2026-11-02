using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class GetLabelSheetFormatsHandlerTests
{
    [Fact]
    public async Task Handle_UnsortedFormats_ReturnsThemSortedByName()
    {
        // Arrange
        var geometry = new LabelSheetGeometry(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8);
        var repository = new Mock<ILabelSheetFormatRepository>();
        repository.Setup(r => r.GetAll()).ReturnsAsync(new List<LabelSheetFormat>
        {
            LabelSheetFormat.Create("LSF00002", "Zweckform", geometry),
            LabelSheetFormat.Create("LSF00001", "avery 16er", geometry),
        });
        var sut = new GetLabelSheetFormatsHandler(repository.Object);

        // Act
        var formats = await sut.Handle();

        // Assert
        Assert.Equal(new[] { "avery 16er", "Zweckform" }, formats.Select(f => f.Name));
    }
}
