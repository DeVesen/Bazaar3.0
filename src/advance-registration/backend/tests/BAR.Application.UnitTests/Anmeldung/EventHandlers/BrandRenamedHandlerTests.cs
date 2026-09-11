using BAR.Modules.Anmeldung.Application.EventHandlers;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Stammdaten.Contracts.Events;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.EventHandlers;

/// <summary>
/// Cross-Modul-Cascade (Stammdaten -&gt; Anmeldung) mit gemocktem
/// IArticleRepository statt eines vollen Integrationstests ueber
/// StammdatenDbContext + AnmeldungDbContext + IDomainEventDispatcher hinweg -
/// guenstiger und fuer die reine Weiterleitung ausreichend aussagekraeftig.
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
