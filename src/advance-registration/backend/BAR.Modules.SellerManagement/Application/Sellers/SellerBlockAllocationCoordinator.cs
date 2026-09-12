using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.SellerManagement.Domain.Ports;

namespace BAR.Modules.SellerManagement.Application.Sellers;

/// <summary>
/// Registration/admin creation and number-block allocation are one business
/// operation, but since the modulith cut they live in two schemas/
/// DbContexts - no shared DB transaction is possible. The seller is
/// committed first, then block allocation is requested via
/// Registration.Contracts; if that fails, the seller (and their refresh
/// tokens) is removed again rather than left without number blocks.
/// </summary>
public sealed class SellerBlockAllocationCoordinator(
    ISellerRepository sellers, IRefreshTokenRepository refreshTokens, IRegistrationModuleApi registration)
{
    public async Task<IReadOnlyList<BlockDto>> AllocateOrCompensateAsync(
        string sellerId, int? blockCount, int? startNumber, CancellationToken cancellationToken)
    {
        try
        {
            return await registration.AllocateInitialBlocksAsync(sellerId, blockCount, startNumber, cancellationToken);
        }
        catch
        {
            await refreshTokens.DeleteAllForSellerAsync(sellerId, cancellationToken);
            var seller = await sellers.GetByIdAsync(sellerId, cancellationToken);
            if (seller is not null)
            {
                await sellers.DeleteAsync(seller, cancellationToken);
            }

            throw;
        }
    }
}
