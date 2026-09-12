using BAR.Modules.Registration.Application.Articles.Update;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.Update;

public class UpdateArticleCommandHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<IClock> _clock = new();
    private static readonly DateTime Now = new(2026, 8, 15, 10, 0, 0, DateTimeKind.Utc);

    private UpdateArticleCommandHandler CreateHandler() => new(_articles.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_OwnArticle_UpdatesFields()
    {
        var article = Article.Create("s1", 101, "Alt", "M", "K", 5m, null, null, null, Now.AddDays(-1));
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        _clock.Setup(c => c.UtcNow).Returns(Now);
        var command = new UpdateArticleCommand("a1", "s1", "Neu", "N", "K2", 9m, "104", "blau", "desc");

        var result = await CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.Equal(9m, result.Price);
        _articles.Verify(a => a.UpdateAsync(article, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownArticle_ThrowsNotFound()
    {
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync((Article?)null);
        var command = new UpdateArticleCommand("a1", "s1", "Neu", "N", "K", 9m, null, null, null);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken));

        Assert.Equal("article.not_found", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_ForeignArticle_ThrowsNotFound()
    {
        var article = Article.Create("owner", 101, "Alt", "M", "K", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        var command = new UpdateArticleCommand("a1", "attacker", "Neu", "N", "K", 9m, null, null, null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken));
    }
}
