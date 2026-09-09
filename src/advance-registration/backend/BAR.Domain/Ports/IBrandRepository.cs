using BAR.Domain.MasterData;

namespace BAR.Domain.Ports;

public interface IBrandRepository
{
    Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken);
    Task<Brand?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(Brand brand, CancellationToken cancellationToken);
    Task UpdateAsync(Brand brand, string? renameArticlesFrom, CancellationToken cancellationToken);
    Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken);
    Task DeleteAsync(Brand brand, CancellationToken cancellationToken);
}
