using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence;

public sealed class BazaarDbContext(DbContextOptions<BazaarDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BazaarDbContext).Assembly);
    }
}
