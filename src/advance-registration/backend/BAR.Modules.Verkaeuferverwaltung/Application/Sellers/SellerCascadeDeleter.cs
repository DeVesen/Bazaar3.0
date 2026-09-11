using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Sellers;

public interface ISellerCascadeDeleter
{
    Task DeleteAsync(string sellerId, Func<Seller, CancellationToken, Task> guard, CancellationToken cancellationToken);
}

public sealed class SellerCascadeDeleter(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IAnmeldungModuleApi anmeldung,
    IUnitOfWork unitOfWork) : ISellerCascadeDeleter
{
    // guard laeuft bewusst INNERHALB der Transaktion (nicht vorher): Pruefungen wie
    // "letzter Admin" muessen denselben Datenbankstand sehen wie die anschliessende
    // Loeschung, sonst koennten zwei gleichzeitige Loeschversuche beide die Pruefung
    // bestehen (TOCTOU).
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

        // Best effort, ausserhalb der Transaktion: Artikel/Nummernbloecke
        // liegen im Modul Anmeldung (eigenes Schema). Der massgebliche
        // Loeschentscheid (Guard, letzter Admin etc.) ist bereits gefallen und
        // committet - ein Fehlschlag hier darf die Loeschung nicht rueckgaengig
        // machen, sonst gaebe es keinen sauberen Fehlerpfad mehr zurueck.
        await anmeldung.DeleteAllForSellerAsync(sellerId, cancellationToken);
    }
}
