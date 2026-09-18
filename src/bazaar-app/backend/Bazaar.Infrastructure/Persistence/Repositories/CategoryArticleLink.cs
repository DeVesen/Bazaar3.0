using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class CategoryArticleLink(BazaarDbContext dbContext) : ICategoryArticleLink
{
    public Task<int> CountByCategoryName(string name) =>
        dbContext.Articles.CountAsync(a => a.Category == name);

    public Task RenameArticlesReferencingCategory(string oldName, string newName) =>
        dbContext.Articles
            .Where(a => a.Category == oldName)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.Category, newName));
}
