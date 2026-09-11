using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence.Configurations;

public sealed class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.ToTable("seller");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(s => s.FirstName).HasColumnName("first_name");
        builder.Property(s => s.LastName).HasColumnName("last_name");
        builder.Property(s => s.Address).HasColumnName("address");
        builder.Property(s => s.PostalCode).HasColumnName("postal_code");
        builder.Property(s => s.City).HasColumnName("city");
        builder.Property(s => s.Phone).HasColumnName("phone");
        builder.Property(s => s.Email).IsRequired().HasColumnName("email");
        builder.HasIndex(s => s.Email).IsUnique();
        builder.Property(s => s.SellerTypeId).HasMaxLength(8).IsRequired().HasColumnName("seller_type_id");
        builder.Property(s => s.IsAdmin).HasColumnName("is_admin");
        builder.Property(s => s.PasswordHash).HasColumnName("password_hash");
        builder.Property(s => s.InviteToken).HasColumnName("invite_token");
        builder.Property(s => s.InviteTokenExpiresAt).HasColumnName("invite_token_expires_at");
    }
}
