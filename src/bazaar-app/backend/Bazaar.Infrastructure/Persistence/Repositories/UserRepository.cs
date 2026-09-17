using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class UserRepository(BazaarDbContext dbContext) : IUserRepository
{
    public async Task Add(User user)
    {
        await dbContext.Users.AddAsync(user);
        await dbContext.SaveChangesAsync();
    }

    public Task<User?> GetById(string id) =>
        dbContext.Users.SingleOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByUsername(string username) =>
        dbContext.Users.SingleOrDefaultAsync(u => u.Username == username);

    public async Task Update(User user)
    {
        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync();
    }

    public Task<bool> AnyAsync() => dbContext.Users.AnyAsync();
}
