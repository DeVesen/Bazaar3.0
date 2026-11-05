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
        builder.ComplexProperty(d => d.Sizes, ConfigureSizes);
        builder.Ignore(d => d.Logo);
        builder.Ignore(d => d.SellerSymbol);
    }

    /// <summary>
    /// Spaltennamen wie vor dem Wertobjekt; Datenbank-Vorgabe = Domain-Vorgabe, damit eine schon
    /// gespeicherte Zeile beim Migrieren gültige Größen bekommt.
    /// </summary>
    private static void ConfigureSizes(ComplexPropertyBuilder<LabelElementSizes> builder)
    {
        var defaults = LabelElementSizes.Default;
        builder.Property(s => s.QrCode).HasColumnName("QrCodeSize")
            .HasPrecision(SizePrecision, SizeScale).HasDefaultValue(defaults.QrCode);
        builder.Property(s => s.SellerSymbol).HasColumnName("SellerSymbolSize")
            .HasPrecision(SizePrecision, SizeScale).HasDefaultValue(defaults.SellerSymbol);
        builder.Property(s => s.NumberHeight).HasColumnName("NumberHeight")
            .HasPrecision(SizePrecision, SizeScale).HasDefaultValue(defaults.NumberHeight);
        builder.Property(s => s.CurrencyHeight).HasColumnName("CurrencyHeight")
            .HasPrecision(SizePrecision, SizeScale).HasDefaultValue(defaults.CurrencyHeight);
    }
}
