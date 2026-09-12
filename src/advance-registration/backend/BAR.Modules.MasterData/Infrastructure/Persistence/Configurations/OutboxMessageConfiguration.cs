using BAR.SharedKernel.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BAR.Modules.MasterData.Infrastructure.Persistence.Configurations;

public sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_message");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasMaxLength(8).HasColumnName("id");
        builder.Property(m => m.Type).IsRequired().HasColumnName("type");
        builder.Property(m => m.PayloadJson).IsRequired().HasColumnName("payload_json");
        builder.Property(m => m.OccurredAtUtc).HasColumnName("occurred_at_utc");
        builder.Property(m => m.ProcessedAtUtc).HasColumnName("processed_at_utc");
    }
}
