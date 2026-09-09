using BAR.Domain.Articles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class ArticleConfiguration : IEntityTypeConfiguration<Article>
{
    public void Configure(EntityTypeBuilder<Article> builder)
    {
        builder.ToTable("article");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(a => a.Number).HasColumnName("number");
        builder.Property(a => a.SellerId).HasMaxLength(8).IsRequired().HasColumnName("seller_id");
        builder.HasIndex(a => a.SellerId);
        builder.Property(a => a.Name).IsRequired().HasColumnName("name");
        builder.Property(a => a.Brand).IsRequired().HasColumnName("brand");
        builder.Property(a => a.Category).IsRequired().HasColumnName("category");
        builder.Property(a => a.Price).HasPrecision(10, 2).HasColumnName("price");
        builder.Property(a => a.Size).HasColumnName("size");
        builder.Property(a => a.Color).HasColumnName("color");
        builder.Property(a => a.Description).HasColumnName("description");
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at");
    }
}
