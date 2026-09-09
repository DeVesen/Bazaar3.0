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
        builder.Property(s => s.Id).HasMaxLength(20);
        builder.Property(s => s.InfoText).HasMaxLength(4000);
        builder.Property(s => s.DefaultTypeId).HasMaxLength(8).IsRequired();
    }
}
