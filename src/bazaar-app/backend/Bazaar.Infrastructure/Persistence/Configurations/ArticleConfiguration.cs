using Bazaar.Domain.Articles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class ArticleConfiguration : IEntityTypeConfiguration<Article>
{
    public void Configure(EntityTypeBuilder<Article> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasMaxLength(8);

        // Number is the barcode basis and must be system-wide unique per
        // Epic_Artikelannahme, even though this Round has no write source
        // for it other than the correction dialog itself (plan.md, Task 3).
        builder.Property(a => a.Number).IsRequired();
        builder.HasIndex(a => a.Number).IsUnique();

        builder.Property(a => a.Name).IsRequired();
        builder.Property(a => a.Brand).IsRequired();
        builder.Property(a => a.Category).IsRequired();

        // Status is a computed CLR property (Task 1) with no backing field —
        // EF Core conventions already skip get-only expression-bodied
        // properties, but Ignore it explicitly for clarity/future-safety.
        builder.Ignore(a => a.Status);
    }
}
