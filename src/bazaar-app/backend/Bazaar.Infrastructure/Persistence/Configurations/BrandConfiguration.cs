using Bazaar.Domain.Brands;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasMaxLength(8);

        builder.Property(b => b.Name).HasColumnType("citext");
        builder.HasIndex(b => b.Name).IsUnique();
    }
}
