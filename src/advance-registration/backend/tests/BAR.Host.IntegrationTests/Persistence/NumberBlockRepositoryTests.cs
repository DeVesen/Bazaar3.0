using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class NumberBlockRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public NumberBlockRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_OverlappingRangeForDifferentSeller_ThrowsOnExclusionConstraint()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
        var ct = TestContext.Current.CancellationToken;

        var first = NumberBlock.Assign(Guid.NewGuid().ToString("N")[..8], 5001, 10, DateTime.UtcNow);
        await repo.AddAsync(first, ct);

        var overlapping = NumberBlock.Assign(Guid.NewGuid().ToString("N")[..8], 5005, 10, DateTime.UtcNow);

        await Assert.ThrowsAsync<DbUpdateException>(() => repo.AddAsync(overlapping, ct));
    }
}
