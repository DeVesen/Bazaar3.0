using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Sellers.Delete;

public sealed class DeleteSellerCommandHandler(ISellerRepository sellers, ISellerCascadeDeleter cascadeDeleter)
{
    public Task HandleAsync(DeleteSellerCommand command, CancellationToken cancellationToken)
    {
        if (command.SellerId == command.RequestingSellerId)
        {
            throw new ConflictException("seller.self_delete_via_profile", "Zum Löschen des eigenen Accounts das Profil verwenden");
        }

        return cascadeDeleter.DeleteAsync(command.SellerId, async (seller, ct) =>
        {
            if (seller.IsAdmin && await sellers.CountAdminsAsync(ct) <= 1)
            {
                throw new ConflictException("seller.last_admin", "Der letzte Admin kann nicht gelöscht werden");
            }
        }, cancellationToken);
    }
}
