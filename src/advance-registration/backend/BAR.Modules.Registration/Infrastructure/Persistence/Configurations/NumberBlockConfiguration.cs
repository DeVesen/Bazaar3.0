using BAR.Modules.Registration.Domain.NumberBlocks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Modules.Registration.Infrastructure.Persistence.Configurations;

public sealed class NumberBlockConfiguration : IEntityTypeConfiguration<NumberBlock>
{
    public void Configure(EntityTypeBuilder<NumberBlock> builder)
    {
        builder.ToTable("number_block", t => t.HasCheckConstraint(
            "CK_number_block_range_valid", "\"to_number\" >= \"from_number\""));
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(b => b.SellerId).HasMaxLength(8).IsRequired().HasColumnName("seller_id");
        builder.HasIndex(b => b.SellerId);
        builder.Property(b => b.FromNumber).HasColumnName("from_number");
        builder.Property(b => b.ToNumber).HasColumnName("to_number");
        builder.Property(b => b.AssignedAt).HasColumnName("assigned_at");
    }
}
