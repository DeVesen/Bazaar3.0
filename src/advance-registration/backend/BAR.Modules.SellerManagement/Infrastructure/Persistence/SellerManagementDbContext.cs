using System.Reflection;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Sellers;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.SellerManagement.Infrastructure.Persistence;

/// <summary>Eigenes Schema "seller_management" (dotnet-modulith-bridge: Persistenz je Modul).</summary>
public sealed class SellerManagementDbContext(DbContextOptions<SellerManagementDbContext> options) : DbContext(options)
{
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("seller_management");
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
