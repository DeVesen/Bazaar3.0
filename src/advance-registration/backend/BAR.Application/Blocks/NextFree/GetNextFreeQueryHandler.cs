using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;

namespace BAR.Application.Blocks.NextFree;

public sealed class GetNextFreeQueryHandler(INumberBlockRepository blocks, ISettingsRepository settingsRepository)
{
    public async Task<NextFreeResult> HandleAsync(GetNextFreeQuery query, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new BAR.Domain.Exceptions.ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");
        var existing = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        // Dry-Run: derselbe Allocator wie bei jeder anderen Vergabe
        // (api/blocks.md Abschnitt 5/6) - das Ergebnis wird nur gelesen, nicht
        // persistiert. sellerId/nowUtc sind fuer einen reinen Vorschlag irrelevant.
        var proposal = NumberBlockAllocator.Allocate(existing, "preview", query.BlockCount, settings.StartNumber, settings.BlockSize, DateTime.UtcNow);
        return new NextFreeResult(proposal[0].FromNumber);
    }
}
