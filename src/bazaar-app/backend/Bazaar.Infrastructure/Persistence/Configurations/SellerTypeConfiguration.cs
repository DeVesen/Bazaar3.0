using Bazaar.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class SellerTypeConfiguration : IEntityTypeConfiguration<SellerType>
{
    public void Configure(EntityTypeBuilder<SellerType> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(8);

        builder.Property(s => s.Name).HasColumnType("citext");
        builder.HasIndex(s => s.Name).IsUnique();
    }
}
