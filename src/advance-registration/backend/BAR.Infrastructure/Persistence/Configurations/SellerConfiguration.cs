using BAR.Domain.Sellers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.ToTable("seller");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(8);
        builder.Property(s => s.Email).IsRequired();
        builder.HasIndex(s => s.Email).IsUnique();
        builder.Property(s => s.SellerTypeId).HasMaxLength(8).IsRequired();
    }
}
