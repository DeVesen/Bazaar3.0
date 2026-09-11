using BAR.Modules.Stammdaten.Domain.SellerTypes;

namespace BAR.Modules.Stammdaten.Domain.Ports;

public interface ISellerTypeRepository
{
    Task<IReadOnlyList<SellerType>> GetAllAsync(CancellationToken cancellationToken);
    Task<SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(SellerType sellerType, CancellationToken cancellationToken);
    Task UpdateAsync(SellerType sellerType, CancellationToken cancellationToken);
    Task DeleteAsync(SellerType sellerType, CancellationToken cancellationToken);
}
