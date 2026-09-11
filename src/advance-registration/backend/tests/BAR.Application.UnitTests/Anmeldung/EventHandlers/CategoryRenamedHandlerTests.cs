using BAR.Modules.Anmeldung.Application.EventHandlers;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Stammdaten.Contracts.Events;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.EventHandlers;

/// <summary>Siehe BrandRenamedHandlerTests - identisches Muster fuer Kategorien.</summary>
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
