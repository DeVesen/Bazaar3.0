using Bazaar.Domain.BlankLabels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class LabelPrintDefaultsConfiguration : IEntityTypeConfiguration<LabelPrintDefaults>
{
    private const int KindMaxLength = 10;

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
        builder.Ignore(d => d.Logo);
        builder.Ignore(d => d.SellerSymbol);
    }
}
