using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts.Events;
using BAR.SharedKernel.Events;

namespace BAR.Modules.Registration.Application.EventHandlers;

/// <summary>
/// Reacts to something that happened in MasterData: Registration keeps its
/// own copy of the brand name on existing articles (cross-schema access is no
/// longer possible) and updates it here.
/// </summary>
public sealed class BrandRenamedHandler(IArticleRepository articles) : IIntegrationEventHandler<BrandRenamed>
{
    public Task HandleAsync(BrandRenamed domainEvent, CancellationToken cancellationToken) =>
        articles.RenameBrandAsync(domainEvent.OldName, domainEvent.NewName, cancellationToken);
}
