using BAR.Modules.Registration.Application.Articles.GetNextNumber;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Operations.Contracts;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.GetNextNumber;

public class GetNextNumberQueryHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IOperationsModuleApi> _operations = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private GetNextNumberQueryHandler CreateHandler() => new(_articles.Object, _blocks.Object, _operations.Object);

    [Fact]
    public async Task HandleAsync_FreeNumberExists_ReturnsItWithoutPersisting()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 10, Now);
        _operations.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NumberingConfigDto(StartNumber: 1, BlockSize: 10, DefaultBlockCount: 1));
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        _articles.Setup(a => a.GetUsedNumbersForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([101, 102]);

        var result = await CreateHandler().HandleAsync(sellerId, TestContext.Current.CancellationToken);

        Assert.Equal(103, result.Number);
        _blocks.Verify(b => b.AddAsync(It.IsAny<NumberBlock>(), It.IsAny<CancellationToken>()), Times.Never);
        _articles.Verify(a => a.CreateAsync(It.IsAny<BAR.Modules.Registration.Domain.Articles.Article>(), It.IsAny<NumberBlock?>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_NoFreeRange_ThrowsConflictNoFreeNumber()
    {
        var sellerId = "s1234567";
        var wallToWall = NumberBlock.Assign("other", 1, int.MaxValue - 1, Now);
        _operations.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NumberingConfigDto(StartNumber: 1, BlockSize: 10, DefaultBlockCount: 1));
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([wallToWall]);
        _articles.Setup(a => a.GetUsedNumbersForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([]);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CreateHandler().HandleAsync(sellerId, TestContext.Current.CancellationToken));

        Assert.Equal("article.no_free_number", ex.ErrorCode);
    }
}
