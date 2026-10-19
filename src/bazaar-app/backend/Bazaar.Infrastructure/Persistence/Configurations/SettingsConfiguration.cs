using Bazaar.Domain.Settings;
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
        // DB-Default true für bestehende Zeilen; ValueGeneratedNever, damit EF den Wert `false`
        // beim Insert nicht als „nicht gesetzt" behandelt und stillschweigend durch den Default ersetzt.
        builder.Property(s => s.ReleaseOnClose).IsRequired().HasDefaultValue(true).ValueGeneratedNever();
        builder.ComplexProperty(s => s.AbgabeBeleg, ConfigurePrintTexts);
        builder.ComplexProperty(s => s.VerkaeuferUebersicht, ConfigurePrintTexts);
    }

    private static void ConfigurePrintTexts(ComplexPropertyBuilder<PrintTexts> builder)
    {
        builder.Property(t => t.Text1).IsRequired().HasMaxLength(PrintTexts.MaxLength);
        builder.Property(t => t.Text2).IsRequired().HasMaxLength(PrintTexts.MaxLength);
        builder.Property(t => t.Text3).IsRequired().HasMaxLength(PrintTexts.MaxLength);
        builder.Property(t => t.Text4).IsRequired().HasMaxLength(PrintTexts.MaxLength);
        builder.Property(t => t.Text5).IsRequired().HasMaxLength(PrintTexts.MaxLength);
    }
}
