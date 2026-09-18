using Bazaar.Domain.Categories;

namespace Bazaar.Domain.Ports;

public interface ICategoryRepository
{
    Task Add(Category category);

    Task<Category?> GetById(string id);

    Task<IReadOnlyList<Category>> GetAll();

    /// <summary>
    /// Case-insensitive lookup by name. Case-insensitivity is the
    /// implementation's responsibility (e.g. Postgres citext column).
    /// </summary>
    Task<bool> ExistsByNameIgnoreCase(string name);

    Task Update(Category category);

    Task Remove(Category category);
}
