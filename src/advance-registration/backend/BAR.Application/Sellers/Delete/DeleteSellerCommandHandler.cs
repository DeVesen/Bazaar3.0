using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Sellers.Delete;

public sealed class DeleteSellerCommandHandler(
    ISellerRepository sellers,
    INumberBlockRepository blocks,
    IRefreshTokenRepository refreshTokens,
    IArticleRepository articles,
    IUnitOfWork unitOfWork)
{
    public async Task HandleAsync(DeleteSellerCommand command, CancellationToken cancellationToken)
    {
        if (command.SellerId == command.RequestingSellerId)
        {
            throw new ConflictException("seller.self_delete_via_profile", "Zum Löschen des eigenen Accounts das Profil verwenden");
        }

        // Guard-Pruefungen und Kaskade sind ein einziger fachlicher Vorgang:
        // ohne diese Klammer koennte ein Absturz zwischen den Loesch-Schritten
        // (Artikel -> Bloecke -> Refresh-Tokens -> Verkaeufer) einen Verkaeufer
        // mit nur teilweise geloeschten Daten zuruecklassen.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByIdAsync(command.SellerId, ct)
                ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

            if (seller.IsAdmin && await sellers.CountAdminsAsync(ct) <= 1)
            {
                throw new ConflictException("seller.last_admin", "Der letzte Admin kann nicht gelöscht werden");
            }

            await articles.DeleteAllForSellerAsync(seller.Id, ct);
            await blocks.DeleteAllForSellerAsync(seller.Id, ct);
            await refreshTokens.DeleteAllForSellerAsync(seller.Id, ct);
            await sellers.DeleteAsync(seller, ct);
        }, cancellationToken);
    }
}
