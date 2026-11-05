using Bazaar.Domain.BlankLabels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class LabelPrintDefaultsConfiguration : IEntityTypeConfiguration<LabelPrintDefaults>
{
    private const int KindMaxLength = 10;
    private const int SizePrecision = 5;
    private const int SizeScale = 1;

    public void Configure(EntityTypeBuilder<LabelPrintDefaults> builder)
    {
        builder.ToTable("LabelPrintDefaults");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).ValueGeneratedNever();
        builder.Property(d => d.LogoKind).HasConversion<string>().HasMaxLength(KindMaxLength);
        builder.Property(d => d.LogoValue);
        builder.Property(d => d.SellerSymbolKind).HasConversion<string>().HasMaxLength(KindMaxLength);
        builder.Property(d => d.SellerSymbolValue);
        // Drei Runes können als Surrogatpaare bis zu sechs UTF-16-Zeichen belegen.
        builder.Property(d => d.CurrencySymbol).IsRequired().HasMaxLength(LabelPrintDefaults.CurrencySymbolMaxLength * 2);
        // Datenbank-Vorgabe = Domain-Vorgabe, damit eine schon gespeicherte Zeile beim Migrieren gültige Größen bekommt.
        builder.Property(d => d.QrCodeSize).HasPrecision(SizePrecision, SizeScale).HasDefaultValue(LabelPrintDefaults.DefaultQrCodeSize);
        builder.Property(d => d.SellerSymbolSize).HasPrecision(SizePrecision, SizeScale).HasDefaultValue(LabelPrintDefaults.DefaultSellerSymbolSize);
        builder.Property(d => d.NumberHeight).HasPrecision(SizePrecision, SizeScale).HasDefaultValue(LabelPrintDefaults.DefaultNumberHeight);
        builder.Property(d => d.CurrencyHeight).HasPrecision(SizePrecision, SizeScale).HasDefaultValue(LabelPrintDefaults.DefaultCurrencyHeight);
        builder.Ignore(d => d.Logo);
        builder.Ignore(d => d.SellerSymbol);
    }
}
