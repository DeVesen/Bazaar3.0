using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Stammdaten.Contracts.Events;
using BAR.SharedKernel.Events;

namespace BAR.Modules.Anmeldung.Application.EventHandlers;

/// <summary>
/// Reagiert auf ein Geschehenes aus Stammdaten: Anmeldung haelt fuer
/// bestehende Artikel eine eigene Kopie des Markennamens (kein
/// Cross-Schema-Zugriff mehr moeglich) und aktualisiert sie hier.
/// </summary>
public sealed class BrandRenamedHandler(IArticleRepository articles) : IIntegrationEventHandler<BrandRenamed>
{
    public Task HandleAsync(BrandRenamed domainEvent, CancellationToken cancellationToken) =>
        articles.RenameBrandAsync(domainEvent.OldName, domainEvent.NewName, cancellationToken);
}
