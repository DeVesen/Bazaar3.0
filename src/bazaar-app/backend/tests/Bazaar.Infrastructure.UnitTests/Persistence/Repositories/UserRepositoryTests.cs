using Bazaar.Domain.Users;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class UserRepositoryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task Add_PersistsUser_FindableByGetById()
    {
        await using var dbContext = CreateContext();
        var sut = new UserRepository(dbContext);
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: false);

        await sut.Add(user);

        var found = await sut.GetById("USER01");
        Assert.NotNull(found);
        Assert.Equal("cashier1", found!.Username);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        var sut = new UserRepository(dbContext);

        var found = await sut.GetById("UNKNOWN1");

        Assert.Null(found);
    }

    [Fact]
    public async Task GetByUsername_ExistingUser_ReturnsUser()
    {
        await using var dbContext = CreateContext();
        var sut = new UserRepository(dbContext);
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: false);
        await sut.Add(user);

        var found = await sut.GetByUsername("cashier1");

        Assert.NotNull(found);
        Assert.Equal("USER01", found!.Id);
    }

    [Fact]
    public async Task GetByUsername_UnknownUsername_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        var sut = new UserRepository(dbContext);

        var found = await sut.GetByUsername("nobody");

        Assert.Null(found);
    }

    [Fact]
    public async Task Update_PersistsChanges()
    {
        await using var dbContext = CreateContext();
        var sut = new UserRepository(dbContext);
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: true);
        await sut.Add(user);

        user.ChangePassword("new-hash");
        await sut.Update(user);

        var found = await sut.GetById("USER01");
        Assert.NotNull(found);
        Assert.Equal("new-hash", found!.PasswordHash);
        Assert.False(found.MustChangePassword);
    }

    [Fact]
    public async Task AnyAsync_NoUsers_ReturnsFalse()
    {
        await using var dbContext = CreateContext();
        var sut = new UserRepository(dbContext);

        Assert.False(await sut.AnyAsync());
    }

    [Fact]
    public async Task AnyAsync_UserExists_ReturnsTrue()
    {
        await using var dbContext = CreateContext();
        var sut = new UserRepository(dbContext);
        await sut.Add(User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: false));

        Assert.True(await sut.AnyAsync());
    }
}
