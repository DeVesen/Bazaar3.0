using BAR.Modules.Registration.Application.EventHandlers;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts.Events;
using Moq;

namespace BAR.Application.UnitTests.Registration.EventHandlers;

/// <summary>
/// A cross-module cascade (MasterData -&gt; Registration) with a mocked
/// IArticleRepository instead of a full integration test spanning
/// MasterDataDbContext + RegistrationDbContext + IDomainEventDispatcher -
/// cheaper and meaningful enough for pure forwarding.
/// </summary>
public class BrandRenamedHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();

    [Fact]
    public async Task HandleAsync_ForwardsOldAndNewNameToArticleRepository()
    {
        var handler = new BrandRenamedHandler(_articles.Object);
        var domainEvent = new BrandRenamed("Alt", "Neu", DateTime.UtcNow);

        await handler.HandleAsync(domainEvent, TestContext.Current.CancellationToken);

        _articles.Verify(a => a.RenameBrandAsync("Alt", "Neu", It.IsAny<CancellationToken>()), Times.Once);
    }
}
