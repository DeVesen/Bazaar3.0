using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Update;

public sealed class UpdateSellerCommandHandler(
    ISellerRepository sellers, IStammdatenModuleApi stammdaten, IAnmeldungModuleApi anmeldung, IClock clock)
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

        var conditions = await stammdaten.GetSellerTypeConditionsAsync(command.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Unbekannter Verkäufer-Typ");

        seller.UpdateAsAdmin(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.UpdateAsync(seller, cancellationToken);

        // ArticleCount und HasPendingInvite muessen konsistent mit
        // GetSellersAsync (GET /api/sellers) berechnet werden, sonst weicht
        // diese Antwort von der Listen-Ansicht fuer denselben Verkaeufer ab.
        var summaries = await anmeldung.GetBlockSummariesForSellersAsync([seller.Id], cancellationToken);
        var summary = summaries.GetValueOrDefault(seller.Id);
        var hasPendingInvite = seller.InviteToken != null && seller.InviteTokenExpiresAt > clock.UtcNow;

        return new SellerDto(
            seller.Id, summary?.StartNumber, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummaryDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee),
            seller.IsAdmin, summary?.ArticleCount ?? 0, hasPendingInvite);
    }
}
