using System.Reflection;
using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Anmeldung.Infrastructure.Persistence;

/// <summary>Eigenes Schema "anmeldung" (dotnet-modulith-bridge: Persistenz je Modul).</summary>
public sealed class AnmeldungDbContext(DbContextOptions<AnmeldungDbContext> options) : DbContext(options)
{
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<NumberBlock> NumberBlocks => Set<NumberBlock>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("anmeldung");
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
