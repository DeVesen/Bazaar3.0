namespace BAR.Domain.Ports;

public interface INumberBlockRepository
{
    Task<IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock>> GetAllOrderedByFromNumberAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock>> GetForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.NumberBlocks.NumberBlock block, CancellationToken cancellationToken);
    Task AddRangeAsync(IReadOnlyList<BAR.Domain.NumberBlocks.NumberBlock> blocks, CancellationToken cancellationToken);
}
