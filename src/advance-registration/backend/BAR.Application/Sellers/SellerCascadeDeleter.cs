using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Sellers;

public interface ISellerCascadeDeleter
{
    Task DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken cancellationToken);
}

public sealed class SellerCascadeDeleter(
    ISellerRepository sellers,
    INumberBlockRepository blocks,
    IRefreshTokenRepository refreshTokens,
    IArticleRepository articles,
    IUnitOfWork unitOfWork) : ISellerCascadeDeleter
{
    // guard laeuft bewusst INNERHALB der Transaktion (nicht vorher): Prüfungen wie
    // "letzter Admin" muessen denselben Datenbankstand sehen wie die anschliessende
    // Loeschung, sonst koennten zwei gleichzeitige Loeschversuche beide die Pruefung
    // bestehen (TOCTOU).
    public Task DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken cancellationToken) =>
        unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByIdAsync(sellerId, ct)
                ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

            await guard(seller, ct);

            await articles.DeleteAllForSellerAsync(seller.Id, ct);
            await blocks.DeleteAllForSellerAsync(seller.Id, ct);
            await refreshTokens.DeleteAllForSellerAsync(seller.Id, ct);
            await sellers.DeleteAsync(seller, ct);
        }, cancellationToken);
}
