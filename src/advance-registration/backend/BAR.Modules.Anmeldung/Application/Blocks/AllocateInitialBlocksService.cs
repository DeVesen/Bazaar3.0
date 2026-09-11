using BAR.Modules.Anmeldung.Domain.Exceptions;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Betrieb.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Anmeldung.Application.Blocks;

/// <summary>
/// Konsolidiert die frueher in RegisterCommandHandler und
/// CreateSellerCommandHandler duplizierte Retry-bei-Overlap-Logik - beide
/// riefen denselben Allocator mit derselben Wiederholungsregel auf. Jetzt der
/// einzige Ort, an dem Verkaeuferverwaltung ueber Anmeldung.Contracts
/// Nummernbloecke fuer einen neuen Verkaeufer anfragt.
/// </summary>
public sealed class AllocateInitialBlocksService(INumberBlockRepository blocks, IBetriebModuleApi betrieb, IClock clock)
{
    public async Task<IReadOnlyList<NumberBlock>> HandleAsync(
        string sellerId, int? blockCount, int? startNumber, CancellationToken cancellationToken)
    {
        var numbering = await betrieb.GetNumberingConfigAsync(cancellationToken);

        // Pruef-Kaskade Stufe 1 (api/blocks.md Abschnitt 6): eine vorgegebene
        // Startnummer darf nie unterhalb der konfigurierten Basar-Startnummer liegen.
        if (startNumber.HasValue && startNumber.Value < numbering.StartNumber)
        {
            throw new ConflictException("block.overlap", "Nummernbereich überschneidet sich mit bestehendem Block");
        }

        var effectiveStart = startNumber ?? numbering.StartNumber;
        var effectiveCount = blockCount ?? numbering.DefaultBlockCount;

        // Zwei gleichzeitige Anlagen koennen denselben freien Bereich berechnen -
        // der zweite Versuch laeuft dann in das EXCLUDE-Constraint. Genau dieser
        // Fall wird einmal wiederholt (mit frisch gelesenem Bestand); scheitert
        // auch das, bleibt es bei einem sauberen 409 statt eines rohen 500.
        try
        {
            return await AllocateAndInsertAsync(sellerId, effectiveCount, effectiveStart, numbering.BlockSize, cancellationToken);
        }
        catch (NumberBlockOverlapException)
        {
            try
            {
                return await AllocateAndInsertAsync(sellerId, effectiveCount, effectiveStart, numbering.BlockSize, cancellationToken);
            }
            catch (NumberBlockOverlapException)
            {
                throw new ConflictException(
                    "block.overlap", "Nummernvergabe momentan ueberlastet, bitte erneut versuchen");
            }
        }
    }

    private async Task<IReadOnlyList<NumberBlock>> AllocateAndInsertAsync(
        string sellerId, int blockCount, int startNumber, int blockSize, CancellationToken cancellationToken)
    {
        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);
        var newBlocks = NumberBlockAllocator.Allocate(existingBlocks, sellerId, blockCount, startNumber, blockSize, clock.UtcNow);
        await blocks.AddRangeAsync(newBlocks, cancellationToken);
        return newBlocks;
    }
}
