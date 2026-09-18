namespace Bazaar.Domain.Ports;

/// <summary>
/// Placeholder port until the Articles table exists (Round-15). The real
/// implementation of both methods lands in Round-15; this Round only
/// provides the port contract (Domain concern) — Infrastructure's
/// placeholder implementation is a separate task.
/// </summary>
public interface IBrandArticleLink
{
    Task<int> CountByBrandName(string name);

    Task RenameArticlesReferencingBrand(string oldName, string newName);
}
