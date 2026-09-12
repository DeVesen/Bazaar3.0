using BAR.Modules.Registration.Domain.Exceptions;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BAR.Modules.Registration.Infrastructure.Persistence.Repositories;

public sealed class NumberBlockRepository(RegistrationDbContext dbContext) : INumberBlockRepository
{
    public async Task<IReadOnlyList<NumberBlock>> GetAllOrderedByFromNumberAsync(CancellationToken cancellationToken) =>
        await dbContext.NumberBlocks.OrderBy(b => b.FromNumber).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NumberBlock>> GetForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        await dbContext.NumberBlocks.Where(b => b.SellerId == sellerId).OrderBy(b => b.FromNumber).ToListAsync(cancellationToken);

    public Task<NumberBlock?> GetByIdAsync(string id, CancellationToken cancellationToken) =>
        dbContext.NumberBlocks.SingleOrDefaultAsync(b => b.Id == id, cancellationToken);

    public async Task AddAsync(NumberBlock block, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.Add(block);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IReadOnlyList<NumberBlock> blocks, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.AddRange(blocks);

        // PostgreSQL aborts the entire transaction on a constraint violation -
        // every subsequent command would hit 25P02. So the handler can retry
        // the same operation, we only roll back to this savepoint instead of
        // losing the whole registration.
        var transaction = dbContext.Database.CurrentTransaction;
        const string savepoint = "number_block_allocation";
        if (transaction is not null)
        {
            await transaction.CreateSavepointAsync(savepoint, cancellationToken);
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsExclusionViolation(ex))
        {
            if (transaction is not null)
            {
                await transaction.RollbackToSavepointAsync(savepoint, cancellationToken);
            }

            foreach (var block in blocks)
            {
                dbContext.Entry(block).State = EntityState.Detached;
            }

            throw new NumberBlockOverlapException(
                "Der berechnete Nummernbereich wurde zwischenzeitlich vergeben");
        }

        if (transaction is not null)
        {
            await transaction.ReleaseSavepointAsync(savepoint, cancellationToken);
        }
    }

    /// <summary>
    /// SQLSTATE 23P01 = <c>exclusion_violation</c>, which PostgreSQL reports
    /// for <c>EXCLUDE USING gist</c> (here: <c>CK_number_block_no_overlap</c>).
    /// </summary>
    private static bool IsExclusionViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException { SqlState: "23P01" };

    public async Task DeleteAsync(NumberBlock block, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.Remove(block);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        await dbContext.NumberBlocks.Where(b => b.SellerId == sellerId).ExecuteDeleteAsync(cancellationToken);
    }
}
