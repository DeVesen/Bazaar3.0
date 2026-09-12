using System.Reflection;
using System.Text.Json;
using BAR.Modules.MasterData.Domain.Catalog;
using BAR.Modules.MasterData.Domain.SellerTypes;
using BAR.SharedKernel;
using BAR.SharedKernel.Events;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.MasterData.Infrastructure.Persistence;

/// <summary>
/// Own schema "master_data" (dotnet-modulith-bridge: persistence per module).
/// Dispatches collected domain events synchronously in-process on save and
/// also writes them to its own outbox (architecture-styles/data-flow.md:
/// "in-process first", outbox as a cheap fallback).
/// </summary>
public sealed class MasterDataDbContext(
    DbContextOptions<MasterDataDbContext> options,
    IDomainEventDispatcher dispatcher) : DbContext(options)
{
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<SellerType> SellerTypes => Set<SellerType>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("master_data");
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entitiesWithEvents = ChangeTracker.Entries<IHasDomainEvents>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Count > 0)
            .ToList();

        foreach (var domainEvent in entitiesWithEvents.SelectMany(e => e.DomainEvents))
        {
            OutboxMessages.Add(new OutboxMessage
            {
                Id = EntityId.New(),
                Type = domainEvent.GetType().Name,
                PayloadJson = JsonSerializer.Serialize(domainEvent, domainEvent.GetType()),
                OccurredAtUtc = domainEvent.OccurredAtUtc
            });
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        foreach (var entity in entitiesWithEvents)
        {
            foreach (var domainEvent in entity.DomainEvents)
            {
                await dispatcher.DispatchAsync(domainEvent, cancellationToken);
            }

            entity.ClearDomainEvents();
        }

        if (entitiesWithEvents.Count > 0)
        {
            // Second, small SaveChanges just for ProcessedAtUtc of the outbox
            // rows just inserted - the in-process dispatch above has already
            // run by the time this block is reached.
            foreach (var message in OutboxMessages.Local.Where(m => m.ProcessedAtUtc is null))
            {
                message.ProcessedAtUtc = DateTime.UtcNow;
            }

            await base.SaveChangesAsync(cancellationToken);
        }

        return result;
    }
}
