using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class SellerRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_ThenGetByEmail_ReturnsSameSeller()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Seller.Register("Test", "User", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await repo.AddAsync(seller, ct);

        var found = await repo.GetByEmailAsync(seller.Email, ct);

        Assert.NotNull(found);
        Assert.Equal(seller.Id, found!.Id);
    }

    [Fact]
    public async Task GetByEmailAsync_UnknownEmail_ReturnsNull()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerRepository>();

        var found = await repo.GetByEmailAsync("nobody@example.com", TestContext.Current.CancellationToken);

        Assert.Null(found);
    }
}
