using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Sellers.Update;

public sealed class UpdateSellerCommandHandler(
    ISellerRepository sellers, IMasterDataModuleApi masterData, IRegistrationModuleApi registration, IClock clock)
{
    public async Task<SellerDto> HandleAsync(UpdateSellerCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(command.SellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

        var existingWithEmail = await sellers.GetByEmailAsync(command.Email, cancellationToken);
        if (existingWithEmail is not null && existingWithEmail.Id != seller.Id)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var conditions = await masterData.GetSellerTypeConditionsAsync(command.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Unbekannter Verkäufer-Typ");

        if (seller.IsAdmin && !command.IsAdmin && await sellers.CountAdminsAsync(cancellationToken) <= 1)
        {
            throw new ConflictException("seller.last_admin", "Der letzte Admin kann nicht degradiert werden");
        }

        seller.UpdateAsAdmin(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.UpdateAsync(seller, cancellationToken);

        // ArticleCount and HasPendingInvite must be computed consistently with
        // GetSellersAsync (GET /api/sellers), otherwise this response would
        // diverge from the list view for the same seller.
        var summaries = await registration.GetBlockSummariesForSellersAsync([seller.Id], cancellationToken);
        var summary = summaries.GetValueOrDefault(seller.Id);
        var hasPendingInvite = seller.InviteToken != null && seller.InviteTokenExpiresAt > clock.UtcNow;

        return new SellerDto(
            seller.Id, summary?.StartNumber, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummaryDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee),
            seller.IsAdmin, summary?.ArticleCount ?? 0, hasPendingInvite);
    }
}
