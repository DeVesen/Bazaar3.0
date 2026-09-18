namespace Bazaar.Domain.Ports;

/// <summary>
/// Placeholder port until the Articles table exists (Round-15). The real
/// implementation of both methods lands in Round-15; this Round only
/// provides the port contract (Domain concern) — Infrastructure's
/// placeholder implementation is a separate task.
/// </summary>
public interface ICategoryArticleLink
{
    Task<int> CountByCategoryName(string name);

    Task RenameArticlesReferencingCategory(string oldName, string newName);
}
