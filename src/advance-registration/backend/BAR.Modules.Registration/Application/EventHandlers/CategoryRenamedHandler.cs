using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts.Events;
using BAR.SharedKernel.Events;

namespace BAR.Modules.Registration.Application.EventHandlers;

/// <summary>See <see cref="BrandRenamedHandler"/> - the identical pattern for categories.</summary>
public sealed class CategoryRenamedHandler(IArticleRepository articles) : IIntegrationEventHandler<CategoryRenamed>
{
    public Task HandleAsync(CategoryRenamed domainEvent, CancellationToken cancellationToken) =>
        articles.RenameCategoryAsync(domainEvent.OldName, domainEvent.NewName, cancellationToken);
}
