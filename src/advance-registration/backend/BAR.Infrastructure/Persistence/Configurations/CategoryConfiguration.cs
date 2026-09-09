using BAR.Domain.MasterData;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("category");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(c => c.Name).IsRequired().HasColumnName("name");
        builder.Property(c => c.Original).HasColumnName("original");
    }
}
