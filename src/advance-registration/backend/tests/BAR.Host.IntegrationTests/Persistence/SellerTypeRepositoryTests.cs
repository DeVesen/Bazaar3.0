using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Domain.SellerTypes;
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

    // CountSellersAsync has moved from ISellerTypeRepository to
    // ISellerManagementModuleApi.CountSellersByTypeAsync - since the modulith
    // cut, Seller lives in a different schema/module and can no longer be
    // queried directly from here. The counting logic itself (there a simple
    // pass-through to ISellerRepository.CountByTypeAsync) is already covered
    // by SellerRepositoryTests.CountByTypeAsync_CountsOnlySellersOfThatType.
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
