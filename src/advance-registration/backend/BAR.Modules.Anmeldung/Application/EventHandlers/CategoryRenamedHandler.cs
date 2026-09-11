using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Stammdaten.Contracts.Events;
using BAR.SharedKernel.Events;

namespace BAR.Modules.Anmeldung.Application.EventHandlers;

/// <summary>Siehe <see cref="BrandRenamedHandler"/> - identisches Muster fuer Kategorien.</summary>
public sealed class CategoryRenamedHandler(IArticleRepository articles) : IIntegrationEventHandler<CategoryRenamed>
{
    public Task HandleAsync(CategoryRenamed domainEvent, CancellationToken cancellationToken) =>
        articles.RenameCategoryAsync(domainEvent.OldName, domainEvent.NewName, cancellationToken);
}
