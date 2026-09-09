using BAR.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class SellerTypeConfiguration : IEntityTypeConfiguration<SellerType>
{
    public void Configure(EntityTypeBuilder<SellerType> builder)
    {
        builder.ToTable("seller_type");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasMaxLength(8);
        builder.Property(t => t.Name).IsRequired();
        builder.HasIndex(t => t.Name).IsUnique();
        builder.Property(t => t.CommissionRate).HasPrecision(5, 2);
        builder.Property(t => t.ItemFee).HasPrecision(10, 2);
    }
}
