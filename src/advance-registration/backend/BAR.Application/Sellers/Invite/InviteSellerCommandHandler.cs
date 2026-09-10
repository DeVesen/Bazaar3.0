using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Sellers.Invite;

public sealed class InviteSellerCommandHandler(ISellerRepository sellers, IClock clock)
{
    public async Task<InviteResult> HandleAsync(InviteSellerCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(command.SellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

        var token = seller.GenerateInviteToken(clock.UtcNow);
        await sellers.UpdateAsync(seller, cancellationToken);

        return new InviteResult(token, seller.InviteTokenExpiresAt!.Value);
    }
}
