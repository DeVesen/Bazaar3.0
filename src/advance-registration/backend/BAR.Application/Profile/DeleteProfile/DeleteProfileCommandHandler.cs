using BAR.Application.Sellers;
using BAR.Domain.Exceptions;

namespace BAR.Application.Profile.DeleteProfile;

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
