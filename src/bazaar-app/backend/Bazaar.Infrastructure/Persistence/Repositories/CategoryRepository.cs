using Bazaar.Domain.Categories;
using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class CategoryRepository(BazaarDbContext dbContext) : ICategoryRepository
{
    public async Task Add(Category category)
    {
        await dbContext.Categories.AddAsync(category);
        await dbContext.SaveChangesAsync();
    }

    public Task<Category?> GetById(string id) =>
        dbContext.Categories.SingleOrDefaultAsync(c => c.Id == id);

    public async Task<IReadOnlyList<Category>> GetAll() =>
        await dbContext.Categories.ToListAsync();

    public Task<bool> ExistsByNameIgnoreCase(string name) =>
        dbContext.Categories.AnyAsync(c => c.Name == name);

    public async Task Update(Category category)
    {
        dbContext.Categories.Update(category);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(Category category)
    {
        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync();
    }
}
