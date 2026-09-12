using BAR.Modules.Registration.Contracts;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Sellers;

public interface ISellerCascadeDeleter
{
    Task DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken cancellationToken);
}

public sealed class SellerCascadeDeleter(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IRegistrationModuleApi registration,
    IUnitOfWork unitOfWork) : ISellerCascadeDeleter
{
    // guard deliberately runs INSIDE the transaction (not before it): checks
    // like "last admin" must see the same database state as the subsequent
    // deletion, otherwise two concurrent delete attempts could both pass the
    // check (TOCTOU).
    public async Task DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByIdAsync(sellerId, ct)
                ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

            await guard(seller, ct);

            await refreshTokens.DeleteAllForSellerAsync(seller.Id, ct);
            await sellers.DeleteAsync(seller, ct);
        }, cancellationToken);

        // Best effort, outside the transaction: articles/number blocks live in
        // the Registration module (its own schema). The decisive deletion
        // decision (guard, last admin, etc.) has already been made and
        // committed - a failure here must not roll back the deletion, or
        // there would no longer be a clean error path to fall back to.
        await registration.DeleteAllForSellerAsync(sellerId, cancellationToken);
    }
}
