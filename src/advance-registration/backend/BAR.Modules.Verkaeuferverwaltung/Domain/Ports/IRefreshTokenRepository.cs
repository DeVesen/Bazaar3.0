using BAR.Modules.Verkaeuferverwaltung.Domain.Auth;

namespace BAR.Modules.Verkaeuferverwaltung.Domain.Ports;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken cancellationToken);
    Task AddAsync(RefreshToken token, CancellationToken cancellationToken);
    Task DeleteAsync(string id, CancellationToken cancellationToken);
    Task DeleteExpiredForSellerAsync(string sellerId, DateTime nowUtc, CancellationToken cancellationToken);
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task<int> CountActiveForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task DeleteOldestForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
