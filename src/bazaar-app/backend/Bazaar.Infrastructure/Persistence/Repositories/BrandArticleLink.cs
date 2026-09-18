using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class BrandArticleLink(BazaarDbContext dbContext) : IBrandArticleLink
{
    public Task<int> CountByBrandName(string name) =>
        dbContext.Articles.CountAsync(a => a.Brand == name);

    public Task RenameArticlesReferencingBrand(string oldName, string newName) =>
        dbContext.Articles
            .Where(a => a.Brand == oldName)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Brand, newName));
}
