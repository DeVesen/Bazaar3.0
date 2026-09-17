using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Bazaar.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace Bazaar.Infrastructure.UnitTests.Security;

public class SeedAdminHostedServiceTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();

    private SeedAdminHostedService CreateSut(IConfiguration configuration)
    {
        var services = new ServiceCollection();
        services.AddSingleton(_userRepository.Object);
        services.AddSingleton(_passwordHasher.Object);
        services.AddSingleton(_idGenerator.Object);
        services.AddSingleton(configuration);
        var provider = services.BuildServiceProvider();
        return new SeedAdminHostedService(provider.GetRequiredService<IServiceScopeFactory>());
    }

    private static IConfiguration CreateConfiguration(string? seedUser, string? seedPassword)
    {
        var data = new Dictionary<string, string?>();
        if (seedUser is not null) data["SEED_ADMIN_USER"] = seedUser;
        if (seedPassword is not null) data["SEED_ADMIN_PASSWORD"] = seedPassword;
        return new ConfigurationBuilder().AddInMemoryCollection(data).Build();
    }

    [Fact]
    public async Task StartAsync_UsersAlreadyExist_DoesNotAddAnyUser()
    {
        _userRepository.Setup(r => r.AnyAsync()).ReturnsAsync(true);
        var sut = CreateSut(CreateConfiguration("admin", "changeme"));

        await sut.StartAsync(CancellationToken.None);

        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task StartAsync_NoUsersAndConfigPresent_CreatesAndAddsAdminUserWithMustChangePassword()
    {
        _userRepository.Setup(r => r.AnyAsync()).ReturnsAsync(false);
        _passwordHasher.Setup(h => h.Hash("changeme")).Returns("hashed-password");
        _idGenerator.Setup(g => g.Generate()).Returns("ADMIN001");
        User? addedUser = null;
        _userRepository
            .Setup(r => r.Add(It.IsAny<User>()))
            .Callback<User>(u => addedUser = u)
            .Returns(Task.CompletedTask);
        var sut = CreateSut(CreateConfiguration("admin", "changeme"));

        await sut.StartAsync(CancellationToken.None);

        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Once);
        Assert.NotNull(addedUser);
        Assert.Equal("ADMIN001", addedUser!.Id);
        Assert.Equal("admin", addedUser.Username);
        Assert.Equal("hashed-password", addedUser.PasswordHash);
        Assert.Equal(Role.Admin, addedUser.Role);
        Assert.True(addedUser.MustChangePassword);
    }

    [Theory]
    [InlineData(null, "changeme")]
    [InlineData("admin", null)]
    [InlineData(null, null)]
    public async Task StartAsync_MissingConfigValue_ThrowsAndDoesNotAddUser(string? seedUser, string? seedPassword)
    {
        _userRepository.Setup(r => r.AnyAsync()).ReturnsAsync(false);
        var sut = CreateSut(CreateConfiguration(seedUser, seedPassword));

        await Assert.ThrowsAsync<InvalidOperationException>(() => sut.StartAsync(CancellationToken.None));

        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }
}
