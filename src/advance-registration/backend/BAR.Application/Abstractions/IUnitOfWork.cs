namespace BAR.Application.Abstractions;

/// <summary>
/// Transaktionsklammer um mehrere Repository-Aufrufe. Jede Repository-Methode
/// ruft intern <c>SaveChanges</c> - ohne diese Klammer waeren mehrere Aufrufe
/// eines Handlers mehrere unabhaengige Commits, und ein Fehler im zweiten
/// Schritt liesse den ersten dauerhaft in der Datenbank zurueck.
/// </summary>
/// <remarks>
/// Bewusst in <c>BAR.Application.Abstractions</c> und nicht in
/// <c>BAR.Domain.Ports</c>: das ist keine fachliche Regel, sondern eine
/// Orchestrierungs-Zusage der Infrastruktur - dieselbe Ebene wie
/// <see cref="IPasswordHasher"/>, <see cref="ITokenIssuer"/> und
/// <see cref="IClock"/>.
/// </remarks>
public interface IUnitOfWork
{
    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken);
}
