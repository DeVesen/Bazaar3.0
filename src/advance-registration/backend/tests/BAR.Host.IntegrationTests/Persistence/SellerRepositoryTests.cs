using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
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

    [Fact]
    public async Task GetAllAsync_ReturnsPersistedSellers()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var ct = TestContext.Current.CancellationToken;
        var seller = Seller.Register("All", "Getter", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await repo.AddAsync(seller, ct);

        var all = await repo.GetAllAsync(ct);

        Assert.Contains(all, s => s.Id == seller.Id);
    }

    [Fact]
    public async Task CountByTypeAsync_CountsOnlySellersOfThatType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerTypeId = $"t{Guid.NewGuid():N}"[..8];
        var seller1 = Seller.Register("A", "B", null, "1", "C", "0", $"{Guid.NewGuid()}@example.com", sellerTypeId, "hash");
        var seller2 = Seller.Register("D", "E", null, "1", "C", "0", $"{Guid.NewGuid()}@example.com", sellerTypeId, "hash");
        var otherTypeSeller = Seller.Register("F", "G", null, "1", "C", "0", $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await repo.AddAsync(seller1, ct);
        await repo.AddAsync(seller2, ct);
        await repo.AddAsync(otherTypeSeller, ct);

        var count = await repo.CountByTypeAsync(sellerTypeId, ct);

        Assert.Equal(2, count);
    }
}
