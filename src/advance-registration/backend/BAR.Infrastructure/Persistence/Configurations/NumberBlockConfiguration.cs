using BAR.Domain.NumberBlocks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class NumberBlockConfiguration : IEntityTypeConfiguration<NumberBlock>
{
    public void Configure(EntityTypeBuilder<NumberBlock> builder)
    {
        builder.ToTable("number_block", t => t.HasCheckConstraint(
            "CK_number_block_range_valid", "\"to_number\" >= \"from_number\""));
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasMaxLength(8);
        builder.Property(b => b.SellerId).HasMaxLength(8).IsRequired();
        builder.HasIndex(b => b.SellerId);
        builder.Property(b => b.FromNumber).HasColumnName("from_number");
        builder.Property(b => b.ToNumber).HasColumnName("to_number");
    }
}
