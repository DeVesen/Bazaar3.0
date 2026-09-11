using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Contracts.SellerTypes;

namespace BAR.Modules.Stammdaten.Contracts;

/// <summary>
/// Einzige Anlaufstelle des Moduls Stammdaten. BAR.Host und alle anderen
/// Module rufen ausschliesslich diese Facade auf, nie Domain/Application/
/// Infrastructure direkt (dotnet-modulith-bridge).
/// </summary>
public interface IStammdatenModuleApi
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

    /// <summary>Fuer Verkaeuferverwaltung/Betrieb/Export: Konditionen eines Typs, ohne dessen Domain zu kennen.</summary>
    Task<SellerTypeConditionsDto?> GetSellerTypeConditionsAsync(string sellerTypeId, CancellationToken cancellationToken);

    /// <summary>Fuer Betrieb: Validierung von <c>DefaultTypeId</c> in den Einstellungen.</summary>
    Task<bool> SellerTypeExistsAsync(string sellerTypeId, CancellationToken cancellationToken);

    /// <summary>Fuer Export: Namenslisten, wenn includeBrands/includeCategories gesetzt sind.</summary>
    Task<IReadOnlyList<string>> GetAllBrandNamesAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<string>> GetAllCategoryNamesAsync(CancellationToken cancellationToken);
}
