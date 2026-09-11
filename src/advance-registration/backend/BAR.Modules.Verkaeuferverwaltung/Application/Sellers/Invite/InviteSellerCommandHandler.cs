using BAR.Modules.Verkaeuferverwaltung.Contracts.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Invite;

public sealed class InviteSellerCommandHandler(ISellerRepository sellers, IClock clock)
{
    public async Task<InviteResultDto> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

        var token = seller.GenerateInviteToken(clock.UtcNow);
        await sellers.UpdateAsync(seller, cancellationToken);

        return new InviteResultDto(token, seller.InviteTokenExpiresAt!.Value);
    }
}
