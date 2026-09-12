using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.Operations.Domain;
using BAR.Modules.Operations.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class SettingsRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SettingsRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task SaveAsync_NoExistingRow_Inserts()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISettingsRepository>();
        var ct = TestContext.Current.CancellationToken;

        var settings = Settings.Create(null, null, null, null, null, null, null, 1, 10, 1);
        await repo.SaveAsync(settings, ct);

        var reloaded = await repo.GetAsync(ct);
        Assert.NotNull(reloaded);
        Assert.Null(reloaded!.RegistrationDeadline);
        Assert.Equal(1, reloaded.StartNumber);
    }

    [Fact]
    public async Task SaveAsync_ExistingRow_Replaces()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISettingsRepository>();
        var ct = TestContext.Current.CancellationToken;

        var settings = Settings.Create(null, null, null, null, null, null, null, 1, 10, 1);
        await repo.SaveAsync(settings, ct);

        var reloaded = await repo.GetAsync(ct);
        reloaded!.Update(null, null, null, null, null, null, null, 5, 20, 2);
        await repo.SaveAsync(reloaded, ct);

        var reReloaded = await repo.GetAsync(ct);
        Assert.Equal(5, reReloaded!.StartNumber);
        Assert.Equal(20, reReloaded.BlockSize);
    }
}
