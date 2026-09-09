using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class SellerTypeRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerTypeRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_ThenGetAll_ContainsType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Standard-{Guid.NewGuid():N}", 12.5m, 0.50m);

        await repo.AddAsync(type, ct);
        var all = await repo.GetAllAsync(ct);

        Assert.Contains(all, t => t.Id == type.Id);
    }

    [Fact]
    public async Task ExistsByNameAsync_SameName_ReturnsTrue()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var name = $"Premium-{Guid.NewGuid():N}";
        await repo.AddAsync(SellerType.Create(name, 20m, 1m), ct);

        var exists = await repo.ExistsByNameAsync(name, excludeId: null, ct);

        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByNameAsync_ExcludeOwnId_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Gewerblich-{Guid.NewGuid():N}", 20m, 1m);
        await repo.AddAsync(type, ct);

        var exists = await repo.ExistsByNameAsync(type.Name, excludeId: type.Id, ct);

        Assert.False(exists);
    }

    [Fact]
    public async Task UpdateAsync_PersistsChangedValues()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Alt-{Guid.NewGuid():N}", 10m, 0.20m);
        await repo.AddAsync(type, ct);

        type.Update("Neu", 15m, 0.30m);
        await repo.UpdateAsync(type, ct);

        var reloaded = await repo.GetByIdAsync(type.Id, ct);
        Assert.Equal("Neu", reloaded!.Name);
        Assert.Equal(15m, reloaded.CommissionRate);
    }

    [Fact]
    public async Task CountSellersAsync_CountsOnlyMatchingType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Zaehl-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(type, ct);
        var otherType = SellerType.Create($"Andere-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(otherType, ct);
        await sellers.AddAsync(Seller.Register("A", "B", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", type.Id, "hash"), ct);
        await sellers.AddAsync(Seller.Register("C", "D", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", type.Id, "hash"), ct);
        await sellers.AddAsync(Seller.Register("E", "F", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", otherType.Id, "hash"), ct);

        var count = await types.CountSellersAsync(type.Id, ct);

        Assert.Equal(2, count);
    }

    [Fact]
    public async Task DeleteAsync_RemovesType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Weg-{Guid.NewGuid():N}", 10m, 0.20m);
        await repo.AddAsync(type, ct);

        await repo.DeleteAsync(type, ct);

        Assert.Null(await repo.GetByIdAsync(type.Id, ct));
    }
}
