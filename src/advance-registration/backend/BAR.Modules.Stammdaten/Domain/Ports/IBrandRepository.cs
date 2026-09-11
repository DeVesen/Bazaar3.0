using BAR.Modules.Stammdaten.Domain.MasterData;

namespace BAR.Modules.Stammdaten.Domain.Ports;

public interface IBrandRepository
{
    Task<IReadOnlyList<Brand>> GetAllAsync(CancellationToken cancellationToken);
    Task<Brand?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(Brand brand, CancellationToken cancellationToken);
    Task UpdateAsync(Brand brand, CancellationToken cancellationToken);
    Task DeleteAsync(Brand brand, CancellationToken cancellationToken);
}
