using Bazaar.Domain.BlankLabels;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class LabelImageConfiguration : IEntityTypeConfiguration<LabelImage>
{
    private const int MediaTypeMaxLength = 20;
    private const int ContentHashLength = 64;

    public void Configure(EntityTypeBuilder<LabelImage> builder)
    {
        builder.ToTable("LabelImages");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).HasMaxLength(8).ValueGeneratedNever();
        builder.Property(i => i.Name).IsRequired().HasMaxLength(LabelImage.NameMaxLength);
        builder.Property(i => i.DataUrl).IsRequired().HasColumnType("text");
        builder.Property(i => i.MediaType).IsRequired().HasMaxLength(MediaTypeMaxLength);
        builder.Property(i => i.SizeBytes);
        builder.Property(i => i.ContentHash).IsRequired().HasMaxLength(ContentHashLength).IsFixedLength();
        builder.Property(i => i.CreatedAt);
        builder.HasIndex(i => i.ContentHash).IsUnique();
    }
}
