using System.Reflection;
using BAR.Modules.Operations.Domain;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Operations.Infrastructure.Persistence;

/// <summary>Eigenes Schema "operations" (dotnet-modulith-bridge: Persistenz je Modul).</summary>
public sealed class OperationsDbContext(DbContextOptions<OperationsDbContext> options) : DbContext(options)
{
    public DbSet<Settings> Settings => Set<Settings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("operations");
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
