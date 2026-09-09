using BAR.Domain.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class SettingsConfiguration : IEntityTypeConfiguration<Settings>
{
    public void Configure(EntityTypeBuilder<Settings> builder)
    {
        builder.ToTable("settings");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(20).HasColumnName("id");
        builder.Property(s => s.RegistrationDeadline).HasColumnName("registration_deadline");
        builder.Property(s => s.DropOffFrom).HasColumnName("drop_off_from");
        builder.Property(s => s.DropOffUntil).HasColumnName("drop_off_until");
        builder.Property(s => s.BazaarFrom).HasColumnName("bazaar_from");
        builder.Property(s => s.BazaarUntil).HasColumnName("bazaar_until");
        builder.Property(s => s.DefaultTypeId).HasMaxLength(8).IsRequired().HasColumnName("default_type_id");
        builder.Property(s => s.InfoText).HasMaxLength(4000).HasColumnName("info_text");
        builder.Property(s => s.StartNumber).HasColumnName("start_number");
        builder.Property(s => s.BlockSize).HasColumnName("block_size");
        builder.Property(s => s.DefaultBlockCount).HasColumnName("default_block_count");
    }
}
