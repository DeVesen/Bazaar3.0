using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Sellers;

/// <summary>
/// Registrierung/Admin-Anlage und Nummernblock-Vergabe sind fachlich ein
/// Vorgang, liegen aber seit dem Modulith-Schnitt in zwei Schemata/
/// DbContexts - keine gemeinsame DB-Transaktion moeglich. Der Seller wird
/// zuerst committet, danach die Blockvergabe ueber Anmeldung.Contracts
/// angefragt; schlaegt die fehl, wird der Seller (und seine Refresh-Tokens)
/// wieder entfernt, statt ihn ohne Nummernbloecke zurueckzulassen.
/// </summary>
public sealed class SellerBlockAllocationCoordinator(
    ISellerRepository sellers, IRefreshTokenRepository refreshTokens, IAnmeldungModuleApi anmeldung)
{
    public async Task<IReadOnlyList<BlockDto>> AllocateOrCompensateAsync(
        string sellerId, int? blockCount, int? startNumber, CancellationToken cancellationToken)
    {
        try
        {
            return await anmeldung.AllocateInitialBlocksAsync(sellerId, blockCount, startNumber, cancellationToken);
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
