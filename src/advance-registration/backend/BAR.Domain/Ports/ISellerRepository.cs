namespace BAR.Domain.Ports;

public interface ISellerRepository
{
    Task<BAR.Domain.Sellers.Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<BAR.Domain.Sellers.Seller?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task AddAsync(BAR.Domain.Sellers.Seller seller, CancellationToken cancellationToken);
}
