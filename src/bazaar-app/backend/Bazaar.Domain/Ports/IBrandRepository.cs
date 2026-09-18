using Bazaar.Domain.Brands;

namespace Bazaar.Domain.Ports;

public interface IBrandRepository
{
    Task Add(Brand brand);

    Task<Brand?> GetById(string id);

    Task<IReadOnlyList<Brand>> GetAll();

    /// <summary>
    /// Case-insensitive lookup by name. Case-insensitivity is the
    /// implementation's responsibility (e.g. Postgres citext column).
    /// </summary>
    Task<bool> ExistsByNameIgnoreCase(string name);

    Task Update(Brand brand);

    Task Remove(Brand brand);
}
