namespace BAR.Domain.Ports;

public interface ISellerTypeRepository
{
    Task<BAR.Domain.SellerTypes.SellerType?> GetByIdAsync(string id, CancellationToken cancellationToken);
}
