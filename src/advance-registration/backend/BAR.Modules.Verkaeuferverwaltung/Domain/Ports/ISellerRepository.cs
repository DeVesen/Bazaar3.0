using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;

namespace BAR.Modules.Verkaeuferverwaltung.Domain.Ports;

public interface ISellerRepository
{
    Task<Seller?> GetByEmailAsync(string email, CancellationToken cancellationToken);
    Task<Seller?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<Seller?> GetByInviteTokenAsync(string inviteToken, CancellationToken cancellationToken);
    Task<IReadOnlyList<Seller>> GetAllAsync(CancellationToken cancellationToken);
    Task AddAsync(Seller seller, CancellationToken cancellationToken);
    Task UpdateAsync(Seller seller, CancellationToken cancellationToken);
    Task DeleteAsync(Seller seller, CancellationToken cancellationToken);
    Task<int> CountAdminsAsync(CancellationToken cancellationToken);
    Task<int> CountByTypeAsync(string sellerTypeId, CancellationToken cancellationToken);
}
