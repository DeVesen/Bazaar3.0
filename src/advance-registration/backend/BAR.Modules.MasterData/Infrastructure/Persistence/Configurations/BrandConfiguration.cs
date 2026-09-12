using BAR.Modules.MasterData.Domain.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Modules.MasterData.Infrastructure.Persistence.Configurations;

public sealed class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.ToTable("brand");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(b => b.Name).IsRequired().HasColumnName("name");
        builder.Property(b => b.Original).HasColumnName("original");
        builder.Ignore(b => b.DomainEvents);
        // The case-insensitive unique index (lower(name)) is created as raw SQL
        // in the migration, not via the Fluent API - EF Core has no functional
        // index expression via HasIndex(...).
    }
}
