using Bazaar.Application.Articles;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Articles;

public class UpdateArticleTimestampsHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private UpdateArticleTimestampsHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object);

    private static Article CreateArticle() =>
        Article.Create(
            "ARTICLE001", 1, "SELLER001", "T-Shirt", "Adidas", "Kleidung", 10m,
            "M", "blau", null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    private void SetupFound(Article article, Seller seller)
    {
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
    }

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithArticleNotFoundCode()
    {
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync((Article?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(
            new UpdateArticleTimestampsCommand { Id = "ARTICLE001" }));

        Assert.Equal("article.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_SellerSettled_ThrowsConflictWithSettlementLockedCode_AndDoesNotCallUpdate()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        seller.Settle(100m, DateTimeOffset.UtcNow);
        SetupFound(article, seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new UpdateArticleTimestampsCommand { Id = "ARTICLE001", ReleasedAt = DateTimeOffset.UtcNow }));

        Assert.Equal("settlement.locked", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SettingSoldAtOnNotPreviouslySoldArticle_SetsSoldManuallyTrue()
    {
        var article = CreateArticle();
        var released = DateTimeOffset.UtcNow.AddDays(-5);
        article.SetTimestamps(released, null, null, false, DateTimeOffset.UtcNow);
        var seller = CreateSeller();
        SetupFound(article, seller);
        var sut = CreateSut();
        var soldAt = DateTimeOffset.UtcNow;

        await sut.Handle(new UpdateArticleTimestampsCommand { Id = "ARTICLE001", ReleasedAt = released, SoldAt = soldAt });

        Assert.Equal(soldAt, article.SoldAt);
        Assert.True(article.SoldManually);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_LeavingSoldAtUnchanged_BothNull_SoldManuallyStaysFalse()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        SetupFound(article, seller);
        var sut = CreateSut();

        await sut.Handle(new UpdateArticleTimestampsCommand { Id = "ARTICLE001", ReleasedAt = null, SoldAt = null, ReturnedAt = null });

        Assert.Null(article.SoldAt);
        Assert.False(article.SoldManually);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    /// <summary>
    /// Documents a deliberate consequence of the brief's given wasSold/manually
    /// computation: because "manually" is recomputed fresh on every call from
    /// wasSold (true here, since soldAt was already set) and is therefore always
    /// false whenever the article was already sold — regardless of whether
    /// SoldManually was previously true — a full-replace PUT that resends the
    /// SAME non-null soldAt value on an article that was manually sold DOES reset
    /// SoldManually back to false. This matches the brief's own framing that
    /// SoldManually should only be true when soldAt is "newly set THROUGH THIS
    /// ENDPOINT" — leaving it unchanged is, by that definition, never a "new"
    /// manual sale, so recomputing to false here is treated as correct rather
    /// than a bug. Covered explicitly so a future change to the computation is a
    /// conscious decision, not an accidental regression.
    /// </summary>
    [Fact]
    public async Task Handle_LeavingSoldAtUnchanged_BothNonNull_ResetsSoldManuallyToFalse()
    {
        var article = CreateArticle();
        var released = DateTimeOffset.UtcNow.AddDays(-5);
        var soldAt = DateTimeOffset.UtcNow.AddDays(-1);
        article.SetTimestamps(released, soldAt, null, true, DateTimeOffset.UtcNow);
        Assert.True(article.SoldManually); // sanity check on the starting state

        var seller = CreateSeller();
        SetupFound(article, seller);
        var sut = CreateSut();

        await sut.Handle(new UpdateArticleTimestampsCommand { Id = "ARTICLE001", ReleasedAt = released, SoldAt = soldAt, ReturnedAt = null });

        Assert.Equal(soldAt, article.SoldAt);
        Assert.False(article.SoldManually);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    /// <summary>
    /// Correcting an erroneous sale by clearing soldAt back to null. There is no
    /// "manual sale" left to flag once the sale itself is undone, so
    /// SoldManually resetting to false is the intended behavior per spec.md and
    /// matches the brief's own reasoning.
    /// </summary>
    [Fact]
    public async Task Handle_ClearingSoldAtBackToNull_ResetsSoldManuallyToFalse()
    {
        var article = CreateArticle();
        var released = DateTimeOffset.UtcNow.AddDays(-5);
        var soldAt = DateTimeOffset.UtcNow.AddDays(-1);
        article.SetTimestamps(released, soldAt, null, true, DateTimeOffset.UtcNow);
        Assert.True(article.SoldManually); // sanity check on the starting state

        var seller = CreateSeller();
        SetupFound(article, seller);
        var sut = CreateSut();

        await sut.Handle(new UpdateArticleTimestampsCommand { Id = "ARTICLE001", ReleasedAt = released, SoldAt = null, ReturnedAt = null });

        Assert.Null(article.SoldAt);
        Assert.False(article.SoldManually);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_InvalidCascade_PropagatesArticleSoldAndReturnedConflictException()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        SetupFound(article, seller);
        var sut = CreateSut();
        var now = DateTimeOffset.UtcNow;

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new UpdateArticleTimestampsCommand { Id = "ARTICLE001", ReleasedAt = now, SoldAt = now, ReturnedAt = now }));

        Assert.Equal("article.sold_and_returned", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }
}
