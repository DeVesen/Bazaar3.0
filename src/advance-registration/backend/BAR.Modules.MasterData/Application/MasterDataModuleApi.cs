using BAR.Modules.MasterData.Application.Catalog.Brands.Create;
using BAR.Modules.MasterData.Application.Catalog.Brands.Delete;
using BAR.Modules.MasterData.Application.Catalog.Brands.GetAll;
using BAR.Modules.MasterData.Application.Catalog.Brands.Update;
using BAR.Modules.MasterData.Application.Catalog.Categories.Create;
using BAR.Modules.MasterData.Application.Catalog.Categories.Delete;
using BAR.Modules.MasterData.Application.Catalog.Categories.GetAll;
using BAR.Modules.MasterData.Application.Catalog.Categories.Update;
using BAR.Modules.MasterData.Application.SellerTypes.Create;
using BAR.Modules.MasterData.Application.SellerTypes.Delete;
using BAR.Modules.MasterData.Application.SellerTypes.GetAll;
using BAR.Modules.MasterData.Application.SellerTypes.Update;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.MasterData.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.MasterData.Application;

/// <summary>
/// See BAR.Modules.Registration.Application.RegistrationModuleApi for the
/// rationale behind resolving handlers via <see cref="IServiceProvider"/>
/// instead of constructor injection (a bidirectional Contracts dependency on
/// SellerManagement, Registration and Operations would otherwise create a
/// DI construction cycle).
/// </summary>
public sealed class MasterDataModuleApi(
    IServiceProvider serviceProvider,
    IBrandRepository brands,
    ICategoryRepository categories,
    ISellerTypeRepository sellerTypes) : IMasterDataModuleApi
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
