using BAR.Modules.Anmeldung.Application.Articles.Create;
using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Betrieb.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Articles.Create;

public class CreateArticleCommandHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IBetriebModuleApi> _betrieb = new();
    private readonly Mock<IClock> _clock = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private CreateArticleCommandHandler CreateHandler() =>
        new(_articles.Object, _blocks.Object, _betrieb.Object, _clock.Object);

    private void SetUpCommonMocks(string sellerId, IReadOnlyList<NumberBlock> sellerBlocks, IReadOnlyList<int> usedNumbers, IReadOnlyList<NumberBlock> allBlocks)
    {
        _betrieb.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NumberingConfigDto(StartNumber: 1, BlockSize: 10, DefaultBlockCount: 1));
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(sellerBlocks);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync(allBlocks);
        _articles.Setup(a => a.GetUsedNumbersForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(usedNumbers);
        _clock.Setup(c => c.UtcNow).Returns(Now);
    }

    private static CreateArticleCommand ValidCommand(string sellerId, int? expectedNumber = null) =>
        new(sellerId, "Winterjacke", "Jako-O", "Jacken", 12.50m, "116", "rot", "kaum getragen", expectedNumber);

    [Fact]
    public async Task HandleAsync_FreeNumberInOwnBlock_CreatesArticleWithoutNewBlock()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101, 102], allBlocks: [block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken);

        Assert.Equal(103, result.Number);
        _articles.Verify(a => a.CreateAsync(
            It.Is<BAR.Modules.Anmeldung.Domain.Articles.Article>(x => x.Number == 103),
            It.Is<NumberBlock?>(b => b == null),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_OwnBlockFull_CreatesArticleWithNewBlock()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        // Filler block occupying 1-100 for another seller, so no free gap remains below 111
        // and the allocator's smallest-free-gap search correctly lands on 111.
        var filler = NumberBlock.Assign("filler", 1, 100, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: Enumerable.Range(101, 10).ToList(), allBlocks: [filler, block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken);

        Assert.Equal(111, result.Number);
        _articles.Verify(a => a.CreateAsync(
            It.IsAny<BAR.Modules.Anmeldung.Domain.Articles.Article>(),
            It.Is<NumberBlock?>(b => b != null && b.FromNumber == 111),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ExpectedNumberDoesNotMatch_ThrowsArticleNumberConflictAndDoesNotCreate()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101], allBlocks: [block]);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ArticleNumberConflictException>(() =>
            handler.HandleAsync(ValidCommand(sellerId, expectedNumber: 999), TestContext.Current.CancellationToken));

        Assert.Equal(102, ex.NextNumber);
        Assert.Equal("article.number_taken", ex.ErrorCode);
        _articles.Verify(a => a.CreateAsync(It.IsAny<BAR.Modules.Anmeldung.Domain.Articles.Article>(), It.IsAny<NumberBlock?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_ExpectedNumberMatches_Creates()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101], allBlocks: [block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId, expectedNumber: 102), TestContext.Current.CancellationToken);

        Assert.Equal(102, result.Number);
    }

    [Fact]
    public async Task HandleAsync_NoFreeNumberAnywhere_ThrowsConflictNoFreeNumber()
    {
        var sellerId = "s1234567";
        var wallToWall = NumberBlock.Assign("other", 1, int.MaxValue - 1, Now);
        SetUpCommonMocks(sellerId, sellerBlocks: [], usedNumbers: [], allBlocks: [wallToWall]);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken));

        Assert.Equal("article.no_free_number", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_Success_NextNumberReflectsFollowingAllocation()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        SetUpCommonMocks(sellerId, [block], usedNumbers: [101, 102], allBlocks: [block]);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(sellerId), TestContext.Current.CancellationToken);

        Assert.Equal(103, result.Number);
        Assert.Equal(104, result.NextNumber);
    }
}
