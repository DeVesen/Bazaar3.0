using Bazaar.Domain.Articles;
using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class ArticleRepository(BazaarDbContext dbContext) : IArticleRepository
{
    public async Task Add(Article article)
    {
        await dbContext.Articles.AddAsync(article);
        await dbContext.SaveChangesAsync();
    }

    public Task<Article?> GetById(string id) =>
        dbContext.Articles.SingleOrDefaultAsync(a => a.Id == id);

    public Task<Article?> GetByNumber(int number) =>
        dbContext.Articles.SingleOrDefaultAsync(a => a.Number == number);

    public async Task Update(Article article)
    {
        dbContext.Articles.Update(article);
        await dbContext.SaveChangesAsync();
    }

    public async Task Remove(Article article)
    {
        dbContext.Articles.Remove(article);
        await dbContext.SaveChangesAsync();
    }

    public async Task<IReadOnlyList<Article>> GetAllBySellerId(string sellerId) =>
        await dbContext.Articles.Where(a => a.SellerId == sellerId).ToListAsync();

    public Task<int?> GetMaxNumber() =>
        dbContext.Articles.MaxAsync(a => (int?)a.Number);
}
