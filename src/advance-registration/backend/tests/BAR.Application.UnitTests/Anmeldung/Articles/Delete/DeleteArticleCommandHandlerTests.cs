using BAR.Modules.Anmeldung.Application.Articles.Delete;
using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Articles.Delete;

public class DeleteArticleCommandHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private static readonly DateTime Now = new(2026, 8, 15, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task HandleAsync_OwnArticle_Deletes()
    {
        var article = Article.Create("s1", 101, "A", "M", "K", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        var handler = new DeleteArticleCommandHandler(_articles.Object);

        await handler.HandleAsync(new DeleteArticleCommand("a1", "s1"), TestContext.Current.CancellationToken);

        _articles.Verify(a => a.DeleteAsync(article, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ForeignArticle_ThrowsNotFoundAndDoesNotDelete()
    {
        var article = Article.Create("owner", 101, "A", "M", "K", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        var handler = new DeleteArticleCommandHandler(_articles.Object);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync(new DeleteArticleCommand("a1", "attacker"), TestContext.Current.CancellationToken));

        Assert.Equal("article.not_found", ex.ErrorCode);
        _articles.Verify(a => a.DeleteAsync(It.IsAny<Article>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
