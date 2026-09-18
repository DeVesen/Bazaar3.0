using Bazaar.Domain.Ports;

namespace Bazaar.Infrastructure.Persistence.Repositories;

// TODO(Round-15): implement real counting/renaming against Articles.Brand
// once the Articles table exists.
public sealed class BrandArticleLink : IBrandArticleLink
{
    public Task<int> CountByBrandName(string name) => Task.FromResult(0);

    public Task RenameArticlesReferencingBrand(string oldName, string newName) =>
        Task.CompletedTask;
}
