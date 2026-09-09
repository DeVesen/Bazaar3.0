using BAR.Domain.MasterData;

namespace BAR.Domain.Ports;

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken);
    Task<Category?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<bool> ExistsByNameCaseInsensitiveAsync(string name, string? excludeId, CancellationToken cancellationToken);
    Task AddAsync(Category category, CancellationToken cancellationToken);
    Task UpdateAsync(Category category, string? renameArticlesFrom, CancellationToken cancellationToken);
    Task<int> CountArticlesWithNameAsync(string name, CancellationToken cancellationToken);
    Task DeleteAsync(Category category, CancellationToken cancellationToken);
}
