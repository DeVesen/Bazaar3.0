using Bazaar.Domain.Ports;

namespace Bazaar.Infrastructure.Persistence.Repositories;

// TODO(Round-15): implement real counting/renaming against Articles.Category
// once the Articles table exists.
public sealed class CategoryArticleLink : ICategoryArticleLink
{
    public Task<int> CountByCategoryName(string name) => Task.FromResult(0);

    public Task RenameArticlesReferencingCategory(string oldName, string newName) =>
        Task.CompletedTask;
}
