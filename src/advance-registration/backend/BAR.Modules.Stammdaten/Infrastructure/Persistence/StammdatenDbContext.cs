using System.Reflection;
using System.Text.Json;
using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.SellerTypes;
using BAR.SharedKernel;
using BAR.SharedKernel.Events;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Stammdaten.Infrastructure.Persistence;

/// <summary>
/// Eigenes Schema "stammdaten" (dotnet-modulith-bridge: Persistenz je Modul).
/// Dispatcht beim Speichern gesammelte Domain Events synchron in-process und
/// schreibt sie zusaetzlich in die eigene Outbox (architecture-styles/
/// data-flow.md: "In-Process zuerst", Outbox als billige Vorleistung).
/// </summary>
public sealed class StammdatenDbContext(
    DbContextOptions<StammdatenDbContext> options,
    IDomainEventDispatcher dispatcher) : DbContext(options)
{
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<SellerType> SellerTypes => Set<SellerType>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("stammdaten");
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
            // Zweiter, kleiner SaveChanges nur fuer ProcessedAtUtc der eben
            // eingefuegten Outbox-Zeilen - der In-Process-Dispatch oben ist
            // bereits durchgelaufen, wenn dieser Block erreicht wird.
            foreach (var message in OutboxMessages.Local.Where(m => m.ProcessedAtUtc is null))
            {
                message.ProcessedAtUtc = DateTime.UtcNow;
            }

            await base.SaveChangesAsync(cancellationToken);
        }

        return result;
    }
}
