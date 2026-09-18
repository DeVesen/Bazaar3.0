using Bazaar.Domain.Sellers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(8);

        // Deliberate deviation from SellerTypeConfiguration/BrandConfiguration:
        // Email is required (NOT NULL) but spec.md does not document it as
        // unique, so no HasIndex(...).IsUnique() here and no citext column
        // type (citext is only used where case-insensitive uniqueness/lookup
        // is needed).
        builder.Property(s => s.Email).IsRequired();
    }
}
