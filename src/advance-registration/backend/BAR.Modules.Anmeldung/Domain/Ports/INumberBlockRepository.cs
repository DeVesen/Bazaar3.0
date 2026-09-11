using BAR.Modules.Anmeldung.Domain.NumberBlocks;

namespace BAR.Modules.Anmeldung.Domain.Ports;

public interface INumberBlockRepository
{
    Task<IReadOnlyList<NumberBlock>> GetAllOrderedByFromNumberAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<NumberBlock>> GetForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task<NumberBlock?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(NumberBlock block, CancellationToken cancellationToken);
    Task AddRangeAsync(IReadOnlyList<NumberBlock> blocks, CancellationToken cancellationToken);
    Task DeleteAsync(NumberBlock block, CancellationToken cancellationToken);
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
