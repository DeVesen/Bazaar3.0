using System.Reflection;
using BAR.Domain.Articles;
using BAR.Domain.Auth;
using BAR.Domain.MasterData;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence;

public sealed class BarDbContext(DbContextOptions<BarDbContext> options) : DbContext(options)
{
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<SellerType> SellerTypes => Set<SellerType>();
    public DbSet<Domain.Settings.Settings> Settings => Set<Domain.Settings.Settings>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<NumberBlock> NumberBlocks => Set<NumberBlock>();
    public DbSet<Article> Articles => Set<Article>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // ESKALIERT (Task 8, siehe task-8-report.md): Die im Brief vorgesehene
        // Exclusion-Constraint (api/blocks.md Abschnitt 6 Stufe 4) laesst sich
        // nicht wie beschrieben abbilden - TableBuilder<T> kennt kein
        // HasAnnotation(...), und "Npgsql:Check:..." ist keine von diesem
        // Npgsql.EntityFrameworkCore.PostgreSQL 10.0.3 erkannte Annotation
        // (CHECK-Constraints akzeptieren ohnehin keine EXCLUDE-USING-Syntax).
        // Bewusst NICHT ersetzt durch eine geratene Alternative - Entscheidung
        // steht noch aus, betrifft Task 9 (Migration).
    }
}
