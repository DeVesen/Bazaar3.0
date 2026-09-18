using Bazaar.Domain.Sellers;

namespace Bazaar.Domain.Ports;

public interface ISellerRepository
{
    Task Add(Seller seller);

    Task<Seller?> GetById(string id);

    Task Update(Seller seller);

    Task Remove(Seller seller);
}
