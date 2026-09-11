using BAR.Modules.Stammdaten.Application.MasterData.Brands.Create;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.Delete;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.GetAll;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.Update;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.Create;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.Delete;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.GetAll;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.Update;
using BAR.Modules.Stammdaten.Application.SellerTypes.Create;
using BAR.Modules.Stammdaten.Application.SellerTypes.Delete;
using BAR.Modules.Stammdaten.Application.SellerTypes.GetAll;
using BAR.Modules.Stammdaten.Application.SellerTypes.Update;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Modules.Stammdaten.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Stammdaten.Application;

/// <summary>
/// Siehe BAR.Modules.Anmeldung.Application.AnmeldungModuleApi fuer die
/// Begruendung der Handler-Aufloesung ueber <see cref="IServiceProvider"/>
/// statt Konstruktor-Injektion (bidirektionale Contracts-Abhaengigkeit zu
/// Verkaeuferverwaltung, Anmeldung und Betrieb wuerde sonst einen
/// DI-Konstruktionszyklus erzeugen).
/// </summary>
public sealed class StammdatenModuleApi(
    IServiceProvider serviceProvider,
    IBrandRepository brands,
    ICategoryRepository categories,
    ISellerTypeRepository sellerTypes) : IStammdatenModuleApi
{
    private T Resolve<T>() where T : notnull => serviceProvider.GetRequiredService<T>();

    public Task<IReadOnlyList<BrandDto>> GetAllBrandsAsync(bool isAdmin, CancellationToken cancellationToken) =>
        Resolve<GetAllBrandsQueryHandler>().HandleAsync(isAdmin, cancellationToken);

    public Task<BrandDto> CreateBrandAsync(CreateBrandCommand command, CancellationToken cancellationToken) =>
        Resolve<CreateBrandCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<BrandDto> UpdateBrandAsync(string id, UpdateBrandCommand command, CancellationToken cancellationToken) =>
        Resolve<UpdateBrandCommandHandler>().HandleAsync(id, command, cancellationToken);

    public Task DeleteBrandAsync(string id, CancellationToken cancellationToken) =>
        Resolve<DeleteBrandCommandHandler>().HandleAsync(id, cancellationToken);

    public Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync(bool isAdmin, CancellationToken cancellationToken) =>
        Resolve<GetAllCategoriesQueryHandler>().HandleAsync(isAdmin, cancellationToken);

    public Task<CategoryDto> CreateCategoryAsync(CreateCategoryCommand command, CancellationToken cancellationToken) =>
        Resolve<CreateCategoryCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<CategoryDto> UpdateCategoryAsync(string id, UpdateCategoryCommand command, CancellationToken cancellationToken) =>
        Resolve<UpdateCategoryCommandHandler>().HandleAsync(id, command, cancellationToken);

    public Task DeleteCategoryAsync(string id, CancellationToken cancellationToken) =>
        Resolve<DeleteCategoryCommandHandler>().HandleAsync(id, cancellationToken);

    public Task<IReadOnlyList<SellerTypeDto>> GetAllSellerTypesAsync(CancellationToken cancellationToken) =>
        Resolve<GetAllSellerTypesQueryHandler>().HandleAsync(cancellationToken);

    public Task<SellerTypeDto> CreateSellerTypeAsync(CreateSellerTypeCommand command, CancellationToken cancellationToken) =>
        Resolve<CreateSellerTypeCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<SellerTypeDto> UpdateSellerTypeAsync(string id, UpdateSellerTypeCommand command, CancellationToken cancellationToken) =>
        Resolve<UpdateSellerTypeCommandHandler>().HandleAsync(id, command, cancellationToken);

    public Task DeleteSellerTypeAsync(string id, CancellationToken cancellationToken) =>
        Resolve<DeleteSellerTypeCommandHandler>().HandleAsync(id, cancellationToken);

    public async Task<SellerTypeConditionsDto?> GetSellerTypeConditionsAsync(string sellerTypeId, CancellationToken cancellationToken)
    {
        var type = await sellerTypes.GetByIdAsync(sellerTypeId, cancellationToken);
        return type is null ? null : new SellerTypeConditionsDto(type.Id, type.Name, type.CommissionRate, type.ItemFee);
    }

    public async Task<bool> SellerTypeExistsAsync(string sellerTypeId, CancellationToken cancellationToken) =>
        await sellerTypes.GetByIdAsync(sellerTypeId, cancellationToken) is not null;

    public async Task<IReadOnlyList<string>> GetAllBrandNamesAsync(CancellationToken cancellationToken) =>
        (await brands.GetAllAsync(cancellationToken)).Select(b => b.Name).ToList();

    public async Task<IReadOnlyList<string>> GetAllCategoryNamesAsync(CancellationToken cancellationToken) =>
        (await categories.GetAllAsync(cancellationToken)).Select(c => c.Name).ToList();
}
