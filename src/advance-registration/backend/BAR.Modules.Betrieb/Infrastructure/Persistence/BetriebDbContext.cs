using System.Reflection;
using BAR.Modules.Betrieb.Domain;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Betrieb.Infrastructure.Persistence;

/// <summary>Eigenes Schema "betrieb" (dotnet-modulith-bridge: Persistenz je Modul).</summary>
public sealed class BetriebDbContext(DbContextOptions<BetriebDbContext> options) : DbContext(options)
{
    public DbSet<Settings> Settings => Set<Settings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("betrieb");
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
