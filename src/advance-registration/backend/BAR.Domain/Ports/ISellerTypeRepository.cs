namespace BAR.Domain.Ports;

public interface ISellerTypeRepository
{
    Task<IReadOnlyList<BAR.Domain.SellerTypes.SellerType>> GetAllAsync(CancellationToken cancellationToken);
    Task<BAR.Domain.SellerTypes.SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.SellerTypes.SellerType sellerType, CancellationToken cancellationToken);
    Task UpdateAsync(BAR.Domain.SellerTypes.SellerType sellerType, CancellationToken cancellationToken);
    Task<int> CountSellersAsync(string sellerTypeId, CancellationToken cancellationToken);
    Task DeleteAsync(BAR.Domain.SellerTypes.SellerType sellerType, CancellationToken cancellationToken);
}
