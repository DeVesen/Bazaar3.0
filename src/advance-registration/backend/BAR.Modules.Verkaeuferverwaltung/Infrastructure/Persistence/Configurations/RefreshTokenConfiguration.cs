using BAR.Modules.Verkaeuferverwaltung.Domain.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_token");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(t => t.SellerId).HasMaxLength(8).IsRequired().HasColumnName("seller_id");
        builder.HasIndex(t => t.SellerId);
        builder.Property(t => t.TokenHash).IsRequired().HasColumnName("token_hash");
        builder.HasIndex(t => t.TokenHash).IsUnique();
        builder.Property(t => t.ExpiresAt).HasColumnName("expires_at");
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.LastUsedAt).HasColumnName("last_used_at");
    }
}
