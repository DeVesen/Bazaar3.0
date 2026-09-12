using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Contracts.SellerTypes;

namespace BAR.Modules.MasterData.Contracts;

/// <summary>
/// The single point of contact for the MasterData module. BAR.Host and every
/// other module call only this facade, never Domain/Application/
/// Infrastructure directly (dotnet-modulith-bridge).
/// </summary>
public interface IMasterDataModuleApi
{
    Task<IReadOnlyList<BrandDto>> GetAllBrandsAsync(bool isAdmin, CancellationToken cancellationToken);
    Task<BrandDto> CreateBrandAsync(CreateBrandCommand command, CancellationToken cancellationToken);
    Task<BrandDto> UpdateBrandAsync(string id, UpdateBrandCommand command, CancellationToken cancellationToken);
    Task DeleteBrandAsync(string id, CancellationToken cancellationToken);

    Task<IReadOnlyList<CategoryDto>> GetAllCategoriesAsync(bool isAdmin, CancellationToken cancellationToken);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryCommand command, CancellationToken cancellationToken);
    Task<CategoryDto> UpdateCategoryAsync(string id, UpdateCategoryCommand command, CancellationToken cancellationToken);
    Task DeleteCategoryAsync(string id, CancellationToken cancellationToken);

    Task<IReadOnlyList<SellerTypeDto>> GetAllSellerTypesAsync(CancellationToken cancellationToken);
    Task<SellerTypeDto> CreateSellerTypeAsync(CreateSellerTypeCommand command, CancellationToken cancellationToken);
    Task<SellerTypeDto> UpdateSellerTypeAsync(string id, UpdateSellerTypeCommand command, CancellationToken cancellationToken);
    Task DeleteSellerTypeAsync(string id, CancellationToken cancellationToken);

    /// <summary>For SellerManagement/Operations/Export: a type's conditions, without knowing its domain.</summary>
    Task<SellerTypeConditionsDto?> GetSellerTypeConditionsAsync(string sellerTypeId, CancellationToken cancellationToken);

    /// <summary>For Operations: validating <c>DefaultTypeId</c> in the settings.</summary>
    Task<bool> SellerTypeExistsAsync(string sellerTypeId, CancellationToken cancellationToken);

    /// <summary>For Export: name lists, when includeBrands/includeCategories are set.</summary>
    Task<IReadOnlyList<string>> GetAllBrandNamesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<string>> GetAllCategoryNamesAsync(CancellationToken cancellationToken);
}
