using Bazaar.Domain.BlankLabels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class LabelSheetFormatConfiguration : IEntityTypeConfiguration<LabelSheetFormat>
{
    private const int MeasurePrecision = 6;
    private const int MeasureScale = 1;

    public void Configure(EntityTypeBuilder<LabelSheetFormat> builder)
    {
        builder.ToTable("LabelSheetFormats");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).HasMaxLength(8).ValueGeneratedNever();
        builder.Property(f => f.Name).IsRequired().HasMaxLength(LabelSheetFormat.NameMaxLength);
        builder.HasIndex(f => f.Name).IsUnique();
        builder.ComplexProperty(f => f.Geometry, ConfigureGeometry);
    }

    private static void ConfigureGeometry(ComplexPropertyBuilder<LabelSheetGeometry> builder)
    {
        builder.Property(g => g.SheetWidth).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.SheetHeight).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.LabelWidth).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.LabelHeight).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.MarginTop).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.MarginRight).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.MarginBottom).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.MarginLeft).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.GapHorizontal).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.GapVertical).HasPrecision(MeasurePrecision, MeasureScale);
        builder.Property(g => g.Columns);
        builder.Property(g => g.Rows);
    }
}
