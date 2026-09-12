using BAR.Modules.Registration.Application.EventHandlers;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts.Events;
using Moq;

namespace BAR.Application.UnitTests.Registration.EventHandlers;

/// <summary>See BrandRenamedHandlerTests - the identical pattern for categories.</summary>
public class CategoryRenamedHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();

    [Fact]
    public async Task HandleAsync_ForwardsOldAndNewNameToArticleRepository()
    {
        var handler = new CategoryRenamedHandler(_articles.Object);
        var domainEvent = new CategoryRenamed("Alt", "Neu", DateTime.UtcNow);

        await handler.HandleAsync(domainEvent, TestContext.Current.CancellationToken);

        _articles.Verify(a => a.RenameCategoryAsync("Alt", "Neu", It.IsAny<CancellationToken>()), Times.Once);
    }
}
