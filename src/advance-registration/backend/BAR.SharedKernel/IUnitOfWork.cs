namespace BAR.SharedKernel;

/// <summary>
/// Transaktionsklammer um mehrere Repository-Aufrufe innerhalb eines Moduls.
/// Jede Repository-Methode ruft intern <c>SaveChanges</c> - ohne diese Klammer
/// waeren mehrere Aufrufe eines Handlers mehrere unabhaengige Commits, und ein
/// Fehler im zweiten Schritt liesse den ersten dauerhaft in der Datenbank
/// zurueck.
/// </summary>
/// <remarks>
/// Das Interface ist modulunabhaengig und liegt darum im SharedKernel; jedes
/// Modul bringt seine eigene Implementierung mit (an seinen eigenen
/// DbContext gebunden, siehe dotnet-modulith-bridge - eigenes Schema je Modul).
/// Eine Transaktion spannt sich nie ueber zwei Module: schreibt ein Vorgang in
/// zwei Modulen, ist das ein Aufruf + Kompensation, keine gemeinsame DB-Transaktion.
/// </remarks>
public interface IUnitOfWork
{
    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken);
}
