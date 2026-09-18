using Bazaar.Application.Articles;
using Bazaar.Domain.Ports;
using Moq;

namespace Bazaar.Application.UnitTests.Articles;

public class GetArticlesHandlerTests
{
    private readonly Mock<IArticleListQuery> _articleListQuery = new();

    private GetArticlesHandler CreateSut() => new(_articleListQuery.Object);

    [Fact]
    public async Task Handle_DelegatesAllParametersUnchangedAndReturnsPortResult()
    {
        var expected = new ArticleListPage([], 0, 2, 50);
        _articleListQuery
            .Setup(q => q.GetArticles("shirt", "Adidas", "Kleidung", "sold", "price_asc", 2, 50))
            .ReturnsAsync(expected);
        var sut = CreateSut();

        var result = await sut.Handle("shirt", "Adidas", "Kleidung", "sold", "price_asc", 2, 50);

        Assert.Same(expected, result);
        _articleListQuery.Verify(q => q.GetArticles("shirt", "Adidas", "Kleidung", "sold", "price_asc", 2, 50), Times.Once);
    }

    [Fact]
    public async Task Handle_NullOptionalParameters_PassedThroughAsNull()
    {
        var expected = new ArticleListPage([], 0, 1, 50);
        _articleListQuery
            .Setup(q => q.GetArticles(null, null, null, null, null, 1, 50))
            .ReturnsAsync(expected);
        var sut = CreateSut();

        var result = await sut.Handle(null, null, null, null, null, 1, 50);

        Assert.Same(expected, result);
    }
}
