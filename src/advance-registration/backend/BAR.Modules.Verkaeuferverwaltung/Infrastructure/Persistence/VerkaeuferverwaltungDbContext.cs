using System.Reflection;
using BAR.Modules.Verkaeuferverwaltung.Domain.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence;

/// <summary>Eigenes Schema "verkaeuferverwaltung" (dotnet-modulith-bridge: Persistenz je Modul).</summary>
public sealed class VerkaeuferverwaltungDbContext(DbContextOptions<VerkaeuferverwaltungDbContext> options) : DbContext(options)
{
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("verkaeuferverwaltung");
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
