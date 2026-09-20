using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class SettingsConfiguration : IEntityTypeConfiguration<SettingsAggregate>
{
    public void Configure(EntityTypeBuilder<SettingsAggregate> builder)
    {
        builder.ToTable("Settings");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();

        builder.Property(s => s.ScannerPauseMs).IsRequired();
    }
}
