using Bazaar.Application.Articles;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Articles;

public class GetArticlesForPrintHandlerTests
{
    private readonly Mock<IArticleListQuery> _articleListQuery = new();

    private GetArticlesForPrintHandler CreateSut() => new(_articleListQuery.Object);

    [Fact]
    public async Task Handle_DelegatesFiltersUnchangedAndReturnsPortResult()
    {
        IReadOnlyList<ArticlePrintItem> expected = [new("Hose", "Nike", "Hosen", "104", "Rot", 5m)];
        _articleListQuery
            .Setup(q => q.GetArticlesForPrint("hose", "Nike", "Hosen", "selling"))
            .ReturnsAsync(expected);
        var sut = CreateSut();

        var result = await sut.Handle("hose", "Nike", "Hosen", "selling");

        Assert.Same(expected, result);
        _articleListQuery.Verify(q => q.GetArticlesForPrint("hose", "Nike", "Hosen", "selling"), Times.Once);
    }

    [Fact]
    public async Task Handle_NullFilters_PassedThroughAsNull()
    {
        IReadOnlyList<ArticlePrintItem> expected = [];
        _articleListQuery
            .Setup(q => q.GetArticlesForPrint(null, null, null, null))
            .ReturnsAsync(expected);
        var sut = CreateSut();

        var result = await sut.Handle(null, null, null, null);

        Assert.Same(expected, result);
    }
}
