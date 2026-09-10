using BAR.Application.Export;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Export;

public class GetExportQueryHandlerTests
{
    private readonly Mock<IExportQuery> _query = new();

    [Fact]
    public async Task HandleAsync_MapsQueryResultToResponseWithExportedAtTimestamp()
    {
        _query.Setup(q => q.ExecuteAsync(true, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ExportResult(
                [new ExportSeller("s1", "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "Standard",
                    [new ExportArticle("a1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null)])],
                ["Nike"], ["Jacken"]));
        var handler = new GetExportQueryHandler(_query.Object);
        var before = DateTime.UtcNow;

        var result = await handler.HandleAsync(new GetExportQuery(true, true), TestContext.Current.CancellationToken);

        Assert.True(result.ExportedAt >= before);
        Assert.Single(result.Sellers);
        Assert.Equal("Standard", result.Sellers[0].SellerType);
        Assert.Equal("Nike", result.Sellers[0].Articles[0].Brand);
        Assert.Equal(["Nike"], result.Brands);
        Assert.Equal(["Jacken"], result.Categories);
    }
}
