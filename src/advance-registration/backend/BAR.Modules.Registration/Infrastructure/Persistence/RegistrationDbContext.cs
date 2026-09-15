using System.Reflection;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Registration.Infrastructure.Persistence;

/// <summary>Eigenes Schema "registration" (dotnet-modulith-bridge: Persistenz je Modul).</summary>
public sealed class RegistrationDbContext(DbContextOptions<RegistrationDbContext> options) : DbContext(options)
{
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<NumberBlock> NumberBlocks => Set<NumberBlock>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("registration");
        modelBuilder.HasPostgresExtension("btree_gist");
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
