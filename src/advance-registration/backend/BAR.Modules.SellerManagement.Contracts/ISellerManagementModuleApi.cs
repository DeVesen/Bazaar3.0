using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Contracts.Profile;
using BAR.Modules.SellerManagement.Contracts.Sellers;

namespace BAR.Modules.SellerManagement.Contracts;

/// <summary>
/// The single point of contact for the SellerManagement module. BAR.Host and
/// every other module call only this facade (dotnet-modulith-bridge).
/// </summary>
public interface ISellerManagementModuleApi
{
    Task<TokenPairDto> RegisterAsync(RegisterCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> LoginAsync(LoginCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> RefreshAsync(RefreshCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> SetPasswordAsync(SetPasswordCommand command, CancellationToken cancellationToken);
    Task<TokenPairDto> BootstrapAdminAsync(RegisterCommand command, CancellationToken cancellationToken);

    /// <summary>For the public "has an admin been created yet" check (Host BootstrapStatusEndpoints).</summary>
    Task<bool> HasAdminAsync(CancellationToken cancellationToken);

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

    /// <summary>For MasterData: may a seller type be deleted?</summary>
    Task<int> CountSellersByTypeAsync(string sellerTypeId, CancellationToken cancellationToken);

    /// <summary>For Home (seller view, Host composition).</summary>
    Task<SellerConditionsDto?> GetSellerConditionsAsync(string sellerId, CancellationToken cancellationToken);

    /// <summary>For Export.</summary>
    Task<IReadOnlyList<ExportSellerDto>> GetAllSellersForExportAsync(CancellationToken cancellationToken);

    /// <summary>For Home (admin view, Host composition).</summary>
    Task<int> GetSellerCountAsync(CancellationToken cancellationToken);

    /// <summary>For Registration: display names for the admin article overview/search.</summary>
    Task<IReadOnlyDictionary<string, SellerNameDto>> GetSellerNamesAsync(IReadOnlyCollection<string> sellerIds, CancellationToken cancellationToken);
    Task<IReadOnlyList<string>> FindSellerIdsByNameAsync(string searchTerm, CancellationToken cancellationToken);
}
