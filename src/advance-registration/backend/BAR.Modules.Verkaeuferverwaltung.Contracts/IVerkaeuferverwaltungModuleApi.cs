using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Sellers;

namespace BAR.Modules.Verkaeuferverwaltung.Contracts;

/// <summary>
/// Einzige Anlaufstelle des Moduls Verkaeuferverwaltung. BAR.Host und alle
/// anderen Module rufen ausschliesslich diese Facade auf (dotnet-modulith-bridge).
/// </summary>
public interface IVerkaeuferverwaltungModuleApi
{
    Task<TokenPairDto> RegisterAsync(RegisterCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> LoginAsync(LoginCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> RefreshAsync(RefreshCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> SetPasswordAsync(SetPasswordCommand command, CancellationToken cancellationToken);

    Task<PagedResultDto<SellerDto>> GetSellersAsync(GetSellersQuery query, CancellationToken cancellationToken);
    Task<SellerDto> CreateSellerAsync(CreateSellerCommand command, CancellationToken cancellationToken);
    Task<SellerDto> UpdateSellerAsync(UpdateSellerCommand command, CancellationToken cancellationToken);
    Task DeleteSellerAsync(DeleteSellerCommand command, CancellationToken cancellationToken);
    Task<InviteResultDto> InviteSellerAsync(string sellerId, CancellationToken cancellationToken);

    Task<ProfileDto> GetProfileAsync(string sellerId, CancellationToken cancellationToken);
    Task<ProfileDto> UpdateProfileAsync(string sellerId, UpdateProfileCommand command, CancellationToken cancellationToken);
    Task ChangeEmailAsync(string sellerId, ChangeEmailCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> ChangePasswordAsync(string sellerId, ChangePasswordCommand command, CancellationToken cancellationToken);
    Task DeleteProfileAsync(string sellerId, CancellationToken cancellationToken);

    /// <summary>Fuer Stammdaten: darf ein Verkaeufer-Typ geloescht werden?</summary>
    Task<int> CountSellersByTypeAsync(string sellerTypeId, CancellationToken cancellationToken);

    /// <summary>Fuer Home (Seller-Ansicht, Host-Komposition).</summary>
    Task<SellerConditionsDto?> GetSellerConditionsAsync(string sellerId, CancellationToken cancellationToken);

    /// <summary>Fuer Export.</summary>
    Task<IReadOnlyList<ExportSellerDto>> GetAllSellersForExportAsync(CancellationToken cancellationToken);

    /// <summary>Fuer Home (Admin-Ansicht, Host-Komposition).</summary>
    Task<int> GetSellerCountAsync(CancellationToken cancellationToken);

    /// <summary>Fuer Anmeldung: Anzeigenamen fuer die admin. Artikel-Uebersicht/Suche.</summary>
    Task<IReadOnlyDictionary<string, SellerNameDto>> GetSellerNamesAsync(IReadOnlyCollection<string> sellerIds, CancellationToken cancellationToken);
    Task<IReadOnlyList<string>> FindSellerIdsByNameAsync(string searchTerm, CancellationToken cancellationToken);
}
