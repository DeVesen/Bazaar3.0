using BAR.Modules.Stammdaten.Domain.MasterData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Modules.Stammdaten.Infrastructure.Persistence.Configurations;

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
        // Case-insensitiver Unique-Index (lower(name)) wird als raw SQL in der
        // Migration angelegt, nicht ueber Fluent API - EF Core kennt keinen
        // funktionalen Index-Ausdruck ueber HasIndex(...).
    }
}
