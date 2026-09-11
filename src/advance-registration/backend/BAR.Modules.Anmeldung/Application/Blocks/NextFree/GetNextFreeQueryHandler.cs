using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Betrieb.Contracts;

namespace BAR.Modules.Anmeldung.Application.Blocks.NextFree;

public sealed class GetNextFreeQueryHandler(INumberBlockRepository blocks, IBetriebModuleApi betrieb)
{
    public async Task<NextFreeResultDto> HandleAsync(int blockCount, CancellationToken cancellationToken)
    {
        var numbering = await betrieb.GetNumberingConfigAsync(cancellationToken);
        var existing = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        // Dry-Run: derselbe Allocator wie bei jeder anderen Vergabe
        // (api/blocks.md Abschnitt 5/6) - das Ergebnis wird nur gelesen, nicht
        // persistiert. sellerId/nowUtc sind fuer einen reinen Vorschlag irrelevant.
        var proposal = NumberBlockAllocator.Allocate(existing, "preview", blockCount, numbering.StartNumber, numbering.BlockSize, DateTime.UtcNow);
        return new NextFreeResultDto(proposal[0].FromNumber);
    }
}
