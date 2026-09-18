using Bazaar.Domain.Articles;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Bazaar.Domain.Users;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence;

public sealed class BazaarDbContext(DbContextOptions<BazaarDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; } = null!;

    public DbSet<Brand> Brands { get; set; } = null!;

    public DbSet<Category> Categories { get; set; } = null!;

    public DbSet<SellerType> SellerTypes { get; set; } = null!;

    public DbSet<Seller> Sellers { get; set; } = null!;

    public DbSet<Article> Articles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresExtension("citext");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BazaarDbContext).Assembly);
    }
}
