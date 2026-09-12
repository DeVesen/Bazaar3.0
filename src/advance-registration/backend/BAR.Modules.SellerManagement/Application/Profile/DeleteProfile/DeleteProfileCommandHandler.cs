using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Profile.DeleteProfile;

public sealed class DeleteProfileCommandHandler(ISellerCascadeDeleter cascadeDeleter)
{
    public Task HandleAsync(string sellerId, CancellationToken cancellationToken) =>
        cascadeDeleter.DeleteAsync(sellerId, (seller, ct) =>
        {
            if (seller.IsAdmin)
            {
                throw new ForbiddenException("profile.admin_self_delete", "Admins können ihr Konto nicht selbst löschen");
            }

            return Task.CompletedTask;
        }, cancellationToken);
}
