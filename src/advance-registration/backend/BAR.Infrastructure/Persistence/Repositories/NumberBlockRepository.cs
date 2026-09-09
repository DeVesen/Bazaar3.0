using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class NumberBlockRepository(BarDbContext dbContext) : INumberBlockRepository
{
    public async Task<IReadOnlyList<NumberBlock>> GetAllOrderedByFromNumberAsync(CancellationToken cancellationToken) =>
        await dbContext.NumberBlocks.OrderBy(b => b.FromNumber).ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<NumberBlock>> GetForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        await dbContext.NumberBlocks.Where(b => b.SellerId == sellerId).OrderBy(b => b.FromNumber).ToListAsync(cancellationToken);

    public async Task AddAsync(NumberBlock block, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.Add(block);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IReadOnlyList<NumberBlock> blocks, CancellationToken cancellationToken)
    {
        dbContext.NumberBlocks.AddRange(blocks);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
