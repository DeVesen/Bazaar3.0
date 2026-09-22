using Bazaar.Application.Intake;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Intake;

public class IntakeHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public IntakeHandlerTests()
    {
        // The real EfUnitOfWork opens a transaction and invokes the action —
        // here we just invoke the action directly so handler logic (including
        // any exception it throws) runs exactly as it would inside the
        // transaction, without a real database.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private IntakeHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object, _idGenerator.Object, _unitOfWork.Object);

    private static Seller CreateSeller(decimal feePerItem = 3.00m) =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, feePerItem);

    private static IntakeArticleLine Line(int number, string name = "Winterjacke") => new()
    {
        Number = number,
        Name = name,
        Brand = "Nike",
        Category = "Jacken",
        Price = 12.00m,
        Size = "128",
        Color = "rot",
        Description = null,
    };

    [Fact]
    public async Task Handle_AllNewArticles_CreatesArticlesSetsTimestampsAddsFeeAndReturnsResult()
    {
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _articleRepository.Setup(r => r.GetByNumber(It.IsAny<int>())).ReturnsAsync((Article?)null);
        _idGenerator.SetupSequence(g => g.Generate()).Returns("ARTICLE001").Returns("ARTICLE002");
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 6.00m, // 2 articles * 3.00
            Articles = [Line(1043), Line(1044, "Gummistiefel")],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(["ARTICLE001", "ARTICLE002"], result.ArticleIds);
        Assert.Equal(6.00m, result.IntakeFeePaid);
        Assert.Equal(6.00m, seller.IntakeFeePaid);
        _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Number == 1043 && a.AcceptedAt != null && a.ReleasedAt != null)), Times.Once);
        _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Number == 1044 && a.AcceptedAt != null && a.ReleasedAt != null)), Times.Once);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
    }

    /// <summary>
    /// Regression test for the retry-safety fix: a CreateExecutionStrategy retry
    /// (Program.cs configures EnableRetryOnFailure) re-invokes the whole transaction
    /// closure. Mutating the `seller` instance fetched BEFORE the transaction (used
    /// only for the fail-fast fee check) would double-apply AddIntakeFeePaid across
    /// attempts. The handler must instead re-fetch seller inside the closure and
    /// mutate that fresh instance — proven here by returning two DIFFERENT Seller
    /// instances from the two GetById calls and asserting only the second (fetched
    /// inside the closure) ends up mutated/persisted.
    /// </summary>
    [Fact]
    public async Task Handle_FetchesSellerFreshInsideTransactionClosure_MutatesOnlyTheFreshInstance()
    {
        var outerSeller = CreateSeller(feePerItem: 3.00m);
        var freshSeller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.SetupSequence(r => r.GetById("SELLER001"))
            .ReturnsAsync(outerSeller)
            .ReturnsAsync(freshSeller);
        _articleRepository.Setup(r => r.GetByNumber(It.IsAny<int>())).ReturnsAsync((Article?)null);
        _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE001");
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [Line(1043)],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(0m, outerSeller.IntakeFeePaid);
        Assert.Equal(3.00m, freshSeller.IntakeFeePaid);
        Assert.Equal(3.00m, result.IntakeFeePaid);
        _sellerRepository.Verify(r => r.GetById("SELLER001"), Times.Exactly(2));
        _sellerRepository.Verify(r => r.Update(freshSeller), Times.Once);
        _sellerRepository.Verify(r => r.Update(outerSeller), Times.Never);
    }

    [Fact]
    public async Task Handle_NumberTakenByAnotherSeller_ThrowsConflictWithTakenNumbersAndNextNumber_AndMakesNoWrites()
    {
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var conflicting = Article.Create(
            "OTHER001", 1044, "SELLER999", "Schon da", "Adidas", "Schuhe", 5m,
            null, null, null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetByNumber(1043)).ReturnsAsync((Article?)null);
        _articleRepository.Setup(r => r.GetByNumber(1044)).ReturnsAsync(conflicting);
        _articleRepository.Setup(r => r.GetMaxNumber()).ReturnsAsync(1287);

        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 6.00m,
            Articles = [Line(1043), Line(1044)],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.number_taken", exception.ErrorCode);
        var takenNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["takenNumbers"]);
        Assert.Equal([1044], takenNumbers);
        Assert.Equal(1288, exception.Extensions["nextNumber"]);
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
        Assert.Equal(0m, seller.IntakeFeePaid);
    }

    [Fact]
    public async Task Handle_NumberAlreadyReleasedForSameSeller_IsTreatedAsTakenNotAsUpdate()
    {
        // A released article for the same seller is not "pre-registered" anymore —
        // it is already in active sale, so a second intake line for the same
        // number is a genuine collision, not a re-booking.
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var alreadyReleased = Article.Create(
            "ARTICLE999", 1043, "SELLER001", "Bereits im Verkauf", "Adidas", "Schuhe", 5m,
            null, null, null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);
        alreadyReleased.MarkAcceptedAndReleased(DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetByNumber(1043)).ReturnsAsync(alreadyReleased);
        _articleRepository.Setup(r => r.GetMaxNumber()).ReturnsAsync(1287);

        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [Line(1043)],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.number_taken", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_FeeAmountMismatch_ThrowsBadRequestException_AndMakesNoWrites()
    {
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 5.00m, // expected 2 * 3.00 = 6.00
            Articles = [Line(1043), Line(1044)],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => sut.Handle(command));

        Assert.Equal("intake.fee_mismatch", exception.ErrorCode);
        _articleRepository.Verify(r => r.GetByNumber(It.IsAny<int>()), Times.Never);
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
        _unitOfWork.Verify(
            u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_SellerNotFound_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [Line(1043)],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(command));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_LineMatchingPreRegisteredArticleForSameSellerNotReleased_UpdatesExistingArticleInPlace()
    {
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var preRegistered = Article.Create(
            "ARTICLE001", 1043, "SELLER001", "Alter Name", "AlteMarke", "AlteKategorie", 5m,
            null, null, null, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-3));
        Assert.Null(preRegistered.ReleasedAt); // sanity check: not yet released

        _articleRepository.Setup(r => r.GetByNumber(1043)).ReturnsAsync(preRegistered);

        var line = Line(1043, "Winterjacke Neu");
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [line],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(["ARTICLE001"], result.ArticleIds);
        Assert.Equal("Winterjacke Neu", preRegistered.Name);
        Assert.Equal("Nike", preRegistered.Brand);
        Assert.Equal("Jacken", preRegistered.Category);
        Assert.Equal(12.00m, preRegistered.Price);
        Assert.NotNull(preRegistered.AcceptedAt);
        Assert.NotNull(preRegistered.ReleasedAt);
        _articleRepository.Verify(r => r.Update(preRegistered), Times.Once);
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
        _idGenerator.Verify(g => g.Generate(), Times.Never);
        Assert.Equal(3.00m, seller.IntakeFeePaid);
    }

    [Fact]
    public async Task Handle_LineWithDeleteArticleNumber_RemovesOldArticleAndCreatesNewOneUnderTargetNumber()
    {
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var oldArticle = Article.Create(
            "ARTICLE001", 1, "SELLER001", "Alter Name", "AlteMarke", "AlteKategorie", 5m,
            null, null, null, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-3));
        Assert.Null(oldArticle.ReleasedAt);

        _articleRepository.Setup(r => r.GetByNumber(1)).ReturnsAsync(oldArticle);
        _articleRepository.Setup(r => r.GetByNumber(6)).ReturnsAsync((Article?)null);
        _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

        var line = Line(6, "Winterjacke Neu");
        line.DeleteArticleNumber = 1;
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [line],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(["ARTICLE002"], result.ArticleIds);
        _articleRepository.Verify(r => r.Remove(oldArticle), Times.Once);
        _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Number == 6 && a.Id == "ARTICLE002")), Times.Once);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_LineWithDeleteArticleNumberEqualToTargetNumber_DeletesThenRecreatesRatherThanUpdatingInPlace()
    {
        // Bewusste Design-Entscheidung (Spec: "kein Sonderfall Nummer unverändert") — auch wenn
        // Ziel- und Ursprungsnummer identisch sind, wird gelöscht + neu angelegt, nicht in-place
        // aktualisiert. Neue Artikel-ID beweist das (kein `Update()`-Aufruf auf den Alt-Artikel).
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var oldArticle = Article.Create(
            "ARTICLE001", 1, "SELLER001", "Alter Name", "AlteMarke", "AlteKategorie", 5m,
            null, null, null, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-3));
        _articleRepository.SetupSequence(r => r.GetByNumber(1))
            .ReturnsAsync(oldArticle)
            .ReturnsAsync((Article?)null); // nach dem Remove() ist Nummer 1 wieder frei

        _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

        var line = Line(1, "Winterjacke Neu");
        line.DeleteArticleNumber = 1;
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [line],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(["ARTICLE002"], result.ArticleIds);
        _articleRepository.Verify(r => r.Remove(oldArticle), Times.Once);
        _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Number == 1 && a.Id == "ARTICLE002")), Times.Once);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_DeleteArticleNumber_AlreadyReleasedInTheMeantime_SkipsDeleteSilentlyAndStillBooksTarget()
    {
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var oldArticle = Article.Create(
            "ARTICLE001", 1, "SELLER001", "Alter Name", "AlteMarke", "AlteKategorie", 5m,
            null, null, null, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-3));
        oldArticle.MarkAcceptedAndReleased(DateTimeOffset.UtcNow); // Race: inzwischen freigegeben
        _articleRepository.Setup(r => r.GetByNumber(1)).ReturnsAsync(oldArticle);
        _articleRepository.Setup(r => r.GetByNumber(6)).ReturnsAsync((Article?)null);
        _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

        var line = Line(6);
        line.DeleteArticleNumber = 1;
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [line],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(["ARTICLE002"], result.ArticleIds);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_DeleteArticleNumber_AlreadyGoneInTheMeantime_SkipsDeleteSilently()
    {
        var seller = CreateSeller(feePerItem: 3.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _articleRepository.Setup(r => r.GetByNumber(1)).ReturnsAsync((Article?)null);
        _articleRepository.Setup(r => r.GetByNumber(6)).ReturnsAsync((Article?)null);
        _idGenerator.Setup(g => g.Generate()).Returns("ARTICLE002");

        var line = Line(6);
        line.DeleteArticleNumber = 1;
        var command = new IntakeCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 3.00m,
            Articles = [line],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(["ARTICLE002"], result.ArticleIds);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }
}
