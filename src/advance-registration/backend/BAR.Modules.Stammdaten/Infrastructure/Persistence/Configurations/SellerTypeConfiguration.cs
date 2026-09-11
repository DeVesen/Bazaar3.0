using BAR.Modules.Stammdaten.Domain.SellerTypes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Modules.Stammdaten.Infrastructure.Persistence.Configurations;

public sealed class SellerTypeConfiguration : IEntityTypeConfiguration<SellerType>
{
    public void Configure(EntityTypeBuilder<SellerType> builder)
    {
        builder.ToTable("seller_type");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(t => t.Name).IsRequired().HasColumnName("name");
        builder.HasIndex(t => t.Name).IsUnique();
        builder.Property(t => t.CommissionRate).HasPrecision(5, 2).HasColumnName("commission_rate");
        builder.Property(t => t.ItemFee).HasPrecision(10, 2).HasColumnName("item_fee");
    }
}
