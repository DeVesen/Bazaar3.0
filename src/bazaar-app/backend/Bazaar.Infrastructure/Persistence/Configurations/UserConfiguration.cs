using Bazaar.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Bazaar.Infrastructure.Persistence.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasMaxLength(8);

        builder.Property(u => u.Username).HasColumnType("citext");
        builder.HasIndex(u => u.Username).IsUnique();

        builder.Property(u => u.Role).HasConversion<string>();
    }
}
