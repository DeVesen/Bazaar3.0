using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.Login;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.Refresh;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.Register;
using BAR.Modules.Verkaeuferverwaltung.Application.Auth.SetPassword;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.ChangeEmail;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.ChangePassword;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.DeleteProfile;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.GetProfile;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.UpdateProfile;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Create;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Delete;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Invite;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.List;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Update;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Verkaeuferverwaltung.Application;

/// <summary>
/// Siehe BAR.Modules.Anmeldung.Application.AnmeldungModuleApi fuer die
/// Begruendung der Handler-Aufloesung ueber <see cref="IServiceProvider"/>
/// statt Konstruktor-Injektion (bidirektionale Contracts-Abhaengigkeit zu
/// Stammdaten und Anmeldung wuerde sonst einen DI-Konstruktionszyklus erzeugen).
/// </summary>
public sealed class VerkaeuferverwaltungModuleApi(
    IServiceProvider serviceProvider,
    ISellerRepository sellers,
    IStammdatenModuleApi stammdaten) : IVerkaeuferverwaltungModuleApi
{
    private T Resolve<T>() where T : notnull => serviceProvider.GetRequiredService<T>();

    public Task<TokenPairDto> RegisterAsync(RegisterCommand command, CancellationToken cancellationToken) =>
        Resolve<RegisterCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<TokenPairDto> LoginAsync(LoginCommand command, CancellationToken cancellationToken) =>
        Resolve<LoginCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<TokenPairDto> RefreshAsync(RefreshCommand command, CancellationToken cancellationToken) =>
        Resolve<RefreshCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<TokenPairDto> SetPasswordAsync(SetPasswordCommand command, CancellationToken cancellationToken) =>
        Resolve<SetPasswordCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<PagedResultDto<SellerDto>> GetSellersAsync(GetSellersQuery query, CancellationToken cancellationToken) =>
        Resolve<GetSellersQueryHandler>().HandleAsync(query, cancellationToken);

    public Task<SellerDto> CreateSellerAsync(CreateSellerCommand command, CancellationToken cancellationToken) =>
        Resolve<CreateSellerCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<SellerDto> UpdateSellerAsync(UpdateSellerCommand command, CancellationToken cancellationToken) =>
        Resolve<UpdateSellerCommandHandler>().HandleAsync(command, cancellationToken);

    public Task DeleteSellerAsync(DeleteSellerCommand command, CancellationToken cancellationToken) =>
        Resolve<DeleteSellerCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<InviteResultDto> InviteSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<InviteSellerCommandHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<ProfileDto> GetProfileAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetProfileQueryHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<ProfileDto> UpdateProfileAsync(string sellerId, UpdateProfileCommand command, CancellationToken cancellationToken) =>
        Resolve<UpdateProfileCommandHandler>().HandleAsync(sellerId, command, cancellationToken);

    public Task ChangeEmailAsync(string sellerId, ChangeEmailCommand command, CancellationToken cancellationToken) =>
        Resolve<ChangeEmailCommandHandler>().HandleAsync(sellerId, command, cancellationToken);

    public Task<TokenPairDto> ChangePasswordAsync(string sellerId, ChangePasswordCommand command, CancellationToken cancellationToken) =>
        Resolve<ChangePasswordCommandHandler>().HandleAsync(sellerId, command, cancellationToken);

    public Task DeleteProfileAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<DeleteProfileCommandHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<int> CountSellersByTypeAsync(string sellerTypeId, CancellationToken cancellationToken) =>
        sellers.CountByTypeAsync(sellerTypeId, cancellationToken);

    public async Task<SellerConditionsDto?> GetSellerConditionsAsync(string sellerId, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken);
        if (seller is null) return null;

        var conditions = await stammdaten.GetSellerTypeConditionsAsync(seller.SellerTypeId, cancellationToken);
        return conditions is null ? null : new SellerConditionsDto(conditions.CommissionRate, conditions.ItemFee);
    }

    public async Task<IReadOnlyList<ExportSellerDto>> GetAllSellersForExportAsync(CancellationToken cancellationToken)
    {
        var all = await sellers.GetAllAsync(cancellationToken);

        var typeNames = new Dictionary<string, string>();
        foreach (var typeId in all.Select(s => s.SellerTypeId).Distinct())
        {
            var conditions = await stammdaten.GetSellerTypeConditionsAsync(typeId, cancellationToken);
            if (conditions is not null) typeNames[typeId] = conditions.Name;
        }

        return all
            .Where(s => typeNames.ContainsKey(s.SellerTypeId))
            .Select(s => new ExportSellerDto(
                s.Id, s.FirstName, s.LastName, s.Address, s.PostalCode, s.City, s.Phone, s.Email, typeNames[s.SellerTypeId]))
            .ToList();
    }

    public async Task<int> GetSellerCountAsync(CancellationToken cancellationToken) =>
        (await sellers.GetAllAsync(cancellationToken)).Count;

    public async Task<IReadOnlyDictionary<string, SellerNameDto>> GetSellerNamesAsync(IReadOnlyCollection<string> sellerIds, CancellationToken cancellationToken)
    {
        var all = await sellers.GetAllAsync(cancellationToken);
        return all
            .Where(s => sellerIds.Contains(s.Id))
            .ToDictionary(s => s.Id, s => new SellerNameDto(s.Id, s.FirstName, s.LastName));
    }

    public async Task<IReadOnlyList<string>> FindSellerIdsByNameAsync(string searchTerm, CancellationToken cancellationToken)
    {
        var all = await sellers.GetAllAsync(cancellationToken);
        return all
            .Where(s => s.FirstName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                        s.LastName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
            .Select(s => s.Id)
            .ToList();
    }
}
