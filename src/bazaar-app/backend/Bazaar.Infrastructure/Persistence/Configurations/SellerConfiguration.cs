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

        // Email is optional (nullable column, inferred from Seller.Email being
        // string?): the Haupt-App only requires FirstName, LastName, City,
        // SellerTypeId and the conditions. Deliberately not unique and no citext
        // column type (citext is only used where case-insensitive
        // uniqueness/lookup is needed).
    }
}
