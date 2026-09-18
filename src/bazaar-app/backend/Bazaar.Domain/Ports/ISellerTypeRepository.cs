using Bazaar.Domain.SellerTypes;

namespace Bazaar.Domain.Ports;

public interface ISellerTypeRepository
{
    Task Add(SellerType sellerType);

    Task<SellerType?> GetById(string id);

    Task<IReadOnlyList<SellerType>> GetAll();

    /// <summary>
    /// Case-insensitive lookup by name. Case-insensitivity is the
    /// implementation's responsibility (e.g. Postgres citext column).
    /// </summary>
    Task<bool> ExistsByNameIgnoreCase(string name);

    Task Remove(SellerType sellerType);
}
